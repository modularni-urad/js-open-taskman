import _ from 'underscore'
import { TABLE_NAMES, MULTITENANT } from '../consts'
import entity from 'entity-api-base'

const conf = {
  tablename: TABLE_NAMES.COMMENTS,
  editables: ['content']
}

export default (knex) => ({
  create: (req, res, next) => {
    // TODO: check if I can and the task is our org
    Object.assign(req.body, { author: req.user.id, taskid: req.params.id })
    entity.create(req.body, conf, knex)
      .then(saved => res.status(201).json(saved))
      .catch(next)
  },
  list: (req, res, next) => {
    Object.assign(req.query.filter, { taskid: req.params.id })
    entity.list(req.query, conf, knex)
      .then(data => res.json(data))
      .catch(next)
  }
})