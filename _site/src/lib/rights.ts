/**
 * the global rights management class
 * version 0.0.1 Jay 2021-05-31
 *
 * Every 'module' has rights:
 *    - read    (1)
 *    - write   (2)
 *    - delete  (4)
 *    - export  (8)
 *    - admin   (16
 * a module can be anything, like 'distribution', 'art', 'user'
 * the right are initialized at login time
 * rights are refreshed when user logs out
 *
 *  so we can say:
 *    if (User.canRead('contact', 'new')) ...
 *    if (User.canRead('contact')) ...
 */

// these constance should be the same in the API!
const RIGHTS_READ = 1;
const RIGHTS_WRITE = 2;
const RIGHTS_DELETE = 4;
const RIGHTS_EXPORT = 8;
const RIGHTS_ADMIN = 16

export interface RightsElement  {
  module: string,
  rights: number
}
// export interface RightsGroup extends Array<RightsElement> {}
export interface RightsType {
  key?<T>(o: T): number
}


export default class Rights {
  private rights : RightsType = {};

  /**
   * return true if the user can read the module
   * @param module String the name of the module (contact, distribution)
   */
  public canRead(module: string) {
    return this.rights[module] !== undefined && this.rights[module] & RIGHTS_READ
  }

  public init(userInfo) {
    this.rights = userInfo.rights;
    // now add the global rights => contact.new and contact.edit will become contact
    Object.keys(this.rights).forEach((key) => {
      let p : Array<string> = key.split('.');
      if (p.length > 1) {
        if (!this.rights[p[0]]) {
          this.rights[p[0]] = this.rights[key]
        } else {
          this.rights[p[0]] += this.rights[key]
        }
      } // otherwise it's p = 'contact' so no change
    })
  }

  public clear() {
    this.rights = {}
  }
}
