
const ReportExcel = require('../lib/report-excel')
const Report = require('../lib/report')
const QueryRoyalties = require("../lib/query/query-royalty");
const Path = require("path");
const Fs = require("fs");
const FsExtra = require('fs-extra')
const ReportRoyaltArtist = require("./report-royalty-artist");
const Moment = require("moment/moment");
const Archiver = require('archiver');

class RoyaltyPerArtist extends ReportExcel {

  constructor(options) {
    super();
    this.title = options.filename || 'RoyaltiesPerArtist'
  }

  /**
   * data has to be transformed to a one line per payment
   * @param req
   * @param options
   * @returns {Promise<void>}
   */
  async getData(req, options) {
    let qry = new QueryRoyalties(req);
    let artists = await qry.contactEvents(req, options);
    for (let artistIndex = 0; artistIndex < artists.length; artistIndex++) {
      let a = artists[artistIndex]
      this.data.push({total: a.total, event: a.events[0], contact: a.contact, pdfFilename: a.pdfFilename})
      for (let eventIndex = 1; eventIndex < a.events.length; eventIndex++) {
        this.data.push({total: null, event: a.events[eventIndex], contact: '', pdfFilename: ''})
      }
    }
  }

  async addInfoTab(req, options) {
    super.addInfoTab(req, options)
    this.info.data[0].value = this.title
  }

  _makeAmount(amount) {
    if (amount === null) {
      return null
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
    this.filename = options.filename ||  `${req.query.year}${req.query.hasOwnProperty('quarter') ? '-' + req.query.quarter + 1 : ''}-${this.title}.xlsx`

    this.schema = [
      {column: 'Contact', type: String, width: 50, alignVertical: 'top', value: (contact) => contact.contact.name},
      {column: 'Email', type: String, width: 25, alignVertical: 'top', value: (contact) => {
          let emails = contact.contact.emails;
          let index = emails ? emails.findIndex(x => x.isDefault) : -1
          if (index >= 0) {
            return emails[index].address
          } else if (emails && emails.length) {
            return emails[0].address
          }
          return ''
        }},
      {column: 'Event', type: String, width: 10, alignVertical: 'top', value: (line) => line.event.event },
      {column: 'Artwork', type: String, width: 50, alignVertical: 'top', value: (line) => line.event.artInfo.title},
      {column: 'Price', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (line) => this._makeAmount(line.event.price || 0)},
      {column: 'Perc artist', type: Number, width: 10, alignVertical: 'top', value: (line) => line.event.royaltyPercentage},
      {column: 'Perc contact', type: Number, width: 10, alignVertical: 'top', value: (line) => line.event.contactPercentage},
      {column: 'Royalties', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (line) => this._makeAmount(line.event.payableAmount || 0)},
      {column: 'Total', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (line) => this._makeAmount(line.total)},
    ]
  }
}


class RoyaltyPerContract extends ReportExcel {

  constructor(options) {
    super();
    this.title = options.filename || 'RoyaltiesPerContract'
  }

  /**
   * data has to be transformed to a one line per payment
   * @param req
   * @param options
   * @returns {Promise<void>}
   */
  async getData(req, options) {
    let qry = new QueryRoyalties(req);
    let contracts = await qry.royaltyPeriod(req, options);
    for (let contactIndex = 0; contactIndex < contracts.length; contactIndex++) {
      let c = contracts[contactIndex]
      this.data.push({code: c.code, total: c.total, event: c.event, royalties: c.royalties, artwork: c.artworks[0], errors: c.artworks[0].royaltyErrors})
      for (let artIndex = 1; artIndex < c.artworks.length; artIndex++) {
        this.data.push({code: '', total: null, event: null, royalties: null, artwork: c.artworks[artIndex], errors: c.artworks[artIndex].royaltyErrors})
      }
    }
  }

  async addInfoTab(req, options) {
    super.addInfoTab(req, options)
    this.info.data[0].value = this.title
  }

  _makeAmount(amount) {
    if (amount === null) {
      return null
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
    this.filename = options.filename ||  `${req.query.year}${req.query.hasOwnProperty('quarter') ? '-' + req.query.quarter + 1 : ''}-${this.title}.xlsx`

    this.schema = [
      {column: 'Code', type: String, width: 10, alignVertical: 'top', value: (contract) => contract.code},
      {column: 'Event', type: String, width: 60, alignVertical: 'top', value: (contract) => contract.event },
      {column: 'Artwork', type: String, width: 40, alignVertical: 'top', value: (contract) => contract.artwork.artInfo.title},
      {column: 'Amount', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (contract) => this._makeAmount(contract.total || 0)},
      {column: 'Perc', type: Number, width: 5, alignVertical: 'top', value: (contract) => contract.artwork.royaltyPercentage},
      {column: 'Royalty', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (contract) => this._makeAmount(contract.artwork.royaltyAmount || 0)},
      {column: 'Error', type: String, width: 10, alignVertical: 'top',  value: (contract) => contract.royaltyError} ,
    ]
  }
}

/**
 * class generates the PDF file for the royalty for the contact/artist
 */
class RoyaltiesContactPdf extends Report {

  constructor(options) {
    super(options)
    this.directory = ''
  }

  async init(req, options) {
    let storeDir = 'royalty.' + (req.query.hasOwnProperty('year') ? req.query.year : 'all')
    if (req.query.hasOwnProperty('quarter')) {
      storeDir += `.${req.query.quarter}`
    }

    if (req.query.hasOwnProperty('output')) {
      if (req.query.output.substring(0,1) === Path.sep) {
        this.directory = Path.join(req.query.output, storeDir)
      } else {
        this.directory = Path.join(__dirname, '../../temp', req.query.output, storeDir)
      }
      Path.join(req.query.output)
    } else {
      this.directory = Path.join(__dirname, '../../temp', String(storeDir))
    }
    Fs.mkdirSync(this.directory, {recursive: true})
  }

  async getData(req, options) {
    let qry = new QueryRoyalties(req);
    let contacts = await qry.contactEvents(req, options);
    this.data = contacts
  }

  /**
   *
   * @param req
   * @param options {index}
   * @returns {Promise<void>}
   */
  async processData(req, options) {
    if (options.reset) {
      await FsExtra.emptyDir(this.directory)
      // Fs.rmSync(this.directory, { recursive: true, force: true });
    }
    for (let index = 0; index < this.data.length; index ++) {
      let artist = this.data[index];
      let rpt = new ReportRoyaltArtist()
      await rpt.render(Path.join(this.directory, artist.pdfFilename), artist,{showDate: true})
    }
    if (!options.hasOwnProperty('index') || options.index) {
      // write the index file into the directory
      let xlsx = new RoyaltiesContactIndex({directory: this.directory})
      await xlsx.execute(req, {data: this.data})
    }
    if (options.zip) {
      let zipFilename = options.zip
      if (zipFilename.substring(0, Path.sep.length) !== Path.sep) {
        zipFilename = Path.join(__dirname, '../../temp', zipFilename)
      }
      if (Fs.existsSync(zipFilename)) {
        Fs.unlinkSync(zipFilename)
      }
      let archive = Archiver('zip', {zlib: {level: 9}});
      const output = Fs.createWriteStream(zipFilename);
      archive.pipe(output)
      return new Promise(async (resolve, reject) => {
        output.on('end', () => {
          resolve()
        })
        output.on('close', () => {
          resolve()
        })
        output.on('error', (err) => {
          reject(err)
        })
        archive.directory(this.directory, '')
        archive.finalize()
      })
    }
  }
  async postProcess(req) {
    return {
      directory: this.directory
    }
  }
}


class RoyaltiesContactIndex extends ReportExcel {

  constructor(options) {
    super(options)
    this.filename = (options.filename || 'contact.index') + '.xlsx'
    this.label = 'Contacts'
  }

  async addInfoTab(req, options) {
    this.info = {
      label: 'Information',
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
    this.info.data.push({label: 'Version', value: require('../package.json').version})
  }

  async getData(req, options) {
    let qry = new QueryRoyalties(req);
    this.data = await qry.contactEvents(req, options);
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

module.exports = {
  RoyaltyPerArtist,
  RoyaltyPerContract,
  RoyaltiesContactPdf
}
