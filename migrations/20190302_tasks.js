import {TABLE_NAMES} from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.TASKS, (table) => {
    table.increments('id').primary()
    table.string('name', 64).notNullable()
    table.string('tags', 64).notNullable()
    table.integer('owner').notNullable()
    table.date('due').notNullable()
    table.integer('progress').notNullable().defaultTo(0)
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('changed')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.TASKS)
}
