
import Board from './board';
import {debug, error, newError, LocationError} from '../vendors/lib/logging';
import Axios, { setHeaders } from '../vendors/lib/axios';
import { axiosActions } from '../vendors/lib/const';

// interface Boards {
//
//   [index: number]: Board
// }
interface Boards extends Array<Board> {}

class Database {
  private boardsLoaded: boolean = false;
  private _boards : Boards = []; //  Array<Board> = []

  get isLoaded() {
    return this.boardsLoaded;
  }

  async load() {
    if (!this.boardsLoaded) {
      const LOC = 'database.load';
      try {
        this._boards.splice(0); // = [];
        // debug(`loading all`, LOC)
        let res = await Axios.get('/board/list');
        debug('load from server', 'database.load')
        if (axiosActions.isOk(res)) {
          let boardList = axiosActions.data(res);
          for (let b of boardList) {
            let boardClass = new Board(b);
            // debug(boardClass, `${LOC}.board`);
            this._boards.push(boardClass);
          }
     //     debug(this._boards, `${LOC}.loaded`)
        } else {
          let err = newError(axiosActions.errors(res), LOC)
          error(err, LOC);
          throw err;
        }
        this.boardsLoaded = true;
      } catch (e) {
        error(e, LOC)
        throw e
      }
    }
    return true;
  }

  async reload() {
    this.boardsLoaded = false;
   // debugger;
    return this.load()
  }

  async boards() {
    await this.load();
    return this._boards;
  }

  async _load(data) {
    if (!data.isLoaded()) {
      const LOC = 'database.boardById';
      let url = `/board/${data.id}`
 //     debug(`loading board ${url}`, LOC)
      let res = await Axios.get(url);
      if (axiosActions.isOk(res)) {

        let boardData = axiosActions.data(res);
        data.load(boardData);
      } else {
        let err = newError(axiosActions.errors(res), LOC)
        error(err, LOC);
        throw err;
      }
    }
    return data
  }
  async boardByIndex(index) {
    let boards = await this.boards();
    if (!Number.isInteger(index) || index < 0  || index >= boards.length) {
      throw newError(`index ${index} out of range`, 'database.boardByIndex')
    }
    return await this._load(boards[index]);
  };

  async boardById(id) {
    let boards = await this.boards();
    let b = boards.find((x) => x.id === id);
    if (!b) {
      throw newError(`board ${id} not found`, 'database.boardById')
    }
    return this._load(b)
  }

  async find(query): Promise<Boards> {
    let result: Boards = []
    let boards = await this.boards();
    for (let index = 0; index < boards.length; index++) {
      let isEqual = true;
      for (let fieldName in query) {
        if (!query.hasOwnProperty(fieldName)) { continue }
        if (boards[index].board[fieldName] != query[fieldName]) {
          isEqual = false;
          break;
        }
      }
      if (isEqual) {
        result.push(boards[index]);
      }
    }
    return result;
  }

  /**
   * generate a new board id
   */
  async boardNew() {
    try {
      let result = await Axios.get('board/newid');
      if (axiosActions.isOk(result)) {
        let newBoard = axiosActions.data(result)
        debug(newBoard, 'new board')
        let boardClass = new Board(newBoard, {isNew: true})
        this._boards.push(boardClass);
        return boardClass;
      } else {
        throw newError(axiosActions.errors(result), 'database.boardNew');
      }
    } catch(e) {
      error(e, 'database.boardNew');
      throw newError(e, 'database.boardNew');
    }
  }

  async boardCreate(boardObj) {
    try {
      let result = await Axios.post('board', boardObj);
      if (axiosActions.isOk(result)) {
        let board = axiosActions.data(result);
        let boardClass = new Board(board)
        this._boards.push(boardClass);
        return boardClass;
      } else {
        throw newError(axiosActions.errors(result), 'database.boardCreate');
      }
    } catch(e) {
      error(e, 'database.boardCreate');
      throw newError(e, 'database.boardCreate');
    }
  }

  async boardUpdate(board) {
    if (board.isNew) {
      return this.boardCreate(board)
    } else {
      if (board.isDirty) {
        let result = await Axios.patch(`board/$(board.id}`, board.changedData())
      }
    }
  }

  /**
   * delete all
   * @param query Object as filter of String: the id
   * @return Boolean true: found and deleted, false: not found
   */
  async boardDelete(query) {
    if (typeof query === 'string') {
      query = {id: query}
    }
    let records = await this.find(query);
    if (records.length) {
      for (let rec of records) {
        let result = await Axios.delete(`board/${rec.id}`);
        if (axiosActions.isOk(result)) {
          let index = this._boards.findIndex( (b) => b.id === rec.id);
          if (index < 0) {
            throw new LocationError(`could not find board ${rec.id}`, 'database.boardDelete')
          }
          this._boards.splice(index, 1)
        } else {
          throw newError(axiosActions.errors(result), 'database.boardDelete');
        }
      }
      return true;
    } else {
      return false;
    }
  }
}


export { Database }
