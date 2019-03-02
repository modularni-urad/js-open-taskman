/* global describe it */
const chai = require('chai')
// const should = chai.should()
import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const p = {
    name: 'pok1',
    tags: 'dwarfs'
  }

  return describe('tasks', () => {
    //
    it('must not create a new item wihout auth', () => {
      return r.post('/tasks').send(p)
      .then(res => {
        res.should.have.status(401)
      })
    })

    it('shall create a new item without mandatory item', () => {
      return r.post('/tasks').send(_.omit(p, 'name'))
      .set('Authorization', g.gimliToken)
      .then(res => {
        res.should.have.status(400)
      })
    })

    it('shall create a new item pok1', () => {
      return r.post('/tasks').send(p)
      .set('Authorization', g.gimliToken)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        p.id = res.body[0]
      })
    })

    it('shall update the item pok1', () => {
      const change = {
        name: 'pok1changed'
      }
      return r.put(`/tasks/${p.id}`).send(change)
      .set('Authorization', g.gimliToken)
      .then(res => {
        res.should.have.status(200)
      })
    })

    it('shall get the pok1', () => {
      return r.get(`/tasks/${p.id}`)
      .then(res => {
        res.body.name.should.eql('pok1changed')
        res.should.have.status(200)
      })
    })
  })
}
