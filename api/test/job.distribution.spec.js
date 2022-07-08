/**
 * Testing the distribution / royalties definition
 *
 * v 1.0 JvK
 */

const Init = require('./init-test');
const chai = require('chai');
const DataDistribution = require("./data/distribution");
const Distribution = require('../model/distribution');
const assert = chai.assert;

describe('job.distribution', async() => {
  let session;

  before(async() => {
    // add the test data
    session = await Init.Session;
    await DataDistribution.removeDistribution();
    await DataDistribution.addDistribution(session)
  })

  describe('calculation', async() => {
    it('distribution.royaltiesCalc - one line, one artist, one contact', async() => {
      let data = DataDistribution.DistributionIds[DataDistribution.DIST_DATA_INDEX['royalties-artist']];
      let dist = await Distribution.findById(data.id);
      assert.equal(dist.locationId, data.distributionId);
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      dist = await Distribution.findById(data.id);
      assert.equal(dist.royaltiesErrors.length, 0,  'no errors');
      assert.equal(dist.lines.length, 1);
      assert.isDefined(dist.lines[0].royalties)
    })

  })

})
