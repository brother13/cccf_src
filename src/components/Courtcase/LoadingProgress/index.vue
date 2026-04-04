<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    title="正在执行"
    :close-on-click-modal="false"
    width="50%"
    append-to-body
  >
    <el-form
      ref="dataForm"
      label-position="left"
      label-width="80px"
      style="padding: 30px"
    >
      <el-form-item label="提示">
        <div>
          {{ temp.title }}
          <template v-if="temp.total">
            【{{ temp.done }}/{{ temp.total }}】
          </template>
        </div>
      </el-form-item>

      <el-form-item label="进度">
        <el-progress :percentage="percentage" :text-inside="true" :stroke-width="26" status="success" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="danger" @click="cancel"> 取消 </el-button>
    </div>
  </el-dialog>
</template>
<script>
// import caseapi from '@/courtcase/api'

export default {
  name: 'LoadingProgress',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      temp: {
        total: 0,
        done: 0,
        title: '正在读取'
      }
    }
  },
  computed: {
    percentage() {
      if (!this.temp.total) {
        return 0
      }
      const cent = (this.temp.done / this.temp.total * 100).toFixed(2) - 0
      return cent
    }
  },
  watch: {},

  mounted() {
    // this.init()
  },
  methods: {
    cancel() {
      this.showWindow = false
      this.$emit('cancel')
    },

    showInfo(title, num, total) {
      this.temp.title = title
      this.temp.done = num
      this.temp.total = total
      if (this.temp.total && !this.showWindow) {
        this.showWindow = true
      }
    },
    close() {
      this.showWindow = false
    }
  }
}
</script>
<style>
.form-item {
  width: 100%;
}
</style>
