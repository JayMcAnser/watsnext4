<template>
    <header-board v-if="isAuthenticated"
       @menu="toggleRight"
    >
      WatsNext 4.0
    </header-board>

    <header-public v-if="!isAuthenticated">
     WatsNext 4.0
    </header-public>
    <!-- this make the part that will scroll: flex-1 overflow-y-auto -->
    <div class="flex-1 overflow-y-auto relative">
      <div v-if="isAuthenticated">
        <tabs
            :items="boardFilters"
            @changed="setFilter"
            :active="activeFilter"
        >
        </tabs>
      </div>

      <boards-list
          :boards="visualBoards"
          @open="openBoard"
      >
      </boards-list>

      <panel-slide>
        <ul>
          <li><router-link to="user">User</router-link></li>
          <li><a @click="logout">Logout</a></li>
        </ul>
      </panel-slide>
    </div>
    <footer
        class="bg-gray-700 text-center text-white p-5"
        v-if="isAuthenticated"
    >
      The footer
    </footer>

</template>

<script>
import HeaderBoard from "../components/header-board.vue";
import {computed, ref, onMounted, watch, reactive} from "vue";
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import {debug} from '../vendors/lib/logging';
import HeaderPublic from "../components/header-public.vue";
import PanelSlide from "../components/panel-slide.vue";
import BoardsList from "../components/boards-list.vue";
import Tabs from "../components/tabs.vue";

export default {
  /**
   * show the list of all boards
   */
  name: "boards",
  components: {Tabs, BoardsList, PanelSlide, HeaderPublic, HeaderBoard},
  setup(props, context) {
    const store = useStore();
    const isAuthenticated = computed( () => store.getters['auth/isLoggedIn'])
    const router = useRouter()
    const logout = async function() {
      await store.dispatch('status/toggleRightDrawer', false)
      try {
        await store.dispatch('auth/logout')
        await router.push('/');
        await store.dispatch('status/rightDrawer');
        activeFilter.value = 'view'
      } catch (e) {
        await store.dispatch('status/error', {title: 'Logout', message: e.message})
      }
    }
    const toggleRight = async function() {
      await store.dispatch('status/toggleRightDrawer')
    }

    // the list of boards that are visible
    const boardFilters = [
      {id: 'writable', caption: 'writable'},
      {id: 'view', caption: 'view'}
    ]
    const activeFilter = ref('view');
    const visualBoards = ref([]);
    const runFilter = function() {
      if (!isAuthenticated) {
        visualBoards.value = boards.value.filter( (b) => {
          return b.isPublic
        } )
      } else if (activeFilter.value === 'writable') {
        visualBoards.value = boards.value.filter( (b) => {
          return b.canWrite
        } )
      } else {
        visualBoards.value = boards.value.filter( (b) => b.isPublic || b.canRead)
      }
      // debug(`visual: ${visualBoards.value.length}, active: ${activeFilter.value}`)
    }
    const boards = ref([]);
    const setFilter = function(idObj) {
      activeFilter.value = idObj.id
      runFilter() ;
    }

    onMounted(async () => {
      // this one can throw an error if the refresh token did not work
      try {
        boards.value = await store.dispatch('board/list'); //  .splice(0, 0, await store.dispatch('board/list'));
      } catch (e) {
        // not tested but: try to logout on error and reload. if not working, go to root, if not working die
        try {
          await store.dispatch('auth/logout')
          boards.value = await store.dispatch('board/list'); //  .splice(0, 0, await store.dispatch('board/list'));
        } catch (e) {
          error(e, 'boards.mounted')
          try {
            await router.push('/')
          } catch (e) {

          }
          return;
        }
      }
      runFilter()
    })

    // -- events
    const openBoard = async function(id) {
      await router.push({name: 'board', params: {id}})
    }
    return {
      isAuthenticated,
      logout,
      toggleRight,

      boards,
      visualBoards,
      boardFilters,
      setFilter,
      activeFilter,
      runFilter,

      openBoard
    }
  },
  watch: {
    boards: {
      handler(val, oldVal) {
        this.runFilter()
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>
