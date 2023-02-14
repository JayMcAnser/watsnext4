const PdfDocument = require("pdfkit-table");
const PdfDoc = require('../lib/pdf-doc' ).PdfDoc

const TEXT_COLOR = 'black'
const LINK_COLOR = 'blue'
const HANDLER_EMAIL = 'ruthtimmermans@li-ma.nl'
const CONT = {continued: true}
const FONT_BOLD = 'Helvetica-Bold'
const FONT_NORMAL = 'Helvetica'

class PdfRoyaltyArtist extends PdfDoc {

  static fontSize = 11;

  createPdf(options) {
    // should create a different pdf definition
    return new PdfDocument(options)
  }

  async docHeader(pdf) {
    pdf
      .fontSize(PdfRoyaltyArtist.fontSize)
    super.docHeader(pdf);

    pdf
      .fontSize(PdfRoyaltyArtist.fontSize)
      .text(`Dear ${pdf.data.contact.firstName},`)
      .moveDown(2)
      .text('We hope this letter finds you in good health and high spirits and we are honoured to have the opportunity to showcase your work to the world.')
      .moveDown()
      .text('We are pleased to provide, as an attachment, an overview of the royalties you are entitled to over the past year for each of your works.')
      .moveDown()
      .text('If the work was screened at a film festival competition or if in consultation with you as the artist, no fee was charged, the amount can be 0. Nevertheless, we are sending you this overview for completeness.')
      .moveDown()
      .text('Please note that, unfortunately, the Dutch tax office no longer accepts royalty statements. As a result, we kindly request that you send us an invoice before ', CONT)
      .font(FONT_BOLD)
      .text('March 31st 2023', CONT)
      .font(FONT_NORMAL)
      .text(' to the following email address ', {continued: true})
      .fillColor(LINK_COLOR)
      .text('facturen@li-ma.nl',  { link: 'mailto:facturen@li-ma.nl', continued : true })
      .fillColor(TEXT_COLOR)
      .text('.')
      .moveDown()
      .text('In your invoice, please include the following details:')
      .list([
        'The reference number on the royalty statement',
        'Your full address, bank account number (IBAN), BIC/SWIFT and VAT number',
        'LI-MA’s full address and VAT number (which you can find at the bottom of this letter)',
        'The amount stated on the royalty statement, VAT (if applicable) and the total amount, stating Royalties 2022'])
      .moveDown()
      .text('Once we receive your correct invoice, you can expect to receive your royalty payment within 14 working days. However, please note that providing an incorrect invoice could lead to delays of the payment. As such, we request that you take the necessary steps to ensure the accuracy of the information you provide. If you have any questions, please do not hesitate to contact us by sending an email to ', {continued: true})
      .fillColor(LINK_COLOR)
      .text(HANDLER_EMAIL, { link: `mailto:${HANDLER_EMAIL}`})
      .fillColor(TEXT_COLOR)
      // .text('If you would like to donate your royalties to LI-MA’s mission to preserve and distribute media art, that option is available to you. Let us know, and we will make the necessary arrangements. Thank you for your understanding and cooperation and, once again, for your trust and support. We look forward to continuing to work with you. ')
      // .moveDown()
      // .text('Warm regards,')
      // .moveDown()
      // .text('Gaby Wijers')
      // .moveDown()
      // .text('PS: We would also like to remind you that you can stay up to date with LI-MA’s activities through subscribing to our newsletter.')

  }


  docFooter(pdf) {
    pdf
      .fontSize(PdfRoyaltyArtist.fontSize)
      .font(FONT_NORMAL)
      .moveDown()
      .text('If you would like to donate your royalties to LI-MA’s mission to preserve and distribute media art, that option is available to you. Let us know, and we will make the necessary arrangements. Thank you for your understanding and cooperation and, once again, for your trust and support. We look forward to continuing to work with you. ')
      .moveDown()
      .text('Warm regards,')
      .moveDown()
      .text('Gaby Wijers')
      .moveDown()
      .text('PS: We would also like to remind you that you can stay up to date with LI-MA’s activities through subscribing to our newsletter.')
      .moveDown(2)
      // .moveDown(2)
      //
      // .text('Best regards')
      // .moveDown(3)
      // .text('Gaby Wijers')
      // .moveDown(2)
      // .text('PS: We would also like to remind you that you can stay up to date with LI-MA’s activities through subscribing to our newsletter.')


    let margins = Object.assign({}, pdf.page.margins);
    pdf.addPage({margins})
      .fontSize(13)
      .font(FONT_BOLD)
      .text('List of events')
      .moveDown(2)
    let table = {
      headers: this.tableHeader(pdf),
      datas: this.tableBody(pdf)
    }
    return pdf.table(table)
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
      return '\u20AC ' + (amount.toFixed(0) / 100).toFixed(2) // +(Math.round((amount / 100) + "e+2")  + "e-2")
    }
  }

  /**
   * build the header for the table
   * @param pdf
   * @return {Object} see: https://www.npmjs.com/package/pdfkit-table
   */
  tableHeader(pdf) {
    let pageWidth = pdf.page.width - pdf.page.margins.right - pdf.page.margins.left;
    const numWidth = 42;
    const percWidth = 35
    return [
      { label: "Event", property: 'event', width: pageWidth - 3 * numWidth, renderer: null },
      { label: "Price", property: 'price', width: numWidth, renderer: null, align: 'right' },
      { label: "Perc.", property: 'perc', width: percWidth, renderer: null, align: 'right' },
      { label: "Total", property: 'total', width: numWidth, renderer: null, align: 'right' },
    ]
  }

  tableBody(pdf) {
    let result = []
    let data = pdf.data
    let id = 0
    for (let eventIndex = 0; eventIndex < data.events.length; eventIndex++ ) {
      let event = data.events[eventIndex]
      if (id !== event.event) {
        result.push({
          event: {label: `bold:${event.event}   `}, // needs space for the error calc
          price: '',
          perc: '',
          total: '',
          // options: {separation: false }
        })
        id = event.event
      }
      result.push({
        event: {label: event.artInfo.title + ' (' + event.agentInfo.name +')', options: { padding: 3 } },
        price: {label: this._makeAmount(event.price) },
        perc: {label: event.royaltyPercentage + (event.contactInfo.percentage != 100 ? `/${event.contactInfo.percentage}` : '') + '%' },
        total: {label: this._makeAmount(event.payableAmount) },

      })
    }
    result.push({
      event:'',
      price: '',
      perc: {label: 'bold:Total'},
      total: {label: 'bold:' + this._makeAmount(data.total)}
    })
    return result;
  }

  async docBody(pdf) {
    // let table = {
    //   headers: this.tableHeader(pdf),
    //   datas: this.tableBody(pdf)
    // }
    // return pdf.table(table)
  }

}

module.exports =  PdfRoyaltyArtist
