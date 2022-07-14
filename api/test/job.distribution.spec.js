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
const {asyncConfig} = require("config/async");


describe('job.distribution', async() => {
  let session;

  before(async() => {
    // add the test data
    session = await Init.Session;
    await DataDistribution.removeDistribution();
    await DataDistribution.addDistribution(session);
  })

  describe('calculation', async() => {
    it('distribution.royaltiesCalc - one line, one artist, one contact', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-artist'];
      let dist = await Distribution.findById(data.id);
      assert.equal(dist.locationId, data.distributionId);
      assert.isUndefined(dist.lines[0].artist, 'filled in by the calculation')
      let result = await dist.royaltiesCalc();
      await result.save();
      // reload it from disk and see if all has gone well
      let distStored = await Distribution.findById(data.id);
      assert.isFalse(distStored.hasRoyaltyErrors);
      assert.equal(distStored.lines.length, 1);
      assert.isDefined(distStored.lines[0].royaltyAmount);
      assert.equal(distStored.lines[0].royaltyAmount, 130)
      assert.isDefined(dist.lines[0].agent)
    });

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
      assert.equal(distStored.lines[0].royaltyAmount, 130);
      assert.equal(distStored.lines[1].royaltyAmount, 260);
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
      assert.equal(a[0].message, 'the max royalties must be less or equal 100')
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

  describe('calculate', async() => {
    // it('line royalties', async() => {
    //   // distribution rec  should be calculate in advance
    //   let data = DataDistribution.DIST_DATA_INDEX['royalties-multiline'];
    //   let qry = [
    //     {$match: {$expr: {$eq: ["$_id", {"$toObjectId": data.id}]}}},
    //     {$set: {
    //        "lines.royaltyAmount": {$multiply:  ["$lines.price", "0.20"]}
    //     }}
    //     ]
    //   let dist = await Distribution.aggregate(qry);
    //   assert.equal(dist.length, 2, 'found both lines');
    // })
  })

  describe('populate', async() =>  {
    it('lines.artist', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-multiline'];
      let qry = [
        {$match: {$expr: {$eq: ["$_id", {"$toObjectId": data.id}]}}},
        {$unwind: '$lines'},
        {$addFields: {
            'agent': '$lines.agent',
            'art': '$lines.art',
            'price': '$lines.price',
            'royaltyAmount': '$lines.royaltyAmount',
            'royaltyPercentage': '$lines.royaltyPercentage',
            'royaltyErrors': '$lines.royaltiesErrors'
          }
        },
        {$unset: 'lines'},
        {$lookup: {
          from: "agents",
          localField: "agent",
          foreignField: "_id",
          as: "agent"
        }},
        {$unwind: '$agent'},  // add the agent to every line

        {$lookup: {
            from: "arts",
            localField: "art",
            foreignField: "_id",
            as: "art"
          }},
        {$unwind: '$art'}
      ];
      let dist = await Distribution.aggregate(qry);
      assert.equal(dist.length, 2, 'found both lines');
      assert.equal(dist[0].agent.name, 'artist.999003')
      assert.equal(dist[1].agent.name, 'artist.999004')
      // it should be calculated
    });

    it('grouping', async() => {
      let data = DataDistribution.DIST_DATA_INDEX['royalties-multiline'];
      let qry = [
        {$match: {$expr: {$eq: ["$_id", {"$toObjectId": data.id}]}}},
        {$lookup: {
            from: "agents",
            localField: "lines.agent",
            foreignField: "_id",
            as: "agent"
          }},
        {$unwind: '$agent'},  // add the agent to every line
        {$group: {
            _id: '$agent.name',
            output: {
              agent: '$agent.name'
            }
          }
        }
      ];
      let dist = await Distribution.aggregate(qry);
      assert.equal(dist.length, 2, 'found both lines');
    })
  })

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

      let dist = await Distribution.findById(DataDistribution.DistributionIds[0].id);
      assert.isDefined(dist);
      await dist.lockRoyalties(session);
      // same but dirty: rec.isLocked = true;
      // await rec.save();

      recs = await Distribution.findRoyalties({shouldProcess: true})
      assert.isTrue(recs.length < cnt, 'should be removed');

      recs = await Distribution.findRoyalties({shouldProcess: false})
      assert.equal(recs.length, 1);

      // clean it again
      await dist.unlockRoyalties(session);
      // --> same but dirty rec.isLocked = undefined;
      // await rec.save();
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
