
import * as chai from 'chai';
const assert = chai.assert;
import {Record} from "../src/models/record";
import {RecordQueue} from "../src/models/record-queue";


describe('record', () => {

  const wait = function(time = 1) {
    return new Promise(resolve => setTimeout(resolve, wait));
  }
  describe('create', () => {
    it('new, empty', () => {
      let rec = new Record('art', {});
      assert.isDefined(rec);
      assert.equal('art', rec.modelName)
    })
  });

  describe('react to changes', () => {
    let sendCalled = false;

    // mock class to see if we call the queue
    class RecQue extends RecordQueue {
      append(modelName, id, parts, logger) {
        sendCalled = true
      }
    }

    it ('rec, update', async() => {
      let rec = new Record('art',{id: 'abc', name: 'jay'});
      Record.queue = new RecQue()
      assert.isFalse(sendCalled);
      assert.equal(rec.id, 'abc')
      rec.ref.name = 'Jay Jay';
      await wait()
      assert.isTrue(sendCalled);
    })
  })
});
