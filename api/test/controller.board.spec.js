const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
chai.use(chaiHttp);
const assert = chai.assert;

// must run init first because it load the wrong definition
const Init = require('./init-test');
const Board = require('../models/board')
const Const = require('../vendors/lib/const');
const server = 'http://localhost:3050/api';


describe('controller.board', () => {

  const TEST_BOARD = 'test.ctrl'
  const TEST_BOARD_PUBLIC = 'test.public.ctrl'
  const TEST_BOARD_NEW_ID = 'test.newid'
  const TEST_BOARD_NO_LOGIN = 'test.ctrl.login';

  let TEST_BOARD_ID = 0;
  let TEST_BOARD_PUBLIC_ID = 0;
  let token;

  describe('with login', () => {

    before( async() => {
      token = await Init.AuthToken;
      let session = {user: await Init.AuthUser};
      // must use ROOT_USER because we logged in as a new user
      await Board.deleteByName(session, TEST_BOARD)
      await Board.deleteByName(session, TEST_BOARD_PUBLIC);
      await Board.deleteByName(session, TEST_BOARD_NEW_ID);
    })

    it ('newId', () => {
      let lastId = false;
      return chai.request(server)
        .get('/board/newid')
        .set('authorization', token)
        .then((result) => {
          assert.equal(result.status, 200);
          assert.isUndefined(result.body.errors)
          assert.isDefined(result.body.data.id);
          lastId = result.body.data.id;

          return chai.request(server)
            .post('/board')
            .set('authorization', token)
            // .type('form')
            .send({id: lastId, name: TEST_BOARD_NEW_ID, title: TEST_BOARD_NEW_ID})
            .then((result) => {
              // the private board
              assert.equal(result.status, 200);
              assert.isUndefined(result.body.errors)
              // assert.equal(result.body.status, Const.status.success, result.body.message);
              assert.equal(lastId, result.body.data.id, 'did reuse the id');
            });
        })
    })


    it('create', () => {
      return chai.request(server)
        .post('/board')
        .set('authorization', token)
        // .type('form')
        .send({name: TEST_BOARD, title: 'Test Board'})
        .then((result) => {
          // the private board
          assert.equal(result.status, 200);
          assert.isUndefined(result.body.errors)
          // assert.equal(result.body.status, Const.status.success, result.body.message);
          TEST_BOARD_ID = result.body.data.id;

          // -- the public board
          return chai.request(server)
            .post('/board')
            .set('authorization', token)
            // .type('form')
            .send({name: TEST_BOARD_PUBLIC, title: 'Test Board', isPublic: true})
            .then((result) => {
              assert.equal(result.status, 200);
              assert.isUndefined(result.body.errors)
              TEST_BOARD_PUBLIC_ID = result.body.data.id
            })
        });
    })

    it('public access', () => {
      return chai.request(server)
        .get(`/board/${TEST_BOARD_PUBLIC}`)
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isUndefined(result.body.errors)
        });
    })

    it('public list', () => {
      return chai.request(server)
        .get(`/board/list`)
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isUndefined(result.body.errors)
          assert.isTrue(result.body.data.length > 0);
          assert.isTrue(result.body.data.findIndex( x => x.id === TEST_BOARD_PUBLIC_ID) >= 0)
          assert.isTrue(result.body.data.findIndex( x => !x.isPublic) < 0, 'all are public')
        });
    })
    it('open - by name', () => {
      return chai.request(server)
        .get(`/board/${TEST_BOARD}`)
        .set('authorization', token)
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data);
          assert.isUndefined(result.body.errors,)
          assert.equal(result.body.data.title, 'Test Board')
          assert.isDefined(result.body.data.id);
        })
    });

    it('open - by id', () => {
      return chai.request(server)
        .get(`/board/${TEST_BOARD_ID}`)
        .set('authorization', token)
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data);
          assert.isUndefined(result.body.errors,)
          assert.equal(result.body.data.title, 'Test Board')
          assert.isDefined(result.body.data.id);
        })
    });

    it('open - not found', async () =>{
      return chai.request(server)
        .get(`/board/${TEST_BOARD + '.not-found'}`)
        .set('authorization', token)
        .then((result) => {
          assert.equal(result.status, 404)
          assert.isDefined(result.body.errors)
          assert.equal(result.body.errors.length, 1)
          assert.equal(result.body.errors[0].title, 'board not found')
        })
    });

    it('patch', () => {
      const DESC = 'new description';
      return chai.request(server)
        .patch(`/board/${TEST_BOARD_ID}`)
        .set('authorization', token)
        .send({
          description: DESC
        })
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data);
          assert.equal(result.body.data.description, DESC, 'success', result.body.message)

        })
    });
    // DO NOT DELETE THE BOARD. ITS USED BY elements
  })


  describe('without login', () => {
    before( async() => {
      let session = {user: await Init.AuthUser};
      await Board.delete(session, TEST_BOARD_NO_LOGIN)
    })

    it('create', () => {
      return chai.request(server)
        .post('/board')
//        .type('form')
        .send({name: TEST_BOARD, title:TEST_BOARD_NO_LOGIN})
        .then((result) => {
          assert.equal(result.status, 403)
          assert.equal(result.body.errors.length, 1);

        })
    })

    it('open', () => {
      return chai.request(server)
        .get(`/board/${TEST_BOARD_NO_LOGIN}`)
        .then((result) => {
          assert.equal(result.status, 404)
          assert.isDefined(result.body.errors);
        })
    });
  });

  describe('elements', () => {
    let elementId;

    it('add', () => {
      return chai.request(server)
        .post(`/board/${TEST_BOARD_ID}/element`)
        .set('authorization', token)
        .send({
          type: 'text',
          key: 'element.1'
        })
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data);
          assert.equal(result.body.data.type, 'text')
        })
    });
    it('check', () => {
      return chai.request(server)
        .get(`/board/${TEST_BOARD_ID}`)
        .set('authorization', token)
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data.elements);
          assert.equal(Object.keys(result.body.data.elements).length, 1)
          let elmKeys =  Object.keys(result.body.data.elements);
          elementId = result.body.data.elements[elmKeys[0]].id
        })
    });

    it('update', () => {
      return chai.request(server)
        .patch(`/board/${TEST_BOARD_ID}/element`)
        .set('authorization', token)
        .send({
          id: elementId,
          type: 'image'
        })
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isDefined(result.body.data);
          let data = result.body.data;
          assert.equal(data.type, 'image')
        });
    })

    it('delete', () => {
      return chai.request(server)
        .delete(`/board/${TEST_BOARD_ID}/element/${elementId}`)
        .set('authorization', token)
        .then((result) => {
          assert.equal(result.status, 200)
          assert.isUndefined(result.body.errors)
          assert.isDefined(result.body.data);
          let data = result.body.data;
          assert.equal(Object.keys(data.elements).length, 0)
        });
    })
  })
})
