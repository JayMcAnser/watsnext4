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
  })

  describe('distribution errors', async() => {
    // validate the entire test dataset by recalculating it
    it('list errors', async() => {
      let qry = new QueryRoyalties();
      let errors = await qry.distributionErrors({query:{}})

      assert.equal(errors.length, 3, '2 are number of programmed errors for testing')
    })

  });

  describe('royalties per contact in range', async() => {

    it ('list the contacts - all', async() => {
      let artistsReq = {
        query: {
          start: Moment().subtract(21, 'day').format('YYYYMMDD'),
          end: Moment().subtract('19', 'days').format('YYYYMMDD'),
          recalc: true
        }
      }

      let qry = new QueryRoyalties(artistsReq);
      let contacts = await qry.contactEvents(artistsReq);
      assert.equal(contacts.length, 4)
      assert.equal(contacts[0].contact.name, 'select-artist-1')
      assert.equal(contacts[0].events.length, 3);
      assert.equal(contacts[0].total, 910)

      assert.equal(contacts[0].events[0].event, 'event.99986003');

      // --- rest can be checked but it should be alright now
    })

    it ('list the contacts - only year', async() => {
      let artistsReq = {
        query: {
          start: Moment().subtract(21, 'day').format('YYYYMMDD'),
          end: Moment().subtract('19', 'days').format('YYYYMMDD'),
          recalc: true,
          royaltyType: 0
        }
      }

      let qry = new QueryRoyalties(artistsReq);
      let contacts = await qry.contactEvents(artistsReq);
      assert.equal(contacts.length, 3)
      assert.equal(contacts[0].contact.name, 'select-artist-1')
      assert.equal(contacts[0].events.length, 3);
      assert.equal(contacts[0].total, 910)
    })

    it ('list the contacts - only quarter', async() => {
      let artistsReq = {
        query: {
          start: Moment().subtract(21, 'day').format('YYYYMMDD'),
          end: Moment().subtract('19', 'days').format('YYYYMMDD'),
          recalc: true,
          royaltyType: 1
        }
      }

      let qry = new QueryRoyalties(artistsReq);
      let contacts = await qry.contactEvents(artistsReq);
      assert.equal(contacts.length, 2)
      assert.equal(contacts[0].contact.name, 'select-artist-3')
      assert.equal(contacts[0].events.length, 1);
      assert.equal(contacts[0].total, 130)
    })

    // problem: one contact gets the royalties of two artists.
    // artist.1 has a quarterly contract, artist.2 has a year contract
    // how does the system react?
    it ('one contact with multiple artists - full', async() => {
      let artistsReq = {
        query: {
          year: '2011',
          recalc: true,
        }
      }
      let qry = new QueryRoyalties(artistsReq);
      let contacts = await qry.contactEvents(artistsReq);
      assert.equal(contacts.length, 1)
      assert.equal(contacts[0].events.length, 4, 'all available')
    })
    it ('one contact with multiple artists - full', async() => {
      let artistsReq = {
        query: {
          year: '2011',
          recalc: true,
          royaltyType: 0
        }
      }
      let qry = new QueryRoyalties(artistsReq);
      let contacts = await qry.contactEvents(artistsReq);
      assert.equal(contacts.length, 1)
      assert.equal(contacts[0].events.length, 2, 'one artist has year contract')
    })

  })

  // ----
  // selecting date on date definitions
  describe('distribution contracts on dates', async () => {
    it('query - range', async () => {
      let req = {query: {
        start: Moment().subtract(21, 'day').format('YYYYMMDD'),
        end: Moment().subtract('19', 'days').format('YYYYMMDD')
      }}
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX['royalties-contact-count']);
      let r = data[0];
      assert.isDefined(r._id);
      assert.isDefined(r.event);
      assert.isDefined(r.locationId);
    })
  })

  // ----
  // selection date ranges based on year and quarter
  //
  describe('distribution contracts on periods', async() => {
    it('check count per period quarter 1', async() => {
      let req = {
        query: {
          year: DataDistribution.DIST_DATA_INDEX['royalties-period-year'],
          quarter: 0,
        }
      }
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX['royalties-period-0-count']);
    })
    it('check count per quarter 2', async() => {
      let req = {
        query: {
          year: DataDistribution.DIST_DATA_INDEX['royalties-period-year'],
          quarter: 1,
        }
      }
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX['royalties-period-1-count']);
    })
    it('check count per year', async() => {
      let req = {
        query: {
          year: DataDistribution.DIST_DATA_INDEX['royalties-period-year'],
        }
      }
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX['royalties-period-all-count']);
    })
  })


  // ----
  // converting distribution contracts to artist lines
  // ----
  describe('royalties', async() => {
    it('query - distribution in range', async () => {
      let req = {query: {
          start: Moment().subtract(21, 'day').format('YYYYMMDD'),
          end: Moment().subtract('19', 'days').format('YYYYMMDD')
        }}
      let qry = new QueryRoyalties(req);
      let data = await qry.data(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX['royalties-contact-count']);
      let r = data[0];
      assert.isDefined(r._id);
      assert.isDefined(r.event);
      assert.isDefined(r.locationId);
    })
    it('query - distribution lines in range', async () => {
      let req = {query: {
          start: Moment().subtract('21', 'day').format('YYYYMMDD'),
          end: Moment().subtract('19', 'days').format('YYYYMMDD'),
          recalc: 1 // force the recalculation for agent needed
        }}
      let qry = new QueryRoyalties(req);
      let data = await qry.royaltyLines(RoyaltyModel, req)
      assert.equal(data.length, DataDistribution.DIST_DATA_INDEX['royalties-line-count']);
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
          start: Moment().subtract(21, 'day').format('YYYYMMDD'),
          end: Moment().subtract('19', 'days').format('YYYYMMDD'),
          recalc: true
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
    it('list of error royalties', async() => {
      let req = {
        query: {
          start: Moment().subtract(31, 'day').format('YYYYMMDD'),
          end: Moment().subtract('29', 'days').format('YYYYMMDD'),
          recalc: 1
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
        start: Moment().subtract(21, 'day').format('YYYYMMDD'),
        end: Moment().subtract('19', 'days').format('YYYYMMDD')
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
