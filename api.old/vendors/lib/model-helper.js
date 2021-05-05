/**
 */

const Logging = require('./logging')

class ValidationError extends Error {
  constructor(props) {
    super(typeof props === 'string' ? props : props.message);
    if (typeof props !== 'object' || props.errors === undefined) {
      Logging.log('warn', 'missing validation errors');
      this.validationError = []
    } else {
      this.validationError = props.errors;
      if (props.status) {
        this.status = props.status
      }
    }
  }
}

class StatusError extends Error {
  constructor(props, status, location) {
    let msgObj = typeof props === 'string' ? {message: props, status} : props
    super(msgObj.message);
    this.status = msgObj.status && typeof msgObj.status === 'number' ? msgObj.status : 500;
    this.location = status !== undefined && typeof status === 'number' ? location : status
  }
}

module.exports = {
  ValidationError,
  StatusError
}
