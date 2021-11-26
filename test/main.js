import chai from 'chai'

const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const g = { chai }
require('./env/init')(g)

describe('app', () => {
  before(() => {
    const InitModule = require('../index')
    return g.InitApp(InitModule)
  })
  after(g.close)

  return describe('taskman API', async () => {
    const submodules = [
      './suites/1_tasks',
      './suites/2_comments',
      './suites/3_solvers'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
