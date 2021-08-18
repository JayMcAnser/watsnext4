/**
 * Record
 *
 * basic record return from the API, rebuild as an Vue.ref v
 */
import {Model} from "./dataset";


import {debug, error} from '../vendors/lib/logging';
import {reactive, watch} from 'vue'
import {cloneDeep} from "lodash";
import * as JsonPatch from 'fast-json-patch';
import {RecordQueue} from "./record-queue";

class RecordData {
  // all records use the same queue for updating
  static queue: RecordQueue;

  // which api model is used
  readonly modelName: string;
  // the data has changed
  private dirty: boolean;
  // the ref version of the information
  private data: any;
  // the id of this record
  private _id : string;


  constructor(modelName: string, record: any) {
    console.assert(modelName.length > 0, 'modelName is required')
    this.modelName = modelName;
    this._id = record.id;
    this.data = reactive(record);
    // check queue
    if (!RecordData.queue) {
      RecordData.queue = new RecordQueue();
    }

    let vm = this;
    watch(() => cloneDeep(this.data), (current, prev) => {
      vm.recordChanged(vm.id, current, prev)
    })
  }

  isDirty(): boolean {
    return this.dirty;
  }
  get id(): string {
    return this._id
  }

  get ref() {
    return this.data;
  }

  /**
   * add a part to the buffer and start the update timer
   * @param id
   * @param patch
   */
  appendBuffer(id: string, patch) {
    if (patch && patch.length) {
      RecordData.queue.append(this.modelName, id, patch)
    }
  }
  /**
   * called when data is changed
   * @param id
   * @param currentData
   * @param prev
   */
  recordChanged(id, currentData, prev) {
    this.appendBuffer(id, JsonPatch.compare(prev, currentData));
  }
  /**
   * data is full changed.
   */
  async unRefData() {
  }
  /**
   * as full set of all fields
   * @param data
   */
  async recordData(data) {
    await this.unRefData()
  }

  /**
   * change all data by this new version
   * @param data
   */
  setRecordData(data) {
    this.data = reactive(data);
  }


}
export { RecordData }
