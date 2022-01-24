
import Board from './board'
import {ElementStored} from './element';
import Element from "./element";

export interface ElementTextStored extends ElementStored {
  description: string
}

class ElementText extends Element {
  public element: ElementTextStored;

  constructor(board: Board, element: ElementStored, options) {
    super(board, element, options);

  }

  get description() : string {
    return (this.element as ElementTextStored).description
  }

  editSchema() {
    let textSchema = super.editSchema();
    textSchema.properties['description'] = { type: 'string', 'x-display': 'textarea', 'x-props': {autoGrow: true}, 'x-class': 'no-padding'}
    return textSchema;
  }
}

export default ElementText;
