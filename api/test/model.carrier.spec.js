/**
 * Test the carrier model
 */

const InitTest = require('./init-test');
let  DbMongo;

const chai = require('chai');
const assert = chai.assert;
const Carrier = require('../model/carrier');
const Art = require('../model/art');
const Code = require('../model/code');
const Setup = require('../lib/setup')

describe('model.carrier', function () {
  this.timeout(5000);
  let session;

  const ART_ID_1 = 2;
  const ART_ID_2 = 2;
  const CARRIER_ID_1 = 1;
  const CARRIER_ID_2 = 2;
  const CARRIER_ID_3 = 3;
  const CARRIER_ID_4 = 4;
  const CARRIER_ID_5 = 5;
  const CODE_ID_1 = 8123451
  const CODE_ID_2 = 8123452
  const CODE_ID_3 = 8123452
  before( async() => {
    DbMongo =  await InitTest.DbMongo;
    session = await InitTest.Session;

    await Carrier.deleteOne({carrierId: CARRIER_ID_1})
    await Carrier.deleteOne({carrierId: CARRIER_ID_2})
    await Carrier.deleteOne({carrierId: CARRIER_ID_3})
    await Carrier.deleteOne({carrierId: CARRIER_ID_4})
    await Carrier.deleteOne({carrierId: CARRIER_ID_5})
    await Art.deleteOne({artId: ART_ID_1})
    await Art.deleteOne({artId: ART_ID_2})
    await Code.deleteOne({codeId: CODE_ID_1})
    await Code.deleteOne({codeId: CODE_ID_2})
    await Code.deleteOne({codeId: CODE_ID_3})
    await Setup.runSetup(session)
  });

  it('create', async() => {
    let carrier = Carrier.create(session, {carrierId: CARRIER_ID_1, locationNumber: 'b1234'});
    let art = Art.create(session, {artId: ART_ID_1, title: 'The 22 works'});
    art = await art.save();

    await carrier.artAdd({art: art, source: 'the source'});
    await carrier.save();
    return await Carrier.findOne({carrierId: CARRIER_ID_1})
      .populate('artwork.art')
      .then( (obj) => {
        assert.equal(obj.carrierId, CARRIER_ID_1);
        assert.isDefined(obj.artwork, 'has link to art');
        assert.equal(obj.artwork.length, 1);
        assert.equal(obj.artwork[0].source, 'the source');
        assert.equal(obj.artwork[0].art.title, 'The 22 works');
      })
  });

  describe('codes', () => {
    it('create one', async() => {
      let carrier = Carrier.create(session, {carrierId: CARRIER_ID_2, locationNumber: 'c3'});
      carrier  = await carrier.save();
      let code = Code.create(session, {codeId: CODE_ID_1, text:'carrier code'})
      code = await code.save();
      assert.isDefined(code.codeId);
      carrier.codeAdd(code);
      await carrier.save();
      carrier = await Carrier.findOne({carrierId : CARRIER_ID_2})
        .populate('codes');
      assert.equal(carrier.codes.length, 1);
      assert.equal(carrier.codes[0].text, 'carrier code');
    });

    it('add code on create', async() => {
      let code = Code.create(session, {codeId: CODE_ID_2, text:'carrier code 2'});
      code = await code.save();
      let carrier = Carrier.create(session, {carrierId: CARRIER_ID_3, locationNumber: 'c4', codes:[code]});
      carrier  = await carrier.save();
      carrier.codeAdd(code);
      carrier = await Carrier.findOne({carrierId : CARRIER_ID_3})
        .populate('codes');
      assert.equal(carrier.codes.length, 1);
      assert.equal(carrier.codes[0].text, 'carrier code 2');
    });
  });
  describe('carrier => art', async () => {
    let art;
    let carrier;
    let code;
    it('add code', async () => {
      art = Art.create(session, {artId: ART_ID_2, title: 'The 4 works'});
      art = await art.save();
      code = Code.create(session, {codeId: CODE_ID_3, text:'carrier to art of 4'});
      code = await code.save();
      carrier = Carrier.create(session, {carrierId: CARRIER_ID_4, locationNumber: 'c5'});
      carrier  = await carrier.save();
      carrier.artAdd({art: art, source:'number 4', artCodes:[code]});
      await carrier.save();
      carrier = await Carrier.findOne({carrierId: CARRIER_ID_4})
        .populate('artwork.art')
        .populate('artwork.artCodes');

      assert.isDefined(carrier.artwork);
      assert.equal(carrier.artwork.length, 1);
      assert.equal(carrier.artwork[0].artCodes.length, 1);
      assert.equal(carrier.artwork[0].artCodes[0].text, 'carrier to art of 4');
    });
    it('add code in one run', async() => {
      carrier = Carrier.create(session, {carrierId: CARRIER_ID_5, locationNumber: 'c6', artwork: [{art: art, source:'number 4', artCodes:[code]}]});
      carrier  = await carrier.save();
      carrier = await Carrier.findOne({carrierId: CARRIER_ID_5})
        .populate('artwork.art')
        .populate('artwork.artCodes');
      assert.isDefined(carrier.artwork);
      assert.equal(carrier.artwork.length, 1);
      assert.equal(carrier.artwork[0].artCodes.length, 1);
      assert.equal(carrier.artwork[0].artCodes[0].text, 'carrier to art of 4');
    })
  })
});
