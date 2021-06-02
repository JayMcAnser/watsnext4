/**
 * Board model.
 *
 * These are currently stored in files. All board are global (not user specific
 *
 * version 1.0
 *
 */
const Config = require('config');
const Fs = require('fs');
const Path = require('path');
const Helper = require('../vendors/lib/helper');
// const { v4 : uuidv4} = require('uuid');
const {generate: uuidv4} = require('short-uuid');
const validateUUID = require('uuid').validate;
const ShortUUId = require('short-uuid')()
const JsonFile = require('jsonfile');
const Const = require('../vendors/lib/const');
const AccessRights = require('../lib/const').accessRights;
const Messages = require('../lib/const');
const Logging = require('../vendors/lib/logging');
const Joi = require('joi');
const {ValidationError, StatusError} = require('../vendors/lib/model-helper');
// the one doing the api to storage conversions

const ElmHandler = require('./element-handler');


const historyActions = {
  imageAdd: 'image.add',
  imageDelete: 'image.delete',
  imageUpdate: 'image.update',
  dataUpate: 'data.update',
  elementAdd: 'element.add',
  elementUpdate: 'element.update',
  elementRemove: 'element.remove'
}

const InsertSchema = Joi.object({
  id: Joi.string().optional().allow('null', ''),
  title: Joi.string().min(1).max(100),
  name: Joi.string().optional().max(50),
  description: Joi.string().optional().allow(null, ''),
  isPublic: Joi.bool().default(false)
});

const UpdateSchema = Joi.object({
  id: Joi.string().allow(null, ''),     // is allowed but we do NOT write it
  title: Joi.string().min(1).max(100).allow(null, ''),
  name: Joi.string().optional().max(50),
  description: Joi.string().optional().allow(null, ''),
  isPublic: Joi.bool().default(false)
})

const ElementLink = Joi.object({
  id: Joi.string(),
  // extend this for other basic link versions
})


const ElementInsertSchema = Joi.object({
  id: Joi.string().optional().allow(null, ''),
  key: Joi.string().max(50),
  type: Joi.string().required(),
  subType: Joi.string().optional(),
  title: Joi.string().min(3).max(100),

  description: Joi.string().allow(null, ''),
  elements: Joi.array().items(ElementLink),

  // media files:
  // the id of the directory in the mime directory
  mediaId: Joi.string().optional(),
  // where to place the for all information as tags, labels, etc
  meta: Joi.object().optional(),
  // where to place user specific information
  data: Joi.object().optional()
})

const ElementUpdateSchema = Joi.object({
  id: Joi.string(),
  key: Joi.string().max(50),
  type: Joi.string(),
  subType: Joi.string().optional(),
  title: Joi.string().min(3).max(100),
  description: Joi.string().allow(null, ''),
  elements: Joi.array().items(ElementLink),
  meta: Joi.object().optional(),
  data: Joi.object().optional()
})

const _isGroupType = (elm) => {
  return ['group','board','column'].indexOf(elm.type) >= 0
}

const _writingLayout = (session) => {
  return session.user.debug ? session.user.debug.jsonLayout: {}
}

const READ = 1;
const WRITE = 2;
const READWRITE = 3;
const DELETE = 4;

module.exports = {
  ROOT_USER: 'f4500bab-6ce1-445c-89da-6a884e723915',
  get rootDir() {
    return Helper.getFullPath('', {rootKey:'Path.dataRoot'})
  },

  _validateSession: function(session) {
    if (session.user === undefined) {
      throw new Error(`[board] ${Const.results.missingSession}`);
    }
    return true;
  },

  _validateRights: function(session, board, rights) {
    if (!board.ownerId) {
      session.log('warn', `missing owner in board ${board.id}`)
    }
    if (session.user.id === this.ROOT_USER || session.user.id === board.ownerId) {
      return true; // owner has ALL rights
    }
    if (board.isPublic) {
      return true;
    }
    // TODO: check the assigned rights
    throw new StatusError({ message: Const.results.noRights, status: 403});
  },
  _loadBoards: function(session, all= true) {
    let dirName = Helper.getFullPath('', {  rootKey: 'Path.dataRoot'})
    let boardIds = Fs.readdirSync(dirName);
    boardIds = boardIds.filter( (dirent) => {
      return Fs.statSync(Path.join(dirName, dirent)).isDirectory()
    })

    let boards = []
    for (let index = 0; index < boardIds.length; index++) {
      try {
        let path = Path.join(dirName, boardIds[index], Config.get('Board.indexFilename'));
        if (Fs.existsSync(path)) {
          let board = JsonFile.readFileSync(path);
          if (board.ownerId === session.user.id ||
            board.isPublic ||
            session.user.id === this.ROOT_USER ||
            board.users.findIndex( (u) => u.user.id === session.user.i) >= 0) {
            // the basic fields to filter
            boards.push({
              id: boardIds[index],
              name: board.name,
              title: board.title,
              isPublic: board.isPublic,
              ownerId: board.ownerId,
              description: board.description,
            })
          }
        } else {
          Logging.log('warn', `[_loadBoards] the index for ${boardIds[index]} does not exist`)
        }
      } catch (e) {
        Logging.log('warn', `[_loadBoards] opening baord ${boardIds[index]} returns an error: ${e.message}`)
      }
    }
    return boards;
  },

  _historyAdd(session, board, action, message = false) {
    if (!board.history) { board.history = []}
    let hist = {
      date: Date.now(),
      userId: session.user.id,
      action: action
    }
    if (message) {
      hist.message = message
    }
    board.history.push(hist)
  },

  /**
   * validate the data for Editing
   *
   * @param data
   * @returns {Joi.ValidationError|boolean} false if all is well
   */
  validate: function(schema, data, ) {
    const {error, value} = schema.validate(data)
    if (error) {
      throw new ValidationError({ message: Const.results.dataNotValid, errors: error, status: 422});
    }
    return true
  },

  newId(session) {
    this._validateSession(session);
    return {id: uuidv4()}
  },

  create: async function(session, board) {
    this._validateSession(session);
    this.validate(InsertSchema, board);

    // check the name in unique
    let b = await this.findOne(session, { name: board.name})
    if (b) {
      throw new Error(`[board] ${Const.results.boardExists}`);
    }
    if (board.id) {
      try {
        if (!validateUUID(ShortUUId.toUUID(board.id))) {
          throw new StatusError('invalid id', 400, 'board.create')
        }
      } catch (e) {
        throw new StatusError('invalid id', 400, 'board.create')
      }
      if (Fs.existsSync(Helper.getFullPath(Config.get('Board.indexFilename'),{
        rootKey: 'Path.dataRoot',
        subDirectory: board.id}))) {
        throw new StatusError('board already exists', 400, 'board.create')
      }
    }

    let boardStore = {
      id: board.id ? board.id : uuidv4(), // can be created by previous newId()
      name: board.name,
      title: board.title ? board.title: board.name,
      ownerId: session.user.id,
      isPublic: !!board.isPublic,
      users: [],
      description: '',
      history: [{userId: session.user.id, date: Date.now(), type: 'created'}],
      elements: board.elements ? board.elements: {}
    }

    let filename = Helper.getFullPath(Config.get('Board.indexFilename'),{
      rootKey: 'Path.dataRoot',
      subDirectory: boardStore.id,
      makePath: true, returnPaths: true})
    let result = await JsonFile.writeFile(filename, boardStore, _writingLayout(session));
    session.log('debug', `generate board ${boardStore.id} at ${filename}`);
    //ToDo: we should register our board to in the database
    Fs.mkdirSync(Path.join(Path.dirname(filename), 'media'));
    return this._returnData(session, boardStore, ['description', 'elements'])
    // use to be only the number return boardStore.id
  },

  async findOne(session, what) {
    this._validateSession(session);
    let boards = this._loadBoards(session)
    return boards.find( (u) => {
      for (let key in what) {
        if (!what.hasOwnProperty(key)) { continue }
        if (what[key] === undefined || u[key] != what[key]) {
          return false
        }
      }
      return true;
    })
  },

  async findById(session, id) {
    this._validateSession(session);
    let filename = Helper.getFullPath(Config.get('Board.indexFilename'), { rootKey: 'Path.dataRoot', subDirectory: id, alwaysReturnPath: true})
    if (Fs.existsSync(filename)) {
      let board = JsonFile.readFileSync(filename)
      if (this._validateRights(session, board, READ)) {
        return board
      }
    }
    throw new Error(Const.results.boardNotFound);
  },
  /**
   * retrieve all boards allowed
   *
   * @param session
   * @param filter  {name | title | isPublic}
   * @returns {Promise<[]>}
   */
  async findAll(session, filter = false) {
    this._validateSession(session);

    let boards = this._loadBoards(session)
    if (filter) {
      return boards.find( (u) => {
        for (let key in whfilterat) {
          if (!filter.hasOwnProperty(key)) { continue }
          if (!filter[key] === undefined || u[key] != filter[key]) {
            return false
          }
        }
        return true;
      })
    }
    return boards.map(b => { return this._returnData(session, b)});
  },

  /**
   * one a board
   *
   * @param session
   * @param name Object | string Object is the board self (inc id and name). string: id
   * @returns {Promise<*>}
   * @private
   */
  async _read(session, name) {
    let board;
    if (typeof name === 'string') {
      board = await this.findById(session, name);
    } else {
      board = await this.findOne(session,{name:  name.name});
    }
    if (board) {
      let filename = Helper.getFullPath(Config.get('Board.indexFilename'), {
        rootKey: 'Path.dataRoot',
        subDirectory: board.id
      })
      // get all the data for this file
      if (Fs.existsSync(filename)) {
        return JsonFile.readFile(filename);
      }
    }
    throw new StatusError({message: Const.results.boardNotFound, status: 404});
  },
  /**
   * lowlevel writing a board
   *
   * @param session
   * @param board
   * @returns {Promise<*>}
   * @private
   */
  async _write(session, board) {
    this._validateRights(session, board, WRITE)
    let filename = Helper.getFullPath(Config.get('Board.indexFilename'), {
      rootKey: 'Path.dataRoot',
      subDirectory: board.id
    });
    if (Fs.existsSync(filename)) {
      return JsonFile.writeFile(filename, board, _writingLayout(session));
    }
    throw new Error(Const.results.boardNotFound)
  },

  /**
   * retrieve the standard visible data from a record
   * @param session
   * @param raw    Object the stored data
   * @param fields Array the extra fields
   * @return {{name: *, isPublic: *|boolean, description: *, id: *, title: *}}
   * @private
   */


  _returnData(session, raw, fields = []) {
    let result = {
      id: raw.id,
      title: raw.title,
      name: raw.name,
     // isPublic: raw.isPublic,
      rights: 0,
      description: raw.description
    }

    // set rights for this board
    if (raw.isPublic) {result.rights += AccessRights.public}
    if (session.user.id === raw.ownerId) {
      result.rights += AccessRights.all
    } else if (raw.users) {
      let usr = raw.users.find( (u) => u.userId === session.user.id);
      if (usr) {
        result.rights += usr.rights
      }
    }

    // copy the extra fields
    for (let index = 0; index < fields.length; index++) {
      result[fields[index]] = raw[fields[index]];
    }
    return result;
  },


  async open(session, name, fields = ['description', 'elements']) {
    this._validateSession(session);
    let raw = await this._read(session, {name: name});
    return this._returnData(session, raw, fields)
  },

  async openById(session, id, fields = ['description', 'elements']) {
    this._validateSession(session);
    let raw = await this._read(session, id);
    return this._returnData(session, raw, fields)
  },
  /**
   * saving a board is only saving the group information
   * @param session
   * @param id
   * @param board Object
   * @returns {Promise<void>}
   */
  async save(session, id, board, fields = ['elements']) {
    this._validateSession(session);
    let boardDef = await this._read(session, id)
    for (let index = 0; index < fields.length; index++) {
      boardDef[fields[index]] = board[fields[index]];
    }
    return this._write(session, boardDef)
  },

  _fieldIsWritable(fieldname) {
    return ['id'].indexOf(fieldname) < 0
  },

  async update(session, id, board, fields = ['description']) {
    this._validateSession(session);
    this.validate(UpdateSchema, board);
    let boardDef = await this._read(session, id)
    for (let fieldname in board) {
      if (this._fieldIsWritable(fieldname)) {
        boardDef[fieldname] = board[fieldname]
      }
    }
    return this._write(session, boardDef).then( () => {
      return this._returnData(session, boardDef, fields)
    })
  },
  /**
   * set the view right for a board
   * @param session
   * @param board
   * @param isPublic
   * @returns {Promise<void>}
   */
  async setPublic(session, board, isPublic) {
    this._validateSession(session);
    let boardDef = await this._read(session, board)
    boardDef.isPublic = !!isPublic
    return this._write(session, boardDef)
  },

  /**
   *
   * @param session
   * @param id
   * @returns {Promise<boolean>} True did succeed. false could not find recod
   */

  async delete(session, id) {
    this._validateSession(session);
    let board = await this.findOne(session, {id: id});
    if (board) {
      this._validateRights(session, board, DELETE)
      const Rimraf = require('rimraf');
      Rimraf.sync(Helper.getFullPath(board.id,{rootKey: 'Path.dataRoot'}));
      return true;
    } else {
      return false;
    }
  },

  async deleteByName(session, name) {
    this._validateSession(session);
    let board = await this.findOne(session, {name: name});
    if (board) {
      return this.delete(session, board.id)
    }
    return false;
  },

  _getImageRec(image) {
    return {
      id: typeof image === 'object' && image.id ? image.id : uuidv4(),
      filename: typeof image === 'object' ? image.filename : image,
      name: typeof image === 'object' ? image.name : Path.basename(image)
    }
  },

  /**
   *  add add a new image. Return
   * @param {Session} session
   * @param {Object} board
   * @param {} image
   * @return String id of image
   */
  async imageAdd(session, board, image) {
    let imageObj = this._getImageRec(image);
    let filename = Helper.getFullPath(imageObj.id, {
      rootKey: 'Path.dataRoot',
      extension: Path.extname(imageObj.filename),
      subDirectory: Path.join(board.id, 'media'),
      alwaysReturnPath: true,
      makePath: true
    })
    Fs.renameSync(imageObj.filename, filename )
    imageObj.filename = Path.basename((imageObj.filename)); // strip the path, only the name is important
    if (!board.images) {
      board.images = [imageObj];
    } else {
      board.images.push(imageObj)
    }
    this._historyAdd(session, board, historyActions.imageAdd, imageObj.id)
    return this.save(session, board, ['history', 'images']).then( () => {
      return imageObj.id
    });
  },
  /**
   *
   * @param {Session} session
   * @param {Board} board Full board or partial board
   * @param {String} imageId
   * @returns {String} the name of the file
   */
  async imageGet(session, board, imageId) {
    let boardDef = board;
    if (!boardDef.images) {
      boardDef = await this.openById(session, board.id, ['images'])
    }
    let image = boardDef.images.find( (img) => img.id === imageId);
    if (image) {
      let filename = Helper.getFullPath(image.id, {
        rootKey: 'Path.dataRoot',
        extension: Path.extname(image.filename),
        subDirectory: Path.join(boardDef.id, 'media')
      })
      if (filename && Fs.existsSync(filename)) {
        return filename
      }
    }
    let err = new Error(Const.results.imageNotFound);
    err.statusCode = 404;
    throw err;
  },
  /**
   * changes the image to an different
   * @param {} session
   * @param {*} board
   * @param {*} image
   */
  async imagePut(session, board, image) {
    throw new Error(Const.notImplemented)
  },


  _findElmentKey(elements, key) {
    for (let elm in elements) {
      if (elements[elm].key === key) {
        return true;
      }
    }
    return false;
  },
  /**
   * checks that element.key is unique or missing
   * when missing it will create a unique id
   * @param board
   * @param element
   * @private
   */
  _validateElementKey(board, element) {
    if (element.key) {
      for (let id in board.elements) {
        if (board.elements[id].key === element.key && !(element.id && id !== element.id)) {
          throw new StatusError({message: `element key ${element.key} is not unique`, status: 409});
        }
      }
    } else {
      // try finding a new key
      let index = 1;
      while (element.key === undefined) {
        if (!this._findElmentKey(board.elements, `${element.type}.${index}`)) {
          element.key = `${element.type}.${index}`;
        } else {
          index++
        }
      }
    }
    return true;
  },
  /**
   * generate a new element it
   * @param session
   * @returns {Promise<Object{id}>}
   */
  async elementId(session) {
    return {id: uuidv4()}
  },

  /**
   *  add add a new image. Return
   * @param {Session} session
   * @param {Object} board
   * @param {Object} element
   * @return Object element with the unique id
   */
  async elementAdd(session, board, element) {
    this._validateSession(session);
    ElmHandler.valid(element);
    // this.validate(ElementInsertSchema, element)
    this._validateElementKey(board, element)

    element.id = element.id || uuidv4();
    if (!board.elements) {
      board.elements = {}
    }
    element = ElmHandler.assign({}, element)
    // element.creationDate = Date.now()
    // element.modifiedDate = Date.now()
    // if (!element.meta) {
    //   element.meta = {}
    // }

    // if a group element, we must transform it
    // if (_isGroupType(element) && element.elements && element.elements.length) {
    //   let items = [];
    //   for (let index = 0; index < element.elements.length; index++) {
    //     if (typeof element.elements[index] === 'string') {
    //       if (validateUUID(element.elements[index]) && board.elements[element.elements[index]]) {
    //         items.push({id: element.elements[index]})
    //       } else {
    //         throw new StatusError({message: 'unknown element', status: 404})
    //       }
    //     } else if (typeof element.elements[index] === 'object') {
    //       let id = this.elementAdd(session, board, element.elements[index]);
    //       items.push({id})
    //     }
    //   }
    //   element.elements = items;
    // } else {
    //   delete element.elements;
    // }
    board.elements[element.id] = element
    this._historyAdd(session, board, historyActions.elementAdd, element)
    return this.save(session, board.id, board, ['history', 'elements']).then( () => {
      return Object.assign(board, {_newElementId: element.id})
    });
  },

  async elementUpdate(session, board, element) {
    this._validateSession(session);
    ElmHandler.valid(element, 'delete')
    if (!element.id || !board.elements.hasOwnProperty(element.id)) {
      throw new StatusError({message: 'element not found', status: 404})
    }
    ElmHandler.assign(board.elements[element.id], element)
    this._historyAdd(session, board, historyActions.elementUpdate, element)
    return this.save(session, board.id, board, ['history', 'elements']).then( () => {
      return board
    });
  },

  async elementRemove(session, board, elementId) {
    this._validateSession(session);
    if (!board.elements.hasOwnProperty(elementId)) {
      throw new StatusError({message: 'element not found', status: 404})
    }
    delete board.elements[elementId]
    this._historyAdd(session, board, historyActions.elementRemove, elementId)
    return this.save(session, board.id, board, ['history', 'elements']).then( () => {
      return board
    });
  },

  /**
   * appends, moves, removes the element to group Element
   * @param session
   * @param board
   * @param parentId the element id that holds the group
   * @param actionObj Object:
   *      - action: String (add, remove, move)
   *      - index: integer = target position
   *      - childId: String id of the element // most important
   *      - child: Object Element to store
   * @returns {Promise<void>}
   */
  async elementChildren(session, board, parentId, actionObj) {
    this._validateSession(session);
    if (!board.elements[parentId]) {
      throw new StatusError({message: 'group element not found', status: 404})
    }
    if (!_isGroupType(board.elements[parentId])) {
      throw new StatusError({message: 'not a group', status: 409})
    }
    let parentElement = board.elements[parentId];
    let childId =  (actionObj.childId) ? actionObj.childId : actionObj.chidld && actionObj.child.id ? actionObj.child.id : undefined

    if (childId) {
      if (!board.elements[childId]) {
        throw new StatusError({message: 'element not found', status: 404})
      }
    } else if (actionObj.child) {
      childId = (await this.elementAdd(session, board, actionObj.child)).id
    } else if (!(actionObj.action === 'move' && actionObj.fromIndex !== undefined)) {
      throw new StatusError({message: 'no element defined', status: 422})
    }
    let index = actionObj.index;

    // the entries in the element are {id: [the link], otherParams}
    switch(actionObj.action) {
      case 'add':
        if (parentElement.elements.find( (e) => e.id === childId)) {
          return false; // is already added
        }
        if (index !== undefined && index >= 0 && index < parentElement.elements.length) {
          parentElement.elements.splice(index, 0, {id: childId})
        } else {
          parentElement.elements.push({id: childId})
        }
        break;
      case 'remove':
        if (index !== undefined && index >= 0 && index < parentElement.elements.length) {
          parentElement.elements.splice(index, 1)
        } else {
          index = parentElement.elements.findIndex( (e) => e.id === childId);
          if (index >= 0) {
            parentElement.splice(index, 1)
          } else {
            throw new StatusError({message: 'element not part of group', status: 404})
          }
        }
        break;
      case 'move':
        // index is where it has to land
        if (index !== undefined && (index < 0 || index >= parentElement.elements.length)) {
          throw new StatusError({message: 'index out of range', status: 409})
        }
        index = actionObj.index
        if (index < 0) {
          throw new StatusError({message: 'element not part of group', status: 404})
        }
        let fromIndex = actionObj.fromIndex ? actionObj.fromIndex : parentElement.elements.findIndex( (e) => e.id === childId);
        if (fromIndex < 0 && fromIndex >= parentElement.elements.length) {
          throw new StatusError({message: 'could not find from position', status: 500})
        }
        parentElement.elements.splice(index, 0, parentElement.elements[fromIndex]);
        if (index > fromIndex) {
          parentElement.elements.splice(fromIndex, 1); // because we did insert
        } else if (index < fromIndex) {
          parentElement.elements.splice(fromIndex + 1, 1); // because we did insert
        }
        break;
      default:
        throw new Error(`unknown element action ${actionObj.action}`)
    }
    parentElement.modifiedDate = Date.now();
    this._historyAdd(session, board, historyActions.elementUpdate, childId)
    return this.save(session, board.id, board, ['history', 'elements']).then( () => {
      return board
    });
  },

  async elementUpload(session, board, element, storedFile) {
    try {
      Logging.log('debug', `[element.upload] stored file: ${JSON.stringify(storedFile)}`);
      element.mediaId = uuidv4();

      let newElement = await this.elementAdd(session, board, element);
      // so now we have to move the file into position
      let indexFilename = Helper.getFullPath('index.json', {
        rootKey: 'Path.dataRoot',
        subDirectory: `${board.id}/media/${element.mediaId}`,
        makePath: true
      });
      let meta = {
        filename: storedFile.originalname,
        size: storedFile.size,
        mimeType: storedFile.mimetype
      };
      JsonFile.writeFileSync(indexFilename, meta);

      let datFilename = Helper.getFullPath('index.dat', {
        rootKey: 'Path.dataRoot',
        subDirectory: `${board.id}/media/${element.mediaId}`,
        makePath: true
      });
      Fs.renameSync(storedFile.path, datFilename);
      return element;
    } catch(e) {
      console.log(e)
    }
  },

  /**
   *
   * @param session
   * @param board
   * @param elementId
   * @param index the index into the multi files
   */
  getStream(session, board, elementId, index) {
    this._validateSession(session);
    if (index) {
      Logging.warn(`[board.getStream] multi file elements are not yet supported ${index}`)
    }
    let element = board.elements[elementId];
    if (!element) {
      throw new Error(Messages.errors.elementNotFound)
    }
    let datFilename = Helper.getFullPath('index.dat', {rootKey: 'Path.dataRoot', subDirectory: `${board.id}/media/${element.mediaId}`, makePath: true});
    if (!Fs.existsSync(datFilename)) {
      throw new Error(`file does not exist`)
    }
    return Fs.createReadStream(datFilename);
  },

  getStreamInfo(session, board, elementId, index, type) {
    this._validateSession(session);
    if (index) {
      Logging.warn(`[board.getStream] multi file elements are not yet supported ${index}`)
    }
    let rootPath;
    let element = board.elements[elementId];
    if (!element ) {
      // its part of the default image system
      rootPath = Helper.getFullPath('', {rootKey: 'Path.mediaRoot', subDirectory: elementId});
    } else {
      rootPath = Helper.getFullPath('', {rootKey: 'Path.dataRoot', subDirectory: `${board.id}/media/${element.mediaId}`});
    }
    if (!Fs.existsSync(rootPath + '/index.json')) {
      Logging.logThrow(new StatusError({message: Messages.errors.indexFileNotFound, status: 404}))
    }
    let indexFile = JsonFile.readFileSync(rootPath + '/index.json');
    indexFile.filename = rootPath + '/index.dat'
    if (!Fs.existsSync(indexFile.filename)) {
      Logging.logThrow(new StatusError({message: Messages.errors.dataFileNotFound, status: 404}))
    }
    if (type) {
      if (indexFile.mimeType.substr(0, type.length) !== type) {
        throw new Error(`mimetype error. (expection ${type}, got ${indexFile.mimeType})`)
      }
    }
    return indexFile
  }
}
