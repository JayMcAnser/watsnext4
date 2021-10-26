const ApiReturn = require('../vendors/lib/api-return');
const ArtQuery = require('../lib/query/query-art');
const Const = require('../lib/const')
const DbMongo = require('../lib/db-mongo');


module.exports = {
  /**
   * The general information. access for everybody logged in
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  general: async function (req, res) {
    try {
      // basic info
      let infoBlock = {
        id: req.session.user.id,
        username: req.session.user.username,
        email: req.session.user.email,
        rights: {}
      }
      // rights structure
      for (let index = 0; index < req.session.user.rights.length; index++) {
        let key = req.session.user.rights[index].module;
        let rights = req.session.user.rights[index].rights;
        let rightsArr = []
        if (Const.accessRights.canRead(rights)) { rightsArr.push('read')  }
        if (Const.accessRights.canWrite(rights)) { rightsArr.push('write')  }
        if (Const.accessRights.isOwner(rights)) { rightsArr.push('owner')  }
        if (Const.accessRights.canAccess(rights)) { rightsArr.push('acesss')  }
        if (Const.accessRights.isPublic(rights)) { rightsArr.push('public')  }
        infoBlock.rights[key] = rightsArr.join(', ')
      }
      // database
      infoBlock.mongo = {
        connectionString: DbMongo._connection.connections[0]._connectionString
      }


      return ApiReturn.result(req, res, infoBlock, 200)
    } catch (e) {
      ApiReturn.error(req, res, e, 200, 'info.get')
    }
  },
  /**
   * retrieve the information about the models the user can see.
   * show the sorting, searching and display fields
   *
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  models: async function(req, res) {
    try {
      // basic info
      let infoBlock = {
        id: req.session.user.id,
        username: req.session.user.username,
        models: {}
      }
      infoBlock.models.art = (new ArtQuery()).modelInfo()
      // // rights structure
      // for (let index = 0; index < req.session.user.rights.length; index++) {
      //   let key = req.session.user.rights[index].module;
      //   let rights = req.session.user.rights[index].rights;
      //   let rightsArr = []
      //   if (Const.accessRights.canRead(rights)) { rightsArr.push('read')  }
      //   if (Const.accessRights.canWrite(rights)) { rightsArr.push('write')  }
      //   if (Const.accessRights.isOwner(rights)) { rightsArr.push('owner')  }
      //   if (Const.accessRights.canAccess(rights)) { rightsArr.push('acesss')  }
      //   if (Const.accessRights.isPublic(rights)) { rightsArr.push('public')  }
      //   infoBlock.rights[key] = rightsArr.join(', ')
      // }
      // // database
      // infoBlock.mongo = {
      //   connectionString: DbMongo._connection.connections[0]._connectionString
      // }


      return ApiReturn.result(req, res, infoBlock, 200)
    } catch (e) {
      ApiReturn.error(req, res, e, 200, 'info.get')
    }
  }


}

