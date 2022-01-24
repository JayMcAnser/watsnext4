import * as chai from 'chai';
import {Database} from "../src/lib/database";
const assert = chai.assert;
import {MockApiServer} from "../mock/api-server.mock";
import {ApiServer} from "../src/lib/api-server";

describe('database', () => {
  const MockApi = new MockApiServer();

  describe('create', () => {
    it('new', () => {
      let db = new Database();
      assert.isDefined(db)
    });

    it ('table names', () => {
      let db = new Database();
      assert.isTrue(Array.isArray(db.tableNames));
      assert.isTrue(db.tableNames.length > 0);
      assert.isTrue(db.tableNames.indexOf('art') >= 0)
    });

    it ('table exists', () => {
      let db = new Database();
      assert.isDefined(db.table.art);
      assert.isDefined(db.table['art'])
      assert.equal(db.table.art.modelName, 'art')
    });

    it ('table does not exist', () => {
      let db = new Database();
      assert.isFalse(db.hasTable('xxx'));
    })

    it('test mocking', () => {
      let db = new Database({apiServer: MockApi});
      let art = db.table.art;
      assert.isTrue(art.apiServer.isMock)
    })
  });

  describe('record access', () => {
    before(() => {
      MockApi.setQueryResult('art', [{id: 'a1', title: 'title 1'}, {id: 'a2', title: 'title2'}])
    })

    it('get one record', async() => {
      let db = new Database({apiServer: MockApi});
      let qry = await db.table.art.findById('a1');
      assert.isDefined(qry);
      assert.equal(qry.record.ref.title, 'title 1');
      assert.equal(db.table.art.size, 1)
      qry.unlink()
      assert.equal(db.table.art.size, 0)
    })
  })

  describe('api access', () => {
    // We should run the standard develop server for this to work

    it('check develop server port', () => {
      let db = new Database({apiServer: new ApiServer()});
      assert.equal(db.apiServer.port, 3055)

    })
    // it('get one record', async() => {
    //   let qry = await db.table.art.findById('a1');
    //   assert.isDefined(qry);
    //   assert.equal(qry.record.ref.title, 'title 1');
    //   assert.equal(db.table.art.size, 1)
    //   qry.unlink()
    //   assert.equal(db.table.art.size, 0)
    // })

  })

})
