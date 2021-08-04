import _ from 'underscore'
import { MULTITENANT, TABLE_NAMES, STATE, PRIORITY } from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.TASKS, (table) => {
    table.increments('id').primary()
    MULTITENANT && table.integer('orgid').notNullable()
    table.string('name', 64).notNullable()
    table.text('desc').notNullable()
    table.json('tags').notNullable()
    table.string('owner').notNullable()
    table.string('manager')
    table.string('solver')
    table.json('solvers').notNullable().defaultTo([])
    table.enum('state', _.values(STATE)).notNullable().defaultTo(STATE.NEW)
    table.enum('prio', _.values(PRIORITY)).notNullable().defaultTo(PRIORITY.NORMAL)
    table.date('due')
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.TASKS)
}
