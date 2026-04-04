<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      title="诉讼费退库相关配置"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="config"
        label-position="left"
        label-width="150px"
        style="width: 600px; margin-left: 50px"
      >
        <template v-for="item in configfield">
          <el-form-item :key="item.field" :label="item.label">
            <el-input
              v-model="config[item.field]"
              class="form-item"
              :placeholder="item.label"
            />
          </el-form-item>

        </template>

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

const CONFIG_FIELD = [
  {
    field: 'pettymoney',
    label: '备用金额度（万元）',
    default: ''
  },
  {
    field: 'bankname',
    label: '本院开户行',
    default: ''
  },
  {
    field: 'bankaccount',
    label: '本院银行账号',
    default: ''
  },
  {
    field: 'finance',
    label: '财政局',
    default: ''
  },
  {
    field: 'dwcode',
    label: '组织机构代码',
    default: ''
  },
  {
    field: 'deptcode',
    label: '部门分类码',
    default: ''
  },
  {
    field: 'itemcode',
    label: '项目编码',
    default: ''
  },
  {
    field: 'chargecode',
    label: '收费标准编码',
    default: ''
  }
]
export default {
  name: 'SSFTKConfig',
  props: {},
  data() {
    return {
      showWindow: false,
      configfield: CONFIG_FIELD,
      config: {
        pettymoney: '',
        bankname: '',
        bankaccount: '',
        finance: '',
        dwcode: '',
        deptcode: '',
        itemcode: '',
        chargecode: ''
      },
      basedata: {}
    }
  },
  computed: {},

  mounted() {
    this.getBasedata()
    this.getConfig()
    this.getField()
  },
  methods: {
    showWin() {
      this.showWindow = true
    },
    getConfig() {
      caseapi.userconfig.ssftk_getConfig().then((data) => {
        this.config = data
      })
    },
    saveConfig() {
      caseapi.userconfig.ssftk_saveConfig(this.config).then((res) => {
        if (res.code === 20000) {
          this.$message('保存成功！')
          this.showWindow = false
        } else {
          this.$message.error(res.message)
        }
      })
    },
    getField() {
      caseapi.userconfig.ssftk_field().then((data) => {
        this.configfield = data
      })
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
