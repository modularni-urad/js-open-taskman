/* global describe it */
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  return describe('tags', () => {
    //
    it('shall get the pok1', async () => {
      const res = await r.get('/tags')
      console.log(res.body)
      res.should.have.status(200)
    })
  })
}
