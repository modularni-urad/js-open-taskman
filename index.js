import path from 'path'
import express from 'express'
import { attachPaginate } from 'knex-paginate'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import { 
  required, requireMembership, isMember, getUID 
} from 'modularni-urad-utils/auth'
import initDB from 'modularni-urad-utils/db'
import initRoutes from './api/routes'

export default async function init (mocks = null) {
  const migrationsDir = path.join(__dirname, 'migrations')
  const knex = mocks
    ? await mocks.dbinit(migrationsDir)
    : await initDB(migrationsDir)
  attachPaginate()

  const auth = { required, requireMembership, isMember, getUID }
  const appContext = { express, knex, auth }

  const app = initRoutes(appContext)

  initErrorHandlers(app) // ERROR HANDLING

  return app
}
