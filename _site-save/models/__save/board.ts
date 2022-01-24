
import { axiosActions } from '../vendors/lib/const';
import { warn } from '../vendors/lib/logging';
import Axios from '../vendors/lib/axios';
import { debug, newError } from '../vendors/lib/logging'
import Element, {ElementItemArray} from "./element";
import Factory, {ElementType} from './factory';
import {ElementStored, ElementArray, ElementMap} from "./element";
import ElementInventory from "./element-inventory";
import {FilterElement, FilterEqual} from './element-filters';
import {AccessRights} from "../lib/const";

/**
 * the fysical definition of a board returned by the API
 */
interface BoardStore {
  id: string,
  title: string,
  name: string,
  rights: number,
  description: string,
  // should be more defined ....
  elements?: Array<ElementStored>,
}

interface ElementType {
  id: string,
  icon: string,
  text: string,
}

export default class Board {
  static elementTypes: Array<ElementType> = [
    {id: 'text', icon: 'element-text', text: 'text' },
    {id: 'image', icon: 'element-image', text: 'image'},
    {id: 'video', icon: 'element-video', text: 'video'},
    {id: 'sound', icon: 'element-sound', text: 'sound'}
  ];
  readonly board: BoardStore;
  private _loaded: boolean = false;
  private _elements: ElementMap;
  private _deleted: ElementArray = [];
  private _isDirty: boolean = false;
  private _changes: Object = {};
  private _orgData: Object = {};
  private _inventory: ElementInventory = null; //undefined;
  private _isNew: boolean = false;
  private no_update_properties = ['id', 'type'];
  private _cachedSelects = {}

  constructor(board: BoardStore, options? ) {
    this.board = board;
    this._elements = new Map();
    this._isNew = !! (options && options.isNew);

    if (this._isNew) {
      debug(`create new board with ${board.id}`, 'board.constructor')
      for (let fieldname in board) {
        this._changes[fieldname] = board[fieldname]
      }
    }
    let vm = this;
    const boardHandler = {
      deleteProperty: function(target, prop) {
        if (! vm.no_update_properties.includes(prop)) {
          delete target[prop]
        }
        return true;
      },
      set: function (target, prop, value, receiver) {
        //debug(`tracking change of ${prop}`, 'board.handler')
        if (vm.no_update_properties.includes(prop)) {
          return true;
        }

        if (target[prop] !== value) {
          debug(value, 'board.change')
          vm._changes[prop] = value;
          vm._isDirty = true;
          if (!vm._orgData[prop]) {
            vm._orgData[prop] = board[prop]
          }
          return Reflect.set(target, prop, value, receiver)
        } else {
          return true;
        }
      }
    }
    if (!board) {
      warn(`board is missing the initialisation object`, 'board.constructor')
      this.board = (new Proxy({}, boardHandler)) as BoardStore;
    } else {
      if (!board.id) {
        warn(`board is missing the id`, 'board.constructor')
      }
      this.board = new Proxy(board, boardHandler);
    }
  }

  /**
   * load the board information from the raw data
   * @param data Object full board returned from API
   */
  load(data) {
    for (let id in data.elements) {
      let elm = data.elements[id]
      let elmClass = Factory(this, elm);
      if (elmClass) {
        // if an error ocurred we do NOT push it
        this._elements.set(elmClass.id, elmClass)
      }
    }
    this._loaded = true;
  }

  protected _clearCache() {

  }

  get isNew() : boolean {
    return this._isNew
  }
  get model() : BoardStore {
    return this.board
  }

  public editSchema() {
    return {
      type: 'object',
      properties: {
        title: {type: 'string'},
        type: {type: 'string'},
      }
    }
  }

  get inventory() : Element { // ElementArray {
    if (!this._inventory) {
      this._inventory = new ElementInventory(this);
    }
    return this._inventory as Element;
  }
  get inventoryElements() : ElementArray {
    return this.inventory.children().map(e => e.item)
  }

  filter(filterDef: FilterElement) {
    let result = [];
    // debug(this.elements.size, 'xch')
    for (let [key, element] of this.elements) {
      // debug(element, 'filter item')
      if (filterDef.compare(element)) {
        result.push(element)
      }
    }
    return result;
  }

  layouts(options): ElementArray {
    this._cachedSelects['layout'] = this.filter(new FilterEqual('type', 'layout'));
    return this._cachedSelects['layout']
  }


  get isDirty() {
    return this._isDirty || this.dirtyElements.length > 0 || this._deleted.length > 0;
  }
  private clearDirty() {
    this._isDirty = false;
    this._inventory = undefined;
    this._isNew = false;
    this._cachedSelects = {}
  }
  get id() {
    return this.board.id
  }
  get name() {
    return this.board.name;
  }
  get isPublic() : boolean{
    return AccessRights.isPublic(this.board.rights);
  }
  get isShared() : boolean {
    return AccessRights.canRead(this.board.rights) && !AccessRights.isOwner(this.board.rights);
  }
  get canWrite() : boolean {
    return AccessRights.canWrite(this.board.rights);
  }
  get isOwner() : boolean {
    return AccessRights.isOwner(this.board.rights);
  }

  get title() {
    return this.board.title
  }
  // set title(value) {
  //   this.addChange('title', value)
  // }

  addChange(fieldname, value) {
    if (this.board[fieldname] !== value) {
      this.board[fieldname] = value;
      this._changes[fieldname] = value;
      this._isDirty = true;
    }
  }

  /**
   * returns the changes to properties of the board NOT to the elements
   */
  changedInfo() {
    return this._changes;
  }

  hasChanges() : boolean {
    return Object.keys(this._changes).length > 0
  }
  /**
   * access to the all elements on the board in a none nested version
   * @returns Map index by the id of the element
   */
  get elements() : ElementMap { //  Map<string, Element> {
    return this._elements;
  }
  element(id) : Element {
    switch(id) {
      case 'inventory':
        return this.inventory
      default:
        return this._elements.get(id)
    }
  }

  get elementCount() {
    return this._elements.size;
  }
  /**
   * list the columns of this board
   */
  get columns() : ElementArray {
    let cols = [];
    this._elements.forEach((elm, key, map) => {
      if (elm.type[0] === ElementType.column) {
        cols.push(elm);
      }
    })
    return cols;
  }

  isLoaded() {
    return this._loaded
  }
  hasElement(id) {
    return this._elements.has(id)
  }

  /**
   * returns the elements that are dirty
   * @protected
   * @returns Array<Element>
   */
  protected get dirtyElements() {
    let result = []
    this._elements.forEach((e) => {
      if (e.isDirty || e.isNew) {
        result.push(e)
      }
    })
    return result
  }

  async save() {
    if (this.isDirty || this.isNew) {
      // ToDo should start a transaction on the server
      if (this.hasChanges() || this.isNew) {
        let result;
        if (this.isNew) {
          // the id should be in the changeInfo!!
          result = await Axios.post(`/board`, this.changedInfo());
        } else {
          result = await Axios.patch(`/board/${this.id}`, this.changedInfo());
        }
        if (!axiosActions.isOk(result)) {
          // rollback the transaction
          throw newError(axiosActions.errors(result), 'board.update');
        } else {
          this._changes = {};
        }
      }

      let dirtyOnes = this.dirtyElements;
      for (let index = 0; index < dirtyOnes.length; index++) {
        let elmData = dirtyOnes[index].changedData;
        let result;
        if (dirtyOnes[index]._isNew) {
          result = await Axios.post(`board/${this.id}/element`, elmData);
        } else {
          result = await Axios.patch(`/board/${this.id}/element/${dirtyOnes[index].id}`, elmData);
        }
        if (axiosActions.isOk(result)) {
          dirtyOnes[index].dirtyClear();
        } else {
          // rollback the transaction
          throw newError(axiosActions.errors(result), 'board.elementUpdate');
        }
      }
      for (let index = 0; index < this._deleted.length; index++) {
        let result = await Axios.delete(`board/${this.id}/element/${this._deleted[index].id}`);
        if (axiosActions.isOk(result)) {
        } else {
          throw newError(axiosActions.errors(result), 'board.elementDelete');
        }
      }
      this._deleted = [];

      // commit the transaction
      this.clearDirty()
    }
    this._clearCache();
    debug(this._inventory, 'board.ts')
    return this;
  }

  async cancel() {
    // if Typescript error: "downlevelIteration": true in the tsconfig.json/compilerOptions
    for (const [key, elm] of this._elements) {
      if (elm.isDirty) {
        await this.elementCancel(elm);
      }
    }
    for (let fieldname in this._orgData) {
      this.model[fieldname] = this._orgData[fieldname]
    }
    this._changes = {};
    this.clearDirty()
  }

  async elementCreate(data) {
    let result = await Axios.post(`board/${this.id}/elementId`, data);
    if (axiosActions.isOk(result)) {
      Object.assign(data, axiosActions.data(result));
      let elementClass = Factory(this, data,{isNew: true});
//      elementClass.updateData(data);
      this._elements.set(data.id, elementClass);
      this._clearCache();
      return elementClass;
    } else {
      throw newError(axiosActions.errors(result), 'board.elementCreate');
    }
  }

  /**
   * cancel the previous create
   */
  async elementCancel(element: Element) {
    if (element.isNew) {
      debug(`remove ${element.id}`, 'board.elementCancel')
      this._elements.delete(element.id);
    } else {
      this.element(element.id).restore();
    }
    this._clearCache();
  }

  async elementDelete(element) {
    this._deleted.push(this.element(element.id));
    this._elements.delete(element.id);
    this._elements.forEach((e) => {
      e.deleteRef(element)
    });
    this._clearCache();
  }

}

