


const Path = require("path");
const writeXlsxFile = require("write-excel-file/node");

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
    this.data = []
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

module.exports = ReportExcel
