

const chai = require('chai');
const assert = chai.assert;
import Init from './init'

import ApiServer from '../src/lib/api-server'
import SearchDefinition from "../src/lib/search-definition";

describe('api-server', () => {

  let authToken;
  before( async() => {
    authToken = await Init.AuthToken
  })

  it('create', () => {
    let apiServer = new ApiServer();
    assert.isDefined(apiServer)
  });

  let id = false
  it('by query', async() => {
    let apiServer = new ApiServer();
    let search = new SearchDefinition({query: 'title'});
    let recs = await apiServer.getByQuery('art', search );
    assert.isTrue(Array.isArray(recs));
    assert.isTrue(recs.length > 0);
    assert.isDefined(recs[0]._id)
    id = recs[0]._id
  })

  it('by id', async() => {
    let apiServer = new ApiServer();
    assert.isTrue(id !== false)
    let rec = await apiServer.getById('art', id)
    assert.isDefined(rec._id);
    assert.equal(rec._id, id)
  })

})
