const boardModel = require('../models/board');
const Const = require('../vendors/lib/const');
const ApiReturn = require('../vendors/lib/api-return');
const AuthController = require('../vendors/controllers/auth')
const validateUUID = require('uuid').validate;
const ShortUUId = require('short-uuid')
const Helper = require('../vendors/lib/helper');
const Multer = require('multer')
const Path = require('path');
const Message = require('../lib/const');

const Storage = Multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, Helper.getFullPath('', {rootKey: 'Path.tempDataRoot', makePath: true}))
  },
  filename: function(req, file, cb) {
    //cb(null, file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + Path.extname(file.originalname));
  }
})

const _getSession = function(req) {
  if (req.session) {
    return req.session
  }
  console.error('mission req.session');

  return {
    userId: req.session.user ? req.session.user.id : '0',
    log: req.session.log,
  }
}

module.exports = {

  validate: function(req, res, next) {
    // we have to check for the /list and the /:id. They can be public
    if (req.method === 'GET' &&  !(req.headers && req.headers.authorization)) {
      // this could be public access
      // only url === /list and url === does not contain a /
      if (req.url === '/list' || req.url.substr(1).indexOf('/') < 0) {
        console.log('possible public access')
        AuthController.setupLogging(req);
        next();
        return
      }
    }
    AuthController.validate(req, res, next)
  },
  newId: async function(req, res) {
    try {
      let boardId = await boardModel.newId(_getSession(req))
      ApiReturn.result(req, res, boardId,`[controller.board].newId` )
    } catch(e) {
      ApiReturn.error(req, res, e, 200 )
    }
  },
  create: async function(req, res, next) {
    try {
      let board = await boardModel.create(_getSession(req), req.body)
      ApiReturn.result(req, res, board,`[controller.board].create name: ${req.body.name}` )
    } catch(e) {
      ApiReturn.error(req, res, e, 200 )
    }
  },
  open: async function(req, res) {
    let LOC = 'board.controller.open';
    try {
      let board
      let id = req.params.id;
      let isUUId = false;
      try {
        isUUId = validateUUID(ShortUUId().toUUID(id));
      } catch (e) {
        try {
          isUUId = validateUUID(id);
        } catch (e) {
        }
      }
      if (isUUId) {
        board = await boardModel.openById(_getSession(req), id);
      } else {
        board = await boardModel.open(_getSession(req), id);
      }
      ApiReturn.result(req, res, board, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },


  openByName: async function(req, res) {
    let LOC = 'board.controller.open';
    try {
      let board = await boardModel.open(_getSession(req), req.params.name);
      ApiReturn.result(req, res, board, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },

  list: async function(req, res) {
    let LOC = 'board.controller.list';
    try {
      let board = await boardModel.findAll(_getSession(req));
      ApiReturn.result(req, res, board, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },


  replace: async function(req, res) {
    const LOC = 'board.controller.replace'
    try {
      let board = await boardModel.save(_getSession(req), req.params.id, req.body);
      ApiReturn.result(req, res, board, LOC)
//      res.json({status: Const.status.success, message: "board replaced", data: board});
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
//       res.json({status: Const.status.error, message: e.message, data:null});
    }
  },

  update: async function(req, res) {
    const LOC = 'board.controller.update';
    try {
      let board = await boardModel.update(_getSession(req), req.params.id, req.body);
      ApiReturn.result(req, res, board, LOC)
      // res.json({status: Const.status.success, message: "board updated", data: board});
    } catch (e) {
      ApiReturn.error(req, res, e, LOC, 200);
      // res.json({status: Const.status.error, message: e.message, data:e.errors});
    }
  },

  delete: async function(req, res) {
    const LOC = 'board.controller.delete';
    try {
      let board = await boardModel.delete(_getSession(req), req.params.id, req.body);
      ApiReturn.result(req, res, board, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC, 200);

    }
  },

  elementId: async function(req, res) {
    ApiReturn.result(req, res, await boardModel.elementId(_getSession(req)), 'controller.board.elementId')
  },

  elementAdd: async function(req, res) {
    let LOC = 'board.controller.elementAdd';
    try {
      let id = req.params.id;
      let board = await boardModel.openById(_getSession(req), id);
      let element = req.body;
      board = await boardModel.elementAdd(_getSession(req), board, element)
      ApiReturn.result(req, res, board, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },
  elementUpdate: async function(req, res) {
    let LOC = 'board.controller.elementUpdate';
    try {
      let id = req.params.id;
      let board = await boardModel.openById(_getSession(req), id);
      let element = req.body;

      if (!element.id) {
        element.id = req.params.elementId
      }
      element = await boardModel.elementUpdate(_getSession(req), board, element)
      ApiReturn.result(req, res, element, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },
  elementRemove: async function(req, res) {
    let LOC = 'board.controller.elementUpdate';
    try {
      let id = req.params.id;
      let board = await boardModel.openById(_getSession(req), id);
      board = await boardModel.elementRemove(_getSession(req), board, req.params.elementId)
      ApiReturn.result(req, res, board, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },
  elementChild: async function (req, res) {
    let LOC = 'board.controller.elementUpdate';
    try {
      let id = req.params.id;
      let board = await boardModel.openById(_getSession(req), id);
      let elementId = eq.params.elementId
      let data = await boardModel.elementRemove(_getSession(req), board, req.params.elementId)
      ApiReturn.result(req, res, data, LOC)
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  },

  // ---------------------------------------------
  elementUpload: async function(req, res) {
    let LOC = 'board.controller.elementUpload';
    try {
      let id = req.params.id;
      let board = await boardModel.openById(_getSession(req), id);
      // image is the name of the element
      let upload = Multer({storage: Storage}).single('image')
      upload(req, res, async function(err) {
        if (req.fileValidationError) {
          ApiReturn.error(req, res, new Error(req.fileValidationError), LOC)
        } else if (!req.file) {
          ApiReturn.error(req, res, new Error(Message.errors.missingFile), LOC)
        } else if (err) {
          ApiReturn.error(req, res, err, LOC);
        } else {
          let element = req.body
          let data = await boardModel.elementUpload(_getSession(req), board, element, req.file)
          ApiReturn.result(req, res, data, LOC)
        }
      })
    } catch (e) {
      ApiReturn.error(req, res, e, LOC)
    }
  }
}
