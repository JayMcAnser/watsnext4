
import * as chai from 'chai';
const assert = chai.assert;
import {Record} from "../src/models/record";



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

  describe('react', () => {
    let sendCalled = false;
    class ReactRec extends Record {
      startSend() {
        sendCalled = true
      }
    }

    it ('rec, update', async() => {
      let rec = new ReactRec('art',{id: 'abc', name: 'jay'});
      assert.isFalse(sendCalled);
      assert.equal(rec.id, 'abc')
      rec.ref.name = 'JayJay';
      await wait()
      assert.isTrue(sendCalled);
    })
  })
});
