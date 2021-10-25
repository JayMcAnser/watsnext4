<template>
  <div>    
    <v-row justify="center">
      <v-dialog
        v-model="hasError"
        transition="dialog-bottom-transition"
        persistent
        max-width="290"       
      >      
        <v-card
        >
          <v-card-title           
            color="primary"
            class="title"
            >
            Error
          </v-card-title>
          
          <v-card-text><br/>{{ errorMessage }}</v-card-text>
          <v-card-actions>
             <v-btn
              color="green darken-1"
              text
              @click="$emit('cancel')"
            >
              {{cancelLabel}}
            </v-btn>     
            <v-spacer></v-spacer>
            <v-btn
              color="green darken-1"
              text
              @click="doAction"
            >
              {{actionLabel}}
            </v-btn>           
          </v-card-actions>
        </v-card>
      </v-dialog>
      </v-row>        
  </div>
</template>


<script>
/**
 * this page is loaded by ALL pages * 
 */
import {debug} from '../lib/logging';

export default {
  data: function() {
    return {     
    }
  },
  props: {
    actionLabel: {
      type: String,
      default: 'Retry'
    },
    cancelLabel: {
      type: String,
      default: 'Cancel'
    },
    openURL: {
      type: String,
      required: false
    },
  },
  computed: {
    hasError() {
//      console.log('status request', this.$store.getters['status/hasError'])
      return this.$store.getters['status/hasError']
    },
    errorMessage() {
      return this.$store.getters['status/errorMessage']
    }
  },
  methods: {
    async doAction() {
      if (this.openURL) {
        await this.$store.dispatch('status/clear');
        debug(`opening after error: ${this.openURL}`)
        this.$router.push(this.openURL)
      } else {
        debug(`sending "retry"`)
        this.$emit('retry', '')
      }
    }
  }
}
</script>

<style scoped>
  .title {
    background-color:tomato;
  }
</style>