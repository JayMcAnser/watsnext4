console.log('create user in WatsNext 4.0, version 0.2\n');

const optionDefinitions = [
  { name: 'email', defaultOption: true },
  // { name: 'email', alias: 'e', type: String },
  { name: 'rights', alias: 'r', type: String, default: '31' },
  { name: 'document', alias: 'd', type: String, multiple: true},
]

const commandLineArgs = require('command-line-args')
let options;
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}
if (!options.hasOwnProperty('email')) {
  console.log('usage: node set-rights -e info@test.com -d')
  console.log('options:');
  console.log(' -d list of document to adjust, comma separated art,carrier,agent, (default: art,carrier,agent,bookmark')
  console.log(' -r the rights (default 31)')
  return
}

const MongoDb = require('./lib/db-mongo');

const util = require('util')

const findUser = async () => {
  let db = await MongoDb.connect();
  const UserModel = require('./model/user');
 //  const UserModel = await db.model('User');

//   let connection = await MongoDb.connect()
  // console.log(`using db: ${connection.connections[0]._connectionString}`)

  let usr = await UserModel.findOne({email: options.email})
  if (!usr) {
    throw new Error(`user ${options.email} not found`)
  } else {
    let rightId = options.hasOwnProperty('rights') ? options.rights : 31;
    let documents = options.hasOwnProperty('document') ? options.document : ['art','agent','carrier','bookmark', 'distribution'];
    for (let index = 0; index < documents.length; index++) {
      let docIndex = -1;
      if (usr.rights) {
        docIndex = usr.rights.findIndex( (x) => { return x.module === documents[index]})
      }
      if (docIndex >= 0) {
        usr.rights[docIndex].rights = rightId;
      } else {
        usr.rights.push({
          module: documents[index],
          rights: rightId
        })
      }
    }
    await usr.save()
  }
}

util.promisify(findUser)
findUser()
  .then(x => {
    console.log(`rights adjusted`)
  })
  .catch( e => {
    console.log('error:', e.message)
  })
