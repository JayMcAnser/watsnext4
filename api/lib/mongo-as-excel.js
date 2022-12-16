/**
 * basic excel report structure to transform the mongodb output into excel
 * version 0.0.1 @Jay  2022-12-12
 *
 * uses the https://github.com/LuisEnMarroquin/json-as-xlsx/blob/main/packages/main-library/package.json
 *
 */
const xlsx = require("json-as-xlsx").xlsx;
const Moment = require('moment');
const QueryRoyalties = require("./query/query-royalty");

// const data =
//   [
//     {
//       sheet: "Adults",
//       // columns: [
//       //   { label: "X", value: "name", format: "#" },
//       //   { label: "   ", value: "age", format: '# "years"' },
//       // ],
//       // content: [
//       //   { name: "Monserrat", age: 21, more: { phone: "11111111" } },
//       //   { name: "Luis", age: 22, more: { phone: "12345678" } },
//       // ],
//       columns: [
//         { label: " ", value: "caption", format: "#"},
//         { label: " ", value: "value", format: "#"},
//       ],
//       content: [
//         { caption: "Monserrat", value: 21 },
//         { caption: "Luis", value: 22},
//       ],
//
//     }
//   ]
// //
// // const settings = {
// //   writeOptions: {
// //     type: "buffer",
// //     bookType: "xlsx",
// //   },
// // }
//
// const settings = {
//   fileName: "temp/MySpreadsheet", // Name of the resulting spreadsheet
//   extraLength: 3, // A bigger number means that columns will be wider
//   writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
//   writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
//   RTL: false, // Display the columns from right-to-left (the default value is false)
// }
//
// const run = async () => {
//   return new Promise((resolve, reject) => {
//     xlsx(data, settings, () => {
//       resolve();
//     })
//   })
// }
//
// class Json2Excel {
//   constructor(options = {}) {
//     this.filename = options.hasOwnProperty('filename') ? options.filename : 'temp'
//   }
//
//   async mapping() {
//     [
//       {
//         sheet: "info",
//         columns: [
//           { label: " ", value: "caption", format: "#"},
//           { label: " ", value: "value", format: "#"},
//         ],
//         content: [
//           { caption: "Monserrat", age: 21, more: { phone: "11111111" } },
//           { value: "Luis", age: 22, more: { phone: "12345678" } },
//         ],
//       }
//     ]
//   }
//
// }

const Path = require('path');

class MongoAsExcel {
  /**
   * @param options
   *    - title - string the name of the report and the filename if not give
   *    - filename = string the filename. if omitted title is used
   *    - dirname = string the location of the file
   *
   *    if the request has parameter, the filename is adjusted to [year].[quarter].title.xslx
   */
  constructor(options = {}) {
    this._errors = [];
    this.data = [];
    this.title = options.title;
    this.filename = options.filename
    this.dirname = options.dirname ? options.dirname : Path.join(__dirname, '../../temp')
    this.date = Moment().format('DD-MM-YYYY');
    this._sheet = [];
  }

  /**
   * retrieve the data from any source
   * store the result in data property
   * @param req
   * @return {Promise<void>}
   */
  async getData(req) {
    this.data = []
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
   * add the information front page to the excel
   * @param req
   * @return {Promise<void>}
   */
  async addInfoTab(req) {
    let infoTab = {
      sheet: "Info",
      columns: [
        { label: "Caption", value: "caption", format: "# "},
        { label: "Value", value: "value", format: "# "},
      ],
      content:  [
        { caption: "Title", value: this.title },
        { caption: "Date", value: this.date}
      ],
    }
    let params = this.requestToQuery(req)
    infoTab.content = infoTab.content.concat(
      params
    )
    return infoTab;
  }

  /**
   * convert the request to an array of object(caption: '', value: '')
   * @param req
   */
  requestToQuery(req) {
    let result = []
    if (req.query.year) {
      result.push({caption: 'Year', value: req.query.year})
    } else {
      result.push({caption: 'Year', value: 'all years'})
    }
    // this.title = result[0].caption
    if (req.query.hasOwnProperty('quarter')) {
      result.push({caption: 'Quarter', value:( req.query.quarter % 4) + 1})
    }
    if (req.query.hasOwnProperty('royaltyType')) {
      result.push({caption: 'Payment period', value: ['quarter', 'once a year'][req.query.royaltyType % 2]})
    } else {
      result.push({caption: 'Payment period', value: 'all'})
    }
    if (req.query.hasOwnProperty('recalc')) {
      result.push({caption: 'Recalculate', value: req.query.recalc ? 'true': 'false'})
    }
    return result;
  }

  /**
   * process if there are error records in the req.
   * @param req
   * @return {Promise<void>}
   */
  async processErrors(req) {
    let qry = new QueryRoyalties(req);
    this._errors = await qry.distributionErrors(req)
  }

  /**
   * add the error information tab if any error did occure
   * @param req
   * @return {Promise<void>}
   */
  async addErrorTab() {
    let tab = {
      sheet: "Errors",
      columns: [
        { label: "Location", value: "location", format: "# "},
        { label: "Event", value: "event", format: "# "},
        { label: "Type", value: "type", format: "# "},
        { label: "Message", value: 'message', format: "# "},
        { label: "Artwork", value: "artwork", format: "# "},
        { label: "Artist", value: "artist", format: "# "},
      ],
      content:  [
      ],
    }
    for (let index = 0; index < this._errors.length; index++) {
      let err = this._errors[index];
//      console.log(index)
      if ( err.lines.royaltyErrors &&  err.lines.royaltyErrors.length) { // can have lines without errors
        tab.content.push({
          location: err.code,
          event: err.event,
          type: err.lines.royaltyErrors[0].type,
          message: err.lines.royaltyErrors[0].message,
          artwork: err.artData ? err.artData.title : '-- unknown --',
          artist: err.artistData ? err.artistData.name : '-- unknown --',
        })
      }
    }
    return tab;
  }

  async errorsClear() {
    this._errors = [];
  }
  errorsHas() {
    return this._errors.length > 0
  }
  async errorsAdd(err) {
    this._errors.push(err)
  }

  /**
   * process the found contact for missing information about addresses and email addresses
   * @param req
   * @return {Promise<void>}
   */
  async processContacts(req) {
    let qry = new QueryRoyalties(req);
    this._errors = await qry.contactErrors(req)
  }


  getSettings(req) {
    let result = {
      fileName: this.filename,
      extraLength: 3, // A bigger number means that columns will be wider
      writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
      writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
      RTL: false, // Display the columns from right-to-left (the default value is false)
    }
    // CAREFUL: fileName as a capitial
    if (!this.filename) {
      result.fileName = `${req.query.year}${req.query.hasOwnProperty('quarter') ? '-' + req.query.quarter + 1 : ''}-${this.title}`
    }
    if (this.dirname) {
      result.fileName = Path.join(this.dirname, result.fileName)
    }
    return result;
  }

  /**
   * run this report
   * @param req - the request object
   * @param options  - { filename }
   * @return {Promise<unknown>}
   */
  async execute(req, options = {}) {
    this._data = [];
    await this.errorsClear();
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
    return new Promise((resolve, reject) => {
      xlsx( this._sheet, this.getSettings(req), (x) => {
        resolve();
      })
    })

  }
}

module.exports = MongoAsExcel
