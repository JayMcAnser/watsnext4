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
    const qry = DataDistribution.DIST_DATA_INDEX['royalties-data-art'];
    let rec = await Distribution.find({locationId: qry.distributionId }).populate(['lines.carrier', 'lines.art']);
    assert.isTrue(rec.length > 0);
    assert.equal(rec.length, 1)
    assert.equal(rec[0].locationId, qry.distributionId);
    assert.equal(rec[0].lines.length, qry.lines.length, 'all lines added');
    assert.equal(rec[0].lines[0].art.artId, qry.lines[0].art, 'include art')
    assert.isUndefined(rec[0].lines[0].carrier, 'no carrier');
  })

  it('check distriLines - by carrier', async() => {
    const qry = DataDistribution.DIST_DATA_INDEX['royalties-data-carrier'];
    let rec = await Distribution.find({locationId: qry.distributionId }).populate(['lines.carrier', 'lines.art']);
    assert.isTrue(rec.length > 0);
    assert.equal(rec.length, 1)
    assert.equal(rec[0].locationId, qry.distributionId);
    assert.equal(rec[0].lines.length, qry.lines.length, 'all lines added');
    let carrier = DataDistribution.CarrierIds.find(x => x.carrierId === qry.lines[0].carrier);

    assert.equal(rec[0].lines[0].art.artId, carrier.art[0].art, 'include art')
    assert.equal(rec[0].lines[0].carrier.carrierId, qry.lines[0].carrier, 'include carrier')
  })
})
