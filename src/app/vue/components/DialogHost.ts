import { dialogState } from '../state/dialog-state.ts';

var root = window;

export var DialogHost = {
  name: 'DialogHost',

  setup: function() {
    return {
      state: dialogState.state
    };
  },

  data: function() {
    return {
      inputValue: ''
    };
  },

  computed: {
    current: function() {
      return this.state.current;
    },

    isPrompt: function() {
      return this.current && this.current.kind === 'prompt';
    },

    showCancel: function() {
      return this.current && this.current.showCancelButton;
    }
  },

  watch: {
    current: function(request) {
      if (!request) {
        this.inputValue = '';
        return;
      }

      this.inputValue = typeof request.defaultValue === 'undefined' ? '' : request.defaultValue;
      this.focusDialog();
    }
  },

  beforeUnmount: function() {
    dialogState.clear();
  },

  methods: {
    focusDialog: function() {
      var self = this;
      root.Vue.nextTick(function() {
        var target = self.$refs.promptInput || self.$refs.confirmButton || self.$refs.cancelButton;
        if (target && target.focus) {
          target.focus();
        }
      });
    },

    typeClass: function() {
      if (!this.current || !this.current.type || this.current.type === 'input') {
        return 'default';
      }
      return this.current.type;
    },

    submit: function() {
      if (!this.current) {
        return;
      }

      if (this.current.kind === 'prompt') {
        dialogState.confirmRequest(this.current, this.inputValue);
      } else {
        dialogState.confirmRequest(this.current);
      }
    },

    cancel: function() {
      if (!this.current) {
        return;
      }

      if (this.current.kind === 'alert') {
        dialogState.confirmRequest(this.current);
      } else {
        dialogState.cancelRequest(this.current);
      }
    }
  },

  template: '' +
    '<div v-if="current" class="b3dialog" :class="typeClass()" @keydown.esc.prevent="cancel">' +
    '  <div class="b3dialog-background" @click="cancel"></div>' +
    '  <form class="b3dialog-window" @submit.prevent="submit">' +
    '    <div class="b3dialog-mark" aria-hidden="true"></div>' +
    '    <div class="b3dialog-content">' +
    '      <h2 class="b3dialog-title">{{ current.title }}</h2>' +
    '      <p class="b3dialog-message" v-if="current.text">{{ current.text }}</p>' +
    '      <div class="b3dialog-field" v-if="isPrompt">' +
    '        <input ref="promptInput" class="b3-input" type="text" :placeholder="current.placeholder" v-model="inputValue">' +
    '      </div>' +
    '    </div>' +
    '    <div class="b3dialog-actions">' +
    '      <button v-if="showCancel" ref="cancelButton" type="button" class="b3-button b3-button-neutral" @click="cancel">{{ current.cancelButtonText }}</button>' +
    '      <button ref="confirmButton" type="submit" class="b3-button b3-button-confirm">{{ current.confirmButtonText }}</button>' +
    '    </div>' +
    '  </form>' +
    '</div>'
};
