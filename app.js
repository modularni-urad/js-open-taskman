const bodyParser = require('body-parser')
const express = require('express')
const Tasks = require('./api/tasks')
const Tags = require('./api/tags')
import cors from 'cors'
import {generalErrorHlr, authErrorHlr, notFoundErrorHlr} from './error_handlers'
import {authMW, optionalAuthMW} from './auth'

function _createError (message, status) {
  return {status: status || 400, message}
}

module.exports = (app, g) => {
  //
  Object.assign(g, {
    authMW,
    optionalAuthMW,
    createError: _createError,
    bodyParser: bodyParser.json()
  })

  process.env.USE_CORS === 'true' && app.use(cors())

  const taskApp = express()
  Tasks(taskApp, g)
  app.use('/tasks', taskApp)

  const tagApp = express()
  Tags(tagApp, g)
  app.use('/tags', tagApp)

  // ERROR HANDLING ------------------------------------------------------------
  app.use(notFoundErrorHlr, authErrorHlr, generalErrorHlr)
}
