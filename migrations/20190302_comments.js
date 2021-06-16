import { TABLE_NAMES } from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TABLE_NAMES.COMMENTS, (table) => {
    table.increments('id').primary()
    table.integer('taskid').notNullable()
      .references('id').inTable(TABLE_NAMES.TASKS)
    table.text('content').notNullable()
    table.string('author', 64).notNullable()
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TABLE_NAMES.COMMENTS)
}
