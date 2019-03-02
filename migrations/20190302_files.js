import {TABLE_NAMES} from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.FILES, (table) => {
    table.increments('id').primary()
    table.integer('taskid').notNullable()
    table.string('comment', 64).defaultTo(null)
    table.integer('author').notNullable()
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.FILES)
}
