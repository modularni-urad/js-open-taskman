import _ from 'underscore'
const Knex = require('knex')

// const rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15)
// process.env.DATABASE_URL = rand + 'test.sqlite'

export default async function initDB () {
  const opts = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true
  }
  const knex = Knex(opts)

  return knex
}
