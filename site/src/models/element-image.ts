
import Board from './board'
import {ElementStored} from './element';
import Element from "./element";

export interface ElementImageStored extends ElementStored {
  image: string
}

class ElementImage extends Element {
  public element: ElementImageStored;

  constructor(board: Board, element: ElementStored, options) {
    super(board, element, options);

  }


  editSchema() {
    let imageSchema = super.editSchema();
    //textSchema.properties['description'] = { type: 'string', 'x-display': 'textarea', 'x-props': {autoGrow: true}, 'x-class': 'no-padding'}
    imageSchema.properties['image'] = {
      "type": "string",
      "title": "click to retrieve image",
      "contentMediaType": "image/*",
      "writeOnly": true
    }
    return imageSchema;
  }

  get url() {
    // @ts-ignore
    let env = import.meta.env;
    return `${env.VUE_APP_API_URL}/file/image/${this.board.id}/${this.id}`;
  }
}

export default ElementImage;
