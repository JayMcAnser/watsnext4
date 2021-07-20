/**
 * Record
 *
 * basic record return from the API, rebuild as an Vue.ref v
 */
import {debug, error} from '../vendors/lib/logging';
import {reactive, watch} from 'vue'
import _ from "lodash";

class Record {
  private modelName: string;
  private dirty: boolean;
  private data: Object;

  constructor(modelName, record) {
    console.assert(modelName, 'modelName is required')
    this.modelName = modelName;
    this.data = reactive(record);
    let vm = this;
    watch(() => _.cloneDeep(this._data), (current, prev) => {
      vm.recordChanged(vm.id, current, prev)
    })
  }

  isDirty() {
    return this.dirty;
  }

  /**
   * send the latest changes to the API
   */
  async flushBuffer() {

  }

  /**
   * called when data is changed
   * @param id
   * @param currentData
   * @param prev
   */
  recordChanged(id, currentData, prev) {

  }
  /**
   * data is full changed.
   */
  async unRefData() {
    if (this.dirty) {
      await this.flushBuffer()
    }
  }
  /**
   * as full set of all fields
   * @param data
   */
  async recordData(data) {
    await this.unRefData()

  }
}
export { Record }
