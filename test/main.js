/* global describe before after */
import chai from 'chai'
import initApp from '../index'
import dbinit from './utils/dbinit'
import SessionServiceMock from 'modularni-urad-utils/mocks/sessionService'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const port = process.env.PORT || 3333
const g = {
  baseurl: `http://localhost:${port}`,
  mockUser: { id: 42 },
  sessionBasket: []
}
const mocks = {
  dbinit: dbinit
}

describe('app', () => {
  before(done => {
    g.sessionSrvcMock = SessionServiceMock(24000, g)
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
    g.sessionSrvcMock.close()
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
