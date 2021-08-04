import { TABLE_NAMES, STATE } from '../consts'
import _ from 'underscore'

async function delegate (taskid, toUID, UID, knex) {
  const task = await knex(TABLE_NAMES.TASKS).where('id', taskid).first()
  if (!_.contains([task.owner, task.solver], UID)) {
    throw new Error('you cannot delegate')
  }
  await knex(TABLE_NAMES.TASKS).where('id', taskid).update({
    state: STATE.DELEG_REQ,
    solvers: _.union(task.solvers, [toUID])
  })
  // write comment
  await knex(TABLE_NAMES.COMMENTS).insert({
    taskid,
    content: `DELEGATE: ${toUID}`,
    author: UID
  })
}

function _invalidTransitionMsg (task, newstate) {
  return `invalid transition ${task.state} x> ${newstate}`
}

async function changeState (taskid, newstate, body, UID, knex) {
  const task = await knex(TABLE_NAMES.TASKS).where('id', taskid).first()
  switch (newstate) {
    case STATE.DELEG_REFUSED:
      if (task.state !== STATE.DELEG_REQ) {
        throw new Error(_invalidTransitionMsg(task, newstate))
      }
      const pendingUID = _.last(task.solvers)
      if (pendingUID !== UID) {
        throw new Error('you are not the pender')
      }
      task.solvers.pop()
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ solvers: task.solvers })
      await knex(TABLE_NAMES.COMMENTS).insert({
        taskid,
        content: body.message,
        author: UID
      })
      break
    case STATE.INPROGRESS:
      if (task.state !== STATE.DELEG_REQ) {
        throw new Error(_invalidTransitionMsg(task, newstate))
      }
      if (_.last(task.solvers) !== UID) {
        throw new Error('you are not the pender')
      }
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ 
        state: newstate,
        solver: UID,
        manager: task.solvers.length > 1 
          ? task.solvers[task.solvers.length - 2] 
          : task.owner
      })
      break
    case STATE.FINISHED:
      if (task.state !== STATE.INPROGRESS) {
        throw new Error(_invalidTransitionMsg(task, newstate))
      }
      if (task.solver !== UID) {
        throw new Error('you are not the solver')
      }
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ state: newstate })
      break
    case STATE.ERROR:
      if (task.state !== STATE.FINISHED) {
        throw new Error(_invalidTransitionMsg(task, newstate))
      }
      if (UID !== task.manager) {
        throw new Error('you are not task manager')
      }
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ state: newstate })
      break
    case STATE.DONE:
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
      break
    case STATE.CLOSED:
      if (task.state !== STATE.DONE) {
        throw new Error(_invalidTransitionMsg(task, newstate))
      }
      if (UID !== task.owner) {
        throw new Error('you are not task owner')
      }
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update({ state: newstate })
      break
    default:
      throw new Error(_invalidTransitionMsg(task, newstate))
  }
}

export default (knex) => ({
  delegate: (req, res, next) => {
    delegate(req.params.id, req.params.uid, req.user.id.toString(), knex)
      .then(saved => res.json(saved))
      .catch(next)
  },
  state: (req, res, next) => {
    changeState(req.params.id, req.params.state, req.body, req.user.id.toString(), knex)
      .then(saved => res.json(saved))
      .catch(next)
  }
})