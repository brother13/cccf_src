<template>
  <el-input
    :value="formatValue"
    v-bind="$attrs"
    v-on="inputListeners"
  />
</template>
<script>
export default {
  name: 'MoneyInput',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number],
      default: null,
      desc: '数值'
    }
  },
  data: () => {
    return {
      formatValue: '',
      isfocus: false
    }
  },
  computed: {
    inputListeners: function() {
      var vm = this
      // `Object.assign` 将所有的对象合并为一个新对象
      return Object.assign({},
        // 我们从父级添加所有的监听器
        this.$listeners,
        // // 然后我们添加自定义监听器，
        // // 或覆写一些监听器的行为
        {
          // 这里确保组件配合 `v-model` 的工作
          input: function(event) {
            vm.formatValue = event
            // console.log(event)
            // console.log('input', event)

            vm.$emit('input', parseFloat(vm.fmoney(event).replace(/\.00/g, '').replace(/,/g, '')))
          },
          blur: function(event) {
            vm.formatValue = vm.fmoney(vm.value)
            vm.isfocus = false
            if (vm.$listeners.blur) {
              vm.$listeners.blur(event)
            }
          },
          focus: function(event) {
            const value = vm.value
            // console.log(value)
            // console.log('focus', event)
            if (!value || isNaN(value)) {
              vm.formatValue = ''
              vm.isfocus = true
              return ''
            }

            vm.formatValue = vm.value
            vm.isfocus = true
          }
        }
      )
    }
  },
  watch: {
    value(newval, oldval) {
      if (isNaN(oldval) || oldval === '' || !this.isfocus) {
        this.formatValue = this.fmoney(newval)
        // console.log('watch', oldval, newval, this.formatValue)
      }
    }
  },
  created() {
    this.formatValue = this.fmoney(this.value)
  },
  methods: {

    fmoney(s) {
      // console.log(s)
      if (s === 0 || !s) {
        return '0.00'
      } else if (s === '' || s == null || s === undefined || isNaN(s)) {
        return ''
      }
      var n = 2
      var b = parseFloat(s)
      n = n > 0 && n <= 20 ? n : 2
      if (b < 0) {
        s = (-1 * parseFloat((s + '').replace(/[^\d\.-]/g, ''))).toFixed(n) + ''
      } else {
        s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + ''
      }
      var l = s.split('.')[0].split('').reverse()
      var r = s.split('.')[1]
      var t = ''
      for (var i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? ',' : '')
      }
      if (b < 0) {
        return '-' + t.split('').reverse().join('') + '.' + r
      } else {
        return t.split('').reverse().join('') + '.' + r
      }
    }
  }
}
</script>
