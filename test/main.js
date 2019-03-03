/* global describe it before after */
// const fs = require('fs')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const should = chai.should()
const express = require('express')
import jwt from 'jsonwebtoken'

process.env.SERVER_SECRET = 'fhdsakjhfkjal'
// const rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15)
// process.env.DATABASE_URL = rand + 'test.sqlite'
process.env.NODE_ENV = 'test'
process.env.REPO_PATH = '/tmp'
const port = process.env.API_PORT = process.env.PORT || 3333
const g = {
  baseurl: `http://localhost:${port}`,
  gimli: {
    name: 'gimli', id: 1
  },
  gandalf: {
    name: 'gandalf', id: 11
  }
}
g.gimliToken = `Bearer ${jwt.sign(g.gimli, process.env.SERVER_SECRET)}`
g.gandalfToken = `Bearer jwt.sign(g.gandalf, process.env.SERVER_SECRET)}`

describe('app', () => {
  const App = require('../app')
  const initDB = require('../db')

  before((done) => {
    initDB().then(db => {
      g.db = db
      g.app = express()
      App(g.app, {knex: db})
      setTimeout(() => {
        g.server = g.app.listen(port, (err) => {
          return err ? done(err) : done()
        })
      }, 200)
    })
    .catch(done)
  })

  after((done) => {
    g.server.close()
    // fs.unlinkSync(process.env.DATABASE_URL)
    done()
  })

  it('should exist', (done) => {
    should.exist(g.app)
    return done()
  })

  describe('API', () => {
    //
    const submodules = [
      './tasks',
      './tags'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
