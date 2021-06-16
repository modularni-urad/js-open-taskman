import { TABLE_NAMES, SOLVEREVENT_TYPE, SOLVING_STATE } from '../consts'
import _ from 'underscore'

export default {
  add: async function (taskid, body, UID, knex) {
    const task = await knex(TABLE_NAMES.TASKS).where('id', taskid).first()
    const canAdd = task.solvers.length === 0
      ? task.owner 
      : _.last(task.solvers).uid
    if (canAdd !== UID.toString()) throw new Error('you cannot add solver')

    // prepare change
    const change = { solvers: _.union(task.solvers, [body]) }
    await knex(TABLE_NAMES.TASKS).where('id', taskid).update(change)
    
    // add events
    knex(TABLE_NAMES.SOLV_EVENTS).insert([
      { taskid, typ: SOLVEREVENT_TYPE.PRIO, newval: body.prio },
      { taskid, typ: SOLVEREVENT_TYPE.SOLVER, newval: body.uid },
      { taskid, typ: SOLVEREVENT_TYPE.DUE, newval: body.due },
      { taskid, typ: SOLVEREVENT_TYPE.STATE, newval: SOLVING_STATE.PENDING }
    ])
  },
  change: async function (taskid, body, UID, knex) {
    const task = await knex(TABLE_NAMES.TASKS).where('id', taskid).first()
    if (UID === task.owner) {
      // I can change the bottom of stack, TODO: propagate change to resp. check
      Object.assign(task.solvers[0], body)
      const change = { solvers: task.solvers }
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update(change)
    } else if (UID === _.last(task.solvers).uid) {
      // I am current solver, I can modify only status

    }
  }
}