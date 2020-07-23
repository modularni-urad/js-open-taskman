/* global describe before after */
import chai from 'chai'
import initApp from '../index'
import dbinit from './utils/dbinit'
// import { ttnClient, setTTNData, integratorData } from './utils/ttn_mock'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const port = process.env.PORT || 3333
const g = {
  baseurl: `http://localhost:${port}`
}
const mocks = {
  dbinit: dbinit,
  auth: {
    required: (req, res, next) => {
      return g.UID ? next() : next(401)
    },
    getUID: (req) => g.UID
  }
}

describe('app', () => {
  before(done => {
    initApp(mocks).then(app => {
      g.server = app.listen(port, '127.0.0.1', (err) => {
        if (err) return done(err)
        done()
      })
    }).catch(done)
  })
  after(done => {
    g.server.close(err => {
      return err ? done(err) : done()
    })
  })

  describe('API', () => {
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
