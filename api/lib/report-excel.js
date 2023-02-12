


const Path = require('path');
const writeXlsxFile = require("write-excel-file/node");
const Report = require('./report')
const Moment = require("moment/moment");


/**
 * this creats the excelsheet belonging to all the pdfs
 */
class ReportExcel extends Report{

  constructor(options = {}) {
    super(options);
    this.directory = options.directory || '../../temp';
    this.filename = options.filename || 'no-name.xlsx';
    this.sheets = []
    this.schema = []
    this.label = 'Sheet 1'
    this.data = []
    this.info = {}  // {label, schema, data}
  }

  async init(req, options) {
    super.init(req, options)
    this.sheets = []
    this.schema = []
  }

  async postProcess(req, options = {}) {

    const writeXlsxFile = require('write-excel-file/node')
    let filename = Path.join(this.directory, options.filename || this.filename)
    if (filename.substring(0, Path.sep.length) != Path.sep) {
      filename = Path.join(__dirname, filename)
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

    if (this.hasErrors()) {
      // write a sheet with the errors
      settings.schema.push(this.errors.schema)
      settings.sheets.push(this.errors.label)
      data.push(this.errors.data)
    }

    if (options.stickyRowsCount) {
      settings.stickyRowsCount = options.stickyRowsCount
    }
    await writeXlsxFile(data, settings)
    return {filename}
  }

  async addInfoTab(req, options) {
    this.info = {
      label: 'About',
      schema: [
        { type: String, width: 10, alignVertical: 'top', value: (opt) => opt.label},
        { type: String, width: 50, alignVertical: 'top', value: (opt) => opt.value}
      ],
      data: [
        { label: 'Report', value: 'Royalty Contacts'},
        { label: 'Date', value: Moment().format('d MMMM YYYY H:mm')},
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
    this.info.data.push({label: 'Revision', value: require('../package.json').version})
  }

}

module.exports = ReportExcel
