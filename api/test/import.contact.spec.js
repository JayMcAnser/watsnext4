/**
 * Test the import contacts
 */


const InitTest = require('./init-test');
const Db = require('./init.db');
let DbMySql;
let  DbMongo;
const Session = require('../lib/session');
const chai = require('chai');
const assert = chai.assert;
const ImportContact = require('../import/contact-import');
const Contact = require('../model/contact');
const Setup = require('../lib/setup');


describe('import.contact', function() {
  this.timeout('10000');

  let mySQL;
  let session;

  before(async() => {
    await Db.init();
    DbMySql = await Db.DbMySQL;
    DbMongo =  await Db.DbMongo;
    session = await InitTest.Session;

    return Contact.deleteMany({}).then(() => {
      return DbMySql.connect().then((con) => {
        mySQL = con;
        let setup = new Setup();
        return setup.run(session);
      })
    })
  });

  it('check field information', () => {
    let record =  {
      "address_ID": 1,
      "address_GUID": "guid",
      "parent_ID": 1,
      "type_ID": 101,
      "full_name": "full name",
      "department": "department",
      // "contact_ID": 3,
      "sub_name": 'sub name',
      "first_name": 'first name',
      "title": "title",
      "first_letters": "letters",
      "name_insertion": "insertion",
      "name": "name",
      "name_suffix": 'suffix',
      "sort_on": "sort on",
      "search": "search",
      "mailchimp_json": 'mailchimp json',
      "mailchimp_guid": 'mailchimp guid'
    };
    let imp = new ImportContact({session});
    return imp.runOnData(record).then( (obj) => {
      assert.equal(obj.type, "institution");
      assert.equal(obj.guid, 'guid');
     // assert.equal(obj.parent, 1);
     // assert.equal(obj.fullName, 'full name');
      assert.equal(obj.department, 'department');
      // assert.equal(obj.contactId, 3);
      assert.equal(obj.subName, 'sub name');
      assert.equal(obj.firstName, 'first name');
      assert.equal(obj.title, 'title');
      assert.equal(obj.firstLetters, 'letters');
      assert.equal(obj.insertion, 'insertion');
      assert.equal(obj.name, 'name');
      assert.equal(obj.suffix, 'suffix');
      assert.equal(obj.sortOn, 'sort on');
      assert.equal(obj.search, 'search');
      assert.equal(obj.mailchimpJson,'mailchimp json');
      assert.equal(obj.mailchimpGuid, 'mailchimp guid');
    })
  });

  it('run - clean', () => {
    const limit = 10;
    let imp = new ImportContact({ session, limit: limit});
    return imp.run(mySQL).then( (result) => {
      assert.equal(result.count, limit)
    })
  });

  it('import full record codes', async () => {
    const limit = 10;
    let imp = new ImportContact({ session, limit: limit});
    await imp.runOnData({address_ID: 3});
    let cnt = await Contact.findOne({addressId: 3});
    assert.isDefined(cnt);
    assert.equal(cnt.addressId, 3)
  })
});
