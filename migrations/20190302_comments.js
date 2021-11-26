import { TABLE_NAMES } from '../consts'

function tableName (tname) {
  return process.env.CUSTOM_MIGRATION_SCHEMA 
    ? `${process.env.CUSTOM_MIGRATION_SCHEMA}.${tname}`
    : tname
}

exports.up = (knex, Promise) => {
  const builder = process.env.CUSTOM_MIGRATION_SCHEMA
    ? knex.schema.withSchema(process.env.CUSTOM_MIGRATION_SCHEMA)
    : knex.schema
  
  return knex.schema.createTable(tableName(TABLE_NAMES.COMMENTS), (table) => {
    table.increments('id').primary()
    table.integer('taskid').notNullable()
      .references('id').inTable(tableName(TABLE_NAMES.TASKS))
    table.text('content').notNullable()
    table.string('author', 64).notNullable()
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  const builder = process.env.CUSTOM_MIGRATION_SCHEMA
    ? knex.schema.withSchema(process.env.CUSTOM_MIGRATION_SCHEMA)
    : knex.schema
  return builder.dropTable(TABLE_NAMES.COMMENTS)
}
