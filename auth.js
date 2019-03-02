import jwt from 'jsonwebtoken'

function getToken (req) {
  const auth = req.headers.authorization
  return auth && auth.match(/Bearer .+$/)
    ? auth.split(' ')[1]
    : req.query.token
}

function verify (token, req, next) {
  jwt.verify(token, process.env.SERVER_SECRET, (err, decoded) => {
    if (err) return next(err)
    req.user = decoded
    next()
  })
}

export const authMW = (req, res, next) => {
  const token = getToken(req)
  verify(token, req, next)
}

export const optionalAuthMW = (req, res, next) => {
  const token = getToken(req)
  token ? verify(token, req, next) : next()
}
