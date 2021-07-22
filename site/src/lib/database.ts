import {Dataset} from "../models/dataset";
import {ArtModel} from "../models/art";
import {config} from '../lib/const'
import {ApiServer} from "./api-server";

export interface IDatabaseOptions {
  debug?: boolean,
  apiServer?: ApiServer
}

interface ITableDefinition {
  dataset: Dataset
}

export class Database {
  readonly debug;

  private _tables: Map<string, ITableDefinition> = new Map();

  constructor(options? : IDatabaseOptions) {
    this.debug = options && options.hasOwnProperty('debug') ? options.debug : config.debug;
    let datasetOptions: IDatabaseOptions = {
      debug: this.debug,
      apiServer: options ? options.apiServer : undefined
    }
    this.createTable(new ArtModel(Object.assign(datasetOptions, {modelName: 'art'})))
  }

  private createTable(dataset: Dataset) {
    this._tables.set(dataset.modelName, {
      dataset: dataset
    })
  }

  /**
   * get a list of names of the table
   */
  get tableNames() : Array<string> {
    let result = [];
    this._tables.forEach((tbl, modelName) => result.push(modelName))
    return result
  }

  /**
   * change the global api server
   * @param server
   */
  set apiServer(server: ApiServer) {
    Dataset.apiServer = server;
  }
  /**
   * return the dataset for the table
   * @param name
   * @return Dataset the reference to the table definition
   */
  table(name: string) : Dataset {
    if (this._tables.has(name)) {
      return this._tables.get(name).dataset
    }
    throw new Error(`table ${name} does not exists`);
  }
}
