/* global describe it */
import _ from 'underscore'
import { STATE } from '../consts'
const chai = require('chai')
chai.should()

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  return describe('tasks', () => {
    //
    it('must not delegate coz we are not owner', async () => {
      g.mockUser.id = 100
      const res = await r.post(`/${g.task.id}/delegation/200`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create delegate', async () => {
      g.mockUser.id = 42
      const res = await r.post(`/${g.task.id}/delegation/200`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
      // TODO: check status
    })

    it('must not refuse delegation we are not the delegated', async () => {
      g.mockUser.id = 100
      const res = await r.put(`/${g.task.id}/state/${STATE.DELEG_REFUSED}`)
        .send({ message: 'nechci to delat!' })
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall refuse delegation', async () => {
      g.mockUser.id = 200
      const res = await r.put(`/${g.task.id}/state/${STATE.DELEG_REFUSED}`)
        .send({ message: 'nechci to delat!' })
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall create new delegate', async () => {
      g.mockUser.id = 42
      const res = await r.post(`/${g.task.id}/delegation/300`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall accept delegation', async () => {
      g.mockUser.id = 300
      const res = await r.put(`/${g.task.id}/state/${STATE.INPROGRESS}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })
    
  })
}
