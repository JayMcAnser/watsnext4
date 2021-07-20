/**
 * Record
 *
 * basic record return from the API, rebuild as an Vue.ref v
 */
import {debug, error} from '../vendors/lib/logging';
import {reactive, watch} from 'vue'
import {cloneDeep} from "lodash";
import * as JsonPatch from 'fast-json-patch';

class Record {
  // which api model is used
  readonly modelName: string;
  // the data has changed
  private dirty: boolean;
  // the ref version of the information
  private data: any;
  // the information send to the server in patch steps
  private updateBuffer: Array<any> = []
  // true if the updateBuffer is going to be send to the server
  private isSending: boolean = false;

  constructor(modelName: string, record: any) {
    console.assert(modelName, 'modelName is required')
    this.modelName = modelName;
    this.data = reactive(record);
    let vm = this;
    watch(() => cloneDeep(this.data), (current, prev) => {
      vm.recordChanged(vm.id, current, prev)
    })
  }

  isDirty() {
    return this.dirty;
  }
  get id() {
    return this.data.id
  }

  get ref() {
    return this.data;
  }
  /**
   * send the latest changes to the API
   */
  async flushBuffer() {
    if (this.isSending || this.updateBuffer.length) {
      debug('force flush buffer')
    }
  }

  /**
   * start the wait for sending information to the server
   */
  startSend() {
    debug('send info to server');
    this.isSending = false
  }

  /**
   * add a part to the buffer and start the update timer
   * @param patch
   */
  appendBuffer(patch) {
    this.updateBuffer = this.updateBuffer.concat(patch);
    if (!this.isSending && this.updateBuffer.length) {
      this.isSending = true;
      this.startSend();
    }
  }
  /**
   * called when data is changed
   * @param id
   * @param currentData
   * @param prev
   */
  recordChanged(id, currentData, prev) {
    let patch = JsonPatch.compare(prev, currentData)
    if (patch.length) {
      this.appendBuffer(patch)
    }
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
