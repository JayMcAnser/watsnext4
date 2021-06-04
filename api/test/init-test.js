/**
 * all test run this file first
 */
process.env.NODE_ENV = 'test';
process.env["NODE_CONFIG_DIR"] = __dirname + '/../../config/';

const app = require('../index');


const EMAIL = 'info@toxus.nl';
const PASSWORD = '123456'
const User = require('../model/user');
// let user;

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
module.exports.Session = new Promise( (resolve, reject) => {
  return User.findOne({email: EMAIL}).then((user) => {
    if (!user) {
      return reject('test user not found')
    }
    const AuthController = require('../vendors/controllers/auth')
    return resolve(AuthController.createSession(user.id))
  })
});

/**
 * return the auth key of a user
 * @type {Promise<unknown>}
 */
module.exports.AuthToken = new Promise((resolve, reject) => {
  return User.findOne({email: EMAIL}).then( (user) => {
    if (!user) {
      user = User.create({name:'test', email: EMAIL, password: PASSWORD})
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
