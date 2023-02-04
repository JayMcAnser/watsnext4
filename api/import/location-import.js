/**
 * import routines for the location
 * version 0.0.1  Jay 2020-03-17
 */

const Distribution = require('../model/distribution');
const DbMySQL = require('../lib/db-mysql');
const Config = require('config');
const Logging = require('../vendors/lib/logging');
// const Contact = require('../model/contact');
const Carrier = require('../model/carrier');
const ImportCarrier = require('../import/carrier-import');
const ImportContact = require('../import/contact-import');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;
// const AddrFieldMap = require('./contact').FieldMap;
// const CarrierFieldMap = require('./carriers').FieldMap;
const ImportHelper = require('./import-helper');


_recordValue = function(rec, part) {
  let result;
  if (typeof part === 'string') {
    result = rec[part]
  } else {
    result = part(rec);
  }
  if (typeof result === 'string') {
    result = result.trim();
  }
  if (result !== null && result && result.length) {
    return result;
  }
  return undefined;
};

let importContact = false;
contactLink = async function(parent, addressId) {
  if (addressId) {
    if (importContact === false) {
      throw new Error('import Contact not activated');
    }
    return importContact.runOnData({address_ID: addressId}, {loadSql: true});
  }
  return undefined;
};

let importCarrier = false;
carrierLink = async function(parent, carrierId) {
  if (carrierId){
    if (importCarrier === false) {
      throw new Error('import Carrier not activated');
    }
    return importCarrier.runOnData({carrier_ID: carrierId}, {loadSql: true});
  }
  return undefined;
};



const ConvertMap = {
  locationId: 'location_ID',
  code: 'location_code',
  invoiceNumber: 'invoice_number',
  event: 'event',
  header: 'intro_text',
  comments: '',
  footer : 'footer_text',
  vat: 'btw_prc',
  eventStartDate: 'rental_date',

  contact: async (rec, mongoRec) => { return await contactLink(mongoRec, rec.contact_address_ID) },
  contactName: 'contact_address_name',
  invoice: async (rec, mongoRec) => { return await contactLink(mongoRec, rec.invoice_address_ID)},
  invoiceName: 'invoice_address_name',
  mail: async (rec, mongoRec) => { return await contactLink(mongoRec, rec.mail_address_ID)},

  shippingCosts: (rec) => { return makeNumber(rec.shipping_costs); },
  otherCosts: (rec) => { return makeNumber(rec.other_costs); },
  productionCosts: (rec) => { return makeNumber(rec.production_costs); },
};

const itemMap = {
  carrier: async (rec, mongoRec) => { return await carrierLink(mongoRec, rec.carrier_ID) },
  order: 'sort_on',
  price: (rec) => { return makeNumber(rec.price); },
};

class LocationImport {

  constructor(options= {}) {
    this.session = options.session;
    console.assert(this.session, 'import needs session')
    importContact = new ImportContact({session: this.session});
    importCarrier = new ImportCarrier({session: this.session});
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = 5;
    this._logging = options.logging ? options.logging : Logging
    this._id = options.id;
  }

  async _convertRecord(con, record, options = {}) {
    let dis = await Distribution.queryOne(this.session,{locationId: String(record.location_ID)});
    if (!dis) {
      dis = await Distribution.create(this.session, {locationId: record.location_ID});
    }
    let dataRec = {};
    for (let fieldName in ConvertMap) {
      if (!ConvertMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, ConvertMap[fieldName], Distribution);
    }
    try {
      Object.assign(dis, dataRec);
      // dis.objectSet(dataRec);
      await dis.reSync();
      dis = await dis.save();

      // start converting lines of carriers
      let sql = `SELECT * FROM location2carrier where location_ID = ${dis.locationId}`;
      let qry = await con.query(sql);
      if (qry.length) {
        for (let recIndex = 0; recIndex < qry.length; recIndex++) {
          let rec = qry[recIndex];
          let lineRec = {};
          for (let fieldName in itemMap) {
            if (!itemMap.hasOwnProperty(fieldName)) {
              continue
            }
            let v = await recordValue(rec, itemMap[fieldName], Distribution);
            if (v !== undefined) {
              lineRec[fieldName] = v
            }
          }
          dis.lineAdd(lineRec)
//          console.log(lineRec)
        }
        dis  = await dis.save();
      }
      this._logging.log('info', `location[${record.location_ID}]: imported`)
    } catch (e) {
       this._logging.log('error', `importing location[${record.location_ID}]: ${e.message}`)
    }
    return dis;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      ImportHelper.stepStart('Location')
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let sql = 'SELECT * FROM locations ';
        if (this._id) {
          sql += ` WHERE location_ID = ${this._id}`
        } else {
          sql += ` WHERE objecttype_ID > 0 ORDER BY location_code LIMIT ${start}, ${vm._step}`;
        }
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
            if (start >= this._limit || this._id) { break }
            start++;
          }

        }
      } while ((qry.length > 0 && (this._limit === 0 || counter.count < this._limit)) && !this._id);
      ImportHelper.stepEnd('Location');
      return resolve(counter)
    })
  }

  async runOnData(record) {
    let con = DbMySQL.connection;
    return await this._convertRecord(con, record);
  }

  async validateImport(con) {
    // get the mySQL ids
    let sql = `SELECT location_code FROM locations WHERE objecttype_ID > 0  ORDER BY location_code `;
    let qry = await con.query(sql);
    let mySQLIds = {}
    for (let index = 0; index < qry.length; index++) {
      mySQLIds[qry[index].location_code] = true;
    }
    // get the mongo is
    let dis = await Distribution.find();
    let mongoIds = {};
    for (let index = 0; index < dis.length; index++) {
      mongoIds[dis[index].code] = true;
    }

    let notInMongo = [];
    let keys = Object.keys(mySQLIds)
    for (let index = 0; index < keys.length; index++) {
      if (!mongoIds.hasOwnProperty(keys[index])) {
        notInMongo.push(keys[index])
      }
    }

    let notInMysql = [];
    let keys2 = Object.keys(mongoIds)
    for (let index = 0; index < keys2.length; index++) {
      if (!mySQLIds.hasOwnProperty(keys2[index])) {
        notInMysql.push(keys2[index])
      }
    }
    return {
      notInMongo,
      notInMysql
    }

  }
}

module.exports = LocationImport;
