/**
 * as search query on the API
 */



export interface ISearchDefinitionOptions {
  query?: string
}

class SearchDefinition {
  private query: string;
  private page: number;

  constructor(options: ISearchDefinitionOptions = {}) {
    this.query = options.query;
    this.page = 0;
  }

  /**
   * convert the internal used query definition into the
   * search engine query
   * @return {{query, page: number}}
   */
  toQuery() {
    return {
      query: this.query,
    }
  }
}

export { SearchDefinition };
