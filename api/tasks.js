import {TABLE_NAMES} from '../consts'

module.exports = (app, g) => {
  //
  app.post(`/`, g.authMW, g.bodyParser, (req, res, next) => {
    Object.assign(req.body, {owner: req.user.id})
    g.knex(TABLE_NAMES.TASKS).returning('id').insert(req.body)
    .then(savedid => {
      res.status(201).json(savedid)
      next()
    })
    .catch(next)
  })

  app.post(`/:id/comments`, g.authMW, g.bodyParser, (req, res, next) => {
    Object.assign(req.body, {author: req.user.id})
    g.knex(TABLE_NAMES.COMMENTS).returning('id').insert(req.body)
    .then(savedid => {
      res.status(201).json(savedid)
      next()
    })
    .catch(next)
  })

  app.put(`/:id`, g.authMW, g.bodyParser, (req, res, next) => {
    const change = Object.assign(req.body, {changed: new Date()})
    g.knex(TABLE_NAMES.TASKS).where('id', req.params.id).update(change)
    .then(saved => {
      res.json(saved)
      next()
    })
    .catch(next)
  })

  app.get(`/`, g.optionalAuthMW, (req, res, next) => {
    let q = g.knex(TABLE_NAMES.TASKS).where('parent', req.params.parent || null)
    if (req.query._select) {
      q = q.select(req.query._select.split(','))
      delete req.query._select
    }
    for (let k in req.query || {}) {
      q = q.where(k, '=', req.query[k])
    }
    q.then(found => {
      res.json(found)
      next()
    })
    .catch(next)
  })

  app.get(`/:id`, g.optionalAuthMW, (req, res, next) => {
    g.knex(TABLE_NAMES.TASKS).where({id: req.params.id}).first().then(data => {
      res.json(data)
      next()
    }).catch(next)
  })

  app.get(`/:id/comments`, g.optionalAuthMW, (req, res, next) => {
    g.knex(TABLE_NAMES.COMMENTS).where('taskid', req.params.id).then(data => {
      res.json(data)
      next()
    }).catch(next)
  })

  return app
}
