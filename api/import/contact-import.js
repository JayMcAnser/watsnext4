
const DbMySQL = require('../lib/db-mysql');
const Contact = require('../model/contact');
const Logging = require('../vendors/lib/logging');
const CodeImport = require('./code-import');
const recordValue = require('./import-helper').recordValue;
const makeNumber = require('./import-helper').makeNumber;
const makeLength = require('./import-helper').makeLength;
const insertField = require('./import-helper').insertField;
const ImportHelper = require('./import-helper');
// left: Mongo, right: Mysql


const FieldMap = {
  addressId: 'address_ID',
  type: (rec) => {
    switch (rec.type_ID) {
      case 101:
        return 'institution';
      case 102:
        return 'male';
      case 103:
        return 'female';
      case 104:
        return 'unknown';
      default:
        return `Unknown (${rec.type_ID})`
    }
  },
  guid: 'address_GUID',
  // parent: async(rec, mongoRec) => { return await contactLine(mongoRec, rec.parent_ID)},
  department: 'department',
  subName: 'sub_name',
  firstName: 'first_name',
  title: 'title',
  firstLetters: 'first_letters',
  insertion: 'name_insertion',
  name : 'name',
  suffix: 'name_suffix',
  search : 'search',
  sortOn: 'sort_on',
  mailchimpJson: 'mailchimp_json',
  mailchimpGuid: 'mailchimp_guid',
};

const AddressFieldMap = {
  type: (rec) => {
    switch (rec.code_ID) {
      case 0: return undefined;
      case 111: return 'address';  // general
      case 151: return 'address';  // wrok
      case 152: return 'telephone';
      case 153: return 'fax';
      case 154: return 'email';
      case 155: return 'url';
      case 156: return 'email'; // with name
      case 160: return 'vat';
      case 161: return 'customer number';
      default:
        Logging.log('warn', `unknown address field type (${rec.type_ID})`)
        return undefined
    }
  },
  street: 'street',
  number: 'number',
  city: 'city',
  zipcode: 'zipcode',
  state: 'state',
  country: 'country'
};


class ContactImport {
  constructor(options = {}) {
    const STEP = 5;
    this.session = options.session;
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = this._limit < STEP ? this._limit : STEP;
    this._codeImport = new CodeImport({session: this.session});
    this._countries = false;
    this._logging = options.logging ? options.logging : Logging;
  }

  async _countryTranslate(con, id) {
    if (this._countries === false) {
      let sql = 'SELECT * FROM codes WHERE parent_ID=4';
      let qry = await con.query(sql);
      this._countries = {};
      for (let l = 0; l < qry.length; l++) {
        this._countries['c' + qry[l].code_ID] = qry[l].text;
      }
    }
    let r = this._countries['c' + id];
    if (r === undefined) {
       this._logging.log('warn', `unknown country code: ${id}`);
      r =  'Netherlands'
    }
    return Promise.resolve(r);
  }

  clean(text) {
    if (typeof text !== 'string') {
      return undefined
    }
    text = text.trim();
    if (text.length === 0) {
      return undefined
    }
    return text;
  }
  cleanTelephone(number) {
    return this.clean(number)
  }
  cleanUrl(url) {
    url = this.clean(url)
    if (!url) {
      return undefined
    }
    if (url.substr(0, 7) === 'http://') {
      url = url.substr(7)
    } else if (url.substr(0, 8) === 'https://') {
      url = url.substr(8)
    }
    return url;
  }
  /**
   * internal converting a record
   *
   * @param record
   * @param options Object
   *   - loadSql Boolean load the sql record if not found
   * @return {Promise<{}>}
   * @private
   */
  async _convertRecord(con, record, options = {}) {
    let contact = await Contact.queryOne(this.session, {addressId: record.address_ID});
    if (!contact) {
      contact = Contact.create(this.session);
    }
    let sql;
    let qry;
    if (options.loadSql) {
      sql = `SELECT * FROM addresses WHERE address_ID=${record.address_ID}`;
      qry = await con.query(sql);
      if (qry.length === 0) {
         this._logging.log('warn', `address[${record.address_ID}] does not exist. skipped`);
        return undefined
      }
      record = qry[0];
    }
    let dataRec = {};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Contact);
    }
    Object.assign(contact, dataRec);
    if (options.loadSql) {
      //-- add the codes
      sql = `SELECT *
             FROM address2code
             WHERE address_ID = ${record.address_ID}`;
      qry = await con.query(sql);
    } else if (record.address2code) {
      qry = record.address2code
    } else {
      qry = []
    }
    for (let codeIndex = 0; codeIndex < qry.length; codeIndex++) {
      let code = await this._codeImport.runOnData(qry[codeIndex], {loadSql: true})
      if (code) { // codes that are remove are skipped
        contact.codeAdd(code);
      }
    }



    // -- add the addresses
    if (options.loadSql) {
      sql = `SELECT *
             FROM addr_fields
             WHERE address_ID = ${record.address_ID}`;
      qry = await con.query(sql);
    } else if (record.addr_fields) {
      qry = record.addr_fields
    } else {
      qry = []
    }
    for (let addrIndex = 0; addrIndex < qry.length; addrIndex++) {
      let rec = qry[addrIndex];
      let addRec = {};
      switch (rec.code_ID) {
        case 111:
        case 151:
          let country = await this._countryTranslate(con, rec.country_ID);
          rec.country = country;
          for (let fieldName in AddressFieldMap) {
            if (!AddressFieldMap.hasOwnProperty(fieldName)) {
              continue
            }
            let a = await recordValue(rec, AddressFieldMap[fieldName]);
            if (a !== undefined) {
              addRec[fieldName] = a;
            }
          }
          contact.locationAdd(addRec);
          break;
        case 152: // tel
          addRec.usage = 'telephone';
          addRec.number = this.cleanTelephone(rec.text)
          if (addRec.number) {
            contact.telephoneAdd(addRec);
          }
          break;
        case 153: // fax
          addRec.usage = 'fax';
          addRec.number = this.cleanTelephone(rec.text)
          if (addRec.number) {
            contact.telephoneAdd(addRec);
          }
          break;
        case 154:  // email
        case 156:  // email & name
          if (rec.code_ID === 156) {
            addRec.name = this.clean(rec.extra_text)
          }
          addRec.address = this.clean(rec.text);
          if (addRec.address) {
            contact.emailAdd(addRec);
          }
          break;
        case 155: // url
          addRec.usage = 'url'
          addRec.text = this.cleanUrl(rec.text);
          if (addRec.text) {
            contact.extraAdd(addRec);
          }
          break;
        case 160: // vat
          addRec.usage = 'vat'
          addRec.text = this.clean(rec.text);
          if (addRec.text) {
            contact.extraAdd(addRec);
          }
          break;

        case 161: // vat
          addRec.usage = 'customer number'
          addRec.url = this.clean(rec.text);
          if (addRec.url) {
            contact.extraAdd(addRec);
          }
          break;
        default:
          this._logging.log('warn', `unknown address field type ${rec.code_ID}`)
      }
    }

    try {
      await contact.reSync();
      contact = await contact.save();
      this._logging.log('info', `address[${contact.address_ID}]: imported`)
    } catch (e) {
       this._logging.log('error', `importing address[${record.address_ID}]: ${e.message}`)
    }
    return contact;
  }

  async run(con) {
    if (!con) {
      this._logging.log('missing mySQL connection')
      throw new Error('missing mySQL connection')
    }
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      let counter = {count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      ImportHelper.stepStart('Contact');
      do {
        let dis;
        let sql = `SELECT * FROM addresses ORDER BY address_ID LIMIT ${start}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
            if (start >= this._limit) { break}
            start++;
          }
        }

      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Contact');
      return resolve(counter)
    })
  }

  async runOnData(record, options = {}) {
    let con = DbMySQL.connection;
    return this._convertRecord(con, record, options);
  }
}

module.exports = ContactImport;
module.exports.FieldMap = FieldMap;
