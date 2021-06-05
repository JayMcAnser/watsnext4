/**
 * Entry point of server
 *
 * Config is located in the root directory where the api and the site life
 */
process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';
let Config;
try {
  Config = require('config');
} catch(e) {
  console.error(`[error] ${e.message}`);
  return 1
}

// load the default app
const App = require('./vendors/main');

// reset the models used by the default app
const Factory = require('./vendors/lib/factory');
Factory.register('user', () => {
  return require('./model/user')
})
Factory.register('session', () => {
  return require('./lib/session');
})

const Logging = require('./vendors/lib/logging')
const AuthController = require('./vendors/controllers/auth')
// const BoardController = require('./controllers/board')
// const FileController = require('./controllers/file')
const StaticSite = require('./vendors/lib/static-site');
const Helper = require('./vendors/lib/helper')

App.use('/api/art', AuthController.validate , require('./routes/art'));

// App.use('/api/public',  require('./routes/public'));
// App.use('/api/board', BoardController.validate,  require('./routes/board'));
// App.use('/api/file', FileController.validate, require('./routes/file'))

// init the mongo db
const MongoDb = require('./lib/db-mongo');

// temp no Auth
//App.use('/api/file', require('./routes/file'))

// this must be the last route otherwise it will catch all previous defined routes
try {
//  let staticSite = new StaticSite(App);

  let listener = App.listen(Config.get('Server.port'),
    function () {
      console.log(`Dropper server (http://localhost:${Config.get('Server.port')}) is active. (data: ${Helper.getFullPath('', {rootKey: 'Path.dataRoot'})})`)
    }
  );
} catch(e) {
  console.error(`Error in startup: ${e.message}`)
}

App.dbInit = new Promise((resolve, reject) => {
  try {
    return MongoDb.connect().then( () => {
      return MongoDb.validateInstall().then( () => {
        return resolve(true);
      })
    })
  } catch(e) {
    Logging.log('error', `[mongo] ${e.message}`);
    return reject(e.message)
  }
} );
module.exports = App

// /**
//  * Dropper Curator App
//  * free from: https://medium.com/zero-equals-false/building-a-restful-crud-api-with-node-js-jwt-bcrypt-express-and-mongodb-4e1fb20b7f3d
//  */
// const express = require('express');
// const cors = require('cors');
// const Logging = require('./vendors/lib/logging');
// const bodyParser = require('body-parser');
// const Config = require('config');
// const ApiReturn = require('./vendors/lib/api-return');
// const Const = require('./vendors/lib/const')
// const StaticSite = require('./vendors/lib/static-site');
// const Path = require('path');
//
// // set our logging to the root of the config
// const { setRootPath } = require('./vendors/lib/helper');
//
// setRootPath(Path.join(__dirname, Config.get('Path.configRoot')))
// const app = express();
// app.use(cors())
// Logging.init(app)
//
//
// // app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json())
// //
// // app.get('/', function(req, res) {
// //   ApiReturn.result(req, res, {message : Const.results.dropperActive});
// // });
//
//
// const AuthController = require('./vendors/controllers/auth');
//
// app.use('/api/auth', require('./vendors/routes/auth'));
// app.use('/api/public',  require('./routes/public'));
// app.use('/api/user',  AuthController.validate,  require('./vendors/routes/user'));
// app.use('/api/board', AuthController.validate,  require('./routes/board'));
//
// app.use('/api/version', function(req, res) {
//   ApiReturn.result(req, res, `Dropper API version ${require('./package.json').version}`)
// })
// // this must be the last route otherwise it will catch all previous defined routes
// let staticSite = new StaticSite((app));
//
// // handle errors
// app.use(function(err, req, res, next) {
//   ApiReturn.error(req, res, err, '[global.error]', err.status)
// });
//
// let listener = app.listen(Config.get('Server.port'),
//   function() {
//     Logging.log('info', `dropper server (http://localhost:${Config.get('Server.port')} listening on port ${Config.get('Server.port')}`)
// //    console.log(`Node server (http://localhost:${Config.get('Server.port')} listening on port ${Config.get('Server.port')}`);
//   }
// );
//
// module.exports = app;


