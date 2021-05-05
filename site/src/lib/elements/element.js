/**
 * root of all elements
 */

class Element {
  constructor(data) {
    this._id = data.id;
    this._type = data.type;
    this.key = data.key;
    this.title = data.title;
  }
  get id() {
    return this._id;
  }
  get isClass() {
    return true;
  }
  /**
   * returns
   * @param {Object} data 
   * @returns Boolean if the data is valid
   */
  isValid() {
    return true;
  }
  get validationErrors() {
    return []
  }
  get isNew() {
    return !(!!this._id && this._id.length > 5);
  }  

  get type() {
    return this._type;
  }
  
  get storeData() {
    let result = {
      type: this.type,
      key: this.key
    }
    if (this.title && this.title.trim().length > 0) {
      result.title = this.title.trim();
    }
    if (!this.isNew) {
      result.id = this._id;
    }
    return result;
  }

}

export default Element;