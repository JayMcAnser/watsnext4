

export interface KeyValue {
  key: string,
  value: string
}

export interface EditControl {
  id: string,
  label: string,
  type: string,               // text, textarea, combo, number, image
  values: Array<KeyValue>,
}
export interface ElementDefinition {
  id: string,
  caption: string,
  fields: Array<EditControl>
}

class ElementTypes {

  /**
   * list the possible type for an element
   */
  list() {
    return [
      {id: 'text', caption: 'text', fields: [
         {id: 'description', label: 'Description', type: 'text'}
      ]},
      {id: 'image', caption: 'image'}
   ]
  }
}
export default ElementTypes;
