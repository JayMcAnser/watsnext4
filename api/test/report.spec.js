/**
 * Test the Report Engine
 */
const InitTest = require('./init-test');
const chai = require('chai');
const assert = chai.assert;

const Path = require('path');
const Fs = require('fs');

const {ReportBasic} = require("../lib/report");

describe('report', () => {
  describe('basics', async () => {

    const filename = Path.join(__dirname, './temp/basic.pdf')
    beforeEach(() => {
      if (Fs.existsSync(filename)) {
        Fs.unlinkSync(filename)
      }
    })


    it('create new', async () => {
      let sec = new ReportBasic()
      assert.isDefined(sec);
    })
    it('write text', async() => {
      let rpt = new ReportBasic()
      let result = await rpt.render(filename)
      assert.isDefined(result);
    })
  })
})
