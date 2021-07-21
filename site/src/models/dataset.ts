/**
 * basic dataset that is a collection of Record
 */
import {debug, warn, error } from '../vendors/lib/logging';
import {SearchDefinition} from "../lib/search-definition";
import {ApiServer} from "../lib/api-server";
import {RecordData} from "./record-data";
import {v4 as uuid} from 'uuid';

export interface IDatasetOptions {
  modelName: string,
  apiServer?: ApiServer
}

export interface IRecordRef {
  record: RecordData,
  usedBy: Array<string>
}

export interface IQueryResult {
  records: Array<RecordData>,
  refId: string
}

class RecordRef implements IRecordRef {
  // the fysical record
  public record;
  // the components using it
  public usedBy: Array<string> = []

  constructor(record) {
    this.record = record
  }

}

export class Dataset {
  static apiServer: ApiServer;

  // dataset are like tables, so the have a name
  readonly modelName: string
  // and a list of records
  private records: Map<string, IRecordRef> = new Map();

  constructor(options?: IDatasetOptions) {
    this.modelName = options && options.modelName ? options.modelName : 'no-table';
    if (options.apiServer) {
      Dataset.apiServer = options.apiServer ? options.apiServer : new ApiServer()
    }
  }

  /**
   * returns the number of records in memory
   */
  get size() {
    return this.records.size
  }
  /**
   * returns what ApiServer is globally used
   */
  get apiServer(): ApiServer{
    return Dataset.apiServer;
  }

  /**
   * query the api, buffers the result
   * @param search
   */
  async query(search: SearchDefinition) : Promise<IQueryResult> {
    let records = await this.apiServer.getByQuery(this.modelName, search);
    let result : IQueryResult = {
      refId: uuid(),
      records: []
    }
    for (let index = 0; index < records.length; index++) {
      let rec = records[index];
      let ref;
      if (this.records.has(rec.id)) {
        // use existing RecordRef
        ref = this.records.get(rec.id);
        ref.record.setRecordData(rec)
      } else {
        ref = new RecordRef(rec);
        this.records.set(rec.id, ref);
      }
      ref.usedBy.push(result.refId)
      result.records.push(rec);
    }
    return result;
  }

  /**
   * removes the reference to the query result
   * @param query
   */
  unLink(query: IQueryResult) {
    for (let recIndex = 0; recIndex < query.records.length; recIndex++) {
      let rec = query.records[recIndex]
      if (this.records.has(rec.id)) {
        let recRef = this.records.get(rec.id);
        let index = recRef.usedBy.indexOf(query.refId);
        if (index >= 0) {
          recRef.usedBy.splice(index, 1);
          if (recRef.usedBy.length === 0) {
            debug(`remove ${this.modelName}[${rec.id}] from memory`)
            this.records.delete(rec.id);
          }
        } else {
          warn(`record ${this.modelName}[${rec.id}] has no reference to ${query.refId}`)
        }
      } else {
        error(`record not found: model: ${this.modelName}[${rec.id}]`)
      }
    }
  }
}
