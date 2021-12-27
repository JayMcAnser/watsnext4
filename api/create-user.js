process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';
console.log('create user in WatsNext 4.0, version 0.3\n');

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
  console.log(' -u {username } the username of the user')
  console.log(' -e {email} the email address of the user')
  console.log(' -p {plain text} the password of the user')
  return
}

const MongoDb = require('./lib/db-mongo');
const UserModel = require('./model/user-model')
const util = require('util')

const createUser = async () => {
  MongoDb.connect();
  // const UserModel = MongoDb.model('User');
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
    process.exit(0)
})
