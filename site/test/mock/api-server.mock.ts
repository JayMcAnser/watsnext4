/**
 * Mock for fake API server
 */

import {ApiServer, IQueryResult, IQueryRecord} from "../../src/lib/api-server";
import {SearchDefinition} from "../../src/lib/search-definition";
import {RecordData} from "../../src/models/record-data";

class MockApiServer extends ApiServer {

  public queryResult : Array<IQueryRecord>;

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


  async getByQuery(model: string, query: SearchDefinition) : Promise<IQueryResult> {
    return this.queryResult
  }

  async getById(model: string, id: string): Promise<IQueryRecord | false > {
    for (let index = 0; index < this.queryResult.length; index++) {
      if (this.queryResult[index].id === id) {
        return this.queryResult[index]
      }
    }
    return false
  }
}

export {
  MockApiServer
}
