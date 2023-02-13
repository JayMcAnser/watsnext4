
const ReportExcel = require('../lib/report-excel')
const Report = require('../lib/report')
const QueryRoyalties = require("../lib/query/query-royalty");
const Path = require("path");
const Fs = require("fs");
const FsExtra = require('fs-extra')
const ReportRoyaltArtist = require("./report-royalty-artist");
const Moment = require("moment/moment");
const Archiver = require('archiver');
const JsonFile = require("jsonfile");


class RoyaltyMongo extends ReportExcel {
  /**
   * so we can dump the query
   * @param req
   * @param options
   * @returns {Promise<void>}
   */
  async init(req, options = {}) {
    await super.init(req, options);
    if (req.query && req.query.mongoQueryFilename) {
      let query = await this.getData(req, {returnData: false});
      // this.data holds now the query
      let filename = req.query.mongoQueryFilename
      if (filename.substring(0, 1) !== '/') {
        filename = Path.join(__dirname, '../../temp', filename)
      }
      JsonFile.writeFileSync(filename, query, {
        spaces: 2,
        EOL: '\r\n'
      })
    }
  }
}

class RoyaltyPerArtist extends RoyaltyMongo {

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
    if (options.hasOwnProperty('returnData') && options.returnData === false) {
      return artists
    }
    for (let artistIndex = 0; artistIndex < artists.length; artistIndex++) {
      let a = artists[artistIndex]
      this.data.push({total: a.total, event: a.events[0], contact: a.contact, pdfFilename: a.pdfFilename})
      for (let eventIndex = 1; eventIndex < a.events.length; eventIndex++) {
        this.data.push({total: null, event: a.events[eventIndex], contact: '', pdfFilename: ''})
      }
    }
    let errors = this.data.filter( (e) => e.event.hasRoyaltyErrors)
    for (let index = 0; index < errors.length; index++) {
      this.addError(errors[index])
    }
    await super.getData(req, options)
    return this.data
  }

  addError(line) {
    if (!this.hasErrors()) {
      this.errors.schema = [
        {column: 'Event', type: String, width: 60, alignVertical: 'top', value: (contract) => contract.event },
        {column: 'Error', type: String, width: 60, alignVertical: 'top', value: (contract) => contract.error },
        {column: 'Artwork', type: String, width: 40, alignVertical: 'top', value: (contract) => contract.artwork},
        {column: 'Artist', type: String, width: 40, alignVertical: 'top', value: (contract) => contract.artist},
      ]
    }
    this.errors.data.push({
      event: line.event.event, error:line.event.royaltyErrors ? line.event.royaltyErrors[0].message : 'unknown error', artist: line.event.agentInfo.name, artwork: line.event.artInfo.title
    })
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


class RoyaltyPerContract extends RoyaltyMongo {

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
    if (options.hasOwnProperty('returnData') && options.returnData === false) {
      return contracts
    }
    for (let contactIndex = 0; contactIndex < contracts.length; contactIndex++) {
      let c = contracts[contactIndex]
      this.data.push({code: c.code, total: c.total, event: c.event, royalties: c.royalties, artwork: c.artworks[0], error: c.artworks[0].royaltyError ? c.artworks[0].royaltyError.message : null})
      for (let artIndex = 1; artIndex < c.artworks.length; artIndex++) {
        this.data.push({code: '', total: null, event: null, royalties: null, artwork: c.artworks[artIndex], error: c.artworks[artIndex].royaltyError ? c.artworks[artIndex].royaltyError.message : null })
      }
    }
//    await super.getData(req, options)
    return contracts;
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
      {column: 'Error', type: String, width: 60, alignVertical: 'top',  value: (contract) => contract.error},
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
      if (options.xlsx) {
        let xlsx = new ReportContactXlsx({directory: this.directory, filename: artist.pdfFilename, contact: artist})
        await xlsx.execute(req, options)
      }
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


class ReportContactXlsx extends ReportExcel {

  constructor(options) {
    super(options);
    this.filename = Path.format({...Path.parse(this.filename), base: '', ext: '.xlsx'})
    this.contact = options.contact
  }
  async addInfoTab(req, options) {
    // nothing
  }

  _makeFullName(contact) {
    let result = '';
    if (contact.firstName) {
      result += contact.firstName + ' '
    }
    if (contact.insertion) {
      result += contact.insertion + ' '
    }
    if (contact.name) {
      result += contact.name
    }
    return result
  }
  _locationString(location) {
    if (!location.street) {
      return ''
    }
    let result = location.street
    if (location.number) {
      result += ` ${location.number}`
    }
    result += '\n'
    if (location.zipcode) {
      result += `${location.zipcode} `
    }
    result += location.city
    if (location.country && location.country !== 'Netherlands') {
      result += '\n' + location.country
    }
    return result
  }

  _makeAmount(amount) {
    if (amount === 0) {
      return 0.00
    } else {
      return  amount / 100; // (amount.toFixed(0) / 100).toFixed(2) // +(Math.round((amount / 100) + "e+2")  + "e-2")
    }
  }

  async init(req, options) {
    await super.init(req, options);

    this.schema = [
      {column: '', type: String, width: 10, alignVertical: 'top', value: (line) => line.info},
      {column: '', type: String, width: 10, alignVertical: 'top', value: (line) => line.event },
      {column: '', type: String, width: 50, alignVertical: 'top', value: (line) => line.art},
      {column: '', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (line) => line.price},
      {column: '', type: String, width: 10, alignVertical: 'top', align: 'right', value: (line) => line.percentage},
      {column: '', type: Number, width: 10, alignVertical: 'top', format: '#,##0.00', value: (line) => line.total},
    ]
  }

  getData(req, options) {
    let c = this.contact
    this.data = []
    this.data.push({})
    this.data.push({info: this._makeFullName(c.contact)})
    if (c.contact.name === 'Werve') {
      console.log('xxx')
    }
    let loc = c.contact.locations.find((x) => x.isDefault && x.usage === 'post') || {}
    if (loc) {
      this.data.push({info: this._locationString(loc)});
    }
    this.data.push({})
    //this.data.push({event: 'Event', art: 'Artwork', price: 'Price', percentage: 'Perc', total: 'Total'})
    let locId = '';
    for (let evtIndex = 0; evtIndex < c.events.length; evtIndex++) {
      let evt = c.events[evtIndex]
      if (evt.locationId !== locId) {
        this.data.push({event: evt.event});
        locId = evt.locationId
      }
      this.data.push({
        art: evt.artInfo.title,
        price: this._makeAmount(evt.price),
        // percentage: String(evt.royaltyAmount + ' / ' + evt.contactPercentage),
        percentage: evt.royaltyPercentage + (evt.contactInfo.percentage != 100 ? `/${evt.contactInfo.percentage}` : '') + '%',
        total: this._makeAmount(evt.payableAmount)})

      if (evtIndex === c.events.length - 1 || locId != c.events[evtIndex + 1].locationId) {
        this.data.push({})
      }
    }
    this.data.push({percentage: 'Total', total: this._makeAmount(c.total)})
  }
}

class RoyaltiesContactIndex extends RoyaltyMongo {

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
