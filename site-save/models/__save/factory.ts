

import Element from './element';
import ElementList from './element-list';
import ElementText from './element-text'
import ElementImage from './element-image';
import ElementLayout from './element-layout'
import { ElementStored } from './element';
import Board from './board';
import { warn } from '../vendors/lib/logging'
import ElementInventory from "./element-inventory";


export const ElementType = {
  board: 'board',
  list: 'list',
  text: 'text',
  image: 'image',
  inventory: 'inventory',
  layout: 'layout'
}


const Factory = function(board: Board, element: ElementStored = undefined, options: object ={}) {
   switch (element.type) {
     case ElementType.text:
       return new ElementText(board, element, options);
     case ElementType.image:
       return new ElementImage(board, element, options);
     case ElementType.list:
       return new ElementList(board, element, options);
     case ElementType.inventory:
       return new ElementInventory(board, element, options);
     case ElementType.layout:
       return new ElementLayout(board, element, options)
     default:
       warn(`unknown element type: ${element.type}`, 'model.factory')
       return new Element(board, element, options)
   }
}

export default Factory;

