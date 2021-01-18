import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import { attachPaginate } from 'knex-paginate'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import initAuth from 'modularni-urad-utils/auth'
import initDB from 'modularni-urad-utils/db'
import initTaskRoutes from './api/task_routes'
import initTagRoutes from './api/tags'

export default async function init (mocks = null) {
  attachPaginate()
  const migrationsDir = path.join(__dirname, 'migrations')
  const knex = mocks
    ? await mocks.dbinit(migrationsDir)
    : await initDB(migrationsDir)

  const app = express()
  const JSONBodyParser = bodyParser.json()
  const auth = mocks ? mocks.auth : initAuth(app)
  const appContext = { express, knex, auth, JSONBodyParser }

  app.use('/tasks', initTaskRoutes(appContext))
  app.use('/tags', initTagRoutes(appContext))

  initErrorHandlers(app) // ERROR HANDLING

  return app
}
