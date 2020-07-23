import tasks from './tasks'

export default (ctx) => {
  const { knex, auth, JSONBodyParser } = ctx
  const app = ctx.express()

  app.post('/', auth.required, JSONBodyParser, (req, res, next) => {
    tasks.create(req.body, auth.getUID(req), knex)
      .then(savedid => res.status(201).json(savedid))
      .catch(next)
  })

  app.post('/:id/comments', auth.required, JSONBodyParser, (req, res, next) => {
    tasks.createComment(req.params.id, req.body, auth.getUID(req), knex)
      .then(savedid => res.status(201).json(savedid))
      .catch(next)
  })

  app.put('/:id', auth.required, JSONBodyParser, (req, res, next) => {
    tasks.update(req.params.id, req.body, auth.getUID(req), knex)
      .then(savedid => res.json(savedid))
      .catch(next)
  })

  app.get('/', (req, res, next) => {
    tasks.list(req.query, knex)
      .then(data => res.json(data))
      .catch(next)
  })

  app.get('/:id/comments', (req, res, next) => {
    tasks.listComments(req.params.id, knex)
      .then(data => res.json(data))
      .catch(next)
  })

  return app
}
