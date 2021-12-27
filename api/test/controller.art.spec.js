/**
 * test of the art controller
 *
 * version 0.0.1 Jay 2021-06-02
 */
const Init = require('./init-test');

const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
chai.use(chaiHttp);
const assert = chai.assert;

const SEARCH_CODE_PRE = 'QBMORE-'
const Art = require('../model/art')
const server = Init.server;
const ArtMock = require('./data/art.mock');

describe('controller.art', () => {

  describe('with login', () => {
    let TOKEN;
    let id = '0';

    before(async () => {
      await ArtMock.mockAdd(SEARCH_CODE_PRE);
      TOKEN = await Init.AuthToken
    });

    after( async () => {
      await ArtMock.mockRemove(SEARCH_CODE_PRE)
    })

    it('list 6 records', () => {
      return chai.request(server)
        .get('/art')
        .query({query: 'work'})
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          let data = result.body.data
          assert.isTrue(Array.isArray(data))
          assert.equal(data.length, 6);
          assert.isDefined(data[0].title);
          assert.isDefined(data[0].created)
          // console.log(data[0])
          id = data[0]._id
        })
    });

    it('list 6 with view', () => {
      return chai.request(server)
        .get('/art')
        .query({query: 'work', view: 'title'})
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          let data = result.body.data
          assert.isTrue(Array.isArray(data))
          assert.equal(data.length, 6);
          assert.isDefined(data[0].title);
          assert.isUndefined(data[0].created)
          // console.log(data[0])
          id = data[0]._id
        })
    })

    it('get one by id', () => {
      assert.isTrue(id != '0', 'should be initialized')
      return chai.request(server)
        .get(`/art/id/${id}`)
        .set('authorization', `bearer ${TOKEN}`)
        .then((result) => {
          assert.equal(result.status, 200);
          let data = result.body.data;
          assert.isTrue(Array.isArray(data))
          assert.equal(data.length, 1);
          assert.isDefined(data[0].title);
          assert.equal(data[0]._id, id)
        })
    })

    it('update - with session', async () => {
      assert.isTrue(id != '0', 'should be initialized')
      let changedData = {
        title: 'updated'
      }
      let sessionKey = false;
      // update an record
      let result = await chai.request(server)
        .patch(`/art/${id}/new`)
        .set('authorization', `bearer ${TOKEN}`)
        .send(changedData)

      assert.equal(result.status, 200);
      assert.isUndefined(result.body.errors)
      let data = result.body.data;
      assert.isDefined(data.sessionKey);
      assert.isTrue(data.sessionKey.length > 10);
      assert.equal(data.model, 'art');
      sessionKey = data.sessionKey

      // check next update is the same session
      changedData.title = 'update.2'
      result = await chai.request(server)
        .patch(`/art/${id}/${sessionKey}`)
        .set('authorization', `bearer ${TOKEN}`)
        .send(changedData)
      assert.equal(result.status, 200);
      assert.isUndefined(result.body.errors)
      data = result.body.data;
      assert.equal(data.sessionKey, sessionKey);

    })
  });
});
