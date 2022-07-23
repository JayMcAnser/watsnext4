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

    it('query', async () => {
      return chai.request(server)
        .get('/royalty/list')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.length, DataDistribution.DIST_DATA_INDEX['royalties-contract-count']);
        })
    })
  })

  describe('sorting', async() => {
    it ('run limited - ok', async() => {
      let QUERY = {start: Moment().subtract(21, 'day').toISOString(), end: new Moment().subtract('19', 'days').toISOString(),
        sort: 'event'
      };
      let order = [];
      return chai.request(server)
        .get('/royalty/recalc')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.count, DataDistribution.DIST_DATA_INDEX['royalties-contract-count']);
          assert.isString(result.body.data.recIds[0].id)
          assert.equal(result.body.data.recIds[0].status, 'ok')
          order = result.body.data.recIds;
          QUERY.sort = 'event.rev'; // reverse the order
          return chai.request(server)
            .get('/royalty/recalc')
            .set('authorization', `bearer ${TOKEN}`)
            .query(QUERY)
            .then((result) => {
              assert.equal(result.status, 200);
              assert.equal(result.body.data.count, DataDistribution.DIST_DATA_INDEX['royalties-contract-count']);
              assert.equal(result.body.data.recIds[0].id, order[DataDistribution.DIST_DATA_INDEX['royalties-contract-count'] - 1].id, 'the first will be the last')
            })
        })
    })
  })

  describe('recalc', async() => {
    it ('run limited - ok', async() => {
      let QUERY = {start: Moment().subtract(21, 'day').toISOString(), end: new Moment().subtract('19', 'days').toISOString()};
      return chai.request(server)
        .get('/royalty/recalc')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.count, DataDistribution.DIST_DATA_INDEX['royalties-contract-count']);
          assert.isString(result.body.data.recIds[0].id)
          assert.equal(result.body.data.recIds[0].status, 'ok')
        })
    })

    it ('run limited - calc error', async() => {
      let QUERY = {start: Moment().subtract(31, 'day').toISOString(), end: new Moment().subtract('29', 'days').toISOString()};
      return chai.request(server)
        .get('/royalty/recalc')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.count, 2);
          assert.isString(result.body.data.recIds[0].id)
          assert.equal(result.body.data.recIds[0].status, 'error')
          assert.equal(result.body.data.recIds[0].errors[0].message, 'the max royalties must be less or equal 100')
        })
    });
  })

  describe('errors', async() => {
    it ('list - found', async() => {
      let QUERY = {start: Moment().subtract(31, 'day').toISOString(), end: new Moment().subtract('29', 'days').toISOString()};
      return chai.request(server)
        .get('/royalty/errors')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.length, 2);
          assert.equal(result.body.data[0].locationId, '99995001')
          assert.equal(result.body.data[0].event, 'event.99995001');
          assert.equal(result.body.data[0].lines[0].royaltyErrors[0].message, 'the max royalties must be less or equal 100');
        })
    })

    it ('list - none found', async() => {
      let QUERY = {start: Moment().subtract(21, 'day').toISOString(), end: new Moment().subtract('19', 'days').toISOString()};
      return chai.request(server)
        .get('/royalty/errors')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.equal(result.body.data.length, 0);
        })
    })
    it ('error - no token', async() => {
      let QUERY = {start: Moment().subtract(31, 'day').toISOString(), end: new Moment().subtract('29', 'days').toISOString()};
      return chai.request(server)
        .get('/royalty/errors')
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 403);
        })
    })
  })

  describe('artists', async() => {
    it ('list', async() => {
      let QUERY = {start: Moment().subtract(21, 'day').toISOString(), end: new Moment().subtract('19', 'days').toISOString()};
      return chai.request(server)
        .get('/royalty/artists')
        .set('authorization', `bearer ${TOKEN}`)
        .query(QUERY)
        .then((result) => {
          assert.equal(result.status, 200);
          // assert.equal(result.body.data.count, 4);
          // assert.isString(result.body.data.recIds[0].id)
          // assert.equal(result.body.data.recIds[0].status, 'ok')
        })
    })
  })


})
