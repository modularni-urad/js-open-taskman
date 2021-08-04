import { MULTITENANT } from '../consts'
import Tasks from './tasks'
import Comments from './comments'
import Solvers from './solvers'

export default (ctx) => {
  const { knex, auth, express } = ctx
  const app = express()
  const bodyParser = express.json()
  const tasks = Tasks(knex)
  const comments = Comments(knex)
  const solvers = Solvers(knex)

  app.post('/', auth.required, bodyParser, tasks.checkData, tasks.create)
  app.put('/:id', auth.required, bodyParser, tasks.checkData, tasks.update)
  app.get('/', tasks.list)

  app.post('/:id/comments', auth.required, bodyParser, comments.create)
  app.get('/:id/comments', comments.list)

  app.post('/:id/delegation/:uid', auth.required, solvers.delegate)
  app.put('/:id/state/:state', auth.required, bodyParser, solvers.state)

  return app
}
