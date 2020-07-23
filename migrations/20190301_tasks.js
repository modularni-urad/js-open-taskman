import _ from 'underscore'
import { TABLE_NAMES, PRIORITY, STATE } from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.TASKS, (table) => {
    table.increments('id').primary()
    table.string('name', 64).notNullable()
    table.text('desc').notNullable()
    table.string('tags', 64).notNullable()
    table.integer('owner').notNullable()
    table.integer('solver')
    table.enum('state', _.values(STATE)).notNullable().defaultTo(STATE.NEW)
    table.enum('prio', _.values(PRIORITY)).notNullable()
      .defaultTo(PRIORITY.NORMAL)
    table.date('due').notNullable()
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('changed')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.TASKS)
}
