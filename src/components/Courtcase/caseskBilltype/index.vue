<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-button type="success" icon="el-icon-setting" class="filter-item" @click="showWin">单据设置</el-button>
    <el-dialog v-dialogDrag :visible.sync="showWindow" title="单据设置" :close-on-click-modal="false">
      <el-form ref="dataForm" label-position="left" label-width="150px" style="width: 600px; margin-left: 50px">
        <el-form-item label="单据递增方式">
          <el-select v-model="billtype" style="width:100%;" placeholder="请选择单据号递增方式" @change="getNewbill">
            <el-option
              v-for="(item, index) in billTypeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下一张单据号">
          <span>{{ newbill }}</span>
        </el-form-item>

        <el-form-item label="是否允许缴款通知书">
          <el-select v-model="casesk_onlykptz" style="width:100%;" placeholder="是否允许缴款通知书">
            <el-option
              v-for="(item, index) in noticeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button type="primary" icon="el-icon-save" @click="saveConfig">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
const billTypeList = [
  { label: '新增票据号在本机上递增', value: 'local' },
  { label: '新增票据号和其他人共用', value: 'fromall' }
]
const noticeList = [
  { label: '允许缴款通知书', value: false },
  { label: '禁止缴款通知书，仅支持开票通知书', value: true }

]
export default {
  name: 'SSFTKConfig',
  props: {
    typeid: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showWindow: false,
      billTypeList: billTypeList,
      billtype: 'local',
      casesk_onlykptz: true,
      key: '',
      newbill: '',

      noticeList: noticeList,

      basedata: {},
      key_caseskconfig: 'caseskconfig'

    }
  },
  computed: {},

  mounted() {
    // this.getBasedata()
    // this.getConfig()
    // this.getField()
  },
  methods: {
    showWin() {
      this.showWindow = true
      this.$nextTick(() => {
        this.getConfig()
        this.getNewbill()
      })
    },
    getConfig() {
      this.key = 'billno_typefrom_' + this.typeid
      const config = caseapi.store.get(this.key)
      if (config) {
        this.billtype = config
      } else {
        this.billtype = 'local'
      }

      // 获取是否仅允许开票通知书的配置

      caseapi.userconfig.getConfig('config', this.key_caseskconfig).then((res) => {
        console.log('getConfig,res=', res)

        const config = res.casesk_onlykptz || false
        this.casesk_onlykptz = config
      })
    },
    saveConfig() {
      this.key = 'billno_typefrom_' + this.typeid
      caseapi.store.set(this.key, this.billtype)
      // 保存配置

      caseapi.userconfig.setConfig('config', this.key_caseskconfig, { casesk_onlykptz: this.casesk_onlykptz }).then((res) => {
        console.log('保存成功', res)
      })
      this.$alert('保存成功')
      this.$nextTick(() => {
        this.showWindow = false
      })
    },
    async getNewbill() {
      this.key = 'billno_typefrom_' + this.typeid
      caseapi.store.set(this.key, this.billtype)
      this.newbill = await caseapi.casesk.getNewCode(this.typeid)
    },
    getField() {
      // caseapi.userconfig.ssftk_field().then((data) => {
      //   this.configfield = data
      // })
    },

    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  width: 100%;
}

.form-label {
  font-weight: bold;
  padding: 10px;
}
</style>
