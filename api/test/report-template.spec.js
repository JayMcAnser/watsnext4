/**
 * Test the Contact model
 */
const InitTest = require('./init-test');
const chai = require('chai');
const {ReportText} = require("../lib/report-template");
const assert = chai.assert;

const ReportSection = require('../lib/report-template').ReportSection;
const ReportData = require('../lib/report-template').ReportData


describe('report-template', () => {
  describe('basics', async() => {
    it('create new', async() => {
      let sec = new ReportSection()
      assert.isDefined(sec);
      let result = await sec.run({})
      assert.equal(result, '')
    })
  })

  describe('text', async() => {
    it ('list report',  async () => {
      class FlatText extends ReportText {
        async header(data) {
          this.addLine(data.header)
        }
        async footer(data) {
          this.addLine(data.footer)
        }

        async body(data) {
          for (let index = 0; index < data.body.length; index++) {
            this.addText(data.body[index])
          }
        }
      }
      let rep = new FlatText();
      let result = await rep.run({header:'begin', footer:'end', body:['one','two']})
      assert.equal(result, 'begin\nonetwoend\n')
    })

    it('section doc', async() => {
      class SectionText extends ReportText {
        async header(data) {
          if (data.header) {
            this.addLine(data.header)
          }
        }
        async footer(data) {
          if (data.footer) {
            this.addLine(data.footer)
          }
        }
        newSection(data) {
          return new SectionText();
        }

        async body(data) {
          if (data.body.section) {
            for (let index = 0; index < data.body.section.length; index++) {
              let x = await this.section(data.body.section[index])
              this.addText(x)
            }
          }
          if (data.text) {
            this.addText(data.text);
          }
        }
      }

      let rep = new SectionText();
      let result = await rep.run({
        header:'begin',
        body: {
          section: [
            {header: 'the section', body: 'the body'},
            {header: 'the section2', body: 'the body'}
          ],
        },
        footer:'end'}
      )
      assert.include(result, 'section2')

    })
  })

})
