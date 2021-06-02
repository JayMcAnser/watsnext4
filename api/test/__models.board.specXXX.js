
const Init = require('./init-test');
const chai = require('chai');
const assert = chai.assert;

const Fs = require('fs');
const Path = require('path');
const Board = require('../models/board');
const Const = require('../vendors/lib/const');
const AccessRights = require('../lib/const').accessRights;
const CreateSession = require('../vendors/controllers/auth').setupLogging;

describe('models.board', () => {

  const TEST_NAME = 'test-board';
  let session;
  let boardId;
  let dataDir = Path.join(__dirname, 'data');

  before( async () => {
    try {
      let req = {}
      CreateSession(req)
      session = req.session;
      session.user = await Init.AuthUser;
      await Board.deleteByName(session, TEST_NAME);
    } catch(e){
      console.error(`model.board: ${e.message}`)
    }
  })

  describe('meta', () => {
    it('create', async() => {
      let board = await  Board.create(session, {name: TEST_NAME});
      assert.isTrue(board.id > '0');
      assert.isDefined(board.rights);
      // assert.isTrue(board.rights & AccessRights.owner > 0)
      assert.isTrue(AccessRights.isOwner(board.rights))
      assert.isTrue(AccessRights.canRead(board.rights));
      assert.isTrue(AccessRights.canWrite(board.rights))
      assert.isTrue(AccessRights.canAccess(board.rights))
      boardId = board.id
    });
    it ('create - duplicate', async() => {
      try {
        boardId = await Board.create(session, {name: TEST_NAME});
        assert.fail('board name is not unique')
      } catch(e) {
        assert.equal(e.message, `[board] ${Const.results.boardExists}`)
      }
    })

    it('findOne', async() => {
      let board = await Board.findOne(session, {name: TEST_NAME});
      assert.equal(board.id, boardId)
    })

    it('findAll', async() => {
      let boards = await Board.findAll(session);
      assert.isTrue(boards.length >= 1, 'found boards');
      assert.isTrue(boards.findIndex( (x) => x.name === TEST_NAME) >= 0, 'has test filename')
    });

    it('open', async() => {
      let board = await Board.open(session, TEST_NAME);
      assert.isDefined(board.id, 'found the board');
    });

    it('save', async() => {
      let board = await Board.open(session, TEST_NAME);
      board.elements = [{id: 1}]
      await Board.save(session, board.id, board);
      // check we wrote it to disk
      board = await Board.open(session, TEST_NAME);
      assert.isDefined(board.elements, 'has something');
      assert.equal(board.elements[0].id, 1)
    });

    it('update', async () => {
      let board = await Board.open(session, TEST_NAME);
      let id = board.id;
      board = {
        description: 'new description'
      }
      await Board.update(session, id, board);
      // check we wrote it to disk
      board = await Board.open(session, TEST_NAME);
      assert.isDefined(board.description, 'did create the field');
      assert.equal(board.description, 'new description')
    })

    it('update - wrong fieldname', async () => {
      let board = await Board.open(session, TEST_NAME);
      let id = board.id;
      board = {
        'DOES_NOT_EXIST': 'new description'
      }
      try {
        await Board.update(session, id, board);
        assert.fail('should not update board')
      } catch (e) {
        assert.equal(e.message, 'data is not valid');
        assert.isDefined(e.validationError);
        assert.equal(e.validationError.message, '"DOES_NOT_EXIST" is not allowed')
      }
    });

    it('update - multiple errors', async () => {
      let board = await Board.open(session, TEST_NAME);
      let id = board.id;
      board = {
        'DOES_NOT_EXIST': 'new description',
        'THIS_TOO': 'no reason'
      }
      try {
        await Board.update(session, id, board);
        assert.fail('should not update board')
      } catch (e) {
        assert.equal(e.message, 'data is not valid');
        assert.isDefined(e.validationError);
        assert.equal(e.validationError.message, '"DOES_NOT_EXIST" is not allowed')
      }
    });


    it('make public', async () => {
      let board = await Board.open(session, TEST_NAME);
      assert.isFalse(AccessRights.isPublic(board.rights));
      await Board.setPublic(session, board, true);
      board = await Board.open(session, TEST_NAME);
      assert.isTrue(AccessRights.isPublic(board.rights))
    });
  })
  describe('image', () => {
    it('image - add - by filename', async () => {
      let board = await Board.open(session, TEST_NAME);
      Fs.writeFileSync( Path.join(dataDir, 'image.png'), 'dummy date');
      let imageId = await Board.imageAdd(session, board, Path.join(dataDir, 'image.png'));
      assert.isDefined(imageId, 'return of the image id');
      let filename = Path.join(Board.rootDir, board.id, 'media', imageId + '.png')
      assert.isTrue(Fs.existsSync(filename), filename);

      let imageFilename = await Board.imageGet(session, board, imageId);
      assert.isTrue(Fs.existsSync(imageFilename))
    });

    it('image - add - by definition', async () => {
      let board = await Board.open(session, TEST_NAME);
      Fs.writeFileSync( Path.join(dataDir, 'image2.png'), 'dummy date');

      let imageId = await Board.imageAdd(session, board, {filename: Path.join(dataDir, 'image2.png'), name: 'testing'});
      assert.isDefined(imageId, 'return of the image id');
      let filename = Path.join(Board.rootDir, board.id, 'media', imageId + '.png')
      assert.isTrue(Fs.existsSync(filename), filename);

      let imageFilename = await Board.imageGet(session, board, imageId);
      assert.isTrue(Fs.existsSync(imageFilename))
    });
  });

  describe('element - general', () => {
    let elmId;
    let grpId;

    it('create - text', async() => {
      let board = await Board.open(session, TEST_NAME);
      elmId = (await Board.elementAdd(session, board, {type: 'text', key: 'key.1'}))._newElementId;
      assert.isDefined(elmId, 'return create an element id');
    });
    it('is stored', async() => {
      let board = await Board.open(session, TEST_NAME);
      assert.isDefined(board.elements)
      assert.isTrue(Object.keys(board.elements).length > 0)
    });
    it('create - group', async() => {
      let board = await Board.open(session, TEST_NAME);
      grpId = (await Board.elementAdd(session, board, {type: 'group', elements: [{id: elmId}]}))._newElementId;

      assert.isTrue(grpId.length > 0)
      assert.isDefined(grpId, 'return create an element id');
      let board2 = await Board.open(session, TEST_NAME);
      assert.equal(Object.keys(board2.elements).length, 2);
      let e = board2.elements[grpId];
      assert.equal(e.key, 'group.1');
      assert.isDefined(e.elements)
      assert.equal(e.elements.length, 1)
      assert.equal(e.elements[0].id, elmId);

    });

    it('key unique', async () => {
      let board = await Board.open(session, TEST_NAME);
      try {
        let element = await Board.elementAdd(session, board, {type: 'text', key: 'key.1'});
        assert.fail('should throw duplicate error')
      } catch( e) {
        assert.equal(e.status, 409)
      }

    })

    it ('remove', async () => {
      let board = await Board.open(session, TEST_NAME);
      let cnt = Object.keys(board.elements).length
      let element = await Board.elementRemove(session, board, elmId);
      board = await Board.open(session, TEST_NAME);
      assert.equal(Object.keys(board.elements).length, cnt -1)
      await Board.elementRemove(session, board, grpId)
    })

  })

  describe('element - movement basic', () => {
    let elmId;
    let board;
    let txtElement;
    let grpElement;
    let extraId

    before( async () => {
      board = await Board.open(session, TEST_NAME);
      assert.equal(Object.keys(board.elements).length, 0)
      txtElementId = (await Board.elementAdd(session, board, {type: 'text',  description: 'this is the description'}))._newElementId;
      grpElementId = (await Board.elementAdd(session, board, {type: 'group', elements:[txtElementId]}))._newElementId;

    })

    it('append an element', async() => {
      extraId = (await Board.elementAdd(session, board, {type: 'text', description: 'nr 2'}))._newElementId;
      assert.isDefined(extraId, 'return create an element id');
      let b = await Board.elementChildren(session, board, grpElementId, {action: 'add', childId: extraId})
      assert.equal(b.elements[grpElementId].elements.length, 2)
      assert.equal(b.elements[grpElementId].elements[1].id, extraId)
    });
    it('add at position', async() => {
      extraId = (await Board.elementAdd(session, board, {type: 'text', description: 'nr 3'}))._newElementId;
      assert.isDefined(extraId, 'return create an element id');
      let b = await Board.elementChildren(session, board, grpElementId, {action: 'add', childId: extraId, index: 0})
      assert.equal(b.elements[grpElementId].elements.length, 3)
      assert.equal(b.elements[grpElementId].elements[0].id, extraId)
    });
    it('move', async() => {
      board = await Board.open(session, TEST_NAME);
      assert.equal(board.elements[grpElementId].elements[0].id, extraId)
      let id = board.elements[grpElementId].elements[2].id
      let b = await Board.elementChildren(session, board, grpElementId, {action: 'move', index: 0, fromIndex:2 })
      assert.equal(b.elements[grpElementId].elements.length, 3)
      assert.equal(b.elements[grpElementId].elements[0].id, id)
    })
    // ToDO: lots more testing moving things around
  })
});
