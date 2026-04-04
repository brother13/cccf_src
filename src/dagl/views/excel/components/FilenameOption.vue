<template>
  <div style="display:inline-block;">
    <label class="radio-label" style="padding-left:0;">文件名称: </label>
    <el-input v-model="filename" placeholder="在此输入文件名称" style="width:345px;" prefix-icon="el-icon-document" />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    filename: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
