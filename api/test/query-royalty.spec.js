/**
 * test query interface of royalties
 *
 * @jay: 2022-07-14
 */

const chai = require('chai');
const assert = chai.assert;
const QueryRoyalty = require('../lib/query/query-royalty');
const Init = require("./init-test");
const DataDistribution = require("./data/distribution");
const Moment = require("moment");
const DistributionModel = require('../model/distribution');
const QueryRoyalties = require("../lib/query/query-royalty");
const RoyaltyModel = require("../model/distribution");
const Distribution = require("../model/distribution");

describe('query-royalty', () => {
  let session;

  before(async() => {
    // add the test data
    session = await Init.Session;
    await DataDistribution.removeDistribution();
    await DataDistribution.addDistribution(session);
    // must recalc the set
    recs = await Distribution
      .findRoyalties({startDate: Moment().subtract(21, 'day'), endDate: new Moment().subtract('19', 'days'), shouldProcess: true })
    for (let index = 0; index < recs.length; index++) {
      let roy = await Distribution.findById(recs[index]._id);
      roy = await roy.royaltiesCalc();
      await roy.save();
    };
  })

  describe('distribution contracts', async () => {
    it('query - range', async () => {
      let req = {query: {
        start: Moment().subtract(21, 'day').format('YYYY-MM-DD'),
        end: Moment().subtract('19', 'days').format('YYYY-MM-DD')
      }}
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, 4);
      let r = data[0];
      assert.isDefined(r._id);
      assert.isDefined(r.event);
      assert.isDefined(r.locationId);
    })
  })

  describe('royalties', async() => {
    it('query - distribution in range', async () => {
      let req = {query: {
          start: Moment().subtract(21, 'day').format('YYYY-MM-DD'),
          end: Moment().subtract('19', 'days').format('YYYY-MM-DD')
        }}
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, 4);
      let r = data[0];
      assert.isDefined(r._id);
      assert.isDefined(r.event);
      assert.isDefined(r.locationId);
    })
    it('query - distribution lines in range', async () => {
      let req = {query: {
          start: Moment().subtract(21, 'day').format('YYYY-MM-DD'),
          end: Moment().subtract('19', 'days').format('YYYY-MM-DD')
        }}
      let qry = new QueryRoyalties(req);
      let data = await qry.royaltyLines(RoyaltyModel, req)
      assert.equal(data.length, 6);
      let r = data[0];
      assert.isDefined(r._id);
      assert.isDefined(r.event);
      assert.isDefined(r.locationId);
      assert.isDefined(r.agent.agentId);
      assert.isDefined(r.royaltyAmount);
    })
  });
  it('query - artist in range', async() => {
    let req = {query: {
        start: Moment().subtract(21, 'day').format('YYYY-MM-DD'),
        end: Moment().subtract('19', 'days').format('YYYY-MM-DD')
      }}
    let qry = new QueryRoyalties(req);
    let data = await qry.artists(RoyaltyModel, req, {sort: {$sort: {'_id': 1}}})
    assert.equal(data.length, 3);
    let r = data[0];
    assert.isDefined(r._id);
    assert.equal(r.lineCount, 2)
  })

})
