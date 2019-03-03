import {TABLE_NAMES} from '../consts'
import _ from 'underscore'

module.exports = (app, g) => {
  //
  app.get(`/`, (req, res, next) => {
    g.knex(TABLE_NAMES.TASKS).distinct('tags').select().then(found => {
      const o = {}
      found.map(i => {
        i.tags.split(',').map(item => {
          o[item] = 1 // set the item as a key -> uniqueness
        })
      })
      res.json(_.keys(o))
      next()
    })
    .catch(next)
  })

  return app
}
