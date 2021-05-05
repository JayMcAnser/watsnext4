

import Text from './elements/text';
import {debug, newError} from '../vendors/lib/logging';


const registeredTypes = {
  text: Text
}

const factory = function(obj) {
  if (typeof obj === 'string') {
    obj = {type: obj}
  }
  if (!registeredTypes[obj.type]) {
    throw new newError(`unknown element type ${obj.type}`, 'factory')
  } else {
    debug(`registered: ${JSON.stringify(obj)}`);
    return new registeredTypes[obj.type](obj)
  }
};

export default factory;