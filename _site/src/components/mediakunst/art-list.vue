<template>
  <div>component.mediakunst.art.list
    <DataTable
        :value="data"
        stripedRows
        :paginator="true" :rows="10"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
    >
      <Column
          v-for="col of fields"
          :field="col.name"
          :header="col.caption"
          :key="col.name"
          :sortable="col.sortable"
      >
      </Column>
      <Column
          header="action"
      >
        <template #body="slotProps">
          <div @click="view(slotProps.data._id)">View</div>
        </template>

      </Column>
    </DataTable>
  </div>
</template>

<script>

import {useRouter} from "vue-router";
import {ref} from "vue";

export default {
  name: "art-list",
  setup({props}) {
    let router = useRouter();
    const layout = ref('');
    const fields = ref([
      { name: '_id', caption: 'ID', sortable: false},
      { name: 'title', caption: 'Title', sortable: true},
      { name: 'artist', caption: 'Artist', sortable: true},
      { name: 'year', caption: 'Year', sortable: true}
    ])
    // const view  = (id) => {
    //   router.push({path:  `/art/show/${id}`})
    //   console.log(`open ${id}`)
    // }
    return {
      layout,
//      view,
      fields
    }
  }
}
</script>

<style scoped>

</style>
