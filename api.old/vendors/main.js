/**
 * Dropper Curator App
 * free from: https://medium.com/zero-equals-false/building-a-restful-crud-api-with-node-js-jwt-bcrypt-express-and-mongodb-4e1fb20b7f3d
 */
const express = require('express');
const cors = require('cors');
const Logging = require('./lib/logging');
const bodyParser = require('body-parser');
const Config = require('config');
const ApiReturn = require('./lib/api-return');
const Const = require('./lib/const')
const StaticSite = require('./lib/static-site');
const Path = require('path');
const cookieParser = require('cookie-parser');

// set our logging to the root of the config
const { setRootPath } = require('./lib/helper');

setRootPath(Path.join(__dirname, '..', Config.get('Path.configRoot')))
const app = express();
app.use(cors())
app.use(cookieParser())
Logging.init(app)


// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

const AuthController = require('./controllers/auth');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user',  AuthController.validate,  require('./routes/user'));

app.use('/api/version', function(req, res) {
  ApiReturn.result(req, res, `API version ${require('../package.json').version}`)
})


// handle errors
app.use(function(err, req, res, next) {
  ApiReturn.error(req, res, err, '[global.error]', err.status)
});



module.exports = app;
