
<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="w-full h-full">
    <div class="mx-auto">
      <div class="text-4xl w-full text-center p-8">WatsNext 2021</div>
    </div>
  </div>

  <TransitionRoot as="template" :show="true">
    <Dialog as="div" class="fixed z-10 inset-0 overflow-y-auto" >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-10 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div class="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                    Login
                  </DialogTitle>
                  <alert
                      title="Connecting to watsnext server:"
                      :message="errorMsg"
                      :type="alertPanelType"
                  ></alert>
                  <div class="mt-2">
                    <div class="w-full">
                      <div class="mb-3 pt-0">
                        <label class="block">
                          <span class="text-gray-700">e-mailaddress</span>
                          <input
                              v-model="email"
                              placeholder="info@li-ma.nl"
                              class="px-3 py-3 placeholder-gray-400 text-gray-600 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:ring w-full" />
                        </label>
                      </div>
                      <div class="mb-3 pt-0">
                        <label class="block">
                          <span class="text-gray-700">password</span>
                          <input v-model="password"
                                 type="password" placeholder=""
                                 class="px-3 py-3 placeholder-gray-400 text-gray-600 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:ring w-full" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      @click="loginClick" ref="openButton"
                      @blur="resetError"
              >
                Login
              </button>
              <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-gray-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      @click="requestPwdClick"
                      @blur="resetError"
              >
                Request password
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
  import { ref } from 'vue'
  import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
  import { ExclamationIcon } from '@heroicons/vue/outline'
  import Alert from "../components/alert.vue";
  import {debug, error} from "../vendors/lib/logging";
  import {useStore} from 'vuex';
 // import FormLogin from "../components/form-login.vue";

  export default {
    name: "LoginPage",
    components: {
      Alert,
    //  FormLogin,
      Dialog,
      DialogOverlay,
      DialogTitle,
      TransitionChild,
      TransitionRoot,
      ExclamationIcon,
    },
    setup() {
      const store = useStore();
      const open = ref(true);
      const email = ref('info@toxus.nl');
      const password = ref('123456')
      const errorMsg = ref('');
      const alertPanelType = ref('error')
      const requestPwdClick = () => {
        alertPanelType.value = 'warn'
        errorMsg.value = 'Requesting password is not yet implemented.<br>Ask the administrator for a new password'
      }
      const loginClick = () => {
        let vm = this;
        debug(`login attempt: ${email.value}`)
        return store.dispatch('auth/login', { username: email.value, password: password.value })
            .then((result) => {
              debug(`user ${email} did login`, 'login-page')
//              vm.$emit('login:success', result)
            })
            .catch( (err) => {
              error(err, 'login-page')
              alertPanelType.value = 'error'
              errorMsg.value = err.message
            })
      }
      const resetError = () => {
        errorMsg.value = ''
      }
      return {
        open,
        loginClick,
        requestPwdClick,
        email,
        password,
        errorMsg,
        alertPanelType,
        resetError
      }
    },
  }
</script>


<style scoped>

</style>
