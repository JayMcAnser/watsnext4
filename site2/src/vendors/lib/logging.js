

import {stringify} from 'flatted'

const _makeMsg = function(message, where) {
  if (typeof message === 'string') {
    return `${where ? '[' + where + '] ': ''}${message}`
  } else {
    // return `${where ? '[' + where + '] ': ''}${ JSON.stringify(message)}`
    return `${where ? '[' + where + '] ': ''}${ stringify(message)}`
  }
}
export const log = function(message, where = false) {
  console.log(_makeMsg(message, where))
  }
export const info = function(message, where = false) {
  console.log(_makeMsg(message, where))
}
export const warn = function(message, where) {
  console.warn(_makeMsg(message, where))
}
export const error = function(message, where) {
  try {
    switch (typeof message) {
      case 'string':
        console.error(_makeMsg(message, where));
        break;
      case 'array': // could be an array because it came from the API
        break;
      case 'object':
        console.log(`[${where}]`, message);
        break;
      default:
        console.error(`[logger] type of message is unknown (${typeof message}): ${stringify(message)})`);
    }
  } catch(e) {
    console.error(`[logging.error].internal: ${e.message}`)
  }
}

export const logger = function(type, message, where) {
  switch (type) {
    case 'log':
      log(message, where);
      return;
    case 'warn':
      warn(message, where);
      return;
    case 'error':
      error(message, where)
      return;
    default:
      console.error(`UNKNOWN error type ${type}: ${message}, ${where}`);
      return
  }
}
export const debug = function(message, where) {
  console.info(`[debug]: ${(_makeMsg(message, where))}`)
}

export class LocationError extends Error {
  constructor(message, where) {
    super(message);
    if (where) {
      this.where = where;
    }
  }
}

export class ValidationError extends LocationError {
  constructor(message, errors, where) {
    super(message, where);
    this.errors = errors;
  }
}

export class RequestLoginError extends LocationError {
  constructor(message, url, where) {
    super(message, where);
    this.url;
    this.where = where
  }
}
/**
 * generate a new action object
 * @param {} message
 * @param {*} where
 */
export const newError = function(message, where) {
  let err = new LocationError(typeof message === 'object' ? message.message : message, where);
  return err;
}


