import _ from 'underscore'
import { TABLE_NAMES, SOLVEREVENT_TYPE } from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.SOLV_EVENTS, (table) => {
    table.integer('taskid').notNullable()
      .references('id').inTable(TABLE_NAMES.TASKS)
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    table.enum('typ', _.values(SOLVEREVENT_TYPE)).notNullable()
    table.string('oldval')
    table.string('newval').notNullable()
    table.primary(['taskid', 'created', 'typ'])
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.SOLV_EVENTS)
}
