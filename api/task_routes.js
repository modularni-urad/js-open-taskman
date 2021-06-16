import tasks from './tasks'
import solvers from './solvers'

export default (ctx) => {
  const { knex, auth, express } = ctx
  const app = express()
  const bodyParser = express.json()

  app.post('/', auth.required, bodyParser, (req, res, next) => {
    tasks.create(req.body, auth.getUID(req), knex)
      .then(savedid => res.status(201).json(savedid))
      .catch(next)
  })

  app.post('/:id/comments', auth.required, bodyParser, (req, res, next) => {
    tasks.createComment(req.params.id, req.body, auth.getUID(req), knex)
      .then(savedid => res.status(201).json(savedid))
      .catch(next)
  })

  app.put('/:id', auth.required, bodyParser, (req, res, next) => {
    tasks.update(req.params.id, req.body, auth.getUID(req), knex)
      .then(savedid => res.json(savedid))
      .catch(next)
  })

  app.post('/:id/solver', auth.required, bodyParser, (req, res, next) => {
    solvers.add(req.params.id, req.body, auth.getUID(req), knex)
      .then(savedid => res.json(savedid))
      .catch(next)
  })

  app.put('/:id/solver', auth.required, bodyParser, (req, res, next) => {
    solvers.change(req.params.id, req.body, auth.getUID(req), knex)
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
