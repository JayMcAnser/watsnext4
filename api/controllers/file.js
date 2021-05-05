const boardModel = require('../models/board');
const Const = require('../vendors/lib/const');
const ApiReturn = require('../vendors/lib/api-return');
const AuthController = require('../vendors/controllers/auth')
const Messages = require('../lib/const')
const Logging = require('../vendors/lib/logging')
const User = require('../vendors/models/user');

const _getSession = function(req) {
  if (!req.session) {
    console.error('missing req.session');
    req.session = {
      user: User.guest()
    }
  }
  return req.session
}

module.exports = {

  hello: function(req, res, next) {
    ApiReturn.result(req, res, {message: 'hi'});
  },

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
  /**
   * retrieve an image from the board
   *
   * boardId: string id of the requested board
   * elementId: string the id of requested element
   * index: number / string optional the element of a multi-image element
   * @returns {Promise<void>}
   */
  imageStream: async function (req, res, next) {
    try {
      let board = await boardModel.findById(_getSession(req), req.params.boardId);
      if (board) {
        let elementId = req.params.elementId
        let index = req.params.index !== undefined ? req.params.index : 0;
        let streamInfo = boardModel.getStreamInfo(_getSession(req),board, elementId, index,'image')
        res.set('Content-Type', streamInfo.mimeType);
        res.set('Content-Length',streamInfo.size);
//         res.writeHeader(200, {'Content-Type': $ );
        let stream = boardModel.getStream(_getSession(req), board, elementId, index);
        stream.on('open', function () {
          stream.pipe(res)
        })
        stream.on('error', function() {
          ApiReturn.error(req, res, e, 200)
          res.end(err)
        })
        stream.on('end', function() {
          res.end();
        })
        // ApiReturn.result(req, res, board, `[controller.file].image`)
      } else {
        ApiReturn.error(req, res, Messages.errors.boardNotFound, 200)
      }
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },
// WHICH ONE IS OK?????
//   imageStream: async function (req, res, next) {
//     try {
//       let board = await boardModel.findById(_getSession(req), req.params.boardId);
//       if (board) {
//         let elementId = req.params.elementId
//         let index = req.params.index !== undefined ? req.params.index : 0;
//         let streamInfo = boardModel.getStreamInfo(_getSession(req),board, elementId, index,'image')
//         res.set('Content-Type', streamInfo.mimeType);
//         res.set('Content-Length',streamInfo.size);
// //         res.writeHeader(200, {'Content-Type': $ );
//         let stream = boardModel.getStream(_getSession(req), board, elementId, index);
//         stream.on('open', function () {
//           stream.pipe(res)
//         })
//         stream.on('error', function() {
//           ApiReturn.error(req, res, e, 200)
//           res.end(err)
//         })
//         stream.on('end', function() {
//           res.end();
//         })
//         // ApiReturn.result(req, res, board, `[controller.file].image`)
//       } else {
//         ApiReturn.error(req, res, Messages.errors.boardNotFound, 200)
//       }
//     } catch (e) {
//       ApiReturn.error(req, res, e, 200)
//     }
//   },
  image: async function (req, res, next) {
    try {
      let board = await boardModel.findById(_getSession(req), req.params.boardId);
      if (board) {
        let elementId = req.params.elementId
        if (!elementId) {
          return ApiReturn.error(req, res, Messages.errors.elementNotFound, 200)
        }
        let index = req.params.index !== undefined ? req.params.index : 0;
        let streamInfo = boardModel.getStreamInfo(_getSession(req),board, elementId, index,'image')
        res.set('Content-Type', streamInfo.mimeType);
        res.set('Content-Length',streamInfo.size);
        res.sendFile(streamInfo.filename);
      } else {
        ApiReturn.error(req, res, Messages.errors.boardNotFound, 200)
      }
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  }
}
