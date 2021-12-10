/**
 * as search query on the API
 */

import {nextTick} from "vue";
import {Model} from "../models/model";

export interface ISearchDefinitionOptions {
  query?: string,
  limit?: string,
  model: Model
}

export interface ISearchDefinition {
  isEmpty: boolean,
  toQuery: any,
  value?: any
}

export interface ISearchEvent {
  name: string,
  action: string,
  func: Function
}

type ISearchEventArray = Array<ISearchEvent>;

export class SearchDefinition implements ISearchDefinition{
  private query: string = '';
  private page: number = 0;
  private limit: string = '25';
  private searchEvents: ISearchEventArray = [];
  public model: Model

  constructor(options: ISearchDefinitionOptions) {
    this.model = options.model
    // this.query = options.query ? options.query : '';
    // this.limit = options.limit ? options.limit: '25';
    // this.page = 0;
  }

  get isEmpty() : boolean {
    return !( this.query && this.query.length > 0)
  }

  setSearch(value: string, limit: string) {
    let changed = this.query !== value || this.limit !== limit;
    this.query = value;
    this.limit = limit
    if (changed) {
      this.callEvent('changed', this)
    }
  }
  // get value(): string {
  //   return this.query
  // }
  // set value(val: string) {
  //   if (val !== this.query) {
  //     this.query = val;
  //     this.callEvent('changed', this)
  //   }
  // }


  /**
   * convert the internal used query definition into the
   * search engine query
   * @return {{query, page: number}}
   */
  toQuery() {
    return {
      query: this.query,
      limit: this.limit,
      page: this.page
    }
  }

  /**
   * event handling
   * @param name
   */
  hasEvent(name: string): boolean {
    let index = this.searchEvents.findIndex( (x) => { return x.name === name})
    return index >= 0
  }
  private eventIndex(name: string) : number {
    return this.searchEvents.findIndex( (x) => { return x.name === name})
  }
  registerEvent(name: string, action: string, func: Function) {
    if (this.hasEvent(name)) {
      throw new Error(`event ${name} already exists`)
    }
    this.searchEvents.push({
      name, action, func
    })
  }

  unregisterEvent(name: string) {
    let index = this.eventIndex(name);
    if (index >= 0) {
      this.searchEvents.splice(index, 1)
    }
  }

  callEvent(action: string, params: any) {
    for (let index = 0; index < this.searchEvents.length; index++) {
      if (this.searchEvents[index].action === action) {
        this.searchEvents[index].func(params)
      }
    }
  }
}
