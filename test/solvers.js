/* global describe it */
import _ from 'underscore'
import { PRIORITY, SOLVING_STATE } from '../consts'
import moment from 'moment'
const chai = require('chai')
chai.should()

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)
  const p = {
    uid: 100,
    due: moment(),
    prio: PRIORITY.NORMAL
  }

  return describe('tasks', () => {
    //
    it('must not create a new solver coz we are not owner', async () => {
      g.mockUser.id = 100
      const res = await r.post(`/tasks/${g.task.id}/solver`).send(p)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create a new solver coz we are the owner', async () => {
      g.mockUser.id = 42
      const res = await r.post(`/tasks/${g.task.id}/solver`).send(p)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall update my resp.stack item', async () => {
      g.mockUser.id = 42
      const res = await r.put(`/tasks/${g.task.id}/solver`).send({ uid: 110 })
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall update my resp.stack item as user 110', async () => {
      g.mockUser.id = 110
      const change = { state: SOLVING_STATE.WORKING }
      const res = await r.put(`/tasks/${g.task.id}/solver`).send(change)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })
    
  })
}
