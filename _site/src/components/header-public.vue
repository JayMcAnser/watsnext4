<template>
  <header-default
      class="flex flex-row justify-between bg-black space-x-4 py-4 px-6"
  >
    <slot>
      <router-link to="/">DROPPER</router-link>
    </slot>
    <button
        v-if="!hideLogin"
        class="text-white cursor-pointer outline-none focus:outline-none"
        type="button" @click="login">
      <UserIcon class="h-5 w-5 text-grayblue-500"/>
    </button>
<!--
    <nav class="relative flex flex-wrap items-center justify-between px-2 py-3 bg-black-500 rounded">
      <div class="container px-4 mx-auto flex flex-wrap items-center justify-between">
        <div class="w-full relative flex justify-between lg:w-auto px-4 lg:static lg:block lg:justify-start">
          <router-link to="/" a class="text-sm  leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white">
            <header>
              Dropper
            </header>
          </router-link>
          <button
              v-if="!hideLogin"
              class="text-white cursor-pointer outline-none focus:outline-none"
              type="button" @click="login">
            <UserIcon class="h-5 w-5 text-grayblue-500"/>
          </button>
        </div>
      </div>
    </nav>
    -->
  </header-default>
</template>

<script>

import HeaderDefault from "./header-default.vue";
import { UserIcon } from '@heroicons/vue/solid';
import { useRouter, useRoute } from 'vue-router'

export default {
  name: "header-public",
  components: {HeaderDefault, UserIcon},
  props: {
    hideLogin: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const router = useRouter()

    const login = function() {
      router.push({name: 'login'})
    }
    return {
      login
    }
  }
}
</script>

<style scoped>

</style>
