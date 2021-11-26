import { TABLE_NAMES, STATE, getQB } from '../consts'
import _ from 'underscore'
const { TASKS, COMMENTS } = TABLE_NAMES

function _invalidTransitionMsg (task, newstate) {
  return `invalid transition ${task.state} x> ${newstate}`
}

export default (knex, ErrorClass) => {
  return {
    refuseDelegation: async function (task, newstate, body, UID, schema) {
      if (task.state !== STATE.DELEG_REQ) {
        throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
      }
      const solvers = task.solvers.split(',')
      const pendingUID = _.last(solvers)
      if (pendingUID !== UID) {
        throw new ErrorClass(400, 'you are not the pender')
      }
      solvers.pop()
      const updated = await getQB(knex, TASKS, schema).where('id', task.id).update({ 
        state: newstate,
        solvers: solvers.join(',')
      }).returning('*')
      await getQB(knex, COMMENTS, schema).insert({
        taskid: task.id,
        content: 'SYS: REFUSED:' + body.message,
        author: UID
      })
      return updated
    },
    beginWork: async function (task, newstate, body, UID, schema) {
      if (!_.contains([STATE.ERROR, STATE.DELEG_REQ], task.state)) {
        throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
      }
      const solvers = task.solvers.split(',')
      if (_.last(solvers) !== UID) {
        throw new ErrorClass(400, 'you are not the pender')
      }
      const updated = await getQB(knex, TASKS, schema).where('id', task.id).update({ 
        state: newstate,
        solver: UID,
        manager: solvers.length > 1 
          ? solvers[solvers.length - 2] 
          : task.owner
      }).returning('*')
      await getQB(knex, COMMENTS, schema).insert({
        taskid: task.id,
        content: 'SYS: ACCEPTED',
        author: UID
      })
      return updated
    },
    setFinished: async function (task, newstate, body, UID, schema) {
      if (task.state !== STATE.INPROGRESS) {
        throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
      }
      if (task.solver !== UID) {
        throw new ErrorClass(400, 'you are not the solver')
      }
      const updated = await getQB(knex, TASKS, schema).where('id', task.id)
          .update({ state: newstate }).returning('*')
      await getQB(knex, COMMENTS, schema).insert({
        taskid: task.id,
        content: 'SYS: FINISHED',
        author: UID
      })
      return updated
    },
    rejectDone: async function (task, newstate, body, UID, schema) {
      if (task.state !== STATE.FINISHED) {
        throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
      }
      if (UID !== task.manager) {
        throw new ErrorClass(400, 'you are not task manager')
      }
      return getQB(knex, TASKS, schema).where('id', task.id)
        .update({ state: newstate }).returning('*')
    },
    approveDone: async function (task, newstate, body, UID, schema) {
      if (task.state !== STATE.FINISHED) {
        throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
      }
      if (UID !== task.manager) {
        throw new ErrorClass(400, 'you are not task manager')
      }
      const solvers = task.solvers.split(',')
      solvers.pop()
      const updated = await getQB(knex, TASKS, schema).where('id', task.id).update({ 
        state: solvers.length > 0 ? STATE.FINISHED : newstate,
        solvers: solvers.join(','),
        solver: task.manager,
        manager: solvers.length > 1 ? solvers[solvers.length - 2] : task.owner
      }).returning('*')
      await getQB(knex, COMMENTS, schema).insert({
        taskid: task.id,
        content: `SYS: APPROVED`,
        author: UID
      })
      return updated
    },
    closeTask: async function (task, newstate, body, UID, schema) {
      if (task.state !== STATE.DONE) {
        throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
      }
      if (UID !== task.owner) {
        throw new ErrorClass(400, 'you are not task owner')
      }
      return getQB(knex, TASKS, schema).where('id', task.id)
        .update({ state: newstate }).returning('*')
    },
    defaultCase: function (task, newstate, body, UID) {
      throw new ErrorClass(400, _invalidTransitionMsg(task, newstate))
    }
  }
}