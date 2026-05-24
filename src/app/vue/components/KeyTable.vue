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
<div class="keytable-wrap">
  <div class="keytable-header">
    <span class="keytable-title">{{ heading }}</span>
    <el-button type="success" size="small" @click="add()">+</el-button>
  </div>
  <el-table :data="rows" size="small" :show-header="false" class="keytable-table">
    <el-table-column>
      <template #default="{ row }">
        <el-input
          v-model="row.key"
          placeholder="key"
          size="small"
          :disabled="row.fixed"
          @input="change"
        />
      </template>
    </el-table-column>
    <el-table-column>
      <template #default="{ row }">
        <el-input
          v-model="row.value"
          placeholder="value"
          size="small"
          @input="change"
        />
      </template>
    </el-table-column>
    <el-table-column width="50" align="right">
      <template #default="{ $index, row }">
        <el-button
          type="danger"
          size="small"
          :disabled="row.fixed"
          @click="remove($index)"
        >-</el-button>
      </template>
    </el-table-column>
  </el-table>
</div>
</template>
