/**
 * art related definitions
 */

import {Model, IModelOptions, ISortDefinition} from "./model";
import {FieldDef, FieldGroup, IFields} from "../lib/fields";

const SortDefinitions : Array<ISortDefinition> = [
  {label: 'Title', key: 'title'}
]

export class ArtModel extends Model {


  constructor(options: IModelOptions) {
    super(
      Object.assign({}, {sortDefinitions: SortDefinitions}, options, {modelName: 'art'})
    );
  }

  private init() {
    this.fields = new FieldGroup()
    let generalGrp = new FieldGroup('general', 'General');
    generalGrp.fields.push(new FieldDef('title', 'Title'));
    generalGrp.triggerFields = ['title']
    //result.groups.push(generalGrp);

  }

  fields(): IFields {
    let result = super.fields();

    return result;
  }
}
