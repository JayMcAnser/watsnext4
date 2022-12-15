/**
 * test query interface of royalties
 *
 * @jay: 2022-07-14
 */
const Init = require("../init-test");
const chai = require('chai');
const assert = chai.assert;
const DataDistribution = require("../data/distribution");
const RoyaltiesContact = require('../../reports/royalties-contact')

describe('report-royalties-contact', async() => {
  let session;

  before(async() => {
    // add the test data
    session = await Init.Session;
    await DataDistribution.removeDistribution();
    await DataDistribution.addDistribution(session);
  })

  it('run query', async() => {
    let artistsReq = {
      query: {
       year: '2012',
        recalc: true,
      }
    }
    let report = new RoyaltiesContact();
    let data = await report.execute(artistsReq)

    // let qry = new QueryRoyalties(artistsReq);
    // let contacts = await qry.contactEvents(artistsReq);
    // assert.equal(contacts.length, 1)
    // assert.equal(contacts[0].events.length, 4, 'all available')
  })
})
