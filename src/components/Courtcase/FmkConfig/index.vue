<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      title="罚没款导出配置"
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
            <template v-if="item.type && item.type=='select'">
              <el-select v-model="config[item.field]" class="form-item">
                <el-option v-for="(op,index) in item['data']" :key="index" :label="op.label" :value="op.value" />
              </el-select>
            </template>
            <template v-else>
              <el-input
                v-model="config[item.field]"
                class="form-item"
                :placeholder="item.label"
              />
            </template>

          </el-form-item>

        </template>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button type="primary" icon="el-icon-check" @click="saveConfig">
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
    field: 'billtype',
    label: '票据代码',
    default: ''
  },
  {
    field: 'target',
    label: '资金流向',
    default: '',
    type: 'select',
    data: [{ value: 0, label: '专户' }, { value: 1, label: '国库' }]
  },
  {
    field: 'transtype',
    label: '缴款方式',
    default: '',
    type: 'select',
    data: [{ value: 0, label: '现金' }, { value: 1, label: '转账' }]
  },
  {
    field: 'bankaccount',
    label: '缴款账号',
    default: ''
  },
  {
    field: 'bankname',
    label: '开户银行',
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
  name: 'FmkConfig',
  props: {},
  data() {
    return {
      showWindow: false,
      configfield: CONFIG_FIELD,
      configcode: 'fmkupload',
      configtype: 'export',
      config: {
        transtype: '',
        target: '',
        billtype: '',
        bankname: '',
        bankaccount: '',
        dwcode: '',
        deptcode: '',
        itemcode: '',
        chargecode: ''
      },
      basedata: {
        allconfig: []
      }
    }
  },
  computed: {},

  mounted() {
    this.getBasedata()
    this.getConfig()
  },
  methods: {
    showWin() {
      this.showWindow = true
    },
    getConfig() {
      caseapi.userconfig.getConfig(this.configtype, this.configcode).then((data) => {
        // console.log(data)
        for (const key in data) {
          this.config[key] = data[key]
        }

        // this.config = data
      })
    },
    saveConfig() {
      caseapi.userconfig.setConfig(this.configtype, this.configcode, this.config, 0).then((res) => {
        if (res.code === 20000) {
          this.$message('保存成功！')
          this.showWindow = false
        } else {
          this.$message.error(res.message)
        }
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
