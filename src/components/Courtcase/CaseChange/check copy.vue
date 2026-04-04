<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      title="变更案号及承办人"
      :close-on-click-modal="false"
      width="1000px"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="detail"
        label-position="right"
        label-width="100px"
        style="width: 90%; margin-left: 50px"
      >
        <el-descriptions class="margin-top" title="" :column="2" border>
          <el-descriptions-item
            v-for="(item, index) in fieldList"
            :key="index"
            :label="item.label"
          >
            {{ info[item.field] }}
          </el-descriptions-item>
        </el-descriptions>

        <el-form-item label="审批结果" prop="checkstatus">
          <el-select v-model="detail.checkstatus" style="width: 100%">
            <template>
              <el-option
                v-for="(item, index) in basedata.checkValueList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="审批意见" prop="checknote">
          <el-input
            v-model="detail.checknote"
            type="textarea"
            maxlength="50"
            :rows="3"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button type="primary" icon="el-icon-edit" @click="doSave"> 提交 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
// 手工设置款项入账的案号信息
const fieldList = [
  { field: 'statustext', label: '当前状态', width: 180, align: 'center', show: true },
  { field: 'username', label: '操作人', width: 100, align: 'center', show: true },
  { field: 'opertime', label: '申请时间', width: 160, align: 'center', show: true },
  { field: 'note', label: '变更说明', width: 120, align: 'center', show: true },
  { field: 'oldcaseinfo', label: '原案号', width: 180, align: 'center', show: true },
  { field: 'caseinfo', label: '新案号', width: 180, align: 'center', show: true },
  { field: 'olddeptname', label: '原承办部门', width: 100, align: 'center', show: true },
  { field: 'deptname', label: '新承办部门', width: 100, align: 'center', show: true },
  { field: 'oldcbr', label: '原承办人', width: 100, align: 'center', show: true },
  { field: 'cbr', label: '新承办人', width: 100, align: 'center', show: true }
]

const checkValueList = [
  { label: '审批通过', value: 1 },
  { label: '拒绝通过', value: 2 }
]
export default {
  name: 'CaseChangecheck',
  props: {},
  data() {
    return {
      showWindow: false,
      showLoglist: false,
      fieldList: fieldList,

      logList: [],
      listLoading: false,
      logLoading: false, // 正在加载日志

      dateRange: '',
      basedata: {
        deptList: [],
        userList: [],
        casetypeList: [],
        yearList: [],
        checkValueList: checkValueList
      },

      linkcase: '', // 当前选中项，默认是-1
      caseList: [], // 通过子账号关联的案号

      detail: {
        id: 0,
        checkstatus: 1,
        checknote: ''
      },
      info: {
        id: 0,
        dwid: 1,
        fydm: '',
        oldbillno: '',
        oldcaseinfo: '',
        oldcbr: '',
        olddeptname: '',
        billno: '',
        typecode: '',
        typeid: 401,
        caseinfo: '',
        deptname: '',
        cbr: '',
        reason: undefined,
        note: '',
        opertime: '',
        olddata: '',
        userid: 1,
        username: '管理员',
        checkstatus: 0,
        checker: undefined,
        checktime: undefined,
        checknote: undefined,
        revstatus: 0,
        revusername: undefined,
        revtime: undefined,
        isvoid: 0,
        createtime: '',
        updatetime: ''
      },
      info_empty: {
        id: 0,
        dwid: 1,
        fydm: '',
        oldbillno: '',
        oldcaseinfo: '',
        oldcbr: '',
        olddeptname: '',
        billno: '',
        typecode: '',
        typeid: 401,
        caseinfo: '',
        deptname: '',
        cbr: '',
        reason: undefined,
        note: '',
        opertime: '',
        olddata: '',
        userid: 1,
        username: '管理员',
        checkstatus: 0,
        checker: undefined,
        checktime: undefined,
        checknote: undefined,
        revstatus: 0,
        revusername: undefined,
        revtime: undefined,
        isvoid: 0,
        createtime: '',
        updatetime: ''
      },
      getajxxing: false,

      rules: {
        checknote: [{ required: true, message: '审批理由不能为空', trigger: 'change' }],
        checkstatus: [{ required: true, message: '审批结果不能为空', trigger: 'change' }]
      },

      // 判断是否提交变更
      canChange: false // 默认不允许，仅在无变更记录，或是最后一条变更记录为 已接收时，才允许新增变更
    }
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    async showInfo(id) {
      console.log('showInfo', id)
      const query = { id: id }
      this.resetInfo(id)
      const res = await caseapi.plugins.caselog_getinfo(query)
      console.log('showInfo,id=', id, 'res=', res)

      if (res) {
        this.info = res
      }
      this.showWindow = true
    },
    resetInfo(id) {
      console.log('resetInfo', id)
      this.detail.id = id
      this.detail.checknote = ''
      this.detail.checkstatus = 1 // 默认通过

      this.info = Object.assign({}, this.info_empty)
    },

    checkCanChange() {
      this.showLoglist = false
      this.canChange = false
      this.detail.status = ''

      const data = this.logList

      // 没有记录，则允许变更
      if (!data || data.length < 1) {
        this.canChange = true
        return false
      }

      // 如果有记录则要判断最后一条的状态，是不是已接收
      const row = data[data.length - 1]

      if (!row) {
        // 没有记录，则允许变更
        return false
      }

      if (row) {
        this.detail.statusText = row.statusText
      }

      // 如果没有记录，则不展开，如果有记录并且末条未审核，则自动展开
      if (data.length > 0 && !row.revtime) {
        this.showLoglist = true
      }

      // 被拒绝的，允许变更
      if (row.checkstatus == 2) {
        this.canChange = true
        return true
      }

      if (row.checkstatus == 1 && row.revtime && row.revusername) {
        this.canChange = true
      } else {
        this.canChange = false
      }
    },

    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      return true
    },

    async doSave() {
      const valid = await this.$refs['dataForm'].validate().catch((e) => {
        console.log('校验失败', e)
      })
      console.log('valid', valid)
      if (!valid) {
        return false
      }

      const res = await caseapi.plugins.caselog_check(this.detail).catch((e) => {
        this.$message.error('发生错误')
        console.log(e)
      })
      if (!res) {
        return false
      }

      if (res > 0) {
        this.$alert('保存成功')
        this.$emit('done', true)
        this.$nextTick(() => {
          this.showWindow = false
        })
      } else {
        this.$message.error('发生错误')
      }
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

.el-form-item__label {
  text-align: justify;
}
</style>
