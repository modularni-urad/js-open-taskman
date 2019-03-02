require('dotenv').config()
const express = require('express')
const App = require('./app')
const initDB = require('./db')
const port = process.env.PORT

const app = express()

initDB().then(knex => {
  App(app, {knex})

  app.listen(port, (err) => {
    if (err) {
      throw err
    }
    console.log(`radagast listens on ${port}`)
  })
})
