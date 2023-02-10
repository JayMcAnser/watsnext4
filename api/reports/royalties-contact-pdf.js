/**
 * generate all the PDF needed for the royalty publications
 *
 * Version: 1.0.0  2023-02-10 @Jay
  */
const Path = require('path');
const Fs = require('fs')
const QueryRoyalties = require("../lib/query/query-royalty");
const JsonFile = require("jsonfile");

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
  }

  async init(req, options) {
    this.errors = []
    this.sheets = []
    this.schema = []
  }
  async postProcess(req, options) {
    if (this.errors.length) {
      // write a sheet with the errors
    }
    const writeXlsxFile = require('write-excel-file/node')
    let filename = Path.join(this.directory, (options.filename ? options.filename : this.filename))
    if (!filename.substring(0, 1) === Path.sep) {
      filename = Path.join(__dirname, '../../temp', filename)
    }
    return writeXlsxFile(
      [this.data], {
        schema: [this.schema],
        sheets: ['artists'],
        filePath: filename
      }
    )
  }

  async infoTab(req, options) {

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
    if (options.infoTab) {
      await this.addInfoTab(req, options)
    }
    await this.processData(req, options)
    await this.postProcess(req, options)
  }
}

class RoyaltiesContactXlsx extends ReportExcel {

  async init(req, options) {
    super.init(req, options);
    this.schema = [
      {column: 'Artist', type: String, value: (contact) => contact.contact.name},
      {column: 'Email', type: String, value: (contact) => {
        let emails = contact.contact.email;
        let index = emails ? email.findIndex(x => x.isDefault) : -1
        if (index >= 0) {
          return emails[index].address
        }
        return ''
      }},
      {column: 'Filename', type: String, value: (contact) => contact.pdfFilename}
    ]
  }
}


module.exports = RoyaltiesContactPdf
