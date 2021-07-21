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
  apiPost?: IApiPostFunc,
  logger?: ILogFunction
}

class RecordQueue {
  private models = new Map();
  private _interval: number = 2000
  private timer;
  private apiPost: IApiPostFunc;
  private logger: ILogFunction;

  constructor(options: IRecordQueueOptions) {
    this.apiPost = options && options.apiPost ? options.apiPost : this.apiPostDefault;
    this._interval = options && options.interval ? options.interval : 2000;
    this.logger = options && options.logger ? options.logger : undefined;
  }

  get interval() {
    return this._interval
  }

  append(modelName: string, id: string, parts: Array<any>, logger: ILogFunction) {
    let queueKey: string = `${modelName}.${id}`;
    let qi : IModelQueue = {
      modelName,
      id,
      parts,
      logger
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
  async sendParts() {
    let sendMap = this.models;
    this.models = new Map();

    let iterator = sendMap.values();
    let queueEntry;
    while (queueEntry = iterator.next().value) {
      // forEach can NOT be used async
      try {
        await this.apiPost(queueEntry.modelName, queueEntry.id, queueEntry.parts)
      } catch(e) {
        // error(`error in API: ${e.message}`)
        if (queueEntry.logger) {
          // use the local logger
          queueEntry.logger(queueEntry.modelName, queueEntry.id, e)
        } else if (this.logger) {
          // use the global logger
          this.logger(queueEntry.modelName, queueEntry.id, e)
        }
      }
    }
  }

  apiPostDefault(model: string, id: string, parts: Array<any>) {
    debug(`api called: ${model}:${id} with ${parts.length} steps`)
  }
}

export { RecordQueue }
