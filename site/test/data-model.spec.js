


const chai = require('chai');
const assert = chai.assert;
import Init from './init'

import DataModel from "../src/lib/data-model";
import SearchDefinition from "../src/lib/search-definition";

describe('data-model', () => {
  let authToken;
  before( async() => {
    authToken = await Init.AuthToken
  })

  describe('create', () => {
    class XModel extends DataModel {
      constructor(props = {}) {
        props.fields = ['id', 'title', 'year'];
        props.model = 'test'
        super(props);
      }

    }
    // it('create.exist', () => {
    //   let dm = new XModel();
    //   assert.isDefined(dm)
    //
    //   // this is the raw record returned from the API
    //   let art = {
    //     id: '1231412',
    //     title: 'the basis',
    //     year: '1998'
    //   }
    //   // d is the reactive model, used for screen _and_ API changes
    //   let d = dm.toModel(art);
    //   assert.equal(d.title, 'the basis');
    //   d.title = 'test';
    //   assert.equal(d.title, 'test');
    // })

    it('create.not exist', () => {
      let dm = new XModel();
      assert.isDefined(dm)
      try {
        dm.NOT = 'Jay';
        assert.fail('should throw error')
      } catch(e) {
        // should throw an error
      }
    })
  })

  describe('query', () => {
    class XModel extends DataModel {
      constructor(props = {}) {
        props.fields = ['id', 'title', 'year'];
        props.model = 'art'
        super(props);
      }
    }
    it('find records', async () => {
      let dm = new XModel();

      assert.isDefined(dm)
      let search = new SearchDefinition();
      search.query = 'title'; // there are 2 fake titles
      let records = await dm.getByQuery(search)
      assert.isDefined(records)
      assert.isTrue(Array.isArray(records))
      assert.equal(records.length, 2);
      assert.equal(records[0].reference, 1);
      assert.equal(records[0].ref.title, 'title')

      let nextRecs = await dm.getByQuery(search)
      assert.isTrue(Array.isArray(nextRecs))
      assert.equal(nextRecs.length, 2, 'same awnser');
      assert.equal(nextRecs[0].reference, 2 ,'used the existing ones');

      // now if we change records[0].title, it should change in nextRecs.title
      assert.equal(records[0].ref.title, nextRecs[0].ref.title);
      records[0].ref.title = 'title changed'
      assert.equal(records[0].ref.title, nextRecs[0].ref.title, 'did change is also');
    })



  })
});
