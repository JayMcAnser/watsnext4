/**
 * A flexable contact model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const UndoHelper = require('mongoose-undo');
const ErrorTypes = require('error-types');
const ModelHelper = require('./model-helper');
/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const FieldMap = {
  type: {type: 'string', name: 'type', group: 'general'},
  guid: {type: 'string', name: 'guid', group: 'general'},
  department: {type: 'string', name: 'department', group: 'general'},
  parent: {type: 'related', onModel: 'Contact', name: 'company', group: 'general'},
  subName: {type: 'string', name: 'sub name', group: 'general'},
  firstName: {type: 'string', name: 'first name', group: 'general'},
  firstLetters: {type: 'string', name: 'first letters', group: 'general'},
  title: {type: 'string', name: 'title', group: 'general'},
  insertion: {type: 'string', name: 'insertion', group: 'general'},
  name: {type: 'string', name: 'name', group: 'general'},
  suffix: {type: 'string', name: 'suffix', group: 'general'},
  search: {type: 'string', name: 'search', group: 'general'},
  sortOn: {type: 'string', name: 'sortOn', group: 'general'},
  mailchimpJson: {type: 'string', name: 'mailchimp json', group: 'mailchimp'},
  mailchimpGuid: {type: 'string', name: 'mailchimp guid', group: 'mailchimp'},

  workAddress: {type: 'string', name: 'work address', group:'address',
    setValue: () => undefined,
    getValue: (rec, mongoRec) => {
      if (rec.addresses && rec.addresses.length) {
        let def = undefined;
        for (let l = 0; l < rec.addresses.length; l++) {
          if (rec.addresses[l].usage === 'work') {
            return rec.addresses[l]
          } else if (rec.addresses[l].isDefault) {
            def = rec.addresses[l]
          }
        }
        if (def) {
          return def;
        } else {
          return rec.addresses[0]
        }
      } else {
        return undefined;
      }
    }
  }
};

const LocationSchema = {
  usage: String,
  isDefault: Boolean,
  street: String,
  number: String,
  suffix: String,
  zipcode: String,
  city: String,
  state: String,
  country: String,
};
const TelephoneSchema = {
  isDefault: Boolean,
  number: String,
  usage: String
}

const EmailSchema = {
  isDefault: Boolean,
  address: String,
  name: String,
  usage: String
}

const ExtraSchema = {
  isDefault: Boolean,
  text: String,
  usage: String
}

const ContactExtendedLayout = {
  addressId: String,
  exactId: String,
}
const ContactLayout = Object.assign({
  addressId: String,
  type: String,
  guid: String,
  searchcode: String,
  department: String,
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  subName: String,
  firstName: String,
  firstLetters: String,
  title: String,
  insertion: String,
  name: String,
  suffix: String,
  search: String,
  sortOn: String,
  mailchimpJson: String,
  mailchimpGuid: String,

  locations: [LocationSchema],
  telephones: [TelephoneSchema],
  emails: [EmailSchema],
  extras: [ExtraSchema],

  codes: [{
    type: Schema.Types.ObjectId,
    ref: 'Code'
  }]
}, ContactExtendedLayout);

let ContactSchema = new Schema(ContactLayout);
ModelHelper.upgradeBuilder('ContactExtra', ContactSchema, ContactExtendedLayout);

ContactSchema.methods.locationAdd = function(loc) {
  ModelHelper.addObject(this, 'locations', loc)
}
ContactSchema.methods.locationUpdate = function (ind, loc) {
  ModelHelper.updateObject(this, 'locations', ind, loc)
}
ContactSchema.methods.locationDelete = function(id) {
  ModelHelper.removeObject(this, 'locations', id)
}

ContactSchema.methods.telephoneAdd = function(tel) {
  ModelHelper.addObject(this, 'telephones', tel)
}
ContactSchema.methods.telephoneUpdate = function (id, tel) {
  ModelHelper.updateObject(this, 'telephones', id, tel)
}
ContactSchema.methods.telephoneDelete = function(id) {
  ModelHelper.removeObject(this, 'telephones', id)
}

ContactSchema.methods.emailAdd = function(email) {
  ModelHelper.addObject(this, 'emails', email);
}
ContactSchema.methods.emailUpdate = function(id, email) {
  ModelHelper.updateObject(this, 'emails', 'id', email)
}
ContactSchema.methods.emailDelete = function(id) {
  ModelHelper.removeObject(this, 'emails', id)
}

ContactSchema.methods.extraAdd = function(extra) {
  ModelHelper.addObject(this, 'extras', extra)
}
ContactSchema.methods.extraUpdate = function(id, extra) {
  ModelHelper.updateObject(this, 'extras', id, extra)
}
ContactSchema.methods.extraDelete = function(id) {
  ModelHelper.removeObject(this, 'extras', id)
}

// ContactSchema.methods.locationAdd = function(data) {
//   this.location.push(data);
// };
//
// ContactSchema.methods.locationUpdate = function(index, itemData = false) {
//   let ind = index;
//   if (typeof index !== 'number') {
//     for (ind = 0; ind < this.location.length; ind++) {
//       if (index.toString() === this.location[ind]._id.toString()) {
//         break;
//       }
//     }
//   }
//   if (ind < this.location.length) {
//     if (itemData === false || Object.keys(itemData).length === 0) {
//       this.location.splice(ind, 1);
//     } else {
//       Object.assign(this.location[ind], itemData)
//     }
//     this.markModified('location');
//   } else {
//     throw new ErrorTypes.ErrorNotFound('address.location not found');
//   }
// };
//
// ContactSchema.methods.locationDelete = function(index) {
//   let ind = index;
//   if (typeof index !== 'number') {
//     this.location.id(ind).remove();
//   } else if (ind < this.location.length) {
//     this.location.id(this.location[ind]).remove();
//   }
// }

ContactSchema.pre('save', async function() {
  // check that we don't have multiple isDefault active
  while (this.locations.filter(e => e.isDefault).length > 1) {
    this.locations[this.locations.findIndex( x => x && x.isDefault)].isDefault = false;
  };
  while (this.locations.length > 0 && this.locations.filter(e => e && e.isDefault).length === 0 ) {
    this.locations[0].isDefault = true;
  }
  while (this.emails.filter(e => e.isDefault).length > 1) {
    this.emails[this.emails.findIndex( x => x && x.isDefault)].isDefault = false;
  }
  while (this.emails.length > 0 && this.emails.filter(e => e && e.isDefault).length === 0 ) {
    this.emails[0].isDefault = true;
  }

  while (this.telephones.filter(e => e && e.isDefault).length > 1) {
    this.telephones[this.telephones.findIndex( x => x && x.isDefault)].isDefault = false;
  }
  while (this.telephones.length > 0 && this.telephones.filter(e => e && e.isDefault).length === 0 ) {
    this.telephones[0].isDefault = true;
  }

});

ContactSchema.methods.codeAdd = function(code) {
  ModelHelper.addObjectId(this.codes, code)
}
ContactSchema.methods.codeRemove = function(index) {
  ModelHelper.removeObjectId(this.codes, index);
}
ContactSchema.methods.codeSet = function(codes) {
  ModelHelper.setObjectIds(this.codes, codes);
}

ContactSchema.plugin(UndoHelper.plugin);
module.exports = Mongoose.Model('Contact', ContactSchema);

