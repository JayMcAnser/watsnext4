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
const Moment = require('moment');
const Agent = require('../model/agent');


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
      let data = DataDistribution.DIST_DATA_INDEX['royalties-artist'];
      let dist = await Distribution.findById(data.id);
      assert.equal(dist.locationId, data.distributionId);
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      let distStored = await Distribution.findById(data.id);
      assert.isFalse(distStored.hasRoyaltyErrors);
      assert.equal(distStored.lines.length, 1);
      assert.isDefined(distStored.lines[0].royalties);
      assert.equal(distStored.lines[0].royalties.length, 1, 'only the artist');
      assert.equal(distStored.lines[0].royalties[0].amount, 130)
    });

    it('distribution.royaltiesCalc - one line, one collective, 2 contact', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-collective'];
      let dist = await Distribution.findById(data.id);
      assert.equal(dist.locationId, data.distributionId);
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      let distStored = await Distribution.findById(data.id);
      assert.isFalse(distStored.hasRoyaltyErrors);
      assert.equal(distStored.lines.length, 1);
      assert.isDefined(distStored.lines[0].royalties);
      assert.equal(distStored.lines[0].royalties.length, 2)
      assert.equal(distStored.lines[0].royalties[0].amount, 72);
      assert.equal(distStored.lines[0].royalties[1].amount, 48);
    })

    it('distribution.royaltiesCalc - two lines, two artist, 2 contact', async() => {
      let data = DataDistribution.DIST_DATA_INDEX[ 'royalties-multiline'];
      let dist = await Distribution.findById(data.id);
      assert.equal(dist.locationId, data.distributionId);
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      let distStored = await Distribution.findById(data.id);
      assert.isFalse(distStored.hasRoyaltyErrors);
      assert.equal(distStored.lines.length, 2);
      assert.isDefined(distStored.lines[0].royalties);
      assert.equal(distStored.lines[0].royalties.length, 1)
      assert.equal(distStored.lines[0].royalties[0].amount, 130);
      assert.isDefined(distStored.lines[1].royalties);
      assert.equal(distStored.lines[1].royalties.length, 1)
      assert.equal(distStored.lines[1].royalties[0].amount, 260);
    });

    it('error - artist more the 100%', async () => {
      let data = DataDistribution.DIST_DATA_INDEX[ 'royalties-error-agent-max'];
      let dist = await Distribution.findById(data.id);
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      let distStored = await Distribution.findById(data.id);
      assert.isTrue(distStored.hasRoyaltyErrors);
      let a = distStored.royaltyErrors;
      assert.equal(a.length, 1)
      assert.equal(a[0].message, 'the artist percentage is more the 100%')
    });

    it('error - contacts more the 100%', async () => {
      let data = DataDistribution.DIST_DATA_INDEX[ 'royalties-error-contact-max'];
      let dist = await Distribution.findById(data.id);
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      let distStored = await Distribution.findById(data.id);
      assert.isTrue(distStored.hasRoyaltyErrors);
      let a = distStored.royaltyErrors;
      assert.equal(a.length, 1)
      assert.equal(a[0].message, 'total of artist percentage should be 100%')

    });

  });


  describe('selection', async() => {
    let cnt = 0;
    it('start range', async () => {
      let rec = await Distribution.findRoyalties({startDate: Moment().subtract(6, 'month') })
      assert.isTrue(rec.length > 0)
    });
    it('end range', async () => {
      let rec = await Distribution.findRoyalties({endDate: new Moment() })
      assert.isTrue(rec.length > 0)
    });
    it('in range', async () => {
      let rec = await Distribution.findRoyalties({startDate: Moment().subtract(6, 'month'), endDate: new Moment(), })
      assert.isTrue(rec.length > 0)
    });
    it('no range', async () => {
      let rec = await Distribution.findRoyalties()
      assert.isTrue(rec.length > 0);
      cnt = rec.length
    });

    it('shouldProcess', async() => {
      let recs = await Distribution.findRoyalties()
      let cnt = recs.length;

      let rec = await Distribution.findById(DataDistribution.DistributionIds[0].id);
      assert.isDefined(rec);
      rec.isLocked = true;
      await rec.save();

      recs = await Distribution.findRoyalties({shouldProcess: true})
      assert.isTrue(recs.length < cnt, 'should be removed');

      recs = await Distribution.findRoyalties({shouldProcess: false})
      assert.equal(recs.length, 1);

      // clean it again
      rec.isLocked = undefined;
      await rec.save();
    })
  });


  describe('processing', async () => {
    let recs
    it('unprocessed', async() => {
      recs = await Distribution
        .findRoyalties({startDate: Moment().subtract(21, 'day'), endDate: new Moment().subtract('19', 'days'), shouldProcess: true })
      assert.equal(recs.length, 4);
    })

    it('recalc - no error', async() => {
      for (let index = 0; index < recs.length; index++) {
        // aggregrated is an object not a MongoDB record!!!!!
        let roy = await Distribution.findById(recs[index]._id);
        roy = await roy.royaltiesCalc();
        await roy.save();
        assert.isFalse(roy.hasRoyaltyErrors, 'no errors (yet)')
      }
    });


  })

  describe('locking', async() => {
    it('lock', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-artist'];
      let dist = await Distribution.findById(data.id);
      assert.isTrue(dist.canRoyaltyCalc)
      await dist.lockRoyalties(session);
      dist = await Distribution.findById(data.id);
      assert.isFalse(!dist.isLocked);
      assert.equal(dist.lockHistory.length, 1);
      assert.isTrue(dist.lockHistory[0].isLocked)
    });

    it('test lock', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-artist'];
      let dist = await Distribution.findById(data.id);
      assert.isFalse(dist.canRoyaltyCalc)
    })

    it('unlock', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-artist'];
      let dist = await Distribution.findById(data.id);
      assert.isTrue(dist.isLocked);
      await dist.unlockRoyalties(session);
      dist = await Distribution.findById(data.id);
      assert.isFalse(dist.isLocked);
      assert.equal(dist.lockHistory.length, 2);
      assert.isFalse(dist.lockHistory[1].isLocked)
    });

  })

  describe('grouping', async() => {
    it('distribution.royaltiesCalc - one line, one artist, one contact', async () => {
    });
  });
})
