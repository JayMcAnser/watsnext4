


const Bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const Config = require('config')
const Const = require('../lib/const')
const Jsonfile = require('jsonfile');
const Helper = require('../lib/helper');
const { v4 : uuidv4} = require('uuid');

const GUEST_ID = 1;

let USERS = [];
let UserFilename = false
const _loadUsers = function() {
  if (USERS.length === 0) {
    UserFilename = Helper.getFullPath('users.json', { rootKey: 'Path.dataRoot'})
    USERS = Jsonfile.readFileSync(UserFilename)
  }
}
// must inialize
_loadUsers();

module.exports = {

  create: async function(user) {

//    res.json({status:"error", message: 'user.create not implemented', data:null})
    let usr = await this.findOne({email: user.email});
    if (usr) {
      throw new Error(`user already exists`)
    }
    if (user.id === undefined) {
      user.id = uuidv4();
    }
    USERS.push(user);
    Jsonfile.writeFileSync(Helper.getFullPath('users.json', { rootKey: 'Path.dataRoot'}), USERS, { spaces: 2, EOL: '\r\n' })
    return user;
  },

  _save: async function(usr) {
    let index = USERS.findIndex( (u) => u.id === usr.id)
    if (index < 0) {
      throw new Error(`user ${usr.id} not found`)
    }
    USERS[index] = usr
    Jsonfile.writeFileSync(Helper.getFullPath('users.json', { rootKey: 'Path.dataRoot'}), USERS, { spaces: 2, EOL: '\r\n' })
  },

  _filter(obj, where) {
    if (Object.keys(where).length === 0) {
      throw new Error(`[_filter] object has no values`)
    }
    for (let key in where) {
      if (!where.hasOwnProperty(key)) { continue }
      if (obj[key] !== where[key]) {
        return false;
      }
    }
    return true;
  },

  /**
   * delete a user defined by the where
   * @param where
   * @returns {boolean}
   */
  delete(where) {
    let index = USERS.findIndex( (a) => { return this._filter(a, where)})
    if (index >= 0) {
      USERS.splice(index, 1);
      Jsonfile.writeFileSync(UserFilename, USERS);
      return true;
    }
    return false;
  },

  /**
   * find one record
   *
   * @param what object holding the values of the found user
   * @returns {Promise<Object | false>}>}
   */
  findOne: async function(what) {
    // _loadUsers();
    return USERS.find( (u) => {
      return this._filter(u, what)
    }) || false
  },

  /**
   * find the user by the id
   * @param id
   * @returns {*|boolean}
   */
  async findById(id) {
    return USERS.find( (u) => {
      return this._filter(u, {id: id})
    }) || false   // should return false not undefined
  },


  /**
   * set the internal refresh token that allowes to reset the account for a user
   * @param user
   * @returns {Promise<boolean>}
   */
  async checkRefreshToken(user) {
    if (user.refreshId === undefined) {
      user.refreshId = Math.ceil(Math.random() * 2000)
      await this._save(user)
    }
    return true;
  },

  async guest() {
    let g = this.findById(GUEST_ID);
    if (!g) {
      throw new Error('guest account is missing')
    }
    return g;
  }
}

