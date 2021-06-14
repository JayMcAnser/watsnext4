/**
 * Test the Contact model
 */
const InitTest = require('./init-test');
const Db = require('./init.db');
let  DbMongo;

const chai = require('chai');
const assert = chai.assert;
const Contact = require('../model/contact');
const Setup = require('../lib/setup');


describe('model.contact', () => {
  let session;

  before( async () => {
    await Db.init();
    DbMongo =  await Db.DbMongo;
    session = await InitTest.Session;
    await Contact.deleteMany({})
    let setup = new Setup();
    return setup.run(session);
  });

  describe('location', () => {
    let cnt;
    let workId;

    before( async () => {
      cnt = await Contact.create(session, {addressId: 1, name: 'test 1'});
      return cnt.save();
    });

    it('add address', async() => {
      cnt.locationAdd({usage: 'work', street: 'Weststreet',number: '1', zipcode: '1017TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session, {addressId : 1});
      assert.equal(cnt.location.length, 1);
      assert.equal(cnt.location[0].usage, 'work');
      assert.equal(cnt.location[0].zipcode,  '1017TE');
      workId = cnt.location[0].id;
      assert.isDefined(workId)
    });

    it('update an address', async() => {
      cnt.locationUpdate(workId, {usage: 'work', street: 'Weststreet',number: '1', zipcode: '1089TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session,{addressId : 1});
      assert.equal(cnt.location.length, 1);
      assert.equal(cnt.location[0].zipcode,  '1089TE');
    });

    it('delete by id', async() => {
     cnt.locationDelete(workId);
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session,{addressId : 1});
      assert.equal(cnt.location.length, 0);
    })

    it('delete by index', async() => {
      cnt.locationAdd({usage: 'work', street: 'Weststreet',number: '1', zipcode: '1017TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt.locationDelete(0);
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session,{addressId : 1});
      assert.equal(cnt.location.length, 0);
    })
  })


});
