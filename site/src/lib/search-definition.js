
class SearchDefinition {
  constructor(options = {}) {
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

export default SearchDefinition;
