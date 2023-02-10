const PdfDocument = require("pdfkit-table");
const Report = require('../lib/report' ).ReportDoc

class ReportRoyaltyArtist extends Report {

  static fontSize = 11;

  createPdf(options) {
    // should create a different pdf definition
    return new PdfDocument(options)
  }

  async docHeader(pdf) {
    pdf
      .fontSize(ReportRoyaltyArtist.fontSize)
    super.docHeader(pdf);
    pdf
      // .moveDown(1)
      .text(`Dear ${pdf.data.contact.firstName}\n`)
      .moveDown(2)
      .text('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.')
      .moveDown()
  }


  docFooter(pdf) {
    pdf
      .fontSize(ReportRoyaltyArtist.fontSize)
      .moveDown(2)
      .text('Please send you invoice within days  ............. to ... ')
      .moveDown()
      .text('Best regards')
      .moveDown(3)
      .text('Gaby Wijers')

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
        event: {label: event.artInfo.title + ' (' + event.agentInfo.name +')' },
        price: {label: this._makeAmount(event.price) },
        perc: {label: event.royaltyPercentage + (event.contactInfo.percentage != 100 ? `/${event.contactInfo.percentage}` : '') + '%' },
        total: {label: this._makeAmount(event.royaltyAmount) },
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
    let table = {
      headers: this.tableHeader(pdf),
      datas: this.tableBody(pdf)
    }
    return pdf.table(table)
  }

}

module.exports = ReportRoyaltyArtist
