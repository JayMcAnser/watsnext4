/**
 * all test run this file first
 */
process.env.NODE_ENV = 'test';
process.env["NODE_CONFIG_DIR"] = __dirname + '/../../config/';

const DbMongo = require('../lib/db-mongo');
const DbMySQL = require('../lib/db-mysql');

async function init() {
  try {
    await DbMySQL.connect();
    await DbMongo.connect();
  } catch (e) {
    console.log(`[Error] starting db connection: ${e.message}`)
    throw e
  }
}


const app = require('../index');


const EMAIL = 'test@watsnext.nl';
const PASSWORD = 'no-password'
const User = require('../model/user-model');
const Const = require('../lib/const');

const createRes = function () {
  return Object.assign({} , {
      headers: {},
      state: 200,
      setHeader: function (key, value) {
        this.headers[key] = value
      },
      status: function (value) {
        this.state = value;
      },
      json: function (value) {
        this.body = value
      }
    }
  )
}

/**
 * create a session for the current test user
 */

const session = new Promise( async (resolve, reject) => {
  let user =  await User.findOne({email: EMAIL})
  if (!user) {
    user = await User.create({username:'test', email: EMAIL, password: PASSWORD, isActive: true, rights:[{module: 'system', rights: Const.rights.RIGHTS_ALL}]})
    user = await user.save()
    if (!user) {
      return reject('could not create test user')
    }
  }
  const AuthController = require('../vendors/controllers/auth')
  return resolve(AuthController.createSession(user.id))
});
module.exports.Session = session
/**
 * return the auth key of a user
 * @type {Promise<unknown>}
 */
module.exports.AuthToken = new Promise((resolve, reject) => {
  return User.findOne({email: EMAIL}).then( async (user) => {
    if (!user) {
      await session
      user = await User.findOne({email: EMAIL})
    }

    const AuthController = require('../vendors/controllers/auth');
    let req = {
      body: {
        username: EMAIL,
        password: PASSWORD
      },
    }
    // trick the auth in thinking we are a express
    let res = createRes();

    return AuthController.authenticate(
      req,
      res,
      (err) => { console.error(err)}
    ).then(() => {
      if (res.state === 200) {
        return resolve(res.body.data.token)
      } else {
        return resolve(false);
      }
    });
  })
});

module.exports.AuthUserId = new Promise((resolve) => {
  return User.findOne({email: EMAIL}).then( async(user) => {
    if (!user) {
      user = await User.create({name: 'test', email: EMAIL, password: PASSWORD})
      await user.save();
    }
    resolve(user.id);
  })
})

module.exports.AuthUser = new Promise((resolve) => {
  return User.findOne({email: EMAIL}).then( async(user) => {
    if (!user) {
      user = await User.create({name: 'test', email: EMAIL, password: PASSWORD})
    }
    resolve(user);
  })
})




module.exports.AuthEmail = EMAIL;
module.exports.AuthPassword = PASSWORD;
module.exports.init = init;
module.exports.DbMongo = DbMongo;
module.exports.DbMySQL = DbMySQL;
module.exports.server = 'http://localhost:3050/api'
