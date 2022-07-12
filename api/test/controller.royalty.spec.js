/**
 * test of the art controller
 *
 * version 0.1.0 Jay 2022-07-11
 */
const Init = require('./init-test');

const chai = require('chai');
const chaiHttp = require('chai-http');
// const {describe} = require("mocha/lib/cli/run");
const DataDistribution = require("./data/distribution");
const Moment = require("moment"); //types');
chai.use(chaiHttp);
const assert = chai.assert;
const server = Init.server;

describe('controller.royalties', async() => {
  let session;
  let TOKEN;

  before(async() => {
    // add the test data
    session = await Init.Session;
    TOKEN = await Init.AuthToken
    await DataDistribution.removeDistribution();
    await DataDistribution.addDistribution(session)
  });

  describe('access', async() => {
    it('token', async() => {
      return chai.request(server)
        .get('/royalty/info')
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data, 'royalties are active');
        })
    })
    it('no token', async() => {
      return chai.request(server)
        .get('/royalty/info')
        .then((result) => {
          assert.equal(result.status, 403);
        })
    })
  })
  describe('list', async() => {
    let count = 0;
    let QUERY = {start: Moment().subtract(21, 'day').toISOString(), end: new Moment().subtract('19', 'days').toISOString()};

    it('all', async() => {
      return chai.request(server)
        .get('/royalty/list')
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.isUndefined(result.body.errors)
          assert.isTrue(result.body.data.length > 1);
          count = result.body.data.length;
        })
    });

    it('range', async () => {
      return chai.request(server)
        .get('/royalty/list')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.length, 4);
        })
    })
  })


})
