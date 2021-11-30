import { TABLE_NAMES } from '../consts'

const conf = {
  tablename: TABLE_NAMES.COMMENTS,
  editables: ['content']
}

export default (ctx) => {
  const { knex, ErrorClass } = ctx
  const entityMWBase = ctx.require('entity-api-base').default
  const _ = ctx.require('underscore')
  const MW = entityMWBase(conf, knex, ErrorClass)
  return {
    create: (req, res, next) => {
      // TODO: check if I can
      Object.assign(req.body, { author: req.user.id, taskid: req.params.id })
      MW.create(req.body, req.tenantid)
        .then(saved => res.status(201).json(saved))
        .catch(next)
    },
    list: (req, res, next) => {
      req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : {}
      Object.assign(req.query.filter, { taskid: req.params.id })
      MW.list(req.query, req.tenantid)
        .then(data => res.json(data))
        .catch(next)
    }
  }
}