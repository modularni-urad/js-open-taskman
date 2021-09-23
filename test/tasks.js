/* global describe it */
import moment from 'moment'
import _ from 'underscore'
import { PRIORITY } from '../consts'
const chai = require('chai')
chai.should()

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const p = {
    name: 'pok1',
    tags: 'dwarfs',
    desc: 'pokus',
    prio: PRIORITY.LOW,
    due: moment().add(20, 'days')
  }

  return describe('tasks', () => {
    //
    it('must not create a new item wihout auth', async () => {
      const res = await r.post('/').send(p)
      res.should.have.status(400)
    })

    it('shall create a new item without mandatory item', async () => {
      const res = await r.post('/').send(_.omit(p, 'name'))
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create a new item pok1', async () => {
      const res = await r.post('/').send(p).set('Authorization', 'Bearer f')
      res.should.have.status(201)
      res.should.have.header('content-type', /^application\/json/)
      p.id = res.body[0]
      g.task = p
    })

    it('shall update the item pok1', async () => {
      const change = {
        name: 'pok1changed'
      }
      const res = await r.put(`/${p.id}`).send(change).set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall get the pok1', async () => {
      const res = await r.get('/').query({ filter: JSON.stringify({ id: p.id }) })
      res.body.length.should.eql(1)
      res.body[0].name.should.eql('pok1changed')
      res.should.have.status(200)
    })

    it('shall list with paginate', async () => {
      const res = await r.get('/').query({ currentPage: 1, perPage: 2 })
      // res.body.length.should.eql(1)
      // res.body[0].name.should.eql('pok1changed')
      res.should.have.status(200)
    })
  })
}
