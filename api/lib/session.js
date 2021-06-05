/**
 * basic session class
 */

const VendorSession = require('../vendors/lib/session')

const RIGHTS_READ = 1;
const RIGHTS_WRITE = 2;
const RIGHTS_DELETE = 4;
const RIGHTS_EXPORT = 8;
const RIGHTS_ADMIN = 16

class Session extends VendorSession {

  constructor(options= {}) {
    super(options)
  }

  async init(userId) {
    await super.init(userId);
    this.rights = this.user.rights
    this.isAdmin = this.rights.findIndex((x) => x.module === 'system' && x.rights & RIGHTS_ADMIN === RIGHTS_ADMIN) >= 0
  }

  /**
   * returns true if the user can read this type information
   * or the user is sysAdmin
   * @param type
   * @return {boolean}
   */
  canRead(type) {
    if (this.isAdmin) {
      return true;
    }
    let module = this.rights.filter((x) => x.module === type && x.rights & RIGHTS_READ === RIGHTS_READ);
    return module.length > 0
  }
}

module.exports = Session;
