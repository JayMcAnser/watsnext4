/**
 * logging information to the central server
 */
const Config = require('config');

class LoggingServer {
  constructor(options) {
    this.setOptions(options);
  }

  /**

   curl 'https://services.li-ma.nl/log/gelf' \
   -h 'apikey: myL6pkDoS430ZWM92Eg7zl9N9t0wwbgnA5wa2wz9GR6VSLNvjD' \
   -h 'Content-Type: application/json' \
   -d '{
      "short_message":"Hello there",
      "host":"example.org",
      "facility":"test",
      "_foo":"bar"
    }'
   * @param action: 'help', 'missing.image', 'not found', ect
   * @param msg: what should be read
   * data: any object
   */
  async log(msg, action = 'info', data = {}) {
    const axios = require('axios');
    // const data = {};
    data.short_message = msg;
    // data.host = this._options.host ? this._options.host : 'wiki.mediakunst.net';
    data.facility = `${this._options.host}`;
    if (this._options.server && typeof this._options.server === 'string') {
      try {
        // the result can not be used because we are not async !!!!!
        let result = await axios.post(
          this._options.server,
          Object.assign({}, this._options.extra, data),
          {
            headers: {
              apikey: this._options.key,
              'Content-Type': 'application/json'
            }
          }
        );
        return true;
      } catch (e) {
        console.error(`could not log msg: ${e.message}, message: ${msg}`);
        return false;
      }
    } else if (this._options.server && typeof this._options.server === 'boolean' && this._options.server === true) {
      console.log(`[${action}] - ${msg}`)
    }
  };

  async debug(action, data = {}) {
    return this.log(action, 'debug', Object.assign({}, data, {state: 'debug'}));
  }
  async info(action, data = {}) {
    return this.log(action, 'info', Object.assign({}, data, {state: 'info'}));
  }
  async warn(action, data = {}) {
    return this.log(action, 'warn', Object.assign({}, data, {state: 'warn'}));
  }
  async error(action, data = {}) {
    return this.log(action, 'error', Object.assign({}, data, {state: 'error'}));
  }

  /**
   * set the information for the log server
   * @param options
   *   * server
   *   * key
   *   * host
   *   * extra
   */
  setOptions(options) {
    this._options = options;
    // this._options = Object.assign(this._options, options);
    this._options.server = this._options.server ? this._options.server : Config.get('LoggingServer.url');
    this._options.key = this._options.key ? this._options.key : Config.get('LoggingServer.key');
    this._options.extra = Object.assign({}, Config.get('LoggingServer.extra'), options.extra);
    this._options.host = options.host ? options.host : Config.get('LoggingServer.host');
  }
}

class ErrorInfo extends Error {
  constructor(message, options) {
    super(message, options);
    if (Object.keys(options)) {
      for(let key in options) {
        this[key] = options[key]
      }
    }
  }
}

const loggingServer = new LoggingServer({});
module.exports = {
  loggingServer,
  LoggingServer,
  ErrorInfo

};
