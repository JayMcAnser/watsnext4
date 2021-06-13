const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
chai.use(chaiHttp);
const assert = chai.assert;

// must run init first because it load the wrong definition
const Init = require('./init-test');
const Board = require('../models/board')
const Const = require('../vendors/lib/const');
const Config = require('config');
const server = 'http://localhost:3050/api';
const SuperTest = require('supertest');
const Path = require('path');
const ImageUtil = require('../lib/image-util');

describe('controller.board.upload', () => {

  const TEST_BOARD = 'test.upload.ctrl'

  let TEST_BOARD_ID = 0;
  let TEST_ELEMENT_ID = 0;
  let TEST_BOARD_PUBLIC_ID = 0;
  let token;

  describe('with login', () => {
    before(async () => {
      token = await Init.AuthToken;
      let session = {user: await Init.AuthUser};
      // must use ROOT_USER because we logged in as a new user
      await Board.deleteByName(session, TEST_BOARD)
      let board = await chai.request(server)
        .post('/board')
        .set('authorization', token)
        // .type('form')
        .send({name: TEST_BOARD, title: TEST_BOARD});
      TEST_BOARD_ID = board.body.data.id;
      let element = await chai.request(server)
        .post(`/board/${TEST_BOARD_ID}/element`)
        .set('authorization', token)
        .send({
          type: 'image',
          key: 'image.1'
        })
      TEST_ELEMENT_ID = element.body.data.id
    });

    it('upload a file to a new element', () => {
      return chai.request(server)
        .post(`/board/${TEST_BOARD_ID}/upload`)
        .set('authorization', token)
        // could set this if it was previous generated
        //id: '6ca0b2b0-2663-4a83-921b-1ecce0c783ba',
        .field('id', TEST_ELEMENT_ID)
        .field('type', 'image')
        .field('key', 'image.2')

        .attach('image', Path.join(__dirname, 'data/image.jpg'))
        .then((result) => {
          assert.equal(result.status, 200);
        })
    })
    it('retrieve file', () => {
      return chai.request(server)
        .get(`/file/image/${TEST_BOARD_ID}/${TEST_ELEMENT_ID}`)
        .set('authorization', token)
        .then(result => {
          assert.equal(result.status, 200);
          assert.isUndefined(result.errors)
        })
    });

    it('retrieve a default file', () => {
      let image = ImageUtil.randomImage('layout')
      return chai.request(server)
        .get(`/file/image/${TEST_BOARD_ID}/${image}`)
        .set('authorization', token)
        .then(result => {
          assert.equal(result.status, 200);
        })
    })
  });
});
