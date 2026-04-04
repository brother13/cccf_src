<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      title="变更案号及承办人审批"
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
        <!-- 批量模式下的情况 -->
        <el-table
          :data="batchinfo.data"
          border
          fit
          highlight-current-row
          style="width: 100%"
          size="mini"
        >
          <el-table-column type="index" width="80" align="center" label="序号">
            <template slot-scope="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>

          <template v-for="field in fieldList">
            <template v-if="field.show">
              <el-table-column
                :key="field.field"
                :label="field.label"
                :prop="field.field"
                :align="field.align ? field.align : 'center'"
                :width="field.width ? field.width : 120"
                :sortable="field.order ? 'custom' : false"
              >
                <template slot-scope="{ row }">
                  <template v-if="field.align == 'right'">
                    {{ formatNumber(row[field.field]) }}
                  </template>
                  <template v-else>
                    {{ row[field.field] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </template>
        </el-table>

        <div style="min-height: 20px">&nbsp;</div>

        <el-form-item label="未发还理由" prop="reason">
          <el-select v-model="detail.reason" style="width: 100%">
            <template>
              <el-option
                v-for="(item, index) in basedata.reasonList"
                :key="index"
                :label="item.classname"
                :value="item.classname"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="具体理由" prop="note">
          <el-input
            v-model="detail.note"
            type="textarea"
            maxlength="50"
            minlength="2"
            :rows="3"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button
          type="primary"
          icon="el-icon-edit"
          :disabled="batchinfo.isDoing"
          @click="doSave"
        >
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
// 手工设置款项入账的案号信息
const fieldList = [
  { field: 'billno', label: '单据号', width: 120, align: 'center', show: true },
  { field: 'caseinfo', label: '案号', width: 180, align: 'center', show: true },
  { field: 'operdate', label: '制单日期', width: 100, align: 'center', show: true },
  { field: 'deptname', label: '承办部门', width: 100, align: 'center', show: true },
  { field: 'cbr', label: '承办人', width: 100, align: 'center', show: true },
  { field: 'ye', label: '金额', width: 100, align: 'right', show: true },
  { field: 'reason_reason', label: '当前理由', width: 100, align: 'center', show: true },
  {
    field: 'reason_note',
    label: '当前具体理由',
    width: 180,
    align: 'center',
    show: true
  },
  { field: 'reason_time', label: '填写时间', width: 160, align: 'center', show: true }
]

const checkValueList = [
  { label: '审批通过', value: 1 },
  { label: '拒绝通过', value: 2 }
]
export default {
  name: 'Casereason',
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
        reasonList: reasonList
      },

      linkcase: '', // 当前选中项，默认是-1
      caseList: [], // 通过子账号关联的案号

      isBatchMode: false, // 是否是批量模式
      batchData: [], // 批量的记录内容
      batchinfo: {
        id: [],
        data: [],
        total: 0,
        done: 0,
        isDoing: false // 正在执行
      },

      detail: {
        id: 0,
        billno: [],
        typeid: '',
        reason: '',
        note: ''
      },

      getajxxing: false,

      rules: {
        reason: [{ required: true, message: '未发还原因不能为空', trigger: 'change' }],
        note: [{ required: true, message: '具体理由不能为空', trigger: 'change' }]
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
      // console.log("showInfo", id);
      const query = { id: id }
      this.resetInfo(id)
      const res = await caseapi.plugins.caselog_getinfo(query)
      // console.log("showInfo,id=", id, "res=", res);

      this.isBatchMode = false

      if (res) {
        this.info = res
      }
      this.showWindow = true
    },
    async showBatchInfo(alldata) {
      // console.log("showInfo", id);
      // const query = { id: id };
      // this.resetInfo(id);
      // const res = await caseapi.plugins.caselog_getinfo(query);
      // console.log("showInfo,id=", id, "res=", res);

      this.isBatchMode = true
      this.getBasedata()

      const allbill = []
      for (let i = 0; i < alldata.length; i++) {
        const row = alldata[i]
        allbill.push(row.billno)
      }
      this.detail.billno = allbill
      this.batchinfo.data = alldata
      const typeid = alldata[0]['typeid'] || 101
      this.detail.typeid = typeid
      this.detail.reason = ''
      this.detail.note = ''

      // if (res) {
      //   this.info = res;
      // }
      this.showWindow = true
    },

    resetInfo(id) {
      console.log('resetInfo', id)
      this.detail.id = id
      this.detail.checknote = ''
      this.detail.checkstatus = 1 // 默认通过

      this.info = Object.assign({}, this.info_empty)
    },

    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      caseapi.base.getBasedata(['dgkreason']).then((res) => {
        this.basedata.reasonList = res['dgkreason']
      })
      return true
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },
    async doSave_batch() {
      this.batchinfo.isDoing = true

      for (let i = 0; i < this.batchinfo.id.length; i++) {
        const id = this.batchinfo.id[i]
        this.batchinfo.done = i + 1
        const param = Object.assign({}, this.detail)
        param.id = id
        const res = await caseapi.plugins.casereason_addnote(param).catch((e) => {
          this.$message.error('发生错误')
          console.log(e)
        })
        if (!res) {
          return false
        }
      }

      this.batchinfo.isDoing = false

      this.$alert('保存成功')
      this.$emit('done', true)
      this.$nextTick(() => {
        this.showWindow = false
      })
    },
    async doSave() {
      const valid = await this.$refs['dataForm'].validate().catch((e) => {
        console.log('校验失败', e)
      })

      console.log('valid', valid)
      if (!valid) {
        return false
      }

      const res = await caseapi.plugins.casereason_addnote(this.detail).catch((e) => {
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
