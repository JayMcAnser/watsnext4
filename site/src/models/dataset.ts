/**
 * basic dataset that is a collection of Record
 */
import {debug, warn, error } from '../vendors/lib/logging';
import {ISearchDefinition, SearchDefinition} from "../lib/search-definition";
import {ApiServer, IApiQueryResult, IQueryRecord} from "../lib/api-server";
import {RecordData} from "./record-data";
import {v4 as uuid} from 'uuid';

export interface IDatasetOptions {
  modelName: string,
  apiServer?: ApiServer,
  debug?: boolean,
  // if set to true the axios will not report any errors the the console
  // default: false
  logging?: boolean,
}

export interface IRecordRef {
  record: RecordData,
  usedBy: Array<string>
}

export interface IQueryResult {
  records: Array<RecordData>,
  refId: string,
  // this is a ref to records[0] for easy access
  record?: IQueryRecord,
  // call this if the query is no longer needed
  unlink(): any
}

class RecordRef implements IRecordRef {
  // the physical record
  public record;
  // the components using it
  public usedBy: Array<string> = []

  constructor(record) {
    this.record = record
  }

  /**
   * set all fields of the record to the values of data
   * @param data
   */
  setRecordData(data) {
    for (let key in data) {
      if (!data.hasOwnProperty(key)) { continue }
      this.record[key] = data[key]
    }
  }
}

export class Dataset {
  static apiServer: ApiServer;

  // dataset are like tables, so the have a name
  readonly modelName: string
  // and a list of records
  private records: Map<string, IRecordRef> = new Map();

  readonly debug: boolean;

  constructor(options?: IDatasetOptions) {
    console.assert(options.modelName.length > 0, 'dataset requires modelName')
    this.modelName = options && options.modelName ? options.modelName : 'no-table';
    if (options && options.apiServer) {
      Dataset.apiServer = options.apiServer ? options.apiServer : new ApiServer({logging: options.logging})
    }
    this.debug = options.debug && options.hasOwnProperty('debug') ? options.debug : false;
    if (options.hasOwnProperty('logging')) {
      Dataset.apiServer.logToConsole(options.logging)
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


  private recordsToQueryResult(records: IApiQueryResult) : IQueryResult {
    let vm = this;
    let result : IQueryResult = {
      refId: uuid(),
      records: [],
      unlink: () => {
        return vm.unLink(result)
      }
    }
    for (let index = 0; index < records.length; index++) {
      let rec = records[index];
      let ref;
      let id = rec.hasOwnProperty('id') ? rec.id : rec._id;
      if (this.records.has(id)) {
        // use existing RecordRef
        ref = this.records.get(id);
        ref.setRecordData(rec)
      } else {
        ref = new RecordRef(rec);
        this.records.set(id, ref);
      }
      ref.usedBy.push(result.refId)
      result.records.push(ref.record); // rec);
    }
    return result;
  }
  /**
   * query the api, buffers the result
   * @param search
   */
  async query(search: ISearchDefinition | string) : Promise<IQueryResult > {

    let records : IApiQueryResult = [];
    if (typeof search === 'string') {
      search = new SearchDefinition(search)
    }
    if (!search.isEmpty) {
      records = await this.apiServer.getByQuery(this.modelName, search);
    }
    return this.recordsToQueryResult(records)
  }

  /**
   * retrieve on record from the server
   * @param id
   * @param forceApi boolean forces an api call even if the record is in the cache
   * @returns Promise the records. false if not found
   */
  async findById(id, forceApi: boolean = false) : Promise<IQueryResult | Boolean> {
    let record;
    if (forceApi === false && this.records.has(id)) {
      // we can use our cached version
      record = this.records.get(id).record;
    } else {
      record = await this.apiServer.getById(this.modelName, id);
    }
    if (record === false) {
      return false;
    }
    let result = this.recordsToQueryResult([record]);
    result.record = result.records.length ? result.records[0] : undefined
    return result;
  }

  /**
   * removes the reference to the query result
   * @param query IQueryResult or false if record wasn't found
   */
  unLink(query: IQueryResult | false) {
    if (query !== false) {
      for (let recIndex = 0; recIndex < query.records.length; recIndex++) {
        let rec = query.records[recIndex]
        let id = rec.hasOwnProperty('id') ? rec.id : rec['_id']; // rec._id is private in typescript ...
        if (this.records.has(id)) {
          let recRef = this.records.get(id);
          let index = recRef.usedBy.indexOf(query.refId);
          if (index >= 0) {
            recRef.usedBy.splice(index, 1);
            if (recRef.usedBy.length === 0) {
              if (this.debug) {
                debug(`removed ${this.modelName}[${id}] from memory`)
              }
              this.records.delete(id);
            }
          } else {
            warn(`record ${this.modelName}[${id}] has no reference to ${query.refId}`)
          }
        } else {
          error(`record not found: model: ${this.modelName}[${id}]`)
        }
      }
    }
    return true;
  }

}
