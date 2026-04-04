<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    title="拒收通知书"
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

      <el-form-item label="拒收理由">
        <el-input
          v-model="temp.note"
          class="form-item"
          placeholder="请输入拒收理由"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" @click="doTP">
        拒收退回
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'

export default {
  name: 'Bank',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      tpReasonList: [],
      temp: {
        notice: [],
        note: '',
        noticetype: '',
        status: 2

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
      this.getTpReason()
    },
    async showTp(typeid, id) {
      try {
        const t = await this.$confirm('您确定要发起退票吗？此操作不可逆！')
        console.log(t)
      } catch (e) {
        return false
      }

      this.temp.typeid = typeid
      this.temp.id = id
      this.temp.tpreason = ''
      this.showWindow = true
    },
    getTpReason() {
      caseapi.base.getTpReasonList().then((data) => {
        // console.log(data)
        this.tpReasonList = data.items
      })
    },

    // querySearch(key, callback) {
    //   caseapi.casetk.getTpReason(key).then((data) => {
    //     callback(data)
    //   })
    // },
    async doTP() {
      const tpreason =
        this.temp.tpreason2 === '-1' ? this.temp.tpreason : this.temp.tpreason2
      if (!tpreason || tpreason === '') {
        this.$message.error('退票理由不能为空')
      }
      const res = await caseapi.casetk.billTP(
        this.temp.typeid,
        this.temp.id,
        tpreason,
        this.temp.tpdate
      )
      if (res.code !== 20000) {
        this.$message.error(res.message)
      } else {
        this.$message('退票完成')
        this.$emit('dotp')
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
