
module.exports = (g) => {
  const _ = g.require('underscore')
  const r = g.chai.request(g.baseurl)

  const p = {
    content: 'pok1'
  }

  return describe('comments', () => {
    //
    it('must not create a new item wihout auth', async () => {
      const res = await r.post(`/${g.task.id}/comments`).send(p)
      res.should.have.status(401)
    })

    it('must not create a new item without mandatory item', async () => {
      const res = await r.post(`/${g.task.id}/comments`).send(_.omit(p, 'content'))
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create a new comment', async () => {
      const res = await r.post(`/${g.task.id}/comments`).send(p).set('Authorization', 'Bearer f')
      res.should.have.status(201)
      res.should.have.header('content-type', /^application\/json/)
    })

    it('shall get comments', async () => {
      const res = await r.get(`/${g.task.id}/comments`)
      res.body.length.should.eql(1)
      res.body[0].content.should.eql(p.content)
      res.should.have.status(200)
    })

    it('shall list with paginate', async () => {
      const res = await r.get(`/${g.task.id}/comments`).query({ currentPage: 1, perPage: 2 })
      res.should.have.status(200)
      res.body.data.length.should.eql(1)
      res.body.data[0].content.should.eql(p.content)
    })
  })
}
