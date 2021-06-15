/**
 * query the agent definition
 */
const Const = require('../const');
const QueryBuilder = require('../query-builder');

class QueryAgent extends QueryBuilder {

  constructor(props) {
    super({
      fields:{
        'default': ['%name', '%searchcode'],
        searchCode: ['searchcode'],
      },
      sorts: {
        default: ['name'],
      },
      views: {
        default: {'id': 1, 'name': 1},
      }
    });
  }


}
module.exports = QueryAgent
