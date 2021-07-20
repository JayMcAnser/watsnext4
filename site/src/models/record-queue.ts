/**
 * queue of record that are periodically send to the server
 */

import {debug, error} from '../vendors/lib/logging';

export type ILogFunction = (modelName: string, id: string, error: Error) => void
export type IApiPostFunc = (model: string, id: string, parts: Array<any>) => void;

export interface IModelQueue {
  modelName: string,
  id: string,
  parts: Array<any>,
  logger: ILogFunction
}

export interface IRecordQueueOptions {
  interval?: number,
  apiPost?: IApiPostFunc
}

class RecordQueue {
  private models = new Map();
  private _interval: number = 2000
  private timer;
  private apiPost: IApiPostFunc

  constructor(options: IRecordQueueOptions) {
    this.apiPost = options && options.apiPost ? options.apiPost : this.apiPostDefault;
    this._interval = options && options.interval ? options.interval : 2000;
  }

  get interval() {
    return this._interval
  }

  append(modelName: string, id: string, parts: Array<any>, logging: ILogFunction) {
    let queueKey: string = `${modelName}.${id}`;
    let qi = {
      modelName,
      id,
      parts,
      logging
    }
    if (!this.models.has(queueKey)) {
      this.models.set(queueKey, qi);
    } else {
      this.models.get(queueKey).parts = this.models.get(queueKey).parts.concat(parts)
    }
    let vm = this;
    if (parts.length) {
      if (this.timer) {
        clearTimeout(this.timer)
      }

      this.timer = setTimeout( () => {
        vm.sendParts();
        vm.timer = false;
      }, this._interval)
    }
  }

  /**
   * send the information to the server
   */
  sendParts() {
    let sendMap = this.models;
    this.models = new Map();
    sendMap.forEach( async (queueEntry: IModelQueue, modelName: string,) => {
      try {
        await this.apiPost(queueEntry.modelName, queueEntry.id, queueEntry.parts)
      } catch(e) {
        if (queueEntry.logger) {
          error(`error in API: ${e.message}`)
          queueEntry.logger(queueEntry.modelName, queueEntry.id, e.message)
        }
      }
    })
  }

  apiPostDefault(model: string, id: string, parts: Array<any>) {
    debug(`api called: ${model}:${id} with ${parts.length} steps`)
  }
}

export { RecordQueue }
