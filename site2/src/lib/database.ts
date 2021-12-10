import {Model, IQueryResult} from "../models/model";
import {config} from './const'
import {ApiServer} from "./api-server";
import {ISearchDefinition} from "./search-definition";
// @ts-ignore
import {debug, error} from '../vendors/lib/logging';

export interface IDatabaseOptions {
  debug?: boolean,
  apiServer?: ApiServer
}


export class Database {
  readonly debug;

  private _tables: Map<string, Model>;
  readonly _apiServer: ApiServer;
  private _afterInit: Promise<boolean>;
  private _doneInit : any;

  constructor(options? : IDatabaseOptions) {
    this.debug = options && options.hasOwnProperty('debug') ? options.debug : config.debug;
    this._apiServer = options && options.hasOwnProperty('apiServer') ? options.apiServer as ApiServer : new ApiServer()
    this._tables = new Map();
    this._afterInit = new Promise((resolve, reject) =>  {
      this._doneInit = resolve
    })
  }


  // private createTableDefinition(model: Model) {
  //   this._tables[model.modelName] = model;
  // }

  /**
   * initializes the database by the configuration return by the user
   * this is done on startup at the restore or when the user logges in
   * @param userData  returned from login
   */
  async init(userData: any) {

    let tables = await this._apiServer.modelInfo()
    if (!tables.models) {
      error(`no models active`, 'database.init')
      await this._doneInit(false)
      throw new Error('no models returned')
    } else {
      debug(`init tables (${Object.keys(tables.models).join(', ')})`, 'database.init')
      this._tables = new Map()
      for (const modelName in tables.models) {
        this._tables.set(modelName, new Model({
          modelName,
          sortDefinitions: tables.models[modelName].sorts
          // ... any other fields
        }))
        // this.createTableDefinition(new Model({
        //   modelName,
        //   sortDefinitions: this.tables.models[modelName].sorts
        //   // ... any other fields
        // }))
      }
      debug('init done', 'database.init')
      await this._doneInit(true)
    }
    // this.createTableDefinition(new ArtModel(Object.assign(datasetOptions, {modelName: 'art'})))
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
    Model.apiServer = server;
  }

  get apiServer() {
    return Model.apiServer
  }

  async apiInfo() {
    return this.apiServer.getInfo()
  }

  get tables() {
    return this._tables
  }

  getTable(modelName: string) : Model {
    return this._tables.get(modelName) as Model
  }
  async hasTable(modelName : string) : Promise<boolean> {
    debug('wait for init')
    await this._doneInit;
    debug('init done')
    return this._tables.hasOwnProperty(modelName)
  }
  async query(modelName: string, searchDef: ISearchDefinition): Promise<IQueryResult> {
    if (await this.hasTable(modelName)) {
      let tbl = this.getTable(modelName);
      return tbl.query(searchDef)
    } else {
      error(`table ${modelName} does not exist`, 'database.query');
      throw new Error(`unknown table ${modelName}`);
    }
  }

  /**
   * count the total number of records that are found by the query, for the pager
   * @param modelName
   * @param searchDef
   */
  async count(modelName: string, searchDef: ISearchDefinition) : Promise<any> {
    if (await this.hasTable(modelName)) {
      let tbl = this.getTable(modelName);
      return tbl.query(searchDef)
    } else {
      error(`table ${modelName} does not exist`, 'database.query');
      throw new Error(`unknown table ${modelName}`);
    }

  }
}
