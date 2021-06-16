import _ from 'underscore'
import { TABLE_NAMES, STATE } from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.TASKS, (table) => {
    table.increments('id').primary()
    table.string('name', 64).notNullable()
    table.text('desc').notNullable()
    table.json('tags').notNullable()
    table.string('owner').notNullable()
    table.json('solvers').notNullable().defaultTo([])
    table.enum('state', _.values(STATE)).notNullable().defaultTo(STATE.NEW)
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.TASKS)
}
