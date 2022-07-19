/**
 * test query interface of royalties
 *
 * @jay: 2022-07-14
 */
const Init = require("./init-test");
const chai = require('chai');
const assert = chai.assert;
const QueryRoyalty = require('../lib/query/query-royalty');
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

  describe('artist list', async() => {
    it('query - artists in range', async () => {
      let req = {
        query: {
          start: Moment().subtract(21, 'day').format('YYYY-MM-DD'),
          end: Moment().subtract('19', 'days').format('YYYY-MM-DD')
        }
      }
      let qry = new QueryRoyalties(req);
      let data = await qry.artists(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX["royalties-artist-count"]);
      let r = data[0];
      assert.isDefined(r._id);
      assert.equal(r.agent.name, 'artist.9697002');
      assert.equal(r.lineCount, DataDistribution.selectArtist(r.agent.agentId).lineCount)
    })
  })

  describe('errors', async() => {
    before(async() => {
      let recs = await Distribution
        .findRoyalties({startDate: Moment().subtract(31, 'day'), endDate: new Moment().subtract('29', 'days'), shouldProcess: true })
      for (let index = 0; index < recs.length; index++) {
        let roy = await Distribution.findById(recs[index]._id);
        await roy.royaltiesCalc();
        await roy.save();
      };
    })

    it('list of error royalties', async() => {
      let req = {
        query: {
          start: Moment().subtract(31, 'day').format('YYYY-MM-DD'),
          end: Moment().subtract('29', 'days').format('YYYY-MM-DD')
        }
      }
      let qry = new QueryRoyalties(req);
      let data = await qry.royaltyErrors(RoyaltyModel, req);
      assert.equal(data.length, 2);
      assert.equal(data[0].event, 'event.99995001')
    })
  })

  describe('artist', async() => {
    let artists;
    let artistsReq = {
      query: {
        start: Moment().subtract(21, 'day').format('YYYY-MM-DD'),
        end: Moment().subtract('19', 'days').format('YYYY-MM-DD')
      }
    }

    /**
     * we have to find the list of artist
     */
    before(async() => {
      let qry = new QueryRoyalties(artistsReq);
      artists = await qry.artists(RoyaltyModel, artistsReq)
    })

    it('query - distribution in range', async () => {
      assert.isTrue(artists.length > 0);
      let req = Object.assign({}, artistsReq);
      req.query.id = artists[0]._id.toString();
      let qry = new QueryRoyalties(req);
      let events = await qry.artistEvents(RoyaltyModel, req);
      let agent = DataDistribution.selectArtist(events[0].artist.agentId);
      assert.equal(events.length, agent.eventCount , 'so we know all event are selected');
      assert.equal(events[0].eventTitle, 'event.99986003')
      assert.equal(events[1].eventTitle, 'event.99986004')
      assert.equal(events[1].lines.length, 1, 'only one of the works');
      assert.equal(events[1].event.lines.length, 2, 'also works from other artists')
    })

  })

})
