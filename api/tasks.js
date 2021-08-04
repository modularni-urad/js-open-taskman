import _ from 'underscore'
import { TABLE_NAMES, MULTITENANT } from '../consts'
import entity from 'entity-api-base'
const conf = {
  tablename: TABLE_NAMES.TASKS,
  editables: ['name', 'tags', 'desc', 'prio', 'due']
}

function _getOrgId (req) {
  return 1
}

export default (knex) => ({
  create: (req, res, next) => {
    Object.assign(req.body, { owner: req.user.id })
    MULTITENANT && Object.assign(req.body, { orgid: _getOrgId(req) })
    entity.create(req.body, conf, knex)
      .then(saved => res.status(201).json(saved))
      .catch(next)
  },
  update: (req, res, next) => {
    entity.update(req.params.id, req.body, conf, knex)
      .then(saved => res.json(saved))
      .catch(next)
  },
  list: (req, res, next) => {
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : {}
    MULTITENANT && Object.assign(req.query.filter, { orgid: _getOrgId(req) })
    entity.list(req.query, conf, knex)
      .then(data => res.json(data))
      .catch(next)
  },
  checkData: (req, res, next) => {
    try {
      entity.check_data(req.body, conf)
      next()
    } catch (err) {
      next(err)
    }
  }
})