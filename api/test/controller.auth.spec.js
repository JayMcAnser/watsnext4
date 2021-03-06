
/**
 * testing the auth controller
 */

const Init = require('./init-test');
const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
chai.use(chaiHttp);
const assert = chai.assert;
const Setup = require('../lib/setup');


const server = 'http://localhost:3050/api';
const ROOT = '/auth';
const Config = require('config')

const AuthController = require('../vendors/controllers/auth')

describe('auth-controller', () => {

  const USER_EMAIL = Config.get('Database.Mongo.rootEmail');
  const USER_PASSWORD = Config.get('Database.Mongo.rootPassword');
  before(async() => {
    // let session = Init.Session;
   // await Setup.runSetup(await Init.Session)
  })

  describe('direct', () => {
    it('validate user', async() => {
      let token = await Init.AuthToken;
      let req = {
        headers: {'authorization': `bearer ${token}`},
        body : {}
      }
      let res = {
        obj: {},
        json: function(obj) { this.obj = obj}
      }
      let result = await AuthController.validate(
        req,
        res,
        () => {});
//      assert.equal(res.obj.status, Const.status.success, res.obj.message);
      assert.isDefined(req.session)
      assert.isDefined(req.session.user);
      assert.equal(req.session.user.email, Init.AuthEmail);
    });


    it('validate user - wrong token', async() => {
      let req = {
        body : {}
      }
      let res = {
        _headers: {},
        setHeader: function(key, value) {
          this._headers[key] = value
        },
        _status: 0,
        status: function(value) {
          this._status = value
        },
        obj: {},
        json: function(obj) { this.obj = obj}
      }
      let result = await AuthController.validate(
        req,
        res);
      assert.equal(res._status, 403);
      // assert.equal(res.obj.status, Const.status.error)
    });

    it('validate user - missing token', async() => {
      let req = {
        body : {}
      }
      let res = {
        _headers: {},
        setHeader: function(key, value) {
          this._headers[key] = value
        },
        _status: 0,
        status: function(value) {
          this._status = value
        },
        obj: {},
        json: function(obj) { this.obj = obj}
      }
      let result = await AuthController.validate(
        req,
        res);
      assert.isDefined(res._status, 403);
    });
  });

  describe('server', () => {
    let refreshToken

    it('login user', () => {
      return chai.request(server)
        .post(ROOT)
        .send({
          username: USER_EMAIL,
          password: USER_PASSWORD
        })
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data)
          assert.isDefined(result.body.data.token)
          assert.isDefined(result.body.data.refreshToken)
          assert.isDefined(result.body.data.user);
          assert.equal(result.body.data.user.email, USER_EMAIL)
          // assert.equal(result.body.data.user.name, 'root')
          refreshToken = result.body.data.refreshToken;
        })
    });
    it('login user - wrong password', () => {
      return chai.request(server)
        .post(ROOT)
        .type('form')
        .send({
          username: 'info@dropper.info',
          password: '--wrong--'
        })
        .then((result) => {
          assert.equal(result.status, 403)
          assert.isDefined(result.body.errors)
          assert.equal(result.body.errors.length, 1);
          assert.equal(result.body.errors[0].title, 'missing username')
        })
    });
    it('refresh token', () => {
      return chai.request(server)
        .post(ROOT+ '/refresh')
        .send({
          token: refreshToken
        })
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data);
          //assert.equal(result.body.data.user.name, 'test-user');
          assert.equal(result.body.data.user.email, USER_EMAIL);
          assert.isDefined(result.body.data.token);
          assert.isUndefined(result.body.data.refreshToken);
        })
    });
    it('refresh token - wrong', () => {
      return chai.request(server)
        .post(ROOT+ '/refresh')
        .send({
          token: 'aa' + refreshToken
        })
        .then((result) => {
          assert.equal(result.status, 401)
          assert.isDefined(result.body.errors);
          assert.equal(result.body.errors[0].title, 'invalid token')
        })
    });

  })
})
