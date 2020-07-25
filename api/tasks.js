import { whereFilter } from 'knex-filter-loopback'
import _ from 'underscore'
import { TABLE_NAMES } from '../consts'

export default { create, createComment, update, list, listComments }

function create (body, UID, knex) {
  Object.assign(body, { owner: UID })
  body.tags = !_.isString(body.tags) ? body.tags : JSON.stringify(body.tags)
  return knex(TABLE_NAMES.TASKS).returning('id').insert(body)
}

function createComment (taskid, body, UID, knex) {
  Object.assign(body, { author: UID, taskid })
  return knex(TABLE_NAMES.COMMENTS).returning('id').insert(body).then(res => {
    return knex(TABLE_NAMES.COMMENTS).where('id', res[0]).first()
  })
}

const editables = ['name', 'tags', 'desc', 'solver', 'state', 'prio', 'due']

function update (taskid, body, UID, knex) {
  body = _.pick(body, editables)
  if (!_.isUndefined(body.tags) && !_.isString(body.tags)) {
    body.tags = JSON.stringify(body.tags)
  }
  const change = Object.assign(body, { changed: new Date() })
  return knex(TABLE_NAMES.TASKS).where('id', taskid).update(change)
}

function list (query, knex) {
  const perPage = Number(query.perPage) || 10
  const currentPage = Number(query.currentPage) || null
  const fields = query.fields ? query.fields.split(',') : null
  const sort = query.sort ? query.sort.split(':') : null
  const filter = query.filter ? JSON.parse(query.filter) : null
  let qb = knex(TABLE_NAMES.TASKS)
  qb = filter ? qb.where(whereFilter(filter)) : qb
  qb = fields ? qb.select(fields) : qb
  qb = sort ? qb.orderBy(sort[0], sort[1]) : qb
  return currentPage ? qb.paginate({ perPage, currentPage }) : qb
}

function listComments (taskid, knex) {
  return knex(TABLE_NAMES.COMMENTS).where('taskid', taskid)
}
