/**
 * A flexable agent model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const UndoHelper = require('mongoose-undo');
const ModelHelper = require('./model-helper');
const Config = require('../lib/default-values');

const ContactSchema = new Schema({
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  isRights : Boolean,
  isContact: Boolean,
  isArtist: Boolean,
  percentage: Number,
})

const WikiScheme = new Schema({
  id: String,
  lastChanged: Date,
  doc: String,
  sha: String,
  status: String,
  error: String,
  imageName: String,
})

const AgentExtendLayout = {
  agentId: String,
  isMediakunst: Boolean,     // set to true if part of mediakunst
  mediakunstId: String,      // the direct link id
  wikipedia: WikiScheme,     // info about the wikipedia retrieve system
  royaltiesPeriod: {
    type: Number,
    default: 0
  },     // 0 = per Year, 1 = per quarter, 2 = per month
//   wikipediaId: String,       // the qId of Wikipedia
//   wikipediaLastChanged: Date,// last date something changed
//   wikipediaSha: String,      // the check is something changed
//   wikipediaDoc: String,      // the wiki tekst as html
//   wikipediaStatus: String,   // the status (retrieved, not-found, no-data, no-wiki-page, other, etc)
//   wikipediaError: String,    // the error if any
//   biography: Object,         // the biography info from the watsnext
// //   biographyLastChange: Date, // the date the biography changed (for checking)
//   imageId: String,           // the id of the image,

}


const AgentLayout = Object.assign({
  agentId: String,
  type: String,
  searchcode:  String,
  name: String,
  sortOn: String,
  died: String,
  biography: String,
  biographyNl: String,
  comments: String,
  born: String,
  bornInCountry: String,
  customerNr: String,
  percentage: {type: Number},  // the default royalties for the artist. If undefined Config('royalties.agent.percentage') is used
  contacts: [
    ContactSchema
  ],
  codes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }],
//  royaltiesError: String,
}, AgentExtendLayout);

let AgentSchema = new Schema(AgentLayout);
ModelHelper.upgradeBuilder('AgentExtra', AgentSchema, AgentExtendLayout);
AgentSchema.plugin(UndoHelper.plugin);

AgentSchema.pre('save', function() {
  if (this.percentage === undefined) {
    this.percentage = Config.value('royalties.agent.percentage', 60)
  }
})

AgentSchema.virtual('contact')
  .get(function() {
    if (this.contacts.length) {
      let index = this.contacts.findIndex( (a) => { return a.isContact})
      if (index < 0) {
        return this.contacts[0].contact
      }
      return this.contacts[index].contact
    }
    return undefined;
  })
AgentSchema.virtual('contactRights')
  .get(function() {
    if (this.contacts.length) {
      let index = this.contacts.findIndex( (a) => { return a.isRights})
      if (index < 0) {
        index = this.contacts.findIndex( (a) => { return a.isContact})
        if (index < 0) {
          return this.contacts[0].contact;
        }
      }
      return this.contacts[index].contact;
    }
    return undefined;
  })
AgentSchema.virtual('contactArtist')
  .get(function() {
    if (this.contacts.length) {
      let index = this.contacts.findIndex( (a) => { return a.isArtist})
      if (index < 0) {
        return this.contact[0].contact
      }
      return this.contacts[index].contact
    }
    return undefined;
  })


/**
 * add a contact to the contacts.
 * @param contact
 * @param usage String 'contact' | 'rights' | 'artist'
 */
AgentSchema.methods.contactAdd = function(contact, usage) {
  let index = this.contacts.findIndex( (a) => { return a.contact._id.toString() === contact._id.toString()})
  if (index < 0) {
    index = this.contacts.length;
    this.contacts.push({contact: contact})
  }
  this.contacts[index].isRights = usage && usage.indexOf('rights') >= 0;
  this.contacts[index].isArtist = usage && usage.indexOf('artist') >= 0;
  this.contacts[index].isContact = usage && usage.indexOf('contact') >= 0;
}

AgentSchema.methods.contactRemove = function(index) {
  if (typeof index === 'object') {
    index = this.contacts.findIndex( (a) => { return a.contact._id.toString() === contact._id.toString()})
  }
  if (index >= 0 && index < this.contacts.length) {
    this.contacts.splice(index, 1);
  }
}

AgentSchema.methods.codeAdd = function(code) {
  ModelHelper.addObjectId(this.codes, code);
  // let index = this.codes.findIndex( (x) => { return x._id.toString() === code._id.toString()});
  // if (index < 0) {
  //   this.codes.push(code);
  // }
}

/**
 * remove a code
 * @param index Number (the index, _id of the code, or the code with _id)
 */
AgentSchema.methods.codeRemove = function (index) {
  ModelHelper.removeObjectId(this.codes, index);
}

AgentSchema.methods.codeSet = function(codes) {
  ModelHelper.setObjectIds(this.codes, codes);
}

/**
 * validate the royalties definition
 *
 * - rule: there should be atleast on contact
 * - rule: total of contact.percentage must be 100
 *
 * @return array of message
 */
AgentSchema.methods.royaltiesValidate = function() {
  let errors = [];
  if (this.contacts === undefined || this.contacts.length === 0) {
    errors.push('no contacts defined for this artist')
  } else {
    let perc = 0;
    for (let index = 0; index < this.contacts.length; index++) {
      perc += this.contacts[index].percentage
    }
    if (perc !== 100) {
      errors.push('total of artist percentage should be 100%')
    }
  }
 // this.royaltiesError = errors.length ? errors.join('\n') : undefined;
  return errors
}


module.exports = Mongoose.Model('Agent', AgentSchema);
