import { TABLE_NAMES, STATE } from '../consts'
import _ from 'underscore'
import lifecycle from './lifecycle'

async function delegate (taskid, toUID, UID, knex) {
  const task = await knex(TABLE_NAMES.TASKS).where('id', taskid).first()
  if (!_.contains([task.owner, task.solver], UID)) {
    throw new Error('you cannot delegate')
  }
  const solvers = task.solvers ? task.solvers.split(',') : []
  const updated = await knex(TABLE_NAMES.TASKS).where('id', taskid).update({
    state: STATE.DELEG_REQ,
    solvers: _.union(solvers, [toUID]).join(',')
  }).returning('*')
  // write comment
  await knex(TABLE_NAMES.COMMENTS).insert({
    taskid,
    content: `DELEGATE: ${toUID}`,
    author: UID
  })
  return updated
}

async function changeState (taskid, newstate, body, UID, knex) {
  const task = await knex(TABLE_NAMES.TASKS).where('id', taskid).first()
  switch (newstate) {
    case STATE.DELEG_REFUSED:
      return lifecycle.refuseDelegation(task, newstate, body, UID, knex)
    case STATE.INPROGRESS:
      return lifecycle.beginWork(task, newstate, body, UID, knex)
    case STATE.FINISHED:
      return lifecycle.setFinished(task, newstate, body, UID, knex)
    case STATE.ERROR:
      return lifecycle.rejectDone(task, newstate, body, UID, knex)
    case STATE.DONE:
      return lifecycle.approveDone(task, newstate, body, UID, knex)
    case STATE.CLOSED:
      return lifecycle.closeTask(task, newstate, body, UID, knex)
    default:
      return lifecycle.defaultCase(task, newstate, body, UID, knex)
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