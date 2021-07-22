/**
 * Board access rights
 */
//
// export const AccessRights  = {
//   export const owner: number =  1;
//   export const read: number = 2;
//   export const write: number = 4;
//   export const access: number = 8;
//   export const publicAccess: number= 16;
//   export const all: number = 1 + 2 + 4 + 8;
//
//   export function isOwner(rights : number) : boolean { return (rights & 1) > 0}
//   export function canRead(rights : number) : boolean { return (rights & 2) > 0}
//   export function canWrite(rights: number) : boolean { return (rights & 4) > 0}
//   export function canAccess(rights : number) : boolean { return  (rights & 8) > 0 }
//   export function isPublic(rights: number) : boolean { return (rights & 16) > 0}
//
//
//
// }
// number of milli sec before we do a write
export const writeDelay = 500;

export const config = {
  debug: false
}
