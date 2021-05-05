/**
 * different type of filters for elements
 *
 *
 */
import Element from "../models/element";
import {debug, warn} from '../vendors/lib/logging'

export interface FilterOptions  {
  // if true the compare is case-sensitive
  caseSensitive?: boolean,
  // if true a '' or false or undefined or null returns the full list
  noValueIsAll?: boolean
}

export class FilterElement {
  readonly caseSensitive: boolean;
  readonly noValueIsAll: boolean;

  constructor(value?, options: FilterOptions = {}) {
    options = Object.assign({}, {caseSensitive: false, noValueIsAll: true}, options);
    this.caseSensitive = options.caseSensitive;
    this.noValueIsAll = options.noValueIsAll;

  }
  compare(element: Element) {
    return true;
  }
}

export class FilterEqual extends FilterElement {
  readonly fieldname;
  readonly value;
  constructor(fieldname: string, value: string, options: FilterOptions = {}) {
    super(value, options);
    this.value = value;
    this.fieldname = fieldname
  }

  compare(element: Element): boolean {
   // debug(`${element[this.fieldname]} == ${this.value} = ${element[this.fieldname] == this.value}`, 'compare.element')
    if (Array.isArray(element[this.fieldname])) { // used for the type
      return element[this.fieldname][0] == this.value
    }
    return element[this.fieldname] == this.value
  }
}


export class FilterContain extends FilterElement {
  readonly searchValue: string;

  constructor(value: string, options: FilterOptions = {}) {
    super(value, options)

    if (this.caseSensitive) {
      this.searchValue = value;
    } else if (typeof value === 'string') {
      this.searchValue = value.toLowerCase();
    } else if (value === null || value === undefined) {
      this.searchValue = ''
    } else {
      warn(`value is unknown ${value}`)
    }
  }

  compare(element: Element): boolean {
    if (this.noValueIsAll && this.searchValue === undefined || this.searchValue === null || this.searchValue.trim().length === 0) {
      return true;
    }
    return element.filterContains(this.searchValue, this.caseSensitive);
  };
}

/**
 * filter that should be true for all sub filters
 */
export class FilterAnd extends FilterElement {
  readonly filters: Array<FilterElement> = []

  constructor(options?) {
    super(undefined, options);
  }

  add(filter) {
    this.filters.push(filter)
  }
  get length() {
    return this.filters.length
  }

  compare(element: Element): boolean {
    for (let index = 0; index < this.filters.length; index++) {
      if (!this.filters[index].compare(element)) {
        return false;
      }
    }
    return true
  }
}

/**
 * filter that split the string and searches on the individual words
 */
export class FilterWordSearch extends FilterAnd {
  constructor(value = '', options?) {
    super(options);
    if (typeof value === 'string') {
      let words = value.split(' ');
      for (let index = 0; index < words.length; index++) {
        let word = words[index].trim();
        if (word.length) {
          this.add(new FilterContain(word, options))
        }
      }
    }
  }
}
