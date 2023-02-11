/**
 * generate all the PDF needed for the royalty publications
 *
 * Version: 1.0.0  2023-02-10 @Jay
  */
const Path = require('path');
const Fs = require('fs')
const QueryRoyalties = require("../lib/query/query-royalty");
const JsonFile = require("jsonfile");
const Moment = require('moment')
const MongoAsExcel = require('../lib/mongo-as-excel');
const ReportRoyaltArtist = require("./report-royalty-artist");


class RoyaltiesContactPdf extends MongoAsExcel {

  constructor(options) {
    super(options)
    this.directory = ''
  }

  init(req) {
    let storeDir = 'royalty.' + (req.query.hasOwnProperty('year') ? req.query.year : 'all')
    if (req.query.hasOwnProperty('quarter')) {
      storeDir += `.${req.query.quarter}`
    }

    if (req.query.hasOwnProperty('output')) {
      if (req.query.output.substring(0,1) === Path.sep) {
        this.directory = Path.join(optireq.queryons.output, storeDir)
      } else {
        this.directory = Path.join(__dirname, '../../temp', req.query.output, storeDir)
      }
      Path.join(req.query.output)
    } else {
      this.directory = Path.join(__dirname, '../../temp', String(storeDir))
    }
    Fs.mkdirSync(this.directory, {recursive: true})
  }

  async addInfoTab(req) {
    // nothing to do
  }

  async postProcess(req) {
    return {
      directory: this.directory
    }
  }
  /**
   * retrieve the data from any source
   * store the result in data property
   * @param req
   * @return {Promise<void>}
   */
  async getData(req, options = {}) {
    let qry = new QueryRoyalties(req);
    let contacts = await qry.contactEvents(req, options);
    this.data = contacts
  }

  async processData(req) {
    for (let index = 0; index < this.data.length; index ++) {
      let artist = this.data[index];
      let rpt = new ReportRoyaltArtist()
      await rpt.render(Path.join(this.directory, artist.pdfFilename), artist,{showDate: true})
    }
    // write the index file into the directory
    let xlsx = new RoyaltiesContactXlsx({directory: this.directory})
    await xlsx.execute(req, {data: this.data})
  }
}

/**
 * this creats the excelsheet belonging to all the pdfs
 */
class ReportExcel {

  constructor(options) {
    this.directory = options.directory;
    this.filename = options.filename ? options.filename : 'no-name.xlsx';
    this.errors = [];
    this.sheets = []
    this.schema = []
    this.label = 'Sheet 1'
    this.info = {}  // {label, schema, data}
  }

  async init(req, options) {
    this.errors = []
    this.sheets = []
    this.schema = []
  }
  async postProcess(req, options = {}) {
    if (this.errors.length) {
      // write a sheet with the errors
    }
    const writeXlsxFile = require('write-excel-file/node')
    let filename = Path.join(this.directory, (options.filename ? options.filename : this.filename))
    if (!filename.substring(0, 1) === Path.sep) {
      filename = Path.join(__dirname, '../../temp', filename)
    }
    let data = []
    let settings = {
      schema: [],
      sheets: [],
      filePath: filename
    }
    if (this.info && this.info.data) {
      settings.schema.push(this.info.schema)
      settings.sheets.push(this.info.label)
      data.push(this.info.data)
    }
    settings.schema.push(this.schema)
    settings.sheets.push(this.label)
    data.push(this.data)

    if (options.stickyRowsCount) {
     settings.stickyRowsCount = options.stickyRowsCount
    }
    return writeXlsxFile(data, settings)
  }

  async addInfoTab(req, options) {
  }

  async getData(req, options) {
    let qry = new QueryRoyalties(req);
    this.data = await qry.contactEvents(req, options);
  }

  /**
   * this processor
   * @param req
   * @param options
   * @returns {Promise<void>}
   */
  async processData(req, options) {

  }
  async execute(req, options = {}) {
    if (options.data) {
      this.data = options.data
    } else {
      await this.getData(req, options)
    }
    await this.init(req, options)
    await this.addInfoTab(req, options)
    await this.processData(req, options)
    await this.postProcess(req, options)
  }
}

class RoyaltiesContactXlsx extends ReportExcel {

  async addInfoTab(req, options) {
    this.info = {
      label: 'Information',
      schema: [
        { type: String, width: 10, alignVertical: 'top', value: (opt) => opt.label},
        { type: String, width: 50, alignVertical: 'top', value: (opt) => opt.value}
      ],
      data: [
        { label: 'Report', value: 'Royalty Contacts'},
        { label: 'Date', value: Moment().format('d MMMM YYYY hh:mm')},
      ]
    }
    if (req.query.year) {
      this.info.data.push({label: 'Year', value: String(req.query.year)})
    }
    if (req.query.quarter) {
      this.info.data.push({label: 'Quarter', value: String(req.query.quarter + 1)})
    }

    if (req.query.recalc) {
      this.info.data.push({label: 'Recalc', value: req.query.recalc ? 'Yes' : 'No'})
    }
  }

  _makeAmount(amount) {
    if (amount === 0) {
      return 0.00
    } else {
      return amount / 100; //  (amount.toFixed(0) / 100).toFixed(2) // +(Math.round((amount / 100) + "e+2")  + "e-2")
    }
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

  async init(req, options) {
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
}


module.exports = RoyaltiesContactPdf
