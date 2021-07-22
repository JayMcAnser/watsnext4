/**
 * Mock for fake API server
 */

import {ApiServer, IQueryResult, IQueryRecord} from "../../src/lib/api-server";
import {SearchDefinition} from "../../src/lib/search-definition";
import {RecordData} from "../../src/models/record-data";

class MockApiServer extends ApiServer {

  public queryResult : Map<string, Array<IQueryRecord>> = new Map();

  get isMock(): boolean {
    return true;
  }
  setQueryResult(modelName: string, data: Array<any>) {
    let records = [];
    for (let index = 0; index < data.length; index++) {
      let rec = new RecordData(modelName, data[index]);
      records.push(rec)
    }
    this.queryResult.set(modelName, records);
  }


  async getByQuery(model: string, query: SearchDefinition) : Promise<IQueryResult> {
    if (this.queryResult.has(model)) {
      return this.queryResult.get(model)
    }
    throw new Error(`unknown model ${model}`);
  }

  async getById(model: string, id: string): Promise<IQueryRecord | false > {
    if (this.queryResult.has(model)) {
      let recs = this.queryResult.get(model)
      for (let index = 0; index < recs.length; index++) {
        if (recs[index].id === id) {
          return recs[index]
        }
      }
      return false
    }
    throw new Error(`unknown model ${model}`);
  }
}

export {
  MockApiServer
}
