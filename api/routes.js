import Tasks from './tasks'
import Comments from './comments'
import Solvers from './solvers'

export default (ctx) => {
  const { auth, express, bodyParser } = ctx
  const { required, session } = auth
  const api = express()
  const taskMW = Tasks(ctx)
  const commetsMW = Comments(ctx)
  const solversMW = Solvers(ctx)

  api.post('/', session, required, bodyParser, taskMW.checkData, taskMW.create)
  api.put('/:id', session, required, bodyParser, taskMW.checkData, taskMW.update)
  api.get('/', session, required, taskMW.list)

  api.post('/:id/comments', session, required, bodyParser, commetsMW.create)
  api.get('/:id/comments', commetsMW.list)

  api.post('/:id/delegation/:uid', session, required, (req, res, next) => {
    solversMW.delegate(req.params.id, req.params.uid, req.user.id.toString(), req.tenantid)
      .then(saved => res.json(saved))
      .catch(next)
  })
  api.put('/:id/state/:state', session, required, bodyParser, (req, res, next) => {
    solversMW.changeState(req.params.id, req.params.state, req.body, req.user.id.toString(), req.tenantid)
      .then(saved => res.json(saved))
      .catch(next)
  })
  return api
}
