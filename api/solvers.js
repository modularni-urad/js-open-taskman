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
    const newItem = Object.assign({ state: SOLVING_STATE.PENDING }, body)
    const change = { solvers: _.union(task.solvers, [newItem]) }
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
    if (UID.toString() === task.owner) {
      // I can change the bottom of stack, TODO: propagate change to resp. check
      Object.assign(task.solvers[0], body)
      const change = { solvers: task.solvers }
      await knex(TABLE_NAMES.TASKS).where('id', taskid).update(change)
    } else {
      const idx = _.findIndex(task.solvers, i => i.uid.toString() === UID.toString())
      if (idx === task.solvers.length - 1) {
        // I am current solver, I can modify only status
        Object.assign(task.solvers[idx], _.pick(body, 'state'))
        const change = { solvers: task.solvers }
        await knex(TABLE_NAMES.TASKS).where('id', taskid).update(change)
      } else if (idx >= 0) {
        // I am one of manager in stack, I can modify state of my stack item 
        // or everything except state to item below me
        Object.assign(task.solvers[idx], body.state)
        Object.assign(task.solvers[idx + 1], body)
        const change = { solvers: task.solvers }
        await knex(TABLE_NAMES.TASKS).where('id', taskid).update(change)
      } else {
        throw new Error('you cannot change solver')
      }
    }
  }
}