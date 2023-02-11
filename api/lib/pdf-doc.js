
const Fs = require('fs')
const Path = require('path')
const _ = require('lodash')
const PdfKit = require('pdfkit')
const Moment = require('moment')

class PdfBasic {

  constructor(options = {}) {
    this.name = options.name ? options.name : 'no-name';
    this.report = false;
    this._data = {}
    this.imagePath = Path.join(__dirname, '../images')
  }

  /**
   * create a new PDF definition
   * @param options
   * @return {PDFDocument}
   */
  createPdf(options) {
    return new PdfKit(options)
  }

  basicFonts() {
    const FontPath = Path.join(__dirname, '../reports/fonts') + '/'
    return {
      Roboto: {
        normal: FontPath + 'Roboto-Regular.ttf',
        bold: FontPath + 'Roboto-Medium.ttf',
        italics: FontPath + 'Roboto-Italic.ttf',
        bolditalics: FontPath + 'Roboto-MediumItalic.ttf'
      }
    };
  }

  /**
   * overload this function to create specific content
   * @param options
   * @return {Promise<string>}
   */
  async content(options = {}) {
    return {}
  }

  get data() {
    return this._data
  }

  /**
   * this is the PdfDocument, this.report is the PdfDoc
   */
  pageHeader() {
    this.report.image(Path.join(this.imagePath, 'lima.logo.jpg'), 50, 185, { width: 40 })
  }

  pageFooter() {
    // this does not work, it moves the entire text !!
    // if (options.footerText) {
    //   pdf.fontSize(
    //     10,
    //   ).text(
    //     options.footerText,
    //     50,
    //     pdf.page.height - pdf.page.margins.bottom - 20 ,
    //     {align: 'center', width: 500},
    //   );
    // }
  }
  /**
   * called when a page is added
   * this is the PDF document
   * to find the current report use ReportBasic.vm
   */
  pageAdded() {
    this.report.pageHeader()
    this.report.pageFooter();
  }

  async addPage() {
    let pageOptions = {};
    if (this.report.reportOptions.margins) {
      pageOptions = this.report.reportOptions.margins
    } else {
      pageOptions = {margins: { left: 120, right: 50, top: 110, bottom: 10}}
    }
    this.report.addPage(pageOptions)
  }

  async docHeader(pdf) {
    pdf.text('docHeader')
  }
  async docBody(pdf) {
    pdf.text('docBody '.repeat(400), pdf.page.margins.left)
  }
  async docFooter(pdf) {
    pdf.text('docFooter')
  }

  /**
   * Write a pdf to a file
   * @param filename the full path to the file or a writeable stream
   * @param data the Object of data
   * @param options
   * @return { filename }
   */
  async render(filename, data = {}, options = {}) {
    // ReportBasic.vm = this;
    const defaults = Object.assign({}, {size: 'A4', autoFirstPage: false}, options)
    // this._data = data;
    // this._options = defaults
    this.report = this.createPdf(defaults);
    this.report.data = data;
    this.report.reportOptions = options
    this.report.report = this;   // our definition of a report
    this.report.on('pageAdded', this.pageAdded)
    this.stream = filename
    if (typeof filename === 'string') {
      this.stream = Fs.createWriteStream(filename)
    }

    await this.addPage();
    await this.docHeader(this.report)
    await this.docBody(this.report)
    await this.docFooter(this.report)

    this.report.end();
    this.report.pipe(this.stream)

    return this;
  }
}

class PdfDoc extends PdfBasic {
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
    // address could be included
    return result
  }

  async docHeader(pdf) {
    let contact = this._makeFullName(pdf.data.contact)
    let lima = 'LIMA\nArie Biemondstraat 111\n1054 PD Amsterdam\nNetherlands'

    let pageWidth = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right
    let mid = pdf.page.margins.left + (pageWidth / 2)
    let top = pdf.page.margins.top
    pdf
      .text(contact, pdf.page.margins.left, top, {width: mid})
      .text(lima, mid, top, {width: mid})
    if (pdf.reportOptions.showDate) {
      pdf
        .text(`Amsterdam, ${Moment().format('d MMMM YYYY')}`, this.report.page.margins.left, 230)
        .moveDown(2)
    }
  }
}


module.exports = {
  PdfBasic,
  PdfDoc,

}
