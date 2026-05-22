<script lang="ts">
// 通用 key/value 编辑表格，用于节点属性、块属性等自由结构数据。
export default {
  name: 'KeyTable',

  props: {
    heading: {
      type: String,
      default: 'Properties'
    },
    modelValue: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },

  emits: ['update:modelValue', 'change'],

  data: function() {
    return {
      rows: []
    };
  },

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler: function(model) {
        // 将外部对象模型展开成可编辑行，避免直接修改 props。
        this.rows = [];
        model = model || {};
        Object.keys(model).forEach(function(key) {
          this.rows.push({
            key: key,
            value: model[key],
            fixed: false
          });
        }, this);
      }
    }
  },

  methods: {
    add: function(key, value, fixed) {
      // fixed 行不可删除，主要用于未来保留系统字段。
      this.rows.push({
        key: key || '',
        value: typeof value === 'undefined' ? '' : value,
        fixed: fixed === true
      });
      this.change();
    },

    remove: function(index) {
      this.rows.splice(index, 1);
      this.change();
    },

    change: function() {
      // 将可编辑行收敛回对象模型，并把数字字符串转成 number。
      var model = {};
      this.rows.forEach(function(row) {
        if (!row.key) {
          return;
        }

        var value = row.value;
        if (!isNaN(value) && value !== '') {
          value = parseFloat(value);
        }
        model[row.key] = value;
      });

      this.$emit('update:modelValue', model);
      this.$emit('change', model);
    }
  }
};
</script>

<template>
<table class="b3-data-sheet b3-data-sheet-compact keytable">
  <thead>
    <tr>
      <th colspan="3">
        <input type="button" class="b3-button b3-button-confirm b3-button-xsmall b3-float-right" value="+" @click="add()">
        <label class="b3-field-label">{{ heading }}</label>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item, index) in rows" :key="index">
      <td><input type="text" class="b3-input" placeholder="key" :disabled="item.fixed" v-model="item.key" @input="change"></td>
      <td><input type="text" class="b3-input" placeholder="value" v-model="item.value" @input="change"></td>
      <td class="b3-align-right"><input type="button" class="b3-button b3-button-danger b3-button-xsmall" :disabled="item.fixed" @click="remove(index)" value="-"></td>
    </tr>
  </tbody>
</table>
</template>
