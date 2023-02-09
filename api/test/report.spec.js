/**
 * Test the Report Engine
 */
const InitTest = require('./init-test');
const chai = require('chai');
const assert = chai.assert;

const Path = require('path');
const Fs = require('fs');
const JsonFile = require('jsonfile');

const {ReportBasic, ReportDoc} = require("../lib/report");
const ReportRoyaltArtist = require('../reports/report-royalty-artist')

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
      assert.isFalse(Fs.existsSync(filename))
      let rpt = new ReportBasic('basic.pdf')
      let result = await rpt.render(filename, {}, {footerText: 'the footer text'})
      assert.isDefined(result);
      assert.isTrue(Fs.existsSync(filename))
    })
  })

  describe('doc', () => {
    const filename = Path.join(__dirname, './temp/doc.pdf')
    beforeEach(() => {
      if (Fs.existsSync(filename)) {
        Fs.unlinkSync(filename)
      }
    })

    it('create new', async () => {
      let rpt = new ReportDoc()
      assert.isDefined(rpt);
    })
    it('write contact', async() => {
      const Artist = {
        "contact": {
          "_id": "63e2667fed53f7d4ee120dde",
          "locations": [],
          "telephones": [
            {
              "isDefault": true,
              "number": "06 44692524",
              "usage": "telephone",
              "_id": "63e2667fed53f7d4ee120ddf"
            }
          ],
          "emails": [
            {
              "isDefault": true,
              "address": "ivar@ivarvanbekkum.nl",
              "_id": "63e2667fed53f7d4ee120de0"
            }
          ],
          "extras": [],
          "addressId": "1003343",
          "type": "female",
          "firstName": "Ivar",
          "insertion": "van",
          "name": "Bekkum",
          "sortOn": "Bekkum",
          "__v": 0,
          "percentage": 100,
          "royaltiesPeriod": 0
        }
      }
      assert.isFalse(Fs.existsSync(filename))
      let rpt = new ReportDoc()
      let result = await rpt.render(filename, Artist,{showDate: true})
      assert.isDefined(result);
      assert.isTrue(Fs.existsSync(filename))
    })
  })

  describe('royalty-artist', async () => {
    const filename = Path.join(__dirname, './temp/royaltyArtist.pdf')
    beforeEach(() => {
      if (Fs.existsSync(filename)) {
        Fs.unlinkSync(filename)
      }
    })

    it('generate', async() => {
      assert.isFalse(Fs.existsSync(filename))
      let rpt = new ReportRoyaltArtist()
      let Artist = JsonFile.readFileSync(Path.join(__dirname, 'data/royalty-artist-2.json'))
      let result = await rpt.render(filename, Artist,{showDate: true});
      assert.isTrue(Fs.existsSync(filename))
    })
  })
})
