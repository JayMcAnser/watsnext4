
const Fs = require('fs')
const Path = require('path')
const _ = require('lodash')
const Report = require('fluentreports').Report

class ReportBasic {

  static vm;

  constructor(options = {}) {
    this.name = options.name ? options.name : 'no-name';
    this.report = false;
    this._data = {}
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
   * Write a pdf to a file
   * @param filename the full path to the file
   * @param data the Object of data
   * @param options
   * @return { filename }
   */
  async render(filename, data, options) {
    ReportBasic.vm = this;
    const defaults = Object.assign({}, {paper: 'A4', }, options)
    this._data = Object.assign({}, {_options: options},  _.cloneDeep(data));
    this._options = options
    this.report = new Report(filename, defaults);
    // load the specific content
    await this.content(data, options)
    return new Promise((resolve, reject) => {
      this.report.render((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve({ data, filename, name: this.name, report: this.report} )
        }
      })
    })
  }
}

class ReportDoc extends ReportBasic {

  constructor(options = {}) {
    super(options)
    this.image = false;
  }

  pageHeader(report) {
    report
      .image(ReportBasic.vm.image, { x: 40, y: 180, width: 30, valign: 'top'})
  }

  headerReport(report) {
    ReportBasic.vm.headerBlockLeft(report)
    ReportBasic.vm.headerBlockRight(report)
  }

  headerBlockLeft(report) {
    report.print('Abramovic', {fontBold: true});  // should be this.data.name
    report.print('70 Grand Street Apt.4')
    report.print('NY 10013 New York')
    report.print('USA')
  }
  headerBlockRight(report) {
    const XPOS = 360
    const YPOS = 90
    report.print('LIMA', {fontBold: true, x: XPOS, y: YPOS});  // should be this.data.name
    report.print('Arie Biemondstraat 111\n1054 PD Amsterdam, Netherland', {x: XPOS})
    report.print('K.V.K 56569254\nBTW NL852191005B01', {x: XPOS})
  }


  intro(report) {
    report.print('lkasdj flaksdj flaksd jflaksdj lfkasjdlfksjadlfjkasldfintro')
  }
  body(report) {
    report.print('body')
  }
  outro(report) {
    report.print('outro')
  }
  footer(report) {
    report.print('footer')
  }

  bodyReport(report) {
    let vm = ReportBasic.vm
   // report.header(this.intro)
    report.detail(vm.body)
   // report.footer(this.outro)
  }

  pageFooter(report) {
    report.print('page footer')
  }

  async content(data, options = {}) {
    this.image = options.image ? options.image : '../images/lima.logo.jpg'
    if (this.image.substring(0, 1) !== '/') {
      this.image = Path.join(__dirname, this.image)
    }
    let contentPart = new Report(this.report)

    // this.assignBodyData(contentPart, data)
    this.report
      .data( data )
      .info({Title:  options.title ? options.title : 'Lima Royalties', Author: 'LIMA'})
      .margins(90)
      .pageHeader(this.pageHeader)
      .pageFooter(this.pageFooter)
//    this.body(this.report)
    contentPart
      .data(data)
      .header(this.headerReport)
      .detail(this.intro)
    //this.report


    return this.report
  }
}


class ReportLetter extends ReportDoc {

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

  contact(report) {
   let contact = ReportBasic.vm.data.contact;
   report.print(ReportBasic.vm._makeFullName(contact), {fontBold: true});  // should be this.data.name
  // report.print('70 Grand Street Apt.4')
  // report.print('NY 10013 New York')
  // report.print('USA')
  }

  /*
   * assign the data element for the body part
   */
  assignBodyData(subReport) {
    const vm = ReportBasic.vm;
    subReport.data(vm.data)
  }

  intro(report, data) {
    const YPOS = 250
    if (data._options && data._options.intro) {
      if (typeof data._options.intro === 'function') {
        data._options.intro(report, data)
      } else {
        report.print(data._options.intro, {fontBold: true, y: YPOS});  // should be this.data.name
      }
    }
    report.newLine()
    report.newLine()
  }

  table(report) {
    report.print('Intro text with why this is send to the artist' );  // should be this.data.name
  }

  outro(report) {
    report.newLine()
    report.newLine()
    report.print('Tell why we are telling this' );  // should be this.data.name
  }


  body(report) {
    const vm = ReportBasic.vm;
    let subReport = new Report(this.report)
    vm.assignBodyData(subReport, vm.data)
    subReport
      .header( this.intro)
      .detail(this.table)
      .footer(this.outro)
    // report.detail(this.table)
    // report.detail(this.outro)
  }
}

module.exports = {
  ReportBasic,
  ReportDoc,
  ReportLetter
}
