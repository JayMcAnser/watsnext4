
import * as chai from 'chai';
const assert = chai.assert;
import {RecordQueue} from "../src/models/record-queue";


const wait = function(time = 1) {
  return new Promise(resolve => setTimeout(resolve, wait));
}

describe('record-queue', () => {
  describe('create', () => {
    it('queue', () => {
      let queue = new RecordQueue();
      assert.isDefined(queue)
    })

    it ('intervalmer', () => {
      let queue = new RecordQueue({interval: 10})
      assert.equal(queue.interval, 10)
    })
  })

  describe('add parts', () => {
    let partLength = 0
    const doPost = (model, id, parts) => {
      partLength = parts.length;
    }

    it('one part', async() => {
      let queue = new RecordQueue({interval:1, apiPost: doPost});
      assert.equal(partLength, 0)
      await queue.append('art', 'ab123', [{action: 'add'}]);
      await wait(2);
      assert.equal(partLength, 1)
    })

    it('multi part', async() => {
      partLength = 0;
      let queue = new RecordQueue({interval: 1, apiPost: doPost});
      await queue.append('art', 'ab123', [{action: 'add'}]);
      await queue.append('art', 'ab123', [{action: 'change'}, {action: 'more'}]);
      await wait(10);
      assert.equal(partLength, 3, 'did combine the updates')
    })
  })

  describe('multi id', () => {
    let ids = {}
    const doPost = (model, id, parts) => {
      ids[id] = parts;
    }

    it('multi part', async() => {
      let queue = new RecordQueue({interval: 1, apiPost: doPost});
      await queue.append('art', 'ab123', [{action: 'add'}]);
      await queue.append('art', 'cd456', [{action: 'change'}, {action: 'more'}]);
      await wait(10);
      assert.equal(Object.keys(ids).length, 2, 'separate calls')
    })
  });

  describe('multi model', () => {
    let models = {}
    const doPost = (model, id, parts) => {
      models[model] = id;
    }

    it('multi part', async() => {
      let queue = new RecordQueue({interval: 1, apiPost: doPost});
      await queue.append('art', 'ab123', [{action: 'add'}]);
      await queue.append('agent', 'cd456', [{action: 'change'}, {action: 'more'}]);
      await wait(10);
      assert.equal(Object.keys(models).length, 2, 'separate calls')
    })
  })

})
