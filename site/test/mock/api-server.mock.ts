/**
 * Mock for fake API server
 */

import {ApiServer} from "../../src/lib/api-server";
import {SearchDefinition} from "../../src/lib/search-definition";
import {RecordData} from "../../src/models/record-data";

class MockApiServer extends ApiServer {

  public queryResult : Array<Object>;

  get isMock(): boolean {
    return true;
  }
  setQueryResult(modelName: string, data: Array<any>) {
    this.queryResult = [];
    for (let index = 0; index < data.length; index++) {
      let rec = new RecordData(modelName, data[index]);
      this.queryResult.push(rec)
    }
  }
  async getByQuery(model: string, query: SearchDefinition) {
    return this.queryResult
  }
}

export {
  MockApiServer
}
