import { STATE } from '../../consts'

module.exports = (g) => {
  const r = g.chai.request(g.baseurl)

  return describe('task delegation', () => {
    //
    it('must not delegate coz we are not owner', async () => {
      g.mockUser.id = 100
      const res = await r.post(`/${g.task.id}/delegation/200`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('user 150 must not see g.task without filter', async () => {
      g.mockUser.id = 150
      g.mockUser.groups = []
      const res = await r.get(`/`).set('Authorization', 'Bearer f')
      res.should.have.status(200)
      res.body.length.should.eql(0)
    })

    it('user 150 shall see g.task without filter coz in task_observers', async () => {
      g.mockUser.groups = [ 'task_observers' ]
      const res = await r.get(`/`).set('Authorization', 'Bearer f')
      res.should.have.status(200)
      res.body.length.should.eql(1)
    })

    it('must not create delegate withou delegated person', async () => {
      g.mockUser.id = 42
      const res = await r.post(`/${g.task.id}/delegation/null`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create delegate', async () => {
      g.mockUser.id = 42
      const res = await r.post(`/${g.task.id}/delegation/150`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
      // TODO: check status
    })

    it('user 150 shall see g.task without filter, coz delegated', async () => {
      g.mockUser.id = 150
      const res = await r.get(`/`).set('Authorization', 'Bearer f')
      res.should.have.status(200)
      res.body.length.should.eql(1)
    })

    it('shall accept delegation', async () => {
      g.mockUser.id = 150
      const res = await r.put(`/${g.task.id}/state/${STATE.INPROGRESS}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall create delegate', async () => {
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

    it('must not finish task coz it is not in INPROGRESS state', async () => {
      g.mockUser.id = 42
      const res = await r.put(`/${g.task.id}/state/${STATE.FINISHED}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
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

    it('must not finish task coz i am not the solver', async () => {
      g.mockUser.id = 200
      const res = await r.put(`/${g.task.id}/state/${STATE.FINISHED}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall finish task', async () => {
      g.mockUser.id = 300
      const res = await r.put(`/${g.task.id}/state/${STATE.FINISHED}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('must not refuse finish of task coz not manager', async () => {
      g.mockUser.id = 42
      const res = await r.put(`/${g.task.id}/state/${STATE.ERROR}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall refuse finish of task', async () => {
      g.mockUser.id = 150
      const res = await r.put(`/${g.task.id}/state/${STATE.ERROR}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall accept refusal', async () => {
      g.mockUser.id = 300
      const res = await r.put(`/${g.task.id}/state/${STATE.INPROGRESS}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('must not refuse finish of task, coz sover has not finished', async () => {
      g.mockUser.id = 42
      const res = await r.put(`/${g.task.id}/state/${STATE.ERROR}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall finish task', async () => {
      g.mockUser.id = 300
      const res = await r.put(`/${g.task.id}/state/${STATE.FINISHED}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('shall accept finish of task', async () => {
      g.mockUser.id = 150
      const res = await r.put(`/${g.task.id}/state/${STATE.DONE}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('must not accept finish of task coz not manager anymore', async () => {
      g.mockUser.id = 150
      const res = await r.put(`/${g.task.id}/state/${STATE.DONE}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall accept finish of task', async () => {
      g.mockUser.id = 42
      const res = await r.put(`/${g.task.id}/state/${STATE.DONE}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })

    it('must not close the task coz not owner', async () => {
      g.mockUser.id = 150
      const res = await r.put(`/${g.task.id}/state/${STATE.CLOSED}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall close the task', async () => {
      g.mockUser.id = 42
      const res = await r.put(`/${g.task.id}/state/${STATE.CLOSED}`)
        .set('Authorization', 'Bearer f')
      res.should.have.status(200)
    })
    
  })
}
