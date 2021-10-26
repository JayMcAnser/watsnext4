<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="flex justify-center h-full items-center">
    <div class="text-center ">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Error</h3>
      <p class="mt-1 text-sm text-gray-500">
        The page requested could not be found
      </p>
      <div class="mt-6">
        <router-link to="/">
          <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            &gt;&gt;  Home
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { PlusIcon } from '@heroicons/vue/solid'

export default {
  components: {
    PlusIcon,
  },
}
</script>
