<template>
  <!-- 案款退款单据 批量生成 银行票据 -->
  <div v-bind="$attrs" style="display:inline;" v-on="$listeners">

    <el-dialog v-dialogDrag :visible.sync="showWindow" title="生成银行票据" width="80%">

      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="width: 90%; margin-left:50px;">

        <el-form-item label="数据预览">
          当前共选中 {{ countinfo.num }} 笔退款记录,共计金额 {{ formatNumber(countinfo.je) }} 元。预计生成 {{ countinfo.banknum }} 笔银行票据,共计金额 {{ formatNumber(countinfo.bankje) }} 元。
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="票据类型" prop="typeid">
              <el-select v-model="temp.typeid" class="form-item" @change="changeType">
                <el-option v-for="item in basedata.typebankList" :key="item.code" :label="item.label" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="起始号码" prop="billno">
              <el-input v-model="temp.billno" style="width:100%;" @change="getPreviewData" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">

            <el-form-item label="制单日期" prop="operdate">
              <el-date-picker
                v-model="temp.operdate"
                type="date"
                placeholder="制单日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                @change="getPreviewData"
              />

            </el-form-item>

          </el-col>
          <el-col :span="12">

            <el-form-item label="出票日期" prop="bankdate">
              <el-date-picker
                v-model="temp.bankdate"
                type="date"
                placeholder="入账日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                @change="getPreviewData"
              />

            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">

            <el-form-item label="收退方式" prop="accounttype">
              <el-select v-model="temp.accounttype" class="form-item">
                <el-option v-for="item in basedata.accountTypeList" :key="item.code" :label="item.label" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="temp.accounttype==2" label="支付账户" prop="accountid">
              <el-select v-model="temp.accountid" class="form-item" @change="getPreviewData">
                <el-option v-for="item in basedata.accountList" :key="item.id" :label="item.accountname" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="生成方式" prop="merge">
              <el-select v-model="temp.merge" class="form-item" @change="getPreviewData">
                <el-option v-for="item in basedata.mergeList" :key="item.code" :label="item.label" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="打印模板" prop="templateid">
              <el-select v-model="temp.templateid" class="form-item">
                <el-option v-for="item in basedata.templateList" :key="item.id" :label="item.tplname" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="备注内容" prop="notetype">
              <el-select v-model="temp.notetype" class="form-item" @change="getPreviewData">
                <el-option v-for="item in basedata.notetypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="temp.notetype==2" label="备注内容" prop="note">
              <el-input v-model="temp.note" placeholder="请填写备注信息" @change="getPreviewData" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="数据预览">
          <el-button @click="showDataPreview=!showDataPreview">{{
            !showDataPreview ? '预览单据内容' : '隐藏预览'
          }}</el-button>
        </el-form-item>
        <transition name="fade">
          <el-table
            v-show="showDataPreview"
            key="dataPreview"
            :data="previewData"
            border
            fit
            highlight-current-row
            style="width: 100%"
            height="250"
            size="mini"
          >
            <el-table-column
              type="index"
              width="80"
              align="center"
              label="序号"
            >
              <template slot-scope="{ $index }">
                {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
              </template>
            </el-table-column>

            <template v-for="field in fieldList">
              <template v-if="field.show">
                <el-table-column
                  :key="field.field"
                  :label="field.label"
                  :prop="field.field"
                  :align="field.align ? field.align : 'center'"
                  :width="field.width ? field.width : 100"
                  :sortable="field.order ? field.order : false"
                >
                  <template slot-scope="{ row }">
                    <template v-if="field.align == 'right'">
                      {{ formatNumber(row[field.field]) }}
                    </template>
                    <template
                      v-else-if="field.type && field.type == 'switch'"
                    >
                      {{ row[field.field] == 1 ? '√' : '' }}
                    </template>
                    <template v-else>
                      {{ row[field.field] }}
                    </template>
                  </template>
                </el-table-column>
              </template>
            </template>
          </el-table></transition>

      </el-form>
      <div slot="footer" class="dialog-footer">

        <el-button @click="showWindow = false">
          取消
        </el-button>
        <el-button icon="el-icon-check" :disabled="countinfo.banknum<1" @click="saveBank">
          生成票据
        </el-button>
        <el-button type="primary" icon="el-icon-printer" :disabled="countinfo.banknum<1" @click="saveBank(true)">
          生成并打印
        </el-button>
      </div>
    </el-dialog>

    <el-dialog v-dialogDrag :visible.sync="showWindowSelect" title="生成银行票据">
      <div style="text-align:center">

        <el-row :gutter="24">
          <el-col :span="8">
            <el-button type="primary" @click="toBank(frominfo.typeid,frominfo.id,301)">贷记凭证</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="toBank(frominfo.typeid,frominfo.id,302)">电汇凭证</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="toBank(frominfo.typeid,frominfo.id,303)">支票</el-button>
          </el-col>
        </el-row>

      </div>

      <div slot="footer" class="dialog-footer">

        <el-button @click="showWindowSelect = false">
          取消
        </el-button>

      </div>
    </el-dialog>

    <hiprintbatch ref="batchPrint" />

  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
import hiprintbatch from '@/components/Courtcase/hiprint/batchPrint' // 引入打印控件

// 批量生成银行票据
const accountTypeList = [
  { code: 1, label: '与单据相同' },
  { code: 2, label: '自定义' }
]
// 生成方式
const mergeList = [
  { code: 0, label: '每笔退款单独一张票据' },
  { code: 1, label: '自动合并相同当事人票据' }

]

const notetypeList = [
  { value: 0, label: '与退款备注信息相同' },
  { value: 1, label: '退款类型加案号，如退（2022）沪XXXX民初1001号代管款' },
  { value: 2, label: '自定义' }
]

const fieldList = [
  { field: 'typename', label: '票据类型', export: true, show: true },
  { field: 'billno', label: '票据号码', export: true, show: true, width: 150 },
  { field: 'operdate', label: '出票日期', export: true, show: true },
  { field: 'bankdate', label: '出票日期', export: true, show: true },
  { field: 'num', label: '笔数', export: true, show: true, width: 50 },
  { field: 'je', label: '金额', export: true, show: true, align: 'right' },
  { field: 'dwname', label: '对方单位', export: true, show: true, width: 200 },
  { field: 'bankaccount', label: '银行账号', export: true, show: true, width: 200 },
  { field: 'bankname', label: '开户行', export: true, show: true, width: 200 },
  { field: 'note', label: '摘要/附言', export: true, show: true, width: 220 },
  { field: 'accountname', label: '付款方式', export: true, show: true, width: 150 },
  { field: 'fyaccountname', label: '法院账户全称', export: true, show: true, width: 300 },
  { field: 'fybankaccount', label: '法院账号', export: true, show: true, width: 200 },
  { field: 'fybankname', label: '法院开户行', export: true, show: true, width: 200 }

]
export default {
  name: 'CasetoBank',
  components: { hiprintbatch },

  props: {

  },
  data() {
    return {
      showWindow: false,
      listQuery: {
        page: 1,
        pagesize: 999
      },
      temp: {
        id: [],
        accounttype: 1,
        accountid: 0,
        typeid: '',
        billno: '',
        merge: 0,
        bankdate: '',
        operdate: '',
        templateid: undefined,
        notetype: 1,
        note: '',
        sort: ''

      },
      temp_temp: {
        id: [],
        accounttype: 1,
        accountid: 0,
        typeid: '',
        billno: '',
        merge: 0,
        bankdate: '',
        operdate: '',
        templateid: undefined,
        notetype: 1,
        note: '',
        sort: ''

      },

      // 批量支付信息

      showWindowSelect: false,
      frominfo: {
        typeid: 0,
        id: 0
      },
      countinfo: {
        num: 0,
        je: 0,
        banknum: 0,
        bankje: 0
      },
      previewData: [], // 预览数据
      showDataPreview: false,
      fieldList: fieldList, // 预览显示的字段
      basedata: {

        accountList: [],
        typebankList: [],
        accountTypeList: [],
        mergeList: mergeList,
        templateList: [],
        notetypeList: notetypeList

      },
      rules: {
        billno: [
          { required: true, message: '单据号码信息不能为空', trigger: 'change' }
        ],
        accounttype: [
          { required: true, message: '支付方式不能为空', trigger: 'change' }
        ],
        accountid: [
          { required: true, message: '支付方式不能为空', trigger: 'change' }
        ],
        typeid: [
          { required: true, message: '银行票据种类不能为空', trigger: 'change' }
        ],
        templateid: [
          { required: true, message: '打印模板不能为空', trigger: 'change' }
        ],
        bankdate: [
          { required: true, message: '出票日期不能为空', trigger: 'change' }
        ],
        operdate: [
          { required: true, message: '制单日期不能为空', trigger: 'change' }
        ]

      }
    }
  },
  computed: {},
  // watch: {
  //   query(newval) {
  //     this.temp = newval
  //   }
  // },
  mounted() {
    // this.temp = this.query
    this.init()
  },
  methods: {

    init() {
      this.temp.operdate = caseapi.base.getLogindate()
    },
    /**
 * 传入退款数据，批量生成银行信息
 */
    batchBank(arr, sort) {
      // 重新打开时清空数据
      this.temp = Object.assign({}, this.temp_temp)
      this.getBasedata()
      this.temp.id = arr
      this.temp.sort = sort
      // 日期默认为今天
      // this.temp.bankdate = caseapi.util.getTodayDate('{yyyy}-{mm}-{dd}')
      this.temp.bankdate = caseapi.base.getLogindate()
      this.temp.operdate = caseapi.base.getLogindate()
      this.showWindow = true

      this.$nextTick(() => {
        this.changeType()
      })
    },

    // 批量获取退款数据
    getPreviewData() {
      if (this.temp.id.length < 1) {
        return
      }
      caseapi.casebank.batchBank(this.temp).then((res) => {
        // console.log('getPreviewData', res)
        this.countinfo = res.total
        this.previewData = res.data
        // const billno = res.billno
        // this.temp.billno = billno
        if (res.data.length > 0) {
          // 默认展开预览
          this.showDataPreview = true
        }
      })
    },

    getTemplateList(typeid) {
      if (!typeid) {
        return
      }
      const query = { typeid: typeid }
      caseapi.template.getList(query).then((res) => {
        console.log('getTemplist', res)
        const data = res.items

        this.basedata.templateList = data
        if (data.length) {
          this.temp.templateid = data[0].id
        } else {
          this.temp.templateid = undefined
        }
      })
    },

    async changeType() {
      const typeid = this.temp.typeid
      const accountid = await caseapi.userconfig.getDefaultAccountId(typeid)
      if (accountid) {
        this.temp.accountid = accountid
      }

      this.getPreviewData()
      this.getTemplateList(typeid)
      // 获取最新单据号
      caseapi.casebank.getNewCode(typeid).then((newcode) => {
        this.temp.billno = newcode
      })
    },
    // 保存数据
    async saveBank(print = false) {
      // 检查数据是否为空
      if (this.temp.templateid === '') {
        this.$alert('模板不能为空！', '错误')
        return false
      }
      if (this.temp.id.length < 1) {
        this.$alert('数据不能为空', '错误')
        return false
      }

      // 提交保存
      const newdata = { typeid: this.temp.typeid, data: this.previewData }

      const res = await caseapi.casebank.batchsaveBank(newdata)
      if (res.code !== 20000) {
        this.$alert(res.message, '错误')
        return false
      }

      const resalert = await this.$alert('保存完成！', '提示')

      // 开始批量打印
      this.showWindow = false
      // 延时开始打印
      if (print) {
        setTimeout(() => {
          if (print) {
            const ids = res.data
            this.$refs['batchPrint'].showPrintBatch(this.temp.typeid, ids)
          }
        }, 1000)
      }
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },
    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      caseapi.base.getBasedata(['account', 'typebank']).then((res) => {
        // this.basedata.casetypeList = res['casetype']
        // this.basedata.casetypeClassList = res['casetypeclass']
        // this.basedata.deptList = res['deptlist']
        this.basedata.accountList = res['account']
        this.basedata.typebankList = res['typebank']
        if (this.basedata.typebankList.length > 0) {
          this.temp.typeid = this.basedata.typebankList[0].code
          this.changeType()
        }
      })
      this.basedata.accountTypeList = accountTypeList

      return true
    },
    // 单独跳转至页面

    toBank(typeid, id, banktype = 0) {
      if (!banktype) {
        this.frominfo.typeid = typeid
        this.frominfo.id = id
        this.showWindowSelect = true
      } else {
        // console.log("toBank");
        this.jumpToBank(banktype, typeid, id)
      }
    },
    jumpToBank(typeid, tktypeid, id) {
      let url = ''
      switch (typeid) {
        case 301: // 贷记
          url = 'Bank-credit'
          break
        case 302: // 电汇
          url = 'bank-wire'
          break
        case 303: // 支票
          url = 'bank-cheque'
          break
      }
      const page = '/casebank/' + url
      const query = { typeid: tktypeid, tkid: id }
      this.$router.push({ path: page, query: query })
    }

  }
}
</script>

<style lang="scss" scoped>
.form-item{
  width:100%;
}
</style>
