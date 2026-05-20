export var KeyTable = {
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
  },

  template: '' +
    '<table class="table table-condensed keytable">' +
    '  <thead>' +
    '    <tr>' +
    '      <th colspan="3">' +
    '        <input type="button" class="btn btn-success btn-xs pull-right" value="+" @click="add()">' +
    '        <label class="control-label">{{ heading }}</label>' +
    '      </th>' +
    '    </tr>' +
    '  </thead>' +
    '  <tbody>' +
    '    <tr v-for="(item, index) in rows" :key="index">' +
    '      <td><input type="text" class="form-control" placeholder="key" :disabled="item.fixed" v-model="item.key" @input="change"></td>' +
    '      <td><input type="text" class="form-control" placeholder="value" v-model="item.value" @input="change"></td>' +
    '      <td class="text-right"><input type="button" class="btn btn-danger btn-xs" :disabled="item.fixed" @click="remove(index)" value="-"></td>' +
    '    </tr>' +
    '  </tbody>' +
    '</table>'
};
