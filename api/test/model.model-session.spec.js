/**
 * Test the Agent model
 */

const InitTest = require('./init-test');
let  DbMongo;

const chai = require('chai');
const assert = chai.assert;
const ModelSession = require('../model/model-session');

const Setup = require('../lib/setup');

describe('model.agent', () => {

  let session;

  before(async () => {
     await ModelSession.deleteMany({})
     DbMongo =  await InitTest.DbMongo;
     session = await InitTest.Session;
     await Setup.runSetup(session)
  });

  it('expire update', async() => {
    ModelSession.expireAfter('1 seconds');
    assert.deepEqual(ModelSession.expireAfter(), {count: 1, type: 'seconds'})
  })

  it('create', async () => {
    let ms = await ModelSession.create({model: 'art'});
    assert.isDefined(ms);
    assert.isDefined(ms.expire);
    assert.isDefined(ms.key)
    assert.isTrue(ms.key.length > 10)
  });

  it('find existing', async() => {
    ModelSession.expireAfter('10 seconds');
    let ms = await ModelSession.create({model: 'art2'});
    let key = ms.key;
    let timeKey = ms.expire;
    assert.isDefined(key);

    let rec = await ModelSession.findByKey(key);
    assert.notEqual(rec, false);
    assert.equal(rec.model, 'art2');
    assert.notEqual(rec.expire, timeKey, 'should have updated the expire');

    ModelSession.expireAfter('1 ms');
    rec = await ModelSession.findByKey(key);
    assert.isFalse(rec, 'is expired');

    // reset the expire to an acceptable version
    ModelSession.expireAfter('10 seconds');
  })
});
