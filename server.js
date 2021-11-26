import express from 'express'
import { attachPaginate } from 'knex-paginate'
import {
  auth,
  initDB,
  initErrorHandlers,
  initConfigManager,
  CORSconfigCallback,
  createLoadOrgConfigMW
} from 'modularni-urad-utils'
import initRoutes from './api/routes'

export async function InitApp () {
  const migrationsDir = path.join(__dirname, 'migrations')
  const knex = await initDB(migrationsDir)
  attachPaginate()

  const appContext = { express, knex, auth }

  const app = initRoutes(appContext)

  initErrorHandlers(app) // ERROR HANDLING
  return app
}

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

InitApp().then(app => {
  app.listen(port, host, (err) => {
    if (err) throw err
    console.log(`radagast listens on ${host}:${port}`)
  })
}).catch(err => {
  console.error(err)
})
