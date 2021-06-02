/**
 * global access to the mongodb
 */

const Mongoose = require('mongoose');
const Config = require('config');
const Logging = require('../vendors/lib/logging');
const Bcrypt = require('bcryptjs');

const RIGHTS_READ = 1;
const RIGHTS_WRITE = 2;
const RIGHTS_DELETE = 4;
const RIGHTS_EXPORT = 8;
const RIGHTS_ADMIN = 16

let DbMongo  = {
  /**
   * create a connection to the database
   *
   * @param options
   * @returns {Promise}
   */
  async connect(options = {}) {

    let connectionString = Config.get('Database.Mongo.host');
    if (Config.has('Database.Mongo.port')) {
      connectionString += ':' + Config.get('Database.Mongo.port')
    }
    connectionString += '/' + Config.get('Database.Mongo.database');
    if (Config.has('Database.Mongo.uriParam') && Config.get('Database.Mongo.uriParam')) {
      connectionString += '?' + Config.get('Database.Mongo.uriParam')
    }


    if (Config.has('Database.Mongo.username') && Config.get('Database.Mongo.username')) {
      let pwd = Config.get('Database.Mongo.password');
      if (pwd) {
        connectionString = `${Config.get('Database.Mongo.username')}:${Config.get('Database.Mongo.password')}@${connectionString}`
      } else {
        connectionString = `${Config.get('Database.Mongo.username')}@${connectionString}`
      }
    }
    if (Config.has('Database.Mongo.prefix') && Config.get('Database.Mongo.prefix')) {
      connectionString = `${Config.get('Database.Mongo.prefix')}://${connectionString}`;
    }

    if (Config.get('Database.Mongo.debug')) {
      Mongoose.set('debug', true)
    }
    Logging.log('info', `connecting to ${connectionString}`, 'dbMongo');
    // https://mongoosejs.com/docs/deprecations.html
    Mongoose.set('useCreateIndex', true);
    return Mongoose.connect(connectionString, {
      useNewUrlParser : true,
   //   reconnectTries: Number.MAX_VALUE,
   //   reconnectInterval: 1000,
      useUnifiedTopology: true
    }).then( (con) => {
      this._connection = con;
      this.con.on('error', (err) => {
        Logging.log('error', err.message, ['dbMongo.global'])
      });
      return this._connection;
    });
  },

  /**
   * get the current connection
   * @returns {Mongoose.connection|net.Socket|tls.TLSSocket|boolean|string|*}
   */
  get con() {
    return Mongoose.connection;
  },

  /**
   * check that everything is ok
   */
  async validateInstall() {
    const User = require('../model/user-model');
    const SystemUser = Config.get('Database.WatsNext.root');
    const SystemPassword = Config.get('Database.WatsNext.password');
    // there must be a user info@toxus.nl with a password
    return User.findOne({username: SystemUser}).then( (usr) => {
      if (!usr) {
        let saltRounds = Config.get('Security.passwordSaltRounds');
        return Bcrypt.hash(Config.get('Database.WatsNext.password'), saltRounds).then( (passwordHash) => {
          usr = new User({
            username: SystemUser,
            email:  Config.get('Database.WatsNext.email'),
            passwordHash: passwordHash,
            isActive: true,
            isValidated: true,
            isAdmin: true,
            rights: [
              {
               module: 'system',
               rights: RIGHTS_READ + RIGHTS_WRITE + RIGHTS_DELETE + RIGHTS_EXPORT + RIGHTS_ADMIN
              }
            ]
          })
          return usr.save()
        });
      }
      return true;
    });
  }
};
module.exports = DbMongo;
module.exports.Schema = Mongoose.Schema;
module.exports.Model = Mongoose.model;
module.exports.Types = Mongoose.Types;
module.exports.ObjectId = Mongoose.Schema.Types.ObjectId;
