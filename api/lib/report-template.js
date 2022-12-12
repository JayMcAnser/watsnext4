/**
 * the template definition of an report
 */

class ReportData {
  constructor() {
    this.value = ''
  }
}

class ReportSection {

  constructor(options = {reportData: new ReportData()}) {
    this.reportData = options.reportData
  }

  newSection() {
    return new ReportSection();
  }
  async section(data) {
    let section = this.newSection(data);
    return await section.run(data);
  }
  async header(data) {
  }
  async body(data) {
  }

  async footer(data) {
  }

  async run(data) {
    await this.header(data);
    await this.body(data);
    await this.footer(data);
    return this.reportData.value
  }
}

class ReportText extends ReportSection {
  constructor(options) {
    super(options);
    this.reportData = new ReportData(); // must be the text version
    this.currentLine = 0
  }
  newSection(data) {
    return new ReportText();
  }
  addLine(text) {
    this.reportData.value += text + '\n';
    this.currentLine++
  }
  addText(text) {
    this.reportData.value += text;
  }
}

module.exports = {
  ReportData,
  ReportSection,
  ReportText
}


