<script lang="ts">
import { dialogState } from '../state/dialog-state.ts';

var root = window;

// 全局弹窗宿主：消费 dialogState 队列，并把确认/取消结果回传给调用方 Promise。
export default {
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

      // 新弹窗出现时同步默认输入值，并把焦点移动到最合适的按钮或输入框。
      this.inputValue = typeof request.defaultValue === 'undefined' ? '' : request.defaultValue;
      this.focusDialog();
    }
  },

  beforeUnmount: function() {
    // 宿主卸载时清理未完成请求，避免路由切换后残留弹窗状态。
    dialogState.clear();
  },

  methods: {
    focusDialog: function() {
      // nextTick 确保 ref 已经渲染出来，再执行 focus。
      var self = this;
      root.Vue.nextTick(function() {
        var target = self.$refs.promptInput || self.$refs.confirmButton || self.$refs.cancelButton;
        if (target && target.focus) {
          target.focus();
        }
      });
    },

    typeClass: function() {
      // type 决定弹窗视觉状态，input/prompt 使用默认样式。
      if (!this.current || !this.current.type || this.current.type === 'input') {
        return 'default';
      }
      return this.current.type;
    },

    submit: function() {
      if (!this.current) {
        return;
      }

      // prompt 需要把输入值作为确认结果，alert/confirm 只需要完成请求。
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

      // alert 没有真正的取消语义，关闭时按确认处理。
      if (this.current.kind === 'alert') {
        dialogState.confirmRequest(this.current);
      } else {
        dialogState.cancelRequest(this.current);
      }
    }
  }
};
</script>

<template>
<div v-if="current" class="b3dialog" :class="typeClass()" @keydown.esc.prevent="cancel">
  <div class="b3dialog-background" @click="cancel"></div>
  <form class="b3dialog-window" @submit.prevent="submit">
    <div class="b3dialog-mark" aria-hidden="true"></div>
    <div class="b3dialog-content">
      <h2 class="b3dialog-title">{{ current.title }}</h2>
      <p class="b3dialog-message" v-if="current.text">{{ current.text }}</p>
      <div class="b3dialog-field" v-if="isPrompt">
        <input ref="promptInput" class="b3-input" type="text" :placeholder="current.placeholder" v-model="inputValue">
      </div>
    </div>
    <div class="b3dialog-actions">
      <button v-if="showCancel" ref="cancelButton" type="button" class="b3-button b3-button-neutral" @click="cancel">{{ current.cancelButtonText }}</button>
      <button ref="confirmButton" type="submit" class="b3-button b3-button-confirm">{{ current.confirmButtonText }}</button>
    </div>
  </form>
</div>
</template>
