import {Dataset, IQueryResult} from "../models/dataset";
import {ArtModel} from "../models/art";
import {config} from './const'
import {ApiServer} from "./api-server";
import {ISearchDefinition} from "./search-definition";

export interface IDatabaseOptions {
  debug?: boolean,
  apiServer?: ApiServer
}

interface ITableDefinition {
  dataset: Dataset
}

export class Database {
  readonly debug;

  private _tables: Object = {};

  constructor(options? : IDatabaseOptions) {
    this.debug = options && options.hasOwnProperty('debug') ? options.debug : config.debug;
    let datasetOptions: IDatabaseOptions = {
      debug: this.debug,
      apiServer: options ? options.apiServer : undefined
    }
    this.createTable(new ArtModel(Object.assign(datasetOptions, {modelName: 'art'})))
  }

  private createTable(dataset: Dataset) {
    this._tables[dataset.modelName] = dataset;
  }

  /**
   * get a list of names of the table
   */
  get tableNames() : Array<string> {
    return Object.keys(this._tables);
  }

  /**
   * change the global api server
   * @param server
   */
  set apiServer(server: ApiServer) {
    Dataset.apiServer = server;
  }

  get apiServer() {
    return Dataset.apiServer
  }

  /**
   * return the dataset for the table
   * @param name
   * @return Dataset the reference to the table definition
   */
  // table(name: string) : Dataset {
  //   if (this._tables.has(name)) {
  //     return this._tables.get(name).dataset
  //   }
  //   throw new Error(`table ${name} does not exists`);
  // }
  get table() {
    return this._tables
  }

  hasTable(modelName) {
    return this._tables.hasOwnProperty(modelName)
  }
  async query(modelName: string, searchDef: ISearchDefinition): Promise<IQueryResult> {
    return this.table[modelName].query(searchDef)
  }
}
