/* global describe it */
const chai = require('chai')
// const should = chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  return describe('tags', () => {
    //
    it('shall get the pok1', () => {
      return r.get(`/tags`)
      .then(res => {
        console.log(res.body)
        res.should.have.status(200)
      })
    })
  })
}
