process.env.NODE_ENV = 'test';
process.env["NODE_CONFIG_DIR"] = __dirname + '/../../config/';

const chai = require('chai');
const assert = chai.assert;

const Mongo = require('../lib/db-mongo')
const Schema = Mongo.Schema;
const ArtSchema = require('../model/art').Schema
const User = require('../model/user-model');

describe('db-mongo', () => {

  before(async () => {
    await Mongo.connect();
    Mongo.register('art',{title: String})
    let testSchema = new Schema({title: String});
    Mongo.register('Test2', testSchema);

  })

  describe('abstracts', () => {
    it('has function to connect', () => {
      let con = Mongo
      assert.isDefined(con)
      assert.isDefined(con.default)
      // console.log(con)
      // assert.equal(con, 'from data')
    })

    it('use .default of connection', () => {
      let con = Mongo;
      let mdl = con.default.model('Art');
      assert.isDefined(mdl)
      assert.isDefined(mdl.schema)
      assert.isDefined(mdl.schema.paths.title);
    });

    it('use connection direct', () => {
      let con = Mongo;
      let mdl = con.model('Art');
      assert.isDefined(mdl)
      assert.isDefined(mdl.schema)
      assert.isDefined(mdl.schema.paths.title);
    })

    it('use multi connections', () => {
      let con = Mongo;
      let mdl = con.test.model('Art');
      assert.isDefined(mdl)
      assert.isDefined(mdl.schema)
      assert.isDefined(mdl.schema.paths.title);
    });

    it('connection does not exist', () => {
      let con = Mongo;
      try {
        let mdl = con.Test.model('Art');
        assert.fail('should throw error')
      } catch (e) {
        assert.equal(e.message, 'unknown connection Test')
      }
    })
  });

  describe('on data', () => {
    it('get user test', async() => {
      let con = Mongo;
      let testSchema = {name: String};
      let UserModel = con.test.model('test', new Schema(testSchema));
      let testUsr = new UserModel({name: 'test 2'});
      let doc = await testUsr.save();
      assert.isDefined(doc);
      assert.equal(doc.name, 'test 2')
    })

    it('on default connection', async () => {
      // because ALL work on the same connection, which is defined by the session,
      // we should be able to say
      //    const Art = require('./model/art')(session)
      // or to use the default session
      //    const Art = require('./model/art')()
      // but what if we don't call the function?
      // could it be
      //    const Art = require('./model/art');
      //    let rec = Art(session).create({...})
      //    let recDefault = Art().create({...})
      // or different
      //    let recDefault = Art.create()
      //    let rec = Art.on(session).create({...})

      // from the DbMongo view:
      // * register the model in the dbMongo
      //     DbMongo.register(name, schema);
      //    const DbMongo.model('Art')                            // use default connection
      //    const DbMongo.model('Art', 'test');                   // use test connection
      //    const DbMongo.sessionInfo.model('Art', sessionInfo)   // use connection defined by sessionInfo


      const TestModel =  Mongo.model('test2');
      assert.isDefined(TestModel);
      let def = new TestModel({title:'def 1'})
      await def.save();
      assert.equal(def.title, 'def 1')
    })

    it('on test connection', async() => {

      const TestModel =  Mongo.model('test2', 'test');
      assert.isDefined(TestModel);
      let def = new TestModel({title:'def 2'})
      await def.save();
      assert.equal(def.title, 'def 2')
    });

    it('on default and watsnext connection', async () => {

      const TestModel =  Mongo.model('test2');
      assert.isDefined(TestModel);
      let def = new TestModel({title:'def 3'})
      await def.save();
      assert.equal(def.title, 'def 3')

      const OtherModel = Mongo.model('test2');
      assert.isDefined(OtherModel);
      let oDef = new OtherModel({title:'def 3'})
      await def.save();
      assert.equal(def.title, 'def 3')
    })
  });

})
