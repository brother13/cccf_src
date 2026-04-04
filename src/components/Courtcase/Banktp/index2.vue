<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    title="诉讼费入库"
    :close-on-click-modal="false"
    width="50%"
  >
    <el-form
      ref="dataForm"
      :model="temp"
      label-position="left"
      label-width="80px"
      style="padding: 30px"
    >
      <el-form-item label="入库日期">
        <el-date-picker
          v-model="temp.fsdate"
          type="date"
          placeholder="入库日期"
          style="width: 100%"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>

      <el-form-item label="入库状态">
        <el-select
          v-model="temp.status"
          style="width: 100%"
          class="form-item"
        >
          <el-option
            v-for="(item, index) in statusList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" @click="dosetFsstatus">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'

const statusList = [
  { label: '入库', value: 1 },
  { label: '未入库', value: 0 }
]
export default {
  name: 'Ssfstatus',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      statusList: statusList,
      temp: {
        typeid: 0,
        id: 0,
        fsdate: '',
        status: 1
      }
    }
  },
  computed: {},
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.temp.tpdate = caseapi.base.getLogindate()
    },
    async showTp(typeid, id) {
      this.temp.typeid = typeid
      this.temp.id = id
      this.temp.status = 1
      this.temp.fsdate = caseapi.base.getLogindate()

      this.showWindow = true
    },

    // querySearch(key, callback) {
    //   caseapi.casetk.getTpReason(key).then((data) => {
    //     callback(data)
    //   })
    // },
    async dosetFsstatus() {
      if (!this.temp.fsdate || this.temp.fsdate === '') {
        this.$message.error('入库日期不能为空')
      }
      const res = await caseapi.casesk.setFsStatus(
        this.temp
      )
      if (res.code !== 20000) {
        this.$message.error(res.message)
      } else {
        this.$message('操作完成')
        this.$emit('done')
        this.showWindow = false
      }
    }
  }
}
</script>
<style>
.form-item {
  width: 100%;
}
</style>
