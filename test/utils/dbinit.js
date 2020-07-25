import Knex from 'knex'
import _ from 'underscore'
import { TABLE_NAMES } from '../../consts'
const knexHooks = require('knex-hooks')

// const rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15)
// process.env.DATABASE_URL = rand + 'test.sqlite'

export default async function initDB (migrationsDir) {
  const opts = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true,
    migrations: {
      directory: migrationsDir
    }
  }
  const knex = Knex(opts)
  knexHooks(knex)
  knex.addHook('before', 'insert', TABLE_NAMES.TASKS, (when, method, table, params) => {
    const data = knexHooks.helpers.getInsertData(params.query)
    data.tags = data.tags ? JSON.stringify(data.tags) : '{}'
  })

  function _2JSON (row, attrs) {
    _.each(attrs, attr => {
      row[attr] = JSON.parse(row[attr])
    })
  }
  knex.addHook('after', 'select', TABLE_NAMES.TASKS, (when, method, table, params) => {
    params.result && _.isArray(params.result)
      ? _.each(params.result, row => { _2JSON(row, ['tags']) })
      : _2JSON(params.result, ['tags'])
  })

  await knex.migrate.latest()

  return knex
}
