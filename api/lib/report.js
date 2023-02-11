/**
 * abstract structure of a report
 * version 1.0 @jay 2032-02-11
 */

class Report {

  constructor(options) {
    this.errors = []; // array of {label, data}.
    this.title = 'no-title'
    this.data = []
  }

  async init(req, options) {
    this.errors = []
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
    return {}
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

module.exports = Report
