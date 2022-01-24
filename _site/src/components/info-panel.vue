<template>
  <Card>
    <template #title>
      <Toolbar>
        <template #left>{{modelName}} - <slot name="caption"></slot></template>
        <template #right>
          <div class="info-button right" v-show="canEdit()">
            <Button
                v-show="isEditMode"
                icon="pi pi-times"
                class="p-button-warning p-mr-2"
                @click="cancel"
            />
            <Button
                :icon="isEditMode ? 'pi pi-save' : 'pi pi-pencil'"
                class="p-button-success p-mr-2"
                @click="save"
            />
          </div>
        </template>
      </Toolbar>
    </template>
    <template #content>
      <div v-show="!isEditMode">
        <div v-for="(field, index) in fields">
          <div class="label">{{field.label}}</div>
          <div class="control">{{ record[field.name]}}</div>
        </div>
      </div>
      <div v-show="isEditMode">
        The fields in edit mode
      </div>
    </template>
  </Card>

</template>

<script>
import {useStore} from "vuex";
import {debug} from "../vendors/lib/logging";
import {ref} from "vue";

export default {
  name: "info-panel",
  props: {
    record: Object,
    fields: Array,
    modelName: String
  },
  setup(props) {
    const store = useStore()
    const isEditMode = ref(false)
    const canEdit = function() {
     // debug(props)
      return props.modelName && props.modelName.length && store.getters['rights/canEdit']
    }
    const cancel = function() {
      isEditMode.value = !isEditMode.value
    }
    const save = function() {
      debug(`saving information`)
      isEditMode.value = !isEditMode.value
    }
    return {
      canEdit,
      isEditMode,
      cancel,
      save
    }
  }
}
</script>

<style scoped>

</style>
