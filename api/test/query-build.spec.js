const app = require('../index');
const chai = require('chai');
const assert = chai.assert;

const QueryBuild = require('../lib/query-builder');
const ITEMS_PER_PAGE = require('../lib/query-builder').itemsPerPage

describe('query-builder', () => {

  it('init', () => {
    let qry = new QueryBuild({ fields: ['title', 'yearFrom']})
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
      let builder = new QueryBuild({ fields: ['title', 'yearFrom']})
      let filter = builder.parse({query:{
        "page": pageNo
      }})
      assert.isDefined(filter.skip);
      assert.isDefined(filter.limit);
      assert.equal(filter.limit, QueryBuild.itemsPerPage);
      assert.equal(filter.skip, pageNo * QueryBuild.itemsPerPage)
    })
    it('limit - none', () => {
      let builder = new QueryBuild({ fields: ['title', 'yearFrom']})
      let filter = builder.parse({query:{}})
      assert.isDefined(filter.skip);
      assert.isDefined(filter.limit);
      assert.isFalse(filter.skip)
      assert.isFalse(filter.limit)
    })

    it('query - single', () => {
      let builder = new QueryBuild({ fields: ['title']})
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.title);
      assert.equal(qry.filter.title, 'work');
    })
    it('query - multi value', () => {
      let builder = new QueryBuild({ fields: ['title']})
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
      let builder = new QueryBuild({ fields: ['title', 'year']})
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
      let builder = new QueryBuild({ fields: ['title', 'year']})
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
      let builder = new QueryBuild({ fields: ['%title']})
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
      let builder = new QueryBuild({ fields: [{fieldName: 'title', compare: 'contain'}]})
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
      let builder = new QueryBuild({ fields: [{fieldName: 'title', compare: 'contain', caseSensitive: true}]})
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
      let builder = new QueryBuild({ fields: [{fieldName: 'title', compare: 'contain', caseSensitive: false}]})
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

  describe('multi filter', () => {
    it('2 filters', () => {
      const pageNo = '2';
      let builder = new QueryBuild({fields: {
        default: ['title', 'yearFrom'],
        year: ['yearFrom']
      }})
      assert.equal(builder.filterNames.length, 2)
      let qry = builder.parse({query:{
          "query": 'work'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter['$or']);
      assert.equal(qry.filter['$or'].length, 2)
      assert.equal(qry.filter['$or'][0].title, 'work');

      qry = builder.parse({query:{
          "query": 'work',
          "fields": 'year'
        }})
      assert.isDefined(qry.filter);
      assert.isDefined(qry.filter.yearFrom);
      assert.equal(qry.filter.yearFrom, 'work');
    });
  });

  describe('sorting', () => {
    it('two orders', () => {
      const pageNo = '2';
      let builder = new QueryBuild({
        fields: {
          default: ['title', 'yearFrom'],
          year: ['yearFrom']
        },
        sortOrders: {
          default: ['title', '-yearFrom'],
          year: ['-yearFrom'],
          yearAsc: ['yearFrom']
        }
      })
      assert.equal(builder.sortNames.length, 3)
      let qry = builder.parse({
        query: {
          "query": 'work'
        }
      });
      assert.isDefined(qry.sort);
      assert.equal(qry.sort.title, 1)
      assert.equal(qry.sort.yearFrom, -1)
    })
  })

  describe('view', () => {
    it('default', () => {
      let builder = new QueryBuild({ fields: ['title']})
      let qry = builder.parse({query:{
          query: 'work'
        }})
      assert.isDefined(qry.fields);
      assert.isDefined(qry.fields.id);
      assert.equal(qry.fields.id, 1);
    })

    it('multiple', () => {
      let builder = new QueryBuild({ fields: ['title'], views:{ title: {id:1, title:1}}})
      let qry = builder.parse({query:{
          query: 'work'
        }})
      assert.isDefined(qry.fields);
      assert.isDefined(qry.fields.id);
      assert.equal(qry.fields.id, 1);
      assert.equal(qry.fields.title, 1);
      assert.equal(builder.viewNames.length, 2, 'title and default')
    })

    it('multiple - select view by input', () => {
      let builder = new QueryBuild({ fields: ['title'], views:{ default: {id: 1}, title: {id:1, title:1}}})
      let qry = builder.parse({query:{
          "query": 'work',
          view: 'title'
        }})
      assert.isDefined(qry.fields);
      assert.isDefined(qry.fields.id);
      assert.equal(qry.fields.id, 1);
      assert.equal(qry.fields.title, 1);
      assert.equal(builder.viewNames.length, 2, 'title and default')
    })
  })

  describe('aggregation', () => {
    it('where', async() => {
      let builder = new QueryBuild({
        fields: {
          default: ['title']
        },
        sortOrders: {
          default: ['title'],
        }
      })
      let qry = builder.aggregate({
        query: {
          "query": 'work'
        }
      });
      assert.equal(qry.length, 3, '$match, $sort, $project');
      assert.isDefined(qry[0].$match);
      assert.isDefined(qry[1].$sort);
    })

    it('where', async() => {
      let builder = new QueryBuild({
        fields: {
          default: ['title']
        },
        sortOrders: {
          default: ['title'],
        }
      })
      let qry = builder.aggregate({
        query: {
          "query": 'work',
          "page": 1
        }
      });
      assert.equal(qry.length, 5 );
      assert.isDefined(qry[0].$match);
      assert.isDefined(qry[1].$sort);
      assert.isDefined(qry[2].$skip)
      assert.isDefined(qry[3].$limit)
      assert.isDefined(qry[4].$project)
      assert.equal(qry[3].$limit, 20);

      qry = builder.aggregate({
        query: {
          "query": 'work',
          "page": 0
        }
      });
      assert.equal(qry.length, 4);
      assert.isDefined(qry[0].$match);
      assert.isDefined(qry[1].$sort);
      assert.isDefined(qry[2].$limit)
      assert.equal(qry[2].$limit, 20);
    });
  })



});
