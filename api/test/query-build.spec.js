const app = require('../index');
const chai = require('chai');
const assert = chai.assert;

const QueryBuild = require('../lib/query-builder');
const ITEMS_PER_PAGE = require('../lib/query-builder').itemsPerPage

describe('query-builder', () => {

  it('init', () => {
    let qry = new QueryBuild({table: 'art', fields: ['title', 'yearFrom']})
    assert.isDefined(qry);
  })

  it('need params', () => {
    try {
      let qry = new QueryBuild({fields: ['title', 'yearFrom']})
      assert.fail('need params')
    } catch (e) {
    }
    try {
      let qry = new QueryBuild({table: 'art'})
      assert.fail('need params')
    } catch (e) {
    }
  });

  describe('filter', () => {
    it('limit - page', () => {
      const pageNo = '2';
      let builder = new QueryBuild({table: 'art', fields: ['title', 'yearFrom']})
      let filter = builder.parse({query:{
        "page": pageNo
      }})
      assert.isDefined(filter.skip);
      assert.isDefined(filter.limit);
      assert.equal(filter.limit, QueryBuild.itemsPerPage);
      assert.equal(filter.skip, pageNo * QueryBuild.itemsPerPage)
    })
    it('limit - none', () => {
      let builder = new QueryBuild({table: 'art', fields: ['title', 'yearFrom']})
      let filter = builder.parse({query:{}})
      assert.isDefined(filter.skip);
      assert.isDefined(filter.limit);
      assert.isFalse(filter.skip)
      assert.isFalse(filter.limit)
    })

    it('query - single', () => {
      let builder = new QueryBuild({table: 'art', fields: ['title']})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.title);
      assert.equal(qry.filter.title, 'work');
    })
    it('query - multi value', () => {
      let builder = new QueryBuild({table: 'art', fields: ['title']})
      let qry = builder.parse({query:{
          "query": 'work again'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter['$and']);
      assert.isTrue(Array.isArray(qry.filter['$and']))
      assert.equal(qry.filter['$and'].length, 2);
      assert.equal(qry.filter['$and'][0].title, 'work')
    })
    it('query - multi field', () => {
      let builder = new QueryBuild({table: 'art', fields: ['title', 'year']})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter['$or']);
      assert.isTrue(Array.isArray(qry.filter['$or']))
      assert.equal(qry.filter['$or'].length, 2);
      assert.equal(qry.filter['$or'][0].title, 'work')
    });
    it('query - multi field, multi value', () => {
      let builder = new QueryBuild({table: 'art', fields: ['title', 'year']})
      let qry = builder.parse({query:{
          "query": 'work again'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter['$or']);
      assert.isTrue(Array.isArray(qry.filter['$or']))
      assert.equal(qry.filter['$or'].length, 2);
      assert.isDefined(qry.filter['$or'][0]['$and']);
      assert.isTrue(Array.isArray(qry.filter['$or'][0]['$and']))
      assert.equal(qry.filter['$or'][0]['$and'].length, 2)
      assert.equal(qry.filter['$or'][0]['$and'][0].title, 'work')
      assert.equal(qry.filter['$or'][0]['$and'][1].title, 'again')
      assert.equal(qry.filter['$or'][1]['$and'][0].year, 'work')
      assert.equal(qry.filter['$or'][1]['$and'][1].year, 'again')
    });

    it('query - compare - sign', () => {
      let builder = new QueryBuild({table: 'art', fields: ['%title']})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title['$regex']);
      assert.equal(qry.filter.title['$regex'], 'work')
      assert.equal(qry.filter.title['$options'], 'i')
    })

    it('query - compare - field', () => {
      let builder = new QueryBuild({table: 'art', fields: [{fieldName: 'title', compare: 'contain'}]})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title['$regex']);
      assert.equal(qry.filter.title['$regex'], 'work')
      assert.equal(qry.filter.title['$options'], 'i')
    })

    it('query - compare - field. caseSensitive true', () => {
      let builder = new QueryBuild({table: 'art', fields: [{fieldName: 'title', compare: 'contain', caseSensitive: true}]})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title['$regex']);
      assert.equal(qry.filter.title['$regex'], 'work')
      assert.isUndefined(qry.filter.title['$options'])
    })

    it('query - compare - field. caseSensitive false', () => {
      let builder = new QueryBuild({table: 'art', fields: [{fieldName: 'title', compare: 'contain', caseSensitive: false}]})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title);
      assert.isDefined(qry.filter.title['$regex']);
      assert.equal(qry.filter.title['$regex'], 'work')
      assert.equal(qry.filter.title['$options'], 'i')
    })

  })

});
