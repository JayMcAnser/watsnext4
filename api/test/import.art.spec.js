/**
 * Test the distribution model
 */

const InitTest = require('./init-test');
let DbMySql;
let  DbMongo;
const Session = require('../lib/session');

const chai = require('chai');
const assert = chai.assert;
const ImportArt = require('../import/art-import');
const Art = require('../model/art');
const Setup = require('../lib/setup');

describe('import.art', function() {
  this.timeout(10000);

  let session;

  const ART_ID_1 = 99991
  const ART_ID_2 = 29992
  before( async () => {
    await InitTest.init();
    DbMySql = await InitTest.DbMySQL;
    DbMongo =  await InitTest.DbMongo;
    session = await InitTest.Session;// new Session('test-import-agent')

    await Art.deleteOne({artId: ART_ID_1})
    await Art.deleteOne({artId: ART_ID_2})
    await DbMySql.connect()

    await Setup.runSetup(session)
  });

  it('field data', () => {
    let imp = new ImportArt({session});
    let record = {
      "art_ID": ART_ID_1,
      "objecttype_ID": 1,
      "searchcode": "searchcode",
      "creation_date": "1996-07-17",
      "modified_date": "2010-10-04",
      "comments": "comments",
      "title": "title",
      "title_en": "titleEn",
      "part_of_collection": "",
      "sort_on": "sortOn",
      "year_from": "from",
      "year_till": "till",
      "length": "01:02:03.00",
      "description": "descriptionEn",
      "description_nl": "description",
      "series": "",
      "distribution": null,
      "distribution_exlusive": 0,
      "contract": 0,
      "fee": 0,
      "fee_inclusive_equipment": 0,
      "percentage": 0,
      "acquisition": null,
      "aquiered": 0,
      "color": 1,
      "sound": 1,
      "audio": "audio",
      "presentation_playback": "pres.playback",
      "presentation_monitors": "pres.monitors",
      "presentation_projectors": "pres.projector",
      "presentation_amplifier_speakers": "pres.amp",
      "presentation_computers_software": "pres.soft",
      "unique_work": 0,
      "impression": "impression",
      "sync": 0,
      "tech_comments": "tech comments",
      "presentation_installation": 1,
      "presentation_monitor": 1,
      "presentation_projection": 1,
      "persentation_carriers": "carriers",
      "presentation_objects": "objects",
      "presentation_space": "space",
      "presentation_support": "support",
      "installation_instructions": "instructions",
      "installation_handling": "handling",
      "preservation_description": "description",
      "preservation_history": "history",
      "preservation_artist_opinion": "artist opinion",
      "preservation_irreplacable_parts": "irreplacable parts",
      "preservation_production": "production",
      "preservation_recommendations": "recommendations",
      "org_length": "20'00'",
      "length_2": "",
      "multi_channel": 1,
      "sub_title": "sub title",
      "hide_from_search": 0,
      "indication": "indication",
      "credits": "credits",
      "aspect_ratio": "aspect_ratio",
      "in_distribution": 1,
      "sys_creation_date": "0000-00-00 00:00:00",
      "sys_creation_user_ID": 0,
      "sys_modified_date": "2007-01-30 12:06:15",
      "sys_modified_user_ID": 18,
      "internal_agent_ID": 3,
      "work_access_id": 0
    };
    return imp.runOnData(record).then( (mRec) => {
      assert.equal(mRec.artId, ART_ID_1);
      assert.equal(mRec.type, 'video');
      assert.equal(mRec.searchcode, 'searchcode');
      assert.equal(mRec.title, 'title');
      assert.equal(mRec.titleEn, 'titleEn');
      assert.equal(mRec.comments, 'comments');
      assert.equal(mRec.sortOn, 'sortOn');
      assert.equal(mRec.length, '01:02:03.00');
      assert.equal(mRec.yearFrom, 'from');
      assert.equal(mRec.yearTill, 'till');
      assert.equal(mRec.descriptionNl, 'description');
      assert.equal(mRec.description, 'descriptionEn');
      assert.equal(mRec.hasSound, 1);
      assert.equal(mRec.audio, 'audio');
      assert.equal(mRec.credits, 'credits');

      // add a second test record
      record.art_ID = ART_ID_2
      record.title = 'title 2';
      return imp.runOnData(record).then((mRec) => {
        assert.equal(mRec.title, 'title 2');
      });
    })
  });

  it('run - clean', () => {
    const limit = 1;
    let imp = new ImportArt({ session, limit: limit});
    return imp.run(DbMySql).then( (result) => {
      assert.equal(result.count, limit)
    })
  });
  //
  // it ('import url', async() => {
  //   let imp = new ImportArt({ session, limit: 2});
  //   let sql = 'SELECT * from art WHERE art_ID=18149';
  //   let qry = await DbMySql.query(sql);
  //   assert.equal(qry.length, 1)
  //   await imp.runOnData(qry[0]);
  //   let rec = await Art.findOne({artId: 18149});
  //   assert.isTrue(rec !== null);
  //   assert.isTrue(Object.keys(rec).length > 0);
  //   assert.equal(rec.urls.length, 2);
  // });

  it('check extended fields after reimport', async () => {
    let art = await Art.findOne({artId: {$gt:  2}});
    assert.isTrue(art !== null);
    assert.isTrue(art.artId > 0, 'found valid artId')
    let id = art._id;
    art.newInfo = 'XX';
    await art.save();
    let art2 = await Art.findById(id);
    assert.equal(art2.newInfo, 'XX', 'should reset the newInfo');
    let artId = art2.artId;
    await Art.deleteOne({artId: artId});

    let imp = new ImportArt({ session, limit: 1});
    let sql = `SELECT * from art WHERE art_ID = ${artId}`;
    let qry = await DbMySql.query(sql);
    assert.equal(qry.length, 1)
    await imp.runOnData(qry[0]);

    art2 = await  Art.findOne({artId: artId})
    assert.equal(art2.newInfo, 'XX', 'should get the info previously stored');

    // check that we do update the extra info
    art2.newInfo = 'YY';
    await art2.save();

    await imp.runOnData(qry[0]);

    art2 = await  Art.findOne({artId: artId})
    assert.equal(art2.newInfo, 'YY', 'should have been updated');

  })
});
