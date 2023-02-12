/**
 * abstract structure of a report
 * version 1.0 @jay 2032-02-11
 */

class Report {

  constructor(options) {
    this.errorsClear()
    this.title = 'no-title'
    this.data = []
  }

  errorsClear() {
    this.errors = {
      label: 'Errors',
      data: [],
      schema: []
    };
  }
  hasErrors() {
    return this.errors.data.length > 0
  }
  addError(error) {

  }

  async init(req, options) {

  }

  async postProcess(req, options = {}) {
    return {}
  }

  async addInfoTab(req, options) {
  }

  async getData(req, options) {
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
    this.errorsClear();
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
