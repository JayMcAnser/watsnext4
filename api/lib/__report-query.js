/**
 * basic excel report structure to transform the mongodb output into excel
 * version 0.0.1 @Jay  2022-12-12
 *
 * uses the https://github.com/LuisEnMarroquin/json-as-xlsx/blob/main/packages/main-library/package.json
 *
 */
const ReportExcel = require('./report-excel')
const QueryRoyalties = require("./query/query-royalty");
const JsonFile = require('jsonfile');
const Path = require('path');

class ReportQuery extends ReportExcel {
  /**
   * @param options
   *    - title - string the name of the report and the filename if not give
   *    - filename = string the filename. if omitted title is used
   *    - dirname = string the location of the file
   *
   *    if the request has parameter, the filename is adjusted to [year].[quarter].title.xslx
   */
  constructor(options = {}) {
    super(options)
  }

  _locationString(location) {
    let result = location.street
    if (location.number) {
      result += ` ${location.number}`
    }
    result += '\n'
    if (location.zipcode) {
      result += `${location.zipcode} `
    }
    result += location.city
    if (location.country !== 'Netherlands') {
      result += '\n' + location.country
    }
    return result
  }

  /**
   * setup of the routines
   * @param options
   */
  async init(req) {
    await super.init(req, options);
    this.schema = [
      {column: 'Artist', type: String, width: 50, alignVertical: 'top', value: (contact) => contact.contact.name},
      {column: 'Email', type: String, width: 25, alignVertical: 'top', value: (contact) => {
          let emails = contact.contact.emails;
          let index = emails ? emails.findIndex(x => x.isDefault) : -1
          if (index >= 0) {
            return emails[index].address
          } else if (emails.length) {
            return emails[0].address
          }
          return ''
        }},
      {column: 'Address', type: String, width: 25, alignVertical: 'top', value: (contact) => {
          let locations = contact.contact.locations;
          let index = locations ? locations.findIndex(x => x.usage === 'post') : -1
          if (index >= 0) {
            return this._locationString(locations[index])
          } else if (locations.length) {
            return this._locationString(locations[0])
          }
          return ''
        }},
      {column: 'Amount', type: Number, width: 10, alignVertical: 'top', format: "#,##0.00", value: (contact) => this._makeAmount(contact.total) },
      {column: 'Filename', type: String, width: 50, alignVertical: 'top', value: (contact) => contact.pdfFilename}
    ]
  }
  /**
   * retrieve the data from any source
   * store the result in data property
   * @param req
   * @return {Promise<void>}
   */
  async getData(req, options) {
    let qry = new QueryRoyalties(req);
    this.data = await qry.contactEvents(req, options);
  }

  /**
   * process the this.data and returns the sheet info
   * during processing the erorr can be set
   *
   * @param req
   * @return {Promise<void>}
   */
  async processData(req) {

  }


  /**
   * Splits a camelCase or PascalCase word into individual words separated by spaces.
   * @param {Object} word
   * @returns {String}
   */
  splitCamelCase(word) {
    var output, i, l, capRe = /[A-Z]/;
    if (typeof(word) !== "string") {
      throw new Error("The \"word\" parameter must be a string.");
    }
    output = [];
    for (i = 0, l = word.length; i < l; i += 1) {
      if (i === 0) {
        output.push(word[i].toUpperCase());
      }
      else {
        if (i > 0 && capRe.test(word[i])) {
          output.push(" ");
        }
        output.push(word[i]);
      }
    }
    return output.join("");
  }

  async processData(req, options) {
    let qry = new QueryRoyalties(req);
    let err = await qry.distributionErrors(req)
    if (err.length) {
      this.errors.push({label: 'Distribution Errors', value: err})
    }
    qry = new QueryRoyalties(req);
    err = await qry.contactErrors(req);
    if (err.length) {
      this.errors.push({label: 'Contact Errors', data: err})
    }
  }


  async postProcess(req) {
    return new Promise((resolve, reject) => {
      const settings = this.getSettings(req)
      xlsx( this._sheet, this.getSettings(req), (x) => {
        resolve({filename: settings.fileName + '.xlsx'});
      })
    })

  }
  /**
   * run this report
   * @param req - the request object
   * @param options  - { filename }
   * @return {Promise<unknown>}
   */
  async execute(req, options = {}) {
    this._data = [];
    await this.init(req)
    await this.errorsClear();
    if (req.query && req.query.mongoQueryFilename) {
      await this.getData(req, {returnData: false});
      // this.data holds now the query
      let filename = req.query.mongoQueryFilename
      if (filename.substring(0, 1) !== '/') {
        filename = Path.join(__dirname, '../../temp', filename)
      }
      JsonFile.writeFileSync(filename, this.data, {
        spaces: 2,
        EOL: '\r\n'
      })
      // return JSON.stringify(this.data, null, '\t')
      this.data = []
      await this.errorsClear();
    }
    await this.getData(req);

    let tab = await this.addInfoTab(req)
    this._sheet.push(tab)
    tab = await this.processData(req);
    this._sheet.push(tab)
    await this.processErrors(req);
    if (this.errorsHas()) {
      tab = await this.addErrorTab()
      this._sheet.push(tab)
    }
    return this.postProcess(req);

  }
}

module.exports = MongoAsExcel
