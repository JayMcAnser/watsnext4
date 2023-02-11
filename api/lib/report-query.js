const Path = require('path')
const Report = require('report')
// const writeXlsxFile from "write-excel-file/node";
import Moment from "moment";

class ReportQuery extends Report {

  constructor(options = {}) {
    super(options);
    this.data = []
  }

  async init(req, options) {
    super.init(req, options)
  }

  async postProcess(req, options = {}) {
    return {}
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
    return await this.postProcess(req, options)

  }
}
