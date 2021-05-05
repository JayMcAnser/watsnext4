

import Element from './element';

class Text extends Element {
  constructor(data) {
    super(data)
    this.description = data.description;
  }

  get storeData() {
    let data = super.storeData;
    if (this.description && this.description.trim().length) {
      data.description = this.description.trim()
    }
    return data;
  }
};

export default Text;