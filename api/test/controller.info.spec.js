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
const server = Init.server;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
describe('controller.art', () => {

  describe('with login', () => {
    let TOKEN;

    before(async () => {
      TOKEN = await Init.AuthToken
    });

    // it('get general info', async() => {
    //   let result = await chai.request(server)
    //     .get('/info')
    //     .set('authorization', `bearer ${TOKEN}`);
    //
    //   assert.equal(result.status, 200);
    //   assert.isUndefined(result.body.errors, 'should not have errors')
    //   let data = result.body.data
    //   assert.equal(data.username,'test');
    //   assert.isDefined(data.rights);
    //   assert.isDefined(data.mongo)
    //   assert.isDefined(data.mongo.connectionString)
    // })
    //
    // it('get model info', async() => {
    //   let result = await chai.request(server)
    //     .get('/info/models')
    //     //        .query({query: 'work'})
    //     .set('authorization', `bearer ${TOKEN}`);
    //
    //   assert.equal(result.status, 200);
    //   assert.isUndefined(result.body.errors, 'should not have errors')
    //   let data = result.body.data
    //   assert.equal(data.username,'test');
    //   assert.isDefined(data.models);
    //   assert.isDefined(data.models.art);
    //   assert.isDefined(data.models.art.searchFields)
    //   assert.isDefined(data.models.art.searchFields.default);
    //   assert.isDefined(data.models.art.searchFields.searchCode);
    //   assert.equal(data.models.art.searchFields.searchCode, 'search code');
    // })

    it('test expire JWT', async() => {
      let result = await chai.request(server)
        .get('/info/expireJwt')
        .query({time: '0.1s'})
        //        .query({query: 'work'})
        .set('authorization', `bearer ${TOKEN}`);
      assert.equal(result.status, 200)
      const data = result.body.data
      assert.isDefined(data.token)
      assert.isDefined(data.refreshToken)

      // let it expire
      await sleep(500)
      result = await chai.request(server)
        .get('/info')
        //        .query({query: 'work'})
       .set('authorization', `bearer ${data.token}`);
      assert.equal(result.status, 401, 'should say expired')
    })
  });



});
