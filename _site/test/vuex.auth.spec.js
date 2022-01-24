const chai = require('chai');
const assert = chai.assert;
import Init from './init'

import { ApiServer } from '../src/lib/api-server';
import { auth as Auth} from '../src/vendors/store/auth';


describe('vuex.auth', () => {
  describe('create', () => {
    it('is namespaced', () => {
      assert.isTrue(Auth.namespaced)
    })
  })
  describe('state', () => {
    it('has state', () => {
      let state = Auth.state();
      assert.isDefined(state.username);
      assert.isDefined(state.email);
      assert.isDefined(state.token);
      assert.isDefined(state.refreshToken);

    })
  })
  describe('mutations', () => {

  });
  describe('actions', () => {

  });
  describe('getters', () => {

  })
})
