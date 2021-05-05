
import Board from './board'
import Element from "./element";
import {ElementStored} from './element';

class ElementList extends Element {
  constructor(board: Board, element: ElementStored, options) {
    super(board, element, options);
  }
}

export default ElementList;
