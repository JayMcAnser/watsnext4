/**
 * test if the test data is OK
 */

const Init = require('./init-test');
const chai = require('chai');
// const {describe} = require("mocha/lib/cli/run");
const assert = chai.assert;

const Distribution = require('../model/distribution');
const DataDistribution = require('./data/distribution')

describe('data.distribution', async() => {
  let session;

  before(async() => {
    session = await Init.Session;
  })
  it('remove existing', async() => {
    assert.isTrue(await DataDistribution.removeDistribution());
  })
  it('add data', async() => {
    assert.isTrue(await DataDistribution.addDistribution(session));
  });

  it('check distriLines - by art', async() => {
    const REC_INDEX = 0;
    let rec = await Distribution.find({locationId: DataDistribution.DistributionIds[REC_INDEX].distributionId }).populate(['lines.carrier', 'lines.art']);
    assert.isTrue(rec.length > 0);
    assert.equal(rec.length, 1)
    assert.equal(rec[0].locationId, DataDistribution.DistributionIds[REC_INDEX].distributionId);
    assert.equal(rec[0].lines.length, DataDistribution.DistributionIds[REC_INDEX].lines.length, 'all lines added');
    assert.equal(rec[0].lines[0].art.artId, DataDistribution.ArtIds[0].artId, 'include art')
    assert.isUndefined(rec[0].lines[0].carrier, 'no carrier');
  })

  it('check distriLines - by carrier', async() => {
    const REC_INDEX = 1;
    let rec = await Distribution.find({locationId: DataDistribution.DistributionIds[REC_INDEX].distributionId }).populate(['lines.carrier', 'lines.art']);
    assert.isTrue(rec.length > 0);
    assert.equal(rec.length, 1)
    assert.equal(rec[0].locationId, DataDistribution.DistributionIds[REC_INDEX].distributionId);
    assert.equal(rec[0].lines.length, DataDistribution.DistributionIds[REC_INDEX].lines.length, 'all lines added');
    assert.equal(rec[0].lines[0].art.artId, DataDistribution.ArtIds[0].artId, 'include art')
    assert.equal(rec[0].lines[0].carrier.carrierId, DataDistribution.CarrierIds[0].carrierId, 'include carrier')
  })
})
