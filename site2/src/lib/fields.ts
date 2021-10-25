/**
 * field information of the visual part
 *
 * version 0.1 Jay 2021-08-20
 */

import {IQueryResult, Model} from "../models/model";

export enum IFieldType  {
  Text = 'text',
  Boolean = 'boolean'
}
export interface IFieldDefinition {
  name: String,
  label: String,
  type: IFieldType
}

export interface IShowDataFunc {
  <Type>(qry: IQueryResult): Boolean
}


export interface IFieldGroup {
  name: String,
  label: String,
  fields: Array<IFieldDefinition>
  // return true if the group should be show because it has data
  showData(record: Model): Boolean
}

/**
 * the order of the fields is the order of display
 */
export interface IFields {
  // structured fields of the record
  groups: Array<IFieldGroup>
  // full list of all fields
  fields: Array<IFieldDefinition>
}

export class FieldGroup implements IFieldGroup {
  public name: String;
  public label: String;
  public fields: Array<IFieldDefinition>
  public triggerFields: Array<String>
  public showData: IShowDataFunc

  constructor(name: String, label : String | undefined) {
    this.name = name;
    this.label = label ? label : name;
    this.showData = this._showData
  }

  /**
   * set the list of fields that define we should show this on
   * @param fieldList
   */
  setShowFields(fieldList:Array<String>) {
    this.triggerFields = fieldList
  }

  /**
   * set an other function to define the empty checker
   * @param value IShowDataFunc
   */
  set showDataFunc(value : IShowDataFunc) {
    this.showData = value
  }

  private _showData(record: IQueryResult): Boolean {
    if (this.triggerFields.length === 0) {
      return true;  // empty is all fiels are defined
    }
    for (let index = 0; index < this.triggerFields.length; index++) {
      if (qry.records[this.triggerFields[index]]) {
        return true; // if one has info all have info
      }
    }
    return false;
  }
}

export class FieldDef implements IFieldDefinition {
  public name: String;
  public label: String
  public type: IFieldType;

  constructor(name: String, label: String, type: IFieldType = Text) {
    this.name = name;
    this.label = label;
    this.type = type
  }

}
