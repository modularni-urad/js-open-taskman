
function _getConfig (req, res, next) {
  const domain = process.env.DOMAIN || req.hostname
  req.entityCfg = _.get(configs, [domain, req.params.name], null)
  
  return req.entityCfg ? next() : next(404)
}