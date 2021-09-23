/**
 * art related definitions
 */

import {Model, IModelOptions} from "./model";
import {FieldDef, FieldGroup, IFields} from "../lib/fields";


export class ArtModel extends Model {

  private groupList: IFields;

  constructor(options: IModelOptions) {
    super(Object.assign({}, options, {modelName: 'art'}));
  }

  private init() {
    this.fields = new FieldGroup()
    let generalGrp = new FieldGroup('general', 'General');
    generalGrp.fields.push(new FieldDef('title', 'Title'));
    generalGrp.triggerFields = ['title']
    result.groups.push(generalGrp);

  }

  fields(): IFields {
    let result = super.fields();


    return result;
  }
}
