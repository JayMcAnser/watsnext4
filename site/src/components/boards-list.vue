<template>
  <div
      class="transition-all duration-150 flex w-full px-0 py-2"
      v-for="board in boards" :key="board.id"
  >
    <div
        class="flex flex-col items-stretch min-h-full pb-4 mb-6 transition-all duration-150 bg-white rounded-lg shadow-lg hover:shadow-2xl"
    >
      <div class="md:flex-shrink-0">
        <img
            src="https://www.unfe.org/wp-content/uploads/2019/04/SM-placeholder-1024x512.png"
            alt="Blog Cover"
            class="object-fill w-full rounded-lg rounded-b-none h-24"
            @click="openBoard(board.id)"
        />
      </div>

      <div class="flex items-center justify-between px-4 py-2 overflow-hidden">
        <span class="text-xs font-medium text-blue-600 uppercase">

        </span>
        <div class="flex flex-row items-center">
          <div
              class="text-xs font-medium text-gray-300 flex flex-row items-center mr-2"
          >
            <span v-if="board.isOwner">owner&nbsp;</span>
            <span v-if="board.canWrite">write&nbsp;</span>
            <span v-if="board.isPublic">public&nbsp;</span>
            <span v-if="board.isShared">shared&nbsp;</span>
          </div>

          <div
              class="text-xs font-medium text-gray-500 flex flex-row items-center"
          >
          </div>
        </div>
      </div>

      <hr class="border-gray-300" />
      <div
          class="flex flex-wrap items-center flex-1 px-4 py-1 text-center mx-auto"
          @click="openBoard(board.id)"
      >
        <a href="#" class="hover:underline">
          <h2 class="text-2xl font-bold tracking-normal text-gray-800">
            {{ board.title }}
          </h2>
        </a>
      </div>
      <hr class="border-gray-300" />
      <p
          class="flex flex-row flex-wrap w-full px-4 py-2 overflow-hidden text-sm text-justify text-gray-700"
      >
        {{board.description}}
      </p>
      <hr class="border-gray-300" />
      <section class="px-4 py-2 mt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center flex-1">
            <img
                class="object-cover h-10 rounded-full"
                src="https://thumbs.dreamstime.com/b/default-avatar-photo-placeholder-profile-icon-eps-file-easy-to-edit-default-avatar-photo-placeholder-profile-icon-124557887.jpg"
                alt="Avatar"
            />
            <div class="flex flex-col mx-2">
              <a href="" class="font-semibold text-gray-700 hover:underline">
                Owner
              </a>
              <span class="mx-1 text-xs text-gray-600">updated date</span>
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-600">9 minutes read</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "boards-list",
  props: {
    boards: {
      type: Array
    }
  },
  emits: ['open'],
  setup(props, {emit}) {
    const openBoard = function(id) {
      emit('open', id)
    }


    return {
      openBoard
    }
  }
}
</script>

<style scoped>

</style>
