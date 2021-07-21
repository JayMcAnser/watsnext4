import * as chai from 'chai';
const assert = chai.assert;
import {Dataset} from "../src/models/dataset";
import {RecordData} from "../src/models/record-data";
import {RecordQueue} from "../src/models/record-queue";
import {MockApiServer} from "./mock/api-server.mock";


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
      let qry = await ds.query({});
      assert.equal(qry.records.length, 2)
      assert.equal(ds.size, 2);

      let qry2 = await ds.query({});
      assert.equal(qry2.records.length, 2)
      assert.equal(ds.size, 2, 'same data, so we should reference the previous ones');

    });

    it('use one query', async() => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.query({});
      assert.equal(qry.records.length, 2)
      assert.equal(ds.size, 2);
      ds.unLink(qry);
      assert.equal(ds.size, 0);
    });

    it('use multi', async () => {
      let ds = new Dataset({modelName: 'art', apiServer: MockApi})
      let qry = await ds.query({});
      assert.equal(qry.records.length, 2)
      assert.equal(ds.size, 2);

      let qry2 = await ds.query({});
      assert.equal(qry2.records.length, 2)
      assert.equal(ds.size, 2, 'same data, so we should reference the previous ones');

      ds.unLink(qry);
      assert.equal(ds.size, 2, 'same data, so we should reference the previous ones');
      ds.unLink(qry2);
      assert.equal(ds.size, 0, 'same data, so we should reference the previous ones');

    });


  })
})
