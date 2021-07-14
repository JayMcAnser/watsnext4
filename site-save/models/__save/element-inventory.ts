/**
 * auto generated layout that display all elements of the board
 */

import ElementLayout from "./element-layout";
import {debug} from '../vendors/lib/logging';
import Board from "./board";
import {ElementItemArray, ElementStored} from "./element";
import {FilterElement} from "./element-filters";

class ElementInventory extends ElementLayout {
  private order? : string;

  constructor(board : Board, element: ElementStored = undefined, options = undefined) {
    super(board, {id: 'inventory', type: 'inventory'}, options);
  }

  get type() : Array<string> {
    return ['inventory'];
  }
  get id() : string {
    return 'inventory'
  }
  get title() {
    return 'Inventory'
  }
  /**
   * this overloaded version reads all elements from the board and returns
   * them as if they are the children
   *
   * @param order String \\ Function(a, b)
   */
  children(qry?: FilterElement, order?): ElementItemArray {
    if (!qry) {
      qry = new FilterElement();
    }
    this._children = [];
    this.board.elements.forEach((element) => {
      if (qry.compare(element)) {
        this._children.push(this.createElementItem(element));
      }
    })
    this.order = order;
    if (this._children.length && order) {
      this.orderArray(this._children, this.order)
    }
    return this._children;
  }

  get length() {
    return this.children().length
  }
}

export default ElementInventory
