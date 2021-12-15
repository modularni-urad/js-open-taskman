import { TABLE_NAMES, STATE } from '../consts'
const conf = {
  tablename: TABLE_NAMES.TASKS,
  editables: ['name', 'tags', 'desc', 'prio', 'due']
}

export default (ctx) => {
  const { knex, ErrorClass, auth } = ctx
  const entityMWBase = ctx.require('entity-api-base').default
  const MW = entityMWBase(conf, knex, ErrorClass)

  function implicitListFilter (req) {
    const iCanSeeEverything = auth.isMember(req, 'task_observers')
    return iCanSeeEverything ? {} : { or: [
      { manager: req.user.id },
      { owner: req.user.id },
      { solvers: { like: `%${req.user.id}%`} }
    ]}
  }

  return {
    create: (req, res, next) => {
      Object.assign(req.body, { owner: req.user.id })
      MW.create(req.body, req.tenantid)
        .then(saved => res.status(201).json(saved))
        .catch(next)
    },
    update: async (req, res, next) => {
      try {
        const task = await MW.get(req.params.id, req.tenantid)
        // nemenit, kdyz done, nebo nejsem owner!!!
        if (task.state === STATE.DONE) throw new ErrorClass(400, 'task done')
        if (task.owner !== req.user.id.toString()) throw new ErrorClass(400, 'task not yours')
        const saved = await MW.update(req.params.id, req.body, req.tenantid)
        res.json(saved)
      } catch (err) {
        next(err)
      }
    },
    list: (req, res, next) => {
      req.query.filter = req.query.filter 
        ? JSON.parse(req.query.filter) : implicitListFilter(req)
      MW.list(req.query, req.tenantid)
        .then(data => res.json(data))
        .catch(next)
    },
    get: (req, res, next) => {
      MW.get(req.params.id, req.tenantid).then(data => res.json(data)).catch(next)
    },
    checkData: (req, res, next) => {
      try {
        MW.check_data(req.body)
        next()
      } catch (err) {
        next(err)
      }
    }
  }
}