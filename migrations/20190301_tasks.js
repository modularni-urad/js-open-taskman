import { TABLE_NAMES, STATE, PRIORITY } from '../consts'

function tableName (tname) {
  return process.env.CUSTOM_MIGRATION_SCHEMA 
    ? `${process.env.CUSTOM_MIGRATION_SCHEMA}.${tname}`
    : tname
}

exports.up = (knex, Promise) => {
  const builder = process.env.CUSTOM_MIGRATION_SCHEMA
    ? knex.schema.withSchema(process.env.CUSTOM_MIGRATION_SCHEMA)
    : knex.schema
  return builder.createTable(TABLE_NAMES.TASKS, (table) => {
    table.increments('id').primary()
    table.string('name', 64).notNullable()
    table.text('desc').notNullable()
    table.string('tags').notNullable()
    table.string('owner').notNullable()
    table.string('manager')
    table.string('solver')
    table.string('solvers')
    table.enum('state', Object.values(STATE)).notNullable().defaultTo(STATE.NEW)
    table.enum('prio', Object.values(PRIORITY)).notNullable().defaultTo(PRIORITY.NORMAL)
    table.date('due')
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  const builder = process.env.CUSTOM_MIGRATION_SCHEMA
    ? knex.schema.withSchema(process.env.CUSTOM_MIGRATION_SCHEMA)
    : knex.schema
  return builder.dropTable(TABLE_NAMES.TASKS)
}
