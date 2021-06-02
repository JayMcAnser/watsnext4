
module.exports = {
  errors: {
    notImplemented: 'not implemented',
    userGuestIsMissing: 'no guest account',
    sessionMissing: 'there is no session',
    missingParamaters: 'missing parameters',


    onlyImages: 'Only image files are allowed',
    missingFile: 'missing file',
    boardNoFound: 'board not found',
    elementNotFound: 'element not found',
    dataFileNotFound: 'the data file does not exist',
    indexFileNotFound: 'the index file is missing',
  },
  accessRights: {
    owner: 1,         // can do anything
    read: 2,          // can read the data
    write: 4,         // can change the data
    access: 8,        // can change the access rights
    public: 16,       // is public to all

    all: 1 + 2 + 4 + 8, // all rights is owner

    isOwner: rights => (rights & 1) > 0,
    canRead: rights => (rights & 2) > 0,
    canWrite: rights => (rights & 4) > 0,
    canAccess: rights => (rights & 8) > 0,
    isPublic: rights => (rights & 16) > 0,
  },
}
