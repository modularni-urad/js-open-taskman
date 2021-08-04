import { TABLE_NAMES, STATE } from '../consts'
import _ from 'underscore'

function _invalidTransitionMsg (task, newstate) {
  return `invalid transition ${task.state} x> ${newstate}`
}

export default {
  refuseDelegation: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.DELEG_REQ) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    const pendingUID = _.last(task.solvers)
    if (pendingUID !== UID) {
      throw new Error('you are not the pender')
    }
    task.solvers.pop()
    await knex(TABLE_NAMES.TASKS).where('id', task.id).update({ solvers: task.solvers })
    await knex(TABLE_NAMES.COMMENTS).insert({
      taskid: task.id,
      content: body.message,
      author: UID
    })
  },
  acceptDelegation: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.DELEG_REQ) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (_.last(task.solvers) !== UID) {
      throw new Error('you are not the pender')
    }
    await knex(TABLE_NAMES.TASKS).where('id', task.id).update({ 
      state: newstate,
      solver: UID,
      manager: task.solvers.length > 1 
        ? task.solvers[task.solvers.length - 2] 
        : task.owner
    })
  },
  setFinished: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.INPROGRESS) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (task.solver !== UID) {
      throw new Error('you are not the solver')
    }
    await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ state: newstate })
  },
  rejectDone: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.FINISHED) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (UID !== task.manager) {
      throw new Error('you are not task manager')
    }
    await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ state: newstate })
  },
  approveDone: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.FINISHED) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (UID !== task.manager) {
      throw new Error('you are not task manager')
    }
    task.solvers.pop()
    await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ 
      state: task.solvers.length > 0 ? STATE.FINISHED : newstate,
      solvers: task.solvers
    })
    // TODO: pridat comment, ze sem to approvenul?
  },
  closeTask: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.DONE) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (UID !== task.owner) {
      throw new Error('you are not task owner')
    }
    await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ state: newstate })
  },
  defaultCase: function (task, newstate, body, UID, knex) {
    throw new Error(_invalidTransitionMsg(task, newstate))
  }
}