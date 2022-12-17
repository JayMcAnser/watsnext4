
const DbMySQL = require('../lib/db-mysql');
const Agent = require('../model/agent');
const Logging = require('../vendors/lib/logging');
const recordValue = require('./import-helper').recordValue;
const makeNumber = require('./import-helper').makeNumber;
const makeLength = require('./import-helper').makeLength;
const insertField = require('./import-helper').insertField;
const ImportHelper = require('./import-helper');
const CodeImport = require('./code-import');
const ContactImport = require('./contact-import');

const FieldMap = {
  agentId: 'agent_ID',
  type: (rec) => {
    switch (rec.objecttype_ID) {
      case 256:
        return 'artist in distribution';
      case 257:
        return 'artist';
      case 512:
        return 'collective in distribution';
      case 1025:
        return 'collective';
      default:
        return `Unknown (${rec.objecttype_ID})`
    }
  },
  name: 'name',
  sortOn: 'sort_on',
  died: 'died',
  biography: 'biography_en',
  biographyNl: 'biography_nl',
  comments: 'comments',
  born: 'born',
  bornInCountry: 'born_in_country',
  customerNr: 'customer_number',
  percentage: 'royalties_percentage',
};

class AgentImport {
  constructor(options = {}) {
    const STEP = 5
    this.session = options.session;
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = this._limit < STEP ? this._limit : STEP;
    this._codeImport = new CodeImport({session: this.session});
    this._contactImport = new ContactImport({session: this.session})
    this._logging = options.logging ? options.logging : Logging
  }

  /**
   * internal converting a record
   *
   * @param record
   * @param options Object
   *   - loadSql Boolean load the sql record if not found
   * @return {Promise<{}>}
   * @private
   */
  async _convertRecord(con, record, options = {}) {
    let agent = await Agent.queryOne(this.session, {agentId: record.agent_ID});
    if (agent) {
      this._logging.log('info', `agent[${record.agent_ID}]: already exists`)
      return agent;
    }
    let sql;
    let qry;
    if (options.loadSql) {
      sql = `SELECT * FROM agent WHERE agent_ID=${record.agent_ID}`;
      qry = await con.query(sql);
      if (qry.length === 0) {
         this._logging.log('warn', `agent[${record.agent_ID}] does not exist. skipped`);
        return undefined
      }
      record = qry[0];
    }
    let dataRec = {};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Agent);
    }
    // -- the address info
    sql = `SELECT * FROM address2agent WHERE agent_ID=${record.agent_ID}`;
    qry = await con.query(sql);
    for (let addrIndex = 0; addrIndex < qry.length; addrIndex++) {
      let addr = await this._contactImport.runOnData(qry[addrIndex], {loadSql: true});
      if (addr) {
        let addrRec = {
          contact: addr._id,
          isRights: qry[addrIndex].is_rights_address,
          isContact: qry[addrIndex].is_contact_address,
          isHome: qry[addrIndex].is_home_address,
          percentage: qry[addrIndex].percentage_of_percentage
        }
        if (dataRec.contacts === undefined) {
          dataRec.contacts = [addrRec]
        } else {
          dataRec.contacts.push(addrRec)
        }
      } else {
        this._logging.log('error', `agent[${record.agent_ID}] has address[${qry.contactId}] but does not exist`)
      }
    }

    // -- add the codes
    sql = `SELECT * FROM agent2code WHERE agent_ID=${record.agent_ID}`;
    qry = await con.query(sql);
    for (let codeIndex = 0; codeIndex < qry.length; codeIndex++) {
      let code = await this._codeImport.runOnData(qry[codeIndex], {loadSql: true})
      if (code) {
        if (dataRec.codes === undefined) {
          dataRec.codes = [code.id]
        } else {
          dataRec.codes.push(code.id)
        }
      }
    }
    try {
      // should also import the agent
      agent = Agent.create(this.session, dataRec);
      agent = await agent.save();
      this._logging.log('info', `agent[${record.agent_ID}]: imported`)
    } catch (e) {
       this._logging.log('error', `agent[${record.agent_ID}]: ${e.message}`)
    }

    return agent;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let stagent = 0;
      let counter = {count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      ImportHelper.stepStart('Agent');
      do {
        let dis;
        let sql = `SELECT * FROM agent ORDER BY agent_ID LIMIT ${stagent}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
            if (stagent >= this._limit) { break }
            stagent++;
          }
        }

      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Agent');
      return resolve(counter)
    })
  }

  async runOnData(record, options = {}) {
    let con = DbMySQL.connection;
    return this._convertRecord(con, record, options);
  }
}
module.exports = AgentImport;
