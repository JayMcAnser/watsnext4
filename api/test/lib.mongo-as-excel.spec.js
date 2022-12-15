// const Init = require("./init-test");
const chai = require('chai');
const assert = chai.assert;
const run = require("../lib/mongo-as-excel").run;

describe('mongo-as-excel', async() => {
  it('test it load', async() => {
    assert.isFalse('this test')
  })

  it('create something', async() => {
    console.log(await run())

  })
})
