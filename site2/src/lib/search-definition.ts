/**
 * as search query on the API
 */



export interface ISearchDefinitionOptions {
  query?: string,
  limit?: string
}

export interface ISearchDefinition {
  isEmpty: boolean,
  toQuery: any,
  value?: any
}

export class SearchDefinition implements ISearchDefinition{
  private query: string;
  private page: number;
  private limit: string;

  constructor(options: ISearchDefinitionOptions = {}) {
    this.query = options.query ? options.query : '';
    this.limit = options.limit ? options.limit: '25';
    this.page = 0;
  }

  get isEmpty() : boolean {
    return !( this.query && this.query.length > 0)
  }

  get value(): string {
    return this.query
  }
  set value(val: string) {
    this.query = val;
  }
  /**
   * convert the internal used query definition into the
   * search engine query
   * @return {{query, page: number}}
   */
  toQuery() {
    return {
      query: this.query,
      limit: this.limit
    }
  }
}
