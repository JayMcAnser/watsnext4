console.log('create user in WatsNext 4.0, version 0.2\n');

const optionDefinitions = [
  { name: 'username', alias: 'u', type: String },
  { name: 'email', alias: 'e', type: String },
  { name: 'password', alias: 'p', type: String },
  { name: 'connection', alias: 'c', type: String},
  { name: 'force', alias: 'f', type: Boolean},
]

const commandLineArgs = require('command-line-args')
let options;
try {
   options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}
if (!options.hasOwnProperty('email') || !options.hasOwnProperty('password')) {
  console.log('usage: node create-user.js -e info@test.com -p verySecret -u mock')
  console.log('options:');
  console.log(' -c  the database connection to use. Default: default')
  console.log(' -f  force the creation even if account exists and passwords are not equal')
  return
}

const MongoDb = require('./model/db-mongo');
const util = require('util')

const createUser = async () => {
  MongoDb.connect();
  const UserModel = MongoDb.model('User');
  if (!options.username) {
    options.username = options.email
  }
//   let connection = await MongoDb.connect()
  // console.log(`using db: ${connection.connections[0]._connectionString}`)
  try {
    let usr = await UserModel.create({
      email: options.email,
      username: options.username,
      password: options.password,
      isActive: true,
      connection: options.connection,
      isForce: options.force
    })
    console.log(`user ${options.username} created\n`)
  } catch (e) {
    console.error(e.message)
  }
}

util.promisify(createUser)
createUser()
  .then(x => {
    return;
})
