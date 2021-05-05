/**
 * validate and assign the information for the individual element.type objects
 *
 * version 0.0.2 Jay 2021-03-14
 */

const clonedeep = require('lodash').cloneDeep;
const Logging = require('../vendors/lib/logging');
const ImageUtil = require('../lib/image-util');

class Element {

  /**
   * ret
   * @param target
   * @param data
   * @returns Object with the original data
   * @private
   */
  _copyFields(target, data, omit =  []) {
    let changes = {};
    try {
      for (let fieldName in data) {
        if (data.hasOwnProperty && !data.hasOwnProperty(fieldName)) {
          continue
        }
        if (omit.indexOf(fieldName) >= 0) {
          continue
        }
        if (typeof data[fieldName] === 'object') {
          if (target[fieldName] === undefined) {
            target[fieldName] = {}
          } else if (Array.isArray(data[fieldName])) {
            //Logging.log('warn', `copying array values is not supported`)
            // we skip arrays. That should be done by the sub class
            continue;
          } else if (typeof target[fieldName] !== 'object') {
            Logging.log('warn', `modifying property ${fieldName} to object`)
            target[fieldName] = {}
          }
          let subChange = this._copyFields(target[fieldName], data[fieldName]);
          if (Object.keys(subChange).length) {
            changes[fieldName] = subChange
          }
        } else if (target[fieldName] !== data[fieldName]) {
          changes[fieldName] = target[fieldName]
          target[fieldName] = data[fieldName]
        }
      }
      return changes;
    } catch (e) {
      console.error(e.message)
    }
  }

  /**
   * assigns the data fields to the target
   *
   * @param target
   * @param data
   * @param omitFields Array of names of fields not to copy
   * @return Boolean True: something changed, false: nothing changed
   */
  assign(target, data, omitFields = [] ) {
    let changes = this._copyFields(target, data, omitFields);

    if (data.elements !== undefined) {
      if (target.elements !== undefined) {
        changes['elements'] = [...target.elements]
      }
      target.elements = [];
      for (let index = 0; index < data.elements.length; index++) {
        target.elements.push(typeof data.elements[index] !== 'object' ? {id: data.elements[index]} : data.elements[index])
      }
    }
    if (!target.title && Object.keys(changes).length) {
      target.title = '(no title)';
      changes.title = ''
    }

    if (Object.keys(changes).length) {
      if (target['creationData'] === undefined) {
        target['creationDate'] = Date.now()
      }
      target['modifiedDate'] = Date.now();
    }
    return target;
  }

}

class TextElement extends Element {

}

class ImageElement extends Element {
  assign(target, data, omitFields = []) {
    super.assign(target, data, omitFields);
    // mediaId is added but should have default if none found
    return target
  }
}

const LayoutSubTypes = ['columns', 'orderGrid', 'style']
class LayoutElement extends TextElement {
  /**
   * assigns the data fields to the target
   *
   * @param target
   * @param data
   * @param omitFields Array of names of fields not to copy
   * @return Boolean True: something changed, false: nothing changed
   */
  assign(target, data, omitFields = [] ) {
    let changes = super.assign(target, data, omitFields);
    if (target.subType === undefined) {
      target.subType = 'columns'
      changes.subType = ''
    }
    // image is allowed but should exist withing the current layout
    if (LayoutSubTypes.indexOf(target.subType) < 0) {
      target.subType = 'columns'
    }
    if (!target.image) {
      target.image = ImageUtil.randomImage('layout');
      if (!target.image) {
        delete target.image
      }
    }
    return target;
  }
}

class GroupElement extends TextElement {
  assign(target, data, omit) {
    super.assign(target, data, ['elements'].concat(omit));
    if (target.elements === undefined) {
      target.elements = []
    }
    return target
  }
}

class ColumnElement extends GroupElement {

}

const ElementMap = {
  text: new TextElement(),
  image: new ImageElement(),
  layout: new LayoutElement(),
  group: new GroupElement(),
  column: new ColumnElement(),
}

class ElementHandler {

  /**
   *
   * @param target Element stored in the board
   * @param data Object the raw data from the api
   */
// moves the data to the target
  assign(target, data) {
    let type = target.type === undefined ? data.type : target.type
    if (ElementMap[type]) {
      return ElementMap[type].assign(target, data)
    } else {
      console.error(`missing element type: ${type}`)
      Logging.log('warn', `unknown element type: '${type}'`)
      return target
    }
  }

  valid(data) {
    return true
  }
}
let handler = new ElementHandler()


module.exports = handler
