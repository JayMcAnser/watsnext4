/**
 * test of the art controller
 *
 * version 0.0.1 Jay 2021-06-02
 */
const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
chai.use(chaiHttp);
const assert = chai.assert;

// must run init first because it load the wrong definition
const Init = require('./init-test');
const Art = require('../model/art')
const server = 'http://localhost:3050/api';
const ArtMock = require('./data/art.mock');

describe('controller.art', () => {

  describe('with login', () => {
    let TOKEN;

    before(async () => {
      await ArtMock.mockAdd();
      TOKEN = await Init.AuthToken
    });

    after( async () => {
      await ArtMock.mockRemove()
    })

    it('list 6 records', () => {
      return chai.request(server)
        .get('/art')
        .query({query: 'work'})
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          let data = result.body.data;
          assert.equal(data.length, 6);
          assert.isDefined(data[0].title)
        })
    })
  });
});
