/**
 * the report to retrieve per contact the amount
 */

const MongoAsExcel = require('../lib/mongo-as-excel');
const QueryRoyalties = require("../lib/query/query-royalty");

class RoyaltiesContact extends MongoAsExcel {

  constructor(options = {}) {
    super(Object.assign({}, options, { title: 'RoyaltiesPerArtist'}));
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

  /**
   * convert the 12345 into 123.45  (english notation
   * @param amount
   * @private
   */
  _makeAmount(amount) {
    if (amount === 0) {
      return '0.00'
    } else {
      return (amount.toFixed(0) / 100).toFixed(2) // +(Math.round((amount / 100) + "e+2")  + "e-2")
    }
  }
  /**
   * process the this.data and returns the sheet info
   * during processing the erorr can be set
   *
   * @param req
   * @return {Promise<void>}
   */
  async processData(req) {
    let content = [];

    for (let index = 0; index < this.data.length; index++) {
      let contact = this.data[index];
      if (contact.events.length > 0) {
        for (let eventIndex = 0; eventIndex < contact.events.length; eventIndex++) {
          let event = contact.events[eventIndex];
          let emailIndex = contact.contact.emails ? contact.contact.emails.findIndex( (e) => e.isDefault) : -1
          content.push({
            contact: eventIndex === 0 ? this._makeFullName(contact.contact) :'',
            email: eventIndex === 0 && emailIndex >= 0 ? contact.contact.emails[emailIndex].address :'',
            event: event.event,
            artwork: event.artInfo.title,
            price: this._makeAmount(event.price),
            percentage: event.royaltyPercentage + (event.contactInfo.percentage != '100' ? ` / ${event.contactInfo.percentage}` : ''),
            royalties: this._makeAmount(event.payableAmount),
            artist: event.agentInfo.name
          })
        }
        content.push({contact: '', event: '', artwork: '', royalties: '', artist: '', total: this._makeAmount(contact.total) })
      }
    }
    let dataTab = {
      sheet: 'Royalties',
      columns: [
        { label: "Contact ", value: "contact", format: "#"},
        { label: "email", value: "email", format: "#"},
        { label: "Event", value: "event", format: "#" },
        { label: "Artwork", value: "artwork", format: "#" },
        { label: "Price", value: "price", format: "#"},
        { label: "Percentage", value: "percentage", format: "#"},
        { label: "Royalties", value: "royalties", format: "#" },
        { label: "Artist", value: "artist", format: "#" },
        { label: "Total", value: "total", format: "#"}
      ],
      content
    }
    return dataTab
  }
}

class RoyaltiesContract extends MongoAsExcel {
  constructor(options = {}) {
    super(Object.assign({}, options, { title: 'RoyaltiesPerContract'}));
  }


  /**
   * convert the 12345 into 123.45  (english notation
   * @param amount
   * @private
   */
  _makeAmount(amount) {
    if (amount === 0) {
      return '0.00'
    } else {
      return (amount.toFixed(0) / 100).toFixed(2) // +(Math.round((amount / 100) + "e+2")  + "e-2")
    }
  }
  /**
   * retrieve the data from any source
   * store the result in data property
   * @param req
   * @return {Promise<void>}
   */
  async getData(req) {
    let qry = new QueryRoyalties(req);
    this.data = await qry.royaltyPeriod(req)

  }
  /**
   * No error reporting for this one
   * @param req
   * @return {Promise<void>}
   */
  async processErrors(req) {
    this._errors = []
  }


  /**
   * process the this.data and returns the sheet info
   * during processing the erorr can be set
   *
   * @param req
   * @return {Promise<void>}
   */
  async processData(req) {
    let content = [];

    for (let index = 0; index < this.data.length; index++) {
      let event = this.data[index];
      content.push({
        code: event.code,
        event: event.event,
        amount: event.total,
        royalty: event.royalties

      })
      for (let artIndex = 0; artIndex < event.artworks.length; artIndex++) {
        let artwork = event.artworks[artIndex];
        content.push({
          artwork: artwork.artInfo ? artwork.artInfo.title : '-- unknown art --',
          artist: artwork.agentInfo ? artwork.agentInfo.name : '-- unknown artist --',
          price: this._makeAmount(artwork.price),
          artRoyalty: this._makeAmount(artwork.royaltyAmount),
          percentage: artwork.royaltyPercentage,
          error: artwork.royaltyError ? artwork.royaltyError.message : ''
        })

      }
    }
    let dataTab = {
      sheet: 'Royalties',
      columns: [
        { label: "Code ", value: "code", format: "#"},
        { label: "Event", value: "event", format: "#" },
        { label: "Amount", value: "amount", format: "#" },
        { label: "Royalty", value: "royalty", format: "#" },
        { label: "Artwork", value: "artwork", format: "#" },
        { label: "Artist", value: "artist", format: "#"},
        { label: "Art Royalties", value: "artRoyalty", format: "#"},
        { label: "Price", value: "price", format: "#"},
        { label: "Percentage", value: "percentage", format: "#"},
        { label: "Error", value: "error", format: "#"},
      ],
      content
    }
    return dataTab
  }
}

module.exports = {
  RoyaltiesContact,
  RoyaltiesContract
};
