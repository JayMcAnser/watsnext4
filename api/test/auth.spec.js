/**
 * testing the authentication
 */

process.env.NODE_ENV = 'test';
process.env["NODE_CONFIG_DIR"] = __dirname + '/../../config/';

const app = require('../index');
const chai = require('chai');
const assert = chai.assert;

const EMAIL = 'info@toxus.nl';
const PASSWORD = '123456'
const User = require('../model/user');
const ApiReturn = require('../vendors/lib/api-return');
const AuthController = require('../vendors/controllers/auth');

/**
 * return the auth key of a user
 * @type {Promise<unknown>}
 */

const createRes = function () {
  return Object.assign({} , {
      headers: {},
      setHeader: function (key, value) {
        this.headers[key] = value
      },
      status: function (value) {
        this.status = value;
      },
      json: function (value) {
        this.body = value
      }
    }
  )
}
describe('auth', () => {
  let USER_ID = ''
  let TOKEN = ''
  let SESSION = {}

  before( () => {
    return app.dbInit;
  })

  it('user should exist and have rights', async() => {
    let usr = await User.findOne({email: EMAIL});
    assert.equal(usr.email, EMAIL);
    assert.isDefined(usr.rights);
    assert.isTrue(usr.rights.length > 0);
    let systemIndex = usr.rights.findIndex( (x) => x.module === 'system')
    assert.isTrue(systemIndex >= 0)
    assert.isTrue(usr.rights[systemIndex].rights >= 7)
    USER_ID = usr.id
  });

  it('should generate a JWT token', async() => {
    let req = {
      body: {
        username: EMAIL,
        password: PASSWORD
      },
    }
    let res = createRes();
    await AuthController.authenticate(req, res);
    assert.isDefined(res.body)
    assert.isDefined(res.body.data)
    assert.isDefined(res.body.data.token)
    assert.isTrue(res.body.data.token.length > 10)
    TOKEN = res.body.data.token;
  })

  it('build session', async() => {
    // build a fake login

    // trick the auth in thinking we are a express
    let req = {
      headers: {
        'authorization': `bearer ${TOKEN}`
      }
    };
    let res = createRes()
    await AuthController.validate(req, {}, () => {ApiReturn.result(req, res, {})})
    assert.isDefined(req.session)
    assert.isDefined(req.session.user);
    assert.equal(req.session.user.id, USER_ID);
    SESSION = req.session;
  })


})
