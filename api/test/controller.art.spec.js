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
const ArtQuery = require('../lib/query-art');
const server = 'http://localhost:3050/api';
const TEST_ART = 'XXX_2021'

describe('controller.art', () => {

  describe('with login', () => {

    let TOKEN = ''
    before(async () => {
      TOKEN = await Init.AuthToken;
      let session = {user: await Init.AuthUser};
      let qry = new ArtQuery();
      // must use ROOT_USER because we logged in as a new user
      await Art.remove(session, qry.toQuery({searchcode: TEST_ART} ));
    })

    it('list', () => {
      return chai.request(server)
        .get('/art?page=2')
        .query({query: 'art test'})
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          console.log(result)
          assert.fail('no quest yet')
        })
    })
  });
});
