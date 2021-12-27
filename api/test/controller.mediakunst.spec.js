/**
 * test of the mediakunst controller
 *
 * version 0.0.1 Jay 2021-09-20
 */
const Init = require('./init-test');

const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
chai.use(chaiHttp);
const assert = chai.assert;

// const Mediakunst = require('../model/mediakunst')
const server = Init.server;


describe('controller.mediakunst', () => {

  let TOKEN = ''
  before(async () => {
    TOKEN = await Init.AuthToken
  });

  describe('security', () => {

    it('no auth key', () => {
      return chai.request(server)
        .get('/mediakunst')
        // .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 403, 'no access');
        })
    });

    it('with auth key', () => {
      return chai.request(server)
        .get('/mediakunst')
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200, 'no access');
          let data = result.body.data
          assert.isDefined(data.artistCount);
          assert.isDefined(data.artCount);
        })
    });
  })

  describe('art query', () => {
    it('list records', () => {
      return chai.request(server)
        .get('/mediakunst/art')
        .query({query: "Garden"})
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          let data = result.body.data
          assert.isTrue(Array.isArray(data))
          assert.equal(data.length, 1, 'same as in the query-mediakunst.spec');
          assert.isDefined(data[0].title);
        })
    })
  })
})
