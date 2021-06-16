/* global describe it */
import _ from 'underscore'
const chai = require('chai')
chai.should()

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const p = {
    name: 'pok1',
    tags: 'dwarfs',
    desc: 'pokus',
    due: new Date()
  }

  return describe('tasks', () => {
    //
    it('must not create a new item wihout auth', async () => {
      g.UID = null
      const res = await r.post('/tasks').send(p)
      res.should.have.status(401)
    })

    it('shall create a new item without mandatory item', async () => {
      g.UID = 100
      const res = await r.post('/tasks').send(_.omit(p, 'name'))
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create a new item pok1', async () => {
      const res = await r.post('/tasks').send(p).set('Authorization', 'Bearer f')
      res.should.have.status(201)
      res.should.have.header('content-type', /^application\/json/)
      p.id = res.body[0]
    })

    it('shall update the item pok1', async () => {
      const change = {
        name: 'pok1changed'
      }
      const res = await r.put(`/tasks/${p.id}`).send(change).set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall get the pok1', async () => {
      const res = await r.get('/tasks/').query({ id: p.id })
      res.body.length.should.eql(1)
      res.body[0].name.should.eql('pok1changed')
      res.should.have.status(200)
    })

    it('shall list with paginate', async () => {
      const res = await r.get('/tasks/').query({ currentPage: 1, perPage: 2 })
      // res.body.length.should.eql(1)
      // res.body[0].name.should.eql('pok1changed')
      res.should.have.status(200)
    })
  })
}
