import { TABLE_NAMES, STATE, getQB } from '../consts'
import Lifecycle from './lifecycle'
const { TASKS, COMMENTS } = TABLE_NAMES

export default (ctx) => {
  const { knex, ErrorClass } = ctx
  const _ = ctx.require('underscore')
  const lifecycle = Lifecycle(knex, ErrorClass, _)
  return { delegate, changeState }

  async function delegate (taskid, toUID, UID, schema) {
    const task = await getQB(knex, TASKS, schema).where('id', taskid).first()
    if (!_.contains([task.owner, task.solver], UID)) {
      throw new ErrorClass(400, 'you cannot delegate')
    }
    const solvers = task.solvers ? task.solvers.split(',') : []
    const updated = await getQB(knex, TASKS, schema).where('id', taskid).update({
      state: STATE.DELEG_REQ,
      solvers: _.union(solvers, [toUID]).join(',')
    }).returning('*')
    // write comment
    await getQB(knex, COMMENTS, schema).insert({
      taskid,
      content: `SYS: DELEGATE: ${toUID}`,
      author: UID
    })
    return updated
  }
  
  async function changeState (taskid, newstate, body, UID, schema) {
    const task = await getQB(knex, TASKS, schema).where('id', taskid).first()
    switch (newstate) {
      case STATE.DELEG_REFUSED:
        return lifecycle.refuseDelegation(task, newstate, body, UID, schema)
      case STATE.INPROGRESS:
        return lifecycle.beginWork(task, newstate, body, UID, schema)
      case STATE.FINISHED:
        return lifecycle.setFinished(task, newstate, body, UID, schema)
      case STATE.ERROR:
        return lifecycle.rejectDone(task, newstate, body, UID, schema)
      case STATE.DONE:
        return lifecycle.approveDone(task, newstate, body, UID, schema)
      case STATE.CLOSED:
        return lifecycle.closeTask(task, newstate, body, UID, schema)
      default:
        return lifecycle.defaultCase(task, newstate, body, UID)
    }
  }
}