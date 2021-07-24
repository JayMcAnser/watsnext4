import * as chai from 'chai';
const assert = chai.assert;
import {Dataset} from "../src/models/dataset";
import {RecordData} from "../src/models/record-data";
import {RecordQueue} from "../src/models/record-queue";
import {MockApiServer} from "../mock/api-server.mock";
import {SearchDefinition} from "../src/lib/search-definition";


describe('dataset', () => {

  const MockApi = new MockApiServer()

  describe('create', () => {
    it('object', () => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      assert.isDefined(ds)
      assert.equal(ds.modelName, 'art')
      assert.isTrue(ds.apiServer.isMock)
    })
  });

  describe('query', () => {
    before(() => {
      MockApi.setQueryResult('art', [{id: 'a1', title: 'title 1'}, {id: 'a2', title: 'title2'}])
    })

    it('check mock', async() => {
      let recs = await MockApi.getByQuery('art', {});
      assert.equal(recs.length, 2)
    })

    it('find', async () => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.query('title');
      assert.equal(qry.records.length, 2)
      assert.equal(ds.size, 2);

      let qry2 = await ds.query('title');
      assert.equal(qry2.records.length, 2)
      assert.equal(ds.size, 2, 'same data, so we should reference the previous ones');

    });

    it('use one query', async() => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.query('title');
      assert.equal(qry.records.length, 2)
      assert.equal(ds.size, 2);
      ds.unLink(qry);
      assert.equal(ds.size, 0);
    });

    it('use multi', async () => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.query('title');
      assert.equal(qry.records.length, 2)
      assert.equal(ds.size, 2);

      let qry2 = await ds.query('title');
      assert.equal(qry2.records.length, 2)
      assert.equal(ds.size, 2, 'same data, so we should reference the previous ones');

      ds.unLink(qry);
      assert.equal(ds.size, 2, 'same data, so we should reference the previous ones');
      ds.unLink(qry2);
      assert.equal(ds.size, 0, 'empty so should remove');
    });

    it('empty query', async () => {
      let ds = new Dataset({modelName: 'art'})
      let search = new SearchDefinition({})
      let qry = await ds.query(search);
      assert.equal(qry.records.length, 0)
    })
  })

  describe('find one', () => {
    before(() => {
      MockApi.setQueryResult('art', [{id: 'a1', title: 'title 1'}, {id: 'a2', title: 'title2'}])
    })

    it ('by id', async() => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.findById('a1');
      assert.equal(qry.records.length, 1);
      assert.equal(ds.size, 1);

      ds.unLink(qry);
      assert.equal(ds.size, 0);
    })

    it ('not found', async() => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.findById('a99');
      assert.isFalse(qry);
      assert.equal(ds.size, 0)

      ds.unLink(qry);
      assert.equal(ds.size, 0);
    })

    it('unlink record', async () => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.findById('a1');
      assert.equal(qry.records.length, 1);
      assert.equal(ds.size, 1);

      qry.unlink();
      assert.equal(ds.size, 0);
    })

  })

  describe('record & query', () => {
    before(() => {
      MockApi.setQueryResult('art', [{id: 'a1', title: 'title 1'}, {id: 'a2', title: 'title2'}])
    })

    it('query result and one record', async() => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.query({});
      assert.equal(qry.records[0].ref.id, 'a1')
      assert.equal(ds.size, 2);

      let rec = await ds.findById('a1');
      assert.equal(rec.records.length, 1);
      assert.equal(ds.size, 2);

      ds.unLink(qry);
      assert.equal(ds.size, 1, 'removed one left the other one');

      ds.unLink(rec);
      assert.equal(ds.size, 0, 'removed one left');
    })


  });
})
