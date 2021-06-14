/**
 * push a objectId to an array as unique value
 *
 * @param arr
 * @param data
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;

const addObjectId = function(arr, data) {
  let index = arr.findIndex( (x) => { return x._id.toString() === data._id.toString()});
  if (index < 0) {
    arr.push(data);
  }
}

/**
 * remove an object from an array
 * @param arr
 * @param index
 */
const removeObjecId = function(arr, index) {
  if (typeof index === 'object') {
    let idString = index._id ? index._id.toString() : index.toString();
    index = arr.findIndex( (c) => { return c.toString() === idString})
  }
  if (index >= 0 && index < arr.length) {
    arr.splice(index, 1);
  }
}

const addObject = function(obj, type, itemData) {
  if (obj[type]) {
    obj[type].push(itemData);
  } else {
    obj[type] = [itemData];
  }
  obj.markModified[type]
}
const updateObject = function(obj, type, index, itemData) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < obj[type].length; ind++) {
      if (index.toString() === obj[type][ind]._id.toString()) {
        break;
      }
    }
  }
  if (ind < obj[type].length) {
    if (itemData === false || Object.keys(itemData).length === 0) {
      obj[type].splice(ind, 1);
    } else {
      Object.assign(obj[type][ind], itemData)
    }
    obj.markModified(this[type]);
  } else {
    throw new Error(`element.${type}[${index}] not found`);
  }
}

const removeObject = function(obj, type, index) {
  if (typeof index !== 'number') {
    obj[type].id(index).remove();
  } else if (index < obj[type].length) {
    obj[type].id(obj[type][index]).remove();
  } else {
    throw new Error(`remove element.${type}[${index}] not found`)
  }
  obj.markModified[type]
}

const setObjectIds = function(arr, data) {

  // codes not yet in vm.codes
  let add = data.filter(x => {
    return arr.findIndex( (k) => {
      return x._id.toString() === k.toString()
    }) < 0;
  });

  let remove = arr.filter(x => {
    return data.findIndex( (k) => {
      return x._id.toString() === k._id.toString()
    }) < 0
  })
  add.forEach((x) => { addObjectId(arr, x) });
  remove.forEach( (x) => { removeObjecId(arr, x)});
}

/**
 * creates a extendable structure, so we can reimport the data without loosing changes made
 * in the newer version
 *
 * After the conversie the  await record.reSync() should be called to update to the restorable version
 *
 * @param model
 * @param extraFields Object the fields to store. First field _must_ be the linked unique field (not the _id, but
 *          the field that survices the conversion
 */
const upgradeBuilder = function(name, schema, extraFields) {

  if (Object.keys(extraFields).length > 1) {
    let extraSchema = new Schema(extraFields);
    let fieldName = Object.keys(extraFields)[0];
    const extraModel = Mongoose.Model(name, extraSchema);


    schema.post('save', async function (doc) {
      let search = {};
      let hasData = false;

      search[fieldName] = doc[fieldName]
      let extra = await extraModel.findOne(search);
      if (!extra) {
        extra = new extraModel()
      }
      for (let key in extraFields) {
        if (!extraFields.hasOwnProperty(key)) {
          continue
        }
        if (doc[key] !== undefined && key !== fieldName) {
          extra[key] = doc[key];
          hasData = true;
        }
      }
      if (hasData) {
        await extra.save();
      }
    })

    schema.methods.reSync = async function () {
      let search = {};
      search[fieldName] = this[fieldName]
      let extra = await extraModel.findOne(search);
      if (!extra) {
        return Promise.resolve(false); // nothing is stored
      }
      for (let key in extraFields) {
        if (!extraFields.hasOwnProperty(key)) {
          continue
        }
        this[key] = extra[key];
      }
      return Promise.resolve(true); // we must store the information
    }
  }
}

module.exports.addObject = addObject;
module.exports.updateObject = updateObject;
module.exports.removeObject = removeObject;

module.exports.addObjectId = addObjectId
module.exports.removeObjectId = removeObjecId;
module.exports.setObjectIds = setObjectIds;
module.exports.upgradeBuilder = upgradeBuilder;
