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
    const solvers = task.solvers.split(',')
    const pendingUID = _.last(solvers)
    if (pendingUID !== UID) {
      throw new Error('you are not the pender')
    }
    solvers.pop()
    const updated = await knex(TABLE_NAMES.TASKS).where('id', task.id).update({ 
      state: newstate,
      solvers: solvers.join(',')
    }).returning('*')
    await knex(TABLE_NAMES.COMMENTS).insert({
      taskid: task.id,
      content: 'REFUSED:' + body.message,
      author: UID
    })
    return updated
  },
  beginWork: async function (task, newstate, body, UID, knex) {
    if (!_.contains([STATE.ERROR, STATE.DELEG_REQ], task.state)) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    const solvers = task.solvers.split(',')
    if (_.last(solvers) !== UID) {
      throw new Error('you are not the pender')
    }
    const updated = await knex(TABLE_NAMES.TASKS).where('id', task.id).update({ 
      state: newstate,
      solver: UID,
      manager: solvers.length > 1 
        ? solvers[solvers.length - 2] 
        : task.owner
    }).returning('*')
    await knex(TABLE_NAMES.COMMENTS).insert({
      taskid: task.id,
      content: 'ACCEPTED',
      author: UID
    })
    return updated
  },
  setFinished: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.INPROGRESS) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (task.solver !== UID) {
      throw new Error('you are not the solver')
    }
    const updated = await knex(TABLE_NAMES.TASKS).where('id', task.id)
        .update({ state: newstate }).returning('*')
    await knex(TABLE_NAMES.COMMENTS).insert({
      taskid: task.id,
      content: 'FINISHED',
      author: UID
    })
    return updated
  },
  rejectDone: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.FINISHED) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (UID !== task.manager) {
      throw new Error('you are not task manager')
    }
    return knex(TABLE_NAMES.TASKS).where('id', task.id)
      .update({ state: newstate }).returning('*')
  },
  approveDone: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.FINISHED) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (UID !== task.manager) {
      throw new Error('you are not task manager')
    }
    const solvers = task.solvers.split(',')
    solvers.pop()
    const updated = await knex(TABLE_NAMES.TASKS).where('id', task.id).update({ 
      state: solvers.length > 0 ? STATE.FINISHED : newstate,
      solvers: solvers.join(','),
      solver: task.manager,
      manager: solvers.length > 1 ? solvers[solvers.length - 2] : task.owner
    }).returning('*')
    await knex(TABLE_NAMES.COMMENTS).insert({
      taskid: task.id,
      content: `APPROVED`,
      author: UID
    })
    return updated
  },
  closeTask: async function (task, newstate, body, UID, knex) {
    if (task.state !== STATE.DONE) {
      throw new Error(_invalidTransitionMsg(task, newstate))
    }
    if (UID !== task.owner) {
      throw new Error('you are not task owner')
    }
    return knex(TABLE_NAMES.TASKS).where('id', task.id)
      .update({ state: newstate }).returning('*')
  },
  defaultCase: function (task, newstate, body, UID, knex) {
    throw new Error(_invalidTransitionMsg(task, newstate))
  }
}