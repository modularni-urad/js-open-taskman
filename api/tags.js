import { TABLE_NAMES } from '../consts'
import _ from 'underscore'

export default (ctx) => {
  const { knex } = ctx
  const app = ctx.express()

  app.get('/', (req, res, next) => {
    knex(TABLE_NAMES.TASKS).distinct('tags').select()
      .then(found => {
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
