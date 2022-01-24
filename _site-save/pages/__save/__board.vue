<template>
  <header-board v-if="isAuthenticated"
                @menu="toggleRight"
  >
    <template v-slot:left>
      <router-link to="/"> &lt </router-link>
    </template>
    <template v-slot:default>
      {{ board.title }}/{{ board.id }}
    </template>
  </header-board>
  <header-public v-if="!isAuthenticated">
    <template v-slot:left>
      <router-link to="/"> &lt </router-link>
    </template>
    <template v-slot:default>
      {{ board.title }}/{{ board.id }}
    </template>
  </header-public>

  <div class="flex-1 overflow-y-auto relative">
    <board-list-layouts
        :board="board"
        v-if="!layout"
    >
    </board-list-layouts>
    <div
        v-if="!layout"
    >
      <router-link :to="{name: 'board', params:{board: board, layout:'inventory'}}">Inventory</router-link>
    </div>
    <board-layout
        :board="board"
        :layout="layout"
        v-if="layout"
    >
    </board-layout>

    <panel-slide>
      <ul>
        <li><router-link to="user">User</router-link></li>
        <li><a @click="logout">Logout</a></li>
      </ul>
    </panel-slide>
    <panel-slide-up>
      <div class="flex flex-row justify-around">
        <div @click="addElement('text')" class="h-26 w-12 p-2">
          <img v-svg-inline  src="../../assets/icons/element-text.svg"  >
        </div>
        <div @click="addElement('image')" class="h-26 w-12 p-2">
          <img v-svg-inline  src="../../assets/icons/element-image.svg"  >
        </div>
        <div @click="addElement('video')" class="h-26 w-12 p-2">
          <img v-svg-inline  src="../../assets/icons/element-video.svg"  >
        </div>
      </div>
      <div class="flex flex-row justify-around">
        <div @click="addElement('layout')" class="h-26 w-12 p-2">
          <img v-svg-inline  src="../../assets/icons/element-layout.svg"  >
        </div>
      </div>
    </panel-slide-up>
  </div>
  <footer-board
      :board="board"
      @activate="toolClick"
  >

  </footer-board>

</template>

<script>
/**
 * show the info of the board with its views
 */
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router';
import { useStore } from 'vuex';
import {debug, warn, error} from '../../vendors/lib/logging';
import PanelSlide from "../../components/panel-slide.vue";
import HeaderBoard from "../../components/header-board.vue";
import HeaderPublic from "../../components/header-public.vue";
import BoardListLayouts from "../../components/__save/board-list-layouts.vue";
import BoardLayout from "../../components/__save/board-layout.vue";
import FooterBoard from "../../components/footer-board.vue";
import PanelSlideUp from "../../components/panel-slide-up.vue";
import Board from '../../models/board'


export default {
  name: "board",
  components: {PanelSlideUp, FooterBoard, BoardLayout, BoardListLayouts, HeaderPublic, HeaderBoard, PanelSlide},
  setup(props) {
    const board = ref({});
    const layout = ref( '')
    const store = useStore()

    const isAuthenticated = computed( () => store.getters['auth/isLoggedIn'])
    const showPopup = ref(true)
    const toggleRight = async function() {
      await store.dispatch('status/toggleRightDrawer')
    }
    const logout = async function() {
      error('try to logout'); // TODO logout link
    }
    const toolClick = function(action) {
      switch (action) {
        case 'add':
            store.dispatch('status/bottomDrawer', true);
          break;
        default:
          warn(`unknown toolClick: ${action}`, 'page.board')
      }
    }
    const closeDialog = function() {
      //return
      showPopup.value = !showPopup.value
      debug('close panel')
      store.dispatch('status/bottomDrawer', false);
    }
    const addElement = function(type) {
      debug(`add element.type %${type}`, 'page.board')
    }

    onMounted( async () => {
      const store = useStore();
      const route = useRoute();

      try {
        await store.dispatch('board/activate', {id: route.params.id })
        board.value = store.getters['board/active'];
        layout.value = route.params.layout
        console.log(Board.elementTypes)
      } catch (e) {
        error(e, 'form.board.mounted')
      }
    })
    return {
      board,
      toggleRight,
      isAuthenticated,

      layout,
      toolClick,
      closeDialog,
      addElement,

      showPopup
    }
  }
}
</script>

<style scoped>

</style>
