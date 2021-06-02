
module.exports = {
// BEGIN OF OLD CODE
  validate: function (req, res, next) {
    // we have to check for the /list and the /:id. They can be public
    if (req.method === 'GET' && !(req.headers && req.headers.authorization)) {
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
  newId: async function (req, res) {
    try {
      let boardId = await boardModel.newId(_getSession(req))
      ApiReturn.result(req, res, boardId, `[controller.board].newId`)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },
  create: async function (req, res, next) {
    try {
      let board = await boardModel.create(_getSession(req), req.body)
      ApiReturn.result(req, res, board, `[controller.board].create name: ${req.body.name}`)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },
  open: async function (req, res) {
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
  // END OF OLD

  list: async function(req, res) {

  }
 }
