process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';

console.log('sync mediakunst with WatsNext, version 0.1\n');

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean},
  { name: 'env', alias: 'e', type: String},
  { name: 'silent', alias: 's', type: Boolean}

  // { name: 'username', alias: 'u', type: String },
  // { name: 'email', alias: 'e', type: String },
  // { name: 'password', alias: 'p', type: String },
  // { name: 'connection', alias: 'c', type: String},
  // { name: 'force', alias: 'f', type: Boolean},
]

const say = (message) => {
  if (options.silent) {
    return;
  }
  console.log(message)
}

const commandLineArgs = require('command-line-args')
let options;
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}
if (options.hasOwnProperty('help')) {
  console.log('usage: node mediakunst-import.js')
  console.log('options:');
  console.log('   --env "name"')
  console.log('   --silent')
//  console.log(' -c  the database connection to use. Default: default')
//  console.log(' -f  force the creation even if account exists and passwords are not equal')
  return
}
if (options.env) {
  say(`settomg NODE_ENV to ${options.env}`)
  process.env.NODE_ENV = options.env
}

const MongoDb = require('./lib/db-mongo');
const DbMySQL = require('./lib/db-mysql');
const User = require('./model/user-model');
const Config = require('config');
const util = require('util')
const Bookmark = require('./model/bookmark');
const BookmarkImport = require('./import/bookmark-import');
const Mediakunst = require('./model/mediakunst');


/**
 * create a session with the current root user. Does NOT validate the password
 * @type {Promise<unknown>}
 */
const createSession = function() {
  return new Promise( async (resolve, reject) => {
    let user =  await User.findOne({email: Config.get('Database.WatsNext.email')})
    if (!user) {
      return reject(`the root import user ${Config.get('Database.WatsNext.email')} does not exists`)
    }
    const AuthController = require('./vendors/controllers/auth')
    return resolve(AuthController.createSession(user.id))
  });
}

const syncMediakunst = async () => {
  await MongoDb.connect();
  await DbMySQL.connect();
  let session;
  try {
    session = await createSession();
  } catch (e) {
    throw e
  }

  // remove the existing bookmark list so we start with a clean slate
  say('removing existing bookmark list')
  await Bookmark.deleteOne({bookmarkId: Bookmark.MEDIAKUST_ID});
  let imp = new BookmarkImport({session});
  say('importing bookmarklist')
  await imp.runOnId(Bookmark.MEDIAKUST_ID);

  // now sync the art and agents with it
  say('update art / agent with nieuw information')
  let result = await Mediakunst.importData((type, msg) => {
    if (type === 'msg') {
      say(msg)
    } else if (type === 'size') {
      // say(`total: ${msg} art works`)
    } else if (type === 'step') {
      if (options.silent) {
        return;
      }
      let rotate = ['|','/','-','\\'];
      process.stdout.write(`${rotate[msg % 4]}\r`);
    }
  });
  if (result.errors.artCnt) {
    say(`there where ${result.errors.artCnt} errors in art`)
  }
  if (result.errors.artistCnt) {
    say(`there where ${result.errors.artistCnt} errors with artist`)
  }
  say(`total artwork: ${result.totals.artCnt}`);
  return true;
}


util.promisify(syncMediakunst)

// we must set the defintion to our specific models
const Factory = require('./vendors/lib/factory');
Factory.register('user', () => {
  return require('./model/user')
})
Factory.register('session', () => {
  return require('./lib/session');
})
syncMediakunst()
  .then(x => {
    console.log('sync done')
    return 0;
  })
  .catch(e => {
    console.log(`[Error]: ${e}`);
    process.exit(1)
  })
