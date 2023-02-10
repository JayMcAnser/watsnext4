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
  }
}

module.exports = RoyaltiesContactPdf
