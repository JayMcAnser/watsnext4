/**
 * Entry point of server
 *
 * Config is located in the root directory where the api and the site life
 */
process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';
let Config;
// ---------
// startup mode.
try {
  const isNumeric = require('./lib/util').isNumeric
  let opt = process.argv;
  if (opt.indexOf('-d') >= 0) {
    // make it the develop server
    process.env.NODE_ENV = 'develop';
  }
  try {
    Config = require('config');
  } catch(e) {
    console.error(`[config read] ${e.message}`);
    process.exit(1);
  }

  let index = opt.indexOf('-i');
  if (index >= 0) {
    // do import of data
    index++;  // the next value
    let count = index < opt.length && isNumeric(opt[index]) ? opt[index] : 999999;
    console.log(`importing ${count} location into distribution`);
    let importer = require('./import').run;

    const util = require('util')
    util.promisify(importer)
    importer(count)
      .then(x => {
        console.log('import done');
        process.exit();
      })
  }
} catch (e) {
  console.error(`'startup options: ${e.message}`)
  return(1)
}




// ----------
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
      console.log(`WatsNext server (http://localhost:${Config.get('Server.port')}) is active. (data: ${Helper.getFullPath('', {rootKey: 'Path.dataRoot'})})`)
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
