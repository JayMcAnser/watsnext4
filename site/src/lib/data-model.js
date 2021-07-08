/**
 * Data Model, the conversion between the Axios data and the internal data structures
 */

import {debug, error} from '../vendors/lib/logging';
import { ref, reactive, watch, watchEffect } from 'vue';
import _ from 'lodash';
import { axiosActions } from '../vendors/lib/const';
import Axios from '../vendors/lib/axios';
import SearchDefinition from "./search-definition";
import {writeDelay as DefaultWriteDelay} from './const'


/**
 * a reference to and record
 * it creates an handle that
 */
class RecordRef {
  /**
   *
   * @param record Object the data to referenc
   * @param model DataModel the model handling the api
   */
  constructor(record, model) {
    this._data = reactive(record);
    this.reference = 0;
    console.assert(model, 'call back is required')
    this._model = model;
    let vm = this;

    watch(() => _.cloneDeep(this._data), (current, prev) => {
      // if the data of the record changes, it's detected here.
      // so we mark the storage dirty
     // console.log('changed !!!', current);
      this._model.recordChanged(vm.id, current, prev)
      // console.log(vm.data.title)
    })
  }

  get id() {
    return this._data._id
  }
  get ref() {
    return this._data
  }
}

class DataModel {
  /**
   * https://stackoverflow.com/questions/40961778/returning-es6-proxy-from-the-es6-class-constructor
   * @param options
   */
  constructor(options = {
      fields: [],
      model: ''
    }) {
    if (options.fields.length === 0) {
      error(`missing fields (${options.table}`)
      throw new Error('missing fields')
    }
    this._fields = options.fields;
    this._model = options.model;
    this._records = new Map();

    this._storeData = new Map();
    this.writeDelay = DefaultWriteDelay;
    this._timer = false;
    console.assert(this._model, 'must have an model')
  }

  get recordCount() {
    return this._records.size
  }
  /**
   * remove all related definitions from the data buffer
   */
  clear() {
    this.data = {}
  }

  startTimer() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = false;
    }
    let vm = this
    this._timer = setTimeout(async () => {
      vm._timer = false;
      if (vm.cancelToken) {
        vm.cancelToken.cancel('redo action')
      }
      // https://github.com/axios/axios#cancellation
      vm.cancelToken = Axios.cancelToken.source();
      

    }, this.writeDelay)

  }
  /**
   * set the data store to be send to the server
   *
   * @param current
   * @param prev
   */
  recordChanged(id, current, prev) {
    let dataRecord = {
      current: current
    };
    if (this._prevData.has(id)) {
      dataRecord.previous = this._prevData.get(id).previous;
    } else {
      dataRecord.previous = prev
    }
    this._storeData.set(id, dataRecord)
    this.startTimer();
  }

  /**
   *
   * @param searchDef SearchDefinition
   * @return {Promise<Array>}
   */
  async getByQuery(searchDef) {
    console.assert(searchDef instanceof SearchDefinition, 'no searchDef')
    // we must request the searchDef.query from the API
    let searchResult = await Axios.get(`/${this._model}`,{params: searchDef.toQuery()});
    if (axiosActions.hasErrors(searchResult)) {
      // await dispatch('auth/logout', undefined,{root: true})
      throw new Error(axiosActions.errorMessage(searchResult))
    } else {
      let result = [];
      let recs = searchResult.data.data;
      // place these record in the buffer
      for (let index = 0; index < recs.length; index++) {
        let recRef;
        if (!this._records.has(recs[index]._id)) {
          recRef = new RecordRef(recs[index], this)
          this._records.set(recRef.id, recRef)
        } else {
          recRef = this._records.get(recs[index]._id);
          recRef.data = recs[index]
        }
        recRef.reference++;
        result.push(recRef)

      }
      return result;
    }
  }
  /**
   *
   * @param record RecordRef
   */
  free(records) {
    // we have to find record within the this._records
    let id = record.data.id;
    if (!this._records(id)) {
      error(`${this._model}.[${id}] not found`);
      throw new Error('record not found')
    }
    let ref = this._records.get(id);
    if (!ref) {
      throw new Error('unexpected: record not found')
    }
    ref.reference--;
    if (ref.reference === 0) {
      this._records.delete(id)
    }
    return true;
  }
}

export default DataModel;
