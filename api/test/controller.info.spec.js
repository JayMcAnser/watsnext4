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

// const  = require('../model/art')
const server = Init.server;
describe('controller.art', () => {

  describe('with login', () => {
    let TOKEN;

    before(async () => {
      TOKEN = await Init.AuthToken
    });

    it('get general info', async() => {
      let result = await chai.request(server)
        .get('/info')
//        .query({query: 'work'})
        .set('authorization', `bearer ${TOKEN}`);

      assert.equal(result.status, 200);
      assert.isUndefined(result.body.errors, 'should not have errors')
      let data = result.body.data
      assert.equal(data.username,'test');
      assert.isDefined(data.rights);
      assert.isDefined(data.mongo)
      assert.isDefined(data.mongo.connectionString)
    })

    it('get model info', async() => {
      let result = await chai.request(server)
        .get('/info/models')
        //        .query({query: 'work'})
        .set('authorization', `bearer ${TOKEN}`);

      assert.equal(result.status, 200);
      assert.isUndefined(result.body.errors, 'should not have errors')
      let data = result.body.data
      assert.equal(data.username,'test');
      assert.isDefined(data.models);
      assert.isDefined(data.models.art);
      assert.isDefined(data.models.art.searchFields)
    })
  });


});
