/**
 * the basic definition for layouts / presentations of a board
 *
 * version 0.0.1 Jay 2021-02-28
 */
import ElementText from "./element-text";
import {warn, debug} from '../vendors/lib/logging';
import {FilterEqual} from './element-filters';

class ElementLayout extends ElementText {
  protected subType: string;

  protected orderArray(arr, order) {
    if (typeof order === 'string' && arr[order] !== undefined) {
      this._children.sort((a, b) => {
        return a[order].localeCompare(b[order], undefined, {sensitivity: 'base'})
      })
    } else if (typeof order === 'string' && order.indexOf('.') >= 0) {
      // looking into an object that is part of the child record
      warn(`the order by child object (${order}) is not yet implemented`, 'layout.orderArray')
    } else if (typeof order === 'function') {
      warn(`the order by function is not yet implemented`, 'layout.orderArray')
    }
    return arr;
  }

  get image() {
    return this.element['image']
  }

  public layoutTypes() {
    return {
      items: [
        {id: 'columns', 'label': 'Manual column layout'},
        {id: 'orderGrid', 'label': 'Auto ordering columns/rows'}
      ]
    }
  }

  /**
   * retrieve a fix or relative image for the header display
   */
  get imageURL() {
    let imgId = this.image;
    if (!imgId) {
      let images = this.board.filter(new FilterEqual('type', 'image'));
      if (images.length) {
        imgId = images[Math.ceil(Math.random() * images.length)].id
      }
    }
    // debug(imgId,'layout.imageURL')
    // @ts-ignore
    let env = import.meta.env;
    return `${env.VUE_APP_API_URL}/file/image/${this.board.id}/${imgId}`;
  }

}

export default ElementLayout;
