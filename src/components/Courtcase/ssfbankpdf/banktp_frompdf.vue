<template>
  <el-dialog
    v-dialogDrag
    v-loading="loading"
    title="绑定退票"
    :visible.sync="showWindow"
    :close-on-click-modal="false"
    width="90%"
  >
    <el-row :gutter="20">

      <el-col :span="12">
        <iframe ref="pdfiframe" class="pdfiframe" src="about:blank" />
      </el-col>

      <el-col :span="12">

        <div>

          <el-tabs v-model="tabCode" type="card" @tab-click="handleTabClick">
            <el-tab-pane label="明细记录" name="tklist">

              <div class="filter-container">
                <span class="form-input">退票状态：</span>
                <el-select v-model="listQuery.tpstatus" style="width:200px;" @change="handleFilter">
                  <el-option
                    v-for="(item, index) in basedata.tpstatusList"
                    :key="index"
                    :value="item.value"
                    :label="item.label"
                  />
                </el-select>
                <template v-if="canShowMerge"><span class="form-input">是否合并：</span>
                  <el-select v-model="listQuery.ismerge" style="width:200px;" @change="handleFilter">
                    <el-option
                      v-for="(item, index) in basedata.ismergeList"
                      :key="index"
                      :value="item.value"
                      :label="item.label"
                    />
                  </el-select></template>
              </div>
              <div v-show="checkedInfo.num">
                当前回单金额<el-tag>{{ formatNumber(detail.je) }}</el-tag>元。目前已选中<el-tag>{{ checkedInfo.num
                }}</el-tag>笔，共计<el-tag>{{
                  formatNumber(checkedInfo.je) }}</el-tag>元。
                <el-button
                  type="primary"
                  size="mini"
                  :disabled="detail.je != checkedInfo.je"
                  @click="bindCasetkTp_batch"
                >合并退票</el-button>
              </div>
              <el-table
                key="ssftemp"
                v-loading="listLoading"
                :data="tableData"
                border
                fit
                highlight-current-row
                style="width: 100%"
                height="250"
                size="mini"
                @selection-change="changeCheck"
              >
                <el-table-column v-if="listQuery.ismerge" type="selection" label="选择" :selectable="checkSelectable" />
                <el-table-column type="index" width="80" align="center" label="序号">
                  <template slot-scope="{ $index }">
                    {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
                  </template>
                </el-table-column>
                <el-table-column width="100" align="center" label="操作">
                  <template slot-scope="{ row }">
                    <el-button-group v-if="!listQuery.ismerge">
                      <el-button size="mini" type="warning" @click="bindCasetkTp(row)">绑定</el-button>
                    </el-button-group>
                  </template>
                </el-table-column>

                <template v-for="field in fieldList">
                  <template v-if="field.show">
                    <el-table-column
                      v-if="!field.tpstatus || field.tpstatus == (listQuery.tpstatus + 1)"
                      :key="field.field"
                      :label="field.label"
                      :prop="field.field"
                      :align="field.align ? field.align : 'center'"
                      :width="field.width ? field.width : 120"
                      :sortable="field.order ? field.order : false"
                    >
                      <template slot-scope="{ row }">
                        <template v-if="field.align == 'right'">
                          {{ formatNumber(row[field.field]) }}
                        </template>
                        <template v-else-if="field.type && field.type == 'switch'">
                          {{ row[field.field] == 1 ? '√' : '' }}
                        </template>
                        <template v-else>
                          {{ row[field.field] }}
                        </template>
                      </template>
                    </el-table-column>
                  </template>
                </template>
              </el-table>
            </el-tab-pane>
            <el-tab-pane v-if="tpdetail.id" label="其它信息" name="tkform">
              <el-form
                ref="dataForm"
                :model="tpdetail"
                label-position="right"
                label-width="100px"
                style="width: 80%; margin-left: 50px; margin-top: 50px"
              >

                <el-form-item label="绑定类型" prop="bindtype">
                  <template v-for="(item, index) in basedata.tpstatusList">
                    <span v-if="item.value == listQuery.tpstatus">{{ item.label }}</span>
                  </template>
                </el-form-item>
                <el-form-item label="回单编号" prop="banklsh">
                  <span>{{ tpdetail.bankbillno }}</span>
                </el-form-item>
                <el-form-item label="单据信息" prop="id">
                  <span>单据主键：{{ tpdetail.id }}，原单据号：{{ tpdetail.frombill }}</span>
                </el-form-item>
                <el-form-item label="案号" prop="caseinfo">
                  <span>{{ tpdetail.caseinfo }}</span>
                </el-form-item>
                <el-form-item label="退票日期" prop="tpdate">
                  <el-date-picker
                    v-model="tpdetail.tpdate"
                    type="date"
                    placeholder="退票日期"
                    style="width: 100%"
                    value-format="yyyy-MM-dd"
                    :disabled="tpdetail.tpstatus==1"
                  />
                </el-form-item>

                <el-form-item label="退票理由" prop="tpreason">
                  <el-input
                    v-model="tpdetail.tpreason"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    type="textarea"
                    placeholder="退票理由"
                    :disabled="tpdetail.tpstatus==1"
                  />
                </el-form-item>
                <el-form-item label="操作">
                  <el-button @click="showWindow = false"> 取消 </el-button>
                  <el-button type="danger" icon="el-icon-edit" @click="doTP">
                    绑定退票
                  </el-button>
                </el-form-item>

              </el-form>
            </el-tab-pane>
          </el-tabs>

        </div>

      </el-col>
    </el-row>

  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'
import { mapGetters } from 'vuex'
const PAGECONOFIG = {
  typename: '银行流水记录',
  typeid: 310
}

const tpstatusList = [
  { label: '未退票', value: 0 },
  { label: '已退票单据', value: 1 }
]
const ismergeList = [
  { label: '回单退票一对一', value: 0 },
  { label: '合并退票', value: 1 }
]

const fieldList = [
  {
    field: 'tpstatus_text',
    label: '退票状态',
    export: true,
    show: true,
    order: false,
    width: 100
  },
  {
    field: 'frombill',
    label: '原收据号',
    export: true,
    show: true,
    order: false,
    width: 150
  },
  {
    field: 'je',
    label: '金额',
    export: true,
    show: true,
    order: false,
    align: 'right',
    width: 100
  },
  {
    field: 'operdate',
    label: '退款日期',
    export: true,
    show: true,
    order: false,
    width: 120
  },
  {
    field: 'tpdate',
    label: '退票日期',
    export: true,
    show: true,
    order: false,
    width: 120,
    tpstatus: 2
  },
  {
    field: 'tpreason',
    label: '退票理由',
    export: true,
    show: true,
    order: false,
    width: 120,
    tpstatus: 2
  },
  {
    field: 'caseinfo',
    label: '案号',
    export: true,
    show: true,
    order: false,
    width: 180
  },
  {
    field: 'dwname',
    label: '单位名称',
    export: true,
    show: true,
    order: false,
    width: 180
  },
  {
    field: 'bankaccount',
    label: '银行账号',
    export: true,
    show: true,
    order: false,
    width: 180
  },
  {
    field: 'bankname',
    label: '开户行',
    export: true,
    show: true,
    order: false,
    width: 180
  }

]

const AUTH_CAN_SHOW_MERGETP = 'TOOL_SSF_BANKTP_MERGE'

export default {
  name: 'SsfbankpdfForm',
  components: {},
  inheritAttrs: false,

  props: {

  },
  computed: {
    ...mapGetters(['roles']),
    canShowMerge: function() {
      const b = this.roles.includes(AUTH_CAN_SHOW_MERGETP)
      return b
    }
  },
  data: () => {
    return {
      loading: false,
      showWindow: false,
      fieldList: fieldList,
      listLoading: false,

      tabCode: 'tklist', // 默认显示明细记录
      tpdetail: {
        id: 0,
        tpdate: '',
        tpreason: '',
        bankbillno: '',
        caseinfo: '',
        frombill: '',
        tpstatus: 0, // 是否已退票
        ismerge: false
      },
      // 已勾选的状态
      checkedInfo: {
        id: [],
        detail: [],
        num: 0,
        je: 0
      },
      tableData: [],

      listQuery: {
        page: 1,
        pagesize: 10,
        total: 0,
        tpstatus: 0, // 0:未退票 1:已退票
        // 是否是合并支付
        ismerge: 0, // 默认不合并支付
        dwname: '',
        bankaccount: '',
        bankname: '',
        je: 0,
        bankdate: ''

      },

      detail: {
        id: 0,
        dwid: '',
        typeid: PAGECONOFIG.typeid,
        billno: '',
        banklsh: '',
        frombill: '',
        banktype: '',
        operdate: '',
        je: 0,
        dwname: '',
        bankname: '',
        bankaccount: '',
        note: '',
        userid: '',
        username: '',
        createtime: '',
        updatetime: ''

      },
      detail_temp: {
        id: 0,
        dwid: '',
        typeid: PAGECONOFIG.typeid,
        billno: '',
        banklsh: '',
        frombill: '',
        banktype: '',
        operdate: '',
        je: 0,
        dwname: '',
        bankname: '',
        bankaccount: '',
        note: '',
        userid: '',
        username: '',
        createtime: '',
        updatetime: ''

      },
      basedata: {
        banktypeList: [],
        tpstatusList: tpstatusList,
        ismergeList: ismergeList
      },

      rules: {
        billno: [
          { required: true, message: '单据号不能为空', trigger: 'change' }
        ],
        operdate: [
          { required: true, message: '制单日期不能为空', trigger: 'change' }
        ],
        banktype: [
          {
            required: true,
            message: '款项类型不能为空',
            trigger: 'change'
          }
        ],
        dwname: [
          { required: true, message: '类型不能为空', trigger: 'change' }
        ],
        je: [{ required: true, message: '金额不能为空', trigger: 'change' }]
      }

    }
  },
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getBasedata()
    },

    getBasedata() {
      caseapi.bankpdf.banktype_getList().then((res) => {
        this.basedata.banktypeList = res
      })
    },

    async showInfo(data) {
      // 默认不合并，未退票
      this.resetTpInfo()
      this.listQuery.tpstatus = 0
      this.listQuery.ismerge = 0

      const fydm = data.fydm
      const bankbillno = data.bankbillno
      const query = {
        fydm: fydm,
        bankbillno: bankbillno,
        getfile: true
      }
      const info = await caseapi.bankpdf.getBankpdf(query)
      this.resetTemp(info)

      const pdfdata = info.pdfdata

      const pdf = caseapi.util.pdf_base64_to_byte(pdfdata)
      const url = caseapi.util.pdf_getObjectURL(pdf)
      this.showPdf(url)
      // 查询记录
      this.resetQuery()
      this.handleFilter()
    },
    resetTemp(info) {
      this.detail = Object.assign({}, this.detail_temp)

      if (info) {
        this.detail.note = info.remark
        this.detail.bankdate = info.transtime
        this.detail.je = info.je
        this.detail.dwname = info.tk_dwname
        this.detail.bankaccount = info.tk_bankaccount
        this.detail.bankname = info.tk_bankname
      }
      this.detail.operdate = caseapi.base.getLogindate()
      this.detail.banklsh = info.bankbillno
      this.loading = false

      // 智能判断款项类型

      for (let i = 0; i < this.basedata.banktypeList.length; i++) {
        const row = this.basedata.banktypeList[i]
        if (row.note && row.note.indexOf(info.note) >= 0) {
          this.detail.banktype = row.itemname
          break
        }
        if (row.keyword) {
          const allkey = row.keyword.split(',')
          for (let j = 0; j < allkey.length; j++) {
            const key = allkey[j]
            if (info.remark.indexOf(key) >= 0) {
              this.detail.banktype = row.itemname
              break
            }
          }
        }
      }

      // this.getNewCode();
      // @todo 智能判断款项类型
    },
    async saveData() {
      this.loading = true

      const res = await caseapi.bankpdf.ssfother_save(this.detail).catch((e) => {
        this.$message.error('发生错误：' + e.message)
      })

      this.$nextTick(() => {
        this.loading = true
        this.$message.success('保存成功')
        this.showWindow = false
        this.$emit('done')
      })
    },
    async showPdf(url) {
      this.showWindow = true
      this.$nextTick(() => {
        this.$refs['pdfiframe'].src = url
      })
    },

    getBigNumber(str) {
      if (str) {
        return '大写金额：' + caseapi.util.cashToChinese(str)
      } else {
        return ''
      }
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },
    getNewCode() {
      caseapi.casebank.getNewCode(this.detail.typeid).then((data) => {
        this.detail.billno = data
      })
    },

    bindCasetkTp(row) {
      // 弹出提示框并确定是否需要绑定

      console.log('this.detail', this.detail)
      const tpstatus = row.tpstatus

      this.tpdetail.ismerge = false // 不合并
      this.tpdetail.frombill = row.frombill
      this.tpdetail.caseinfo = row.caseinfo
      this.tpdetail.tpreason = '' // 先设成空的。取当前信息
      this.tpdetail.tpstatus = tpstatus
      this.tpdetail.id = row.id
      this.tpdetail.bankbillno = this.detail.banklsh
      this.tpdetail.tpdate = this.detail.bankdate // 取当前登录日期，或单据日期
      if (tpstatus == 1) {
        this.tpdetail.tpreason = row.tpreason
        this.tpdetail.tpdate = row.tpdate
      } else {
        this.tpdetail.tpreason = this.detail.note
      }
      // 切换标签页
      this.tabCode = 'tkform'
    },
    // 批量绑定
    bindCasetkTp_batch() {
      if (this.checkedInfo.detail.length < 1) {
        this.$alert('请先选择记录')
        return false
      }
      if (this.checkedInfo.je != this.detail.je) {
        this.$alert('金额不一致，无法发起合并退票！')
        return false
      }

      const tpstatus = this.listQuery.tpstatus
      const frombill = []

      const caseinfo = []
      for (let i = 0; i < this.checkedInfo.detail.length; i++) {
        const row = this.checkedInfo.detail[i]
        const _bill = row.frombill
        const _caseinfo = row.caseinfo
        if (frombill.indexOf(_bill) == -1) {
          frombill.push(_bill)
        }
        if (caseinfo.indexOf(_caseinfo) == -1) {
          caseinfo.push(_caseinfo)
        }
      }
      this.tpdetail.frombill = this.getStringFromArray(frombill)
      this.tpdetail.caseinfo = this.getStringFromArray(caseinfo)

      this.tpdetail.ismerge = true // 合并
      // this.tpdetail.frombill = row.frombill;
      // this.tpdetail.caseinfo = row.caseinfo;
      this.tpdetail.tpreason = '' // 先设成空的。取当前信息
      this.tpdetail.tpstatus = tpstatus
      this.tpdetail.id = this.getStringFromArray(this.checkedInfo.id)
      this.tpdetail.bankbillno = this.detail.banklsh
      this.tpdetail.tpdate = this.detail.bankdate // 取当前登录日期，或单据日期
      const row = this.checkedInfo.detail[0] // 取第一行
      if (tpstatus == 1) {
        this.tpdetail.tpreason = row.tpreason
        this.tpdetail.tpdate = row.tpdate
      }
      // 切换标签页
      this.tabCode = 'tkform'
    },
    /**
     *
     * @param arr 数组
     * @param len 数量，默认3
     * @param spliter 分割符，默认、
     */
    getStringFromArray(arr, len = 3, spliter = '、') {
      let str = ''
      if (arr && arr.length >= len) {
        const temp = []
        for (let i = 0; i < len; i++) {
          temp.push(arr[i])
        }
        str = temp.join(spliter)
        str += '等' + arr.length + '个'
      } else {
        str = arr.join(spliter)
      }
      return str
    },
    handleTabClick(tab, event) {

      // 标签被点击

    },

    // 绑定退票信息
    async doTP() {
      if (this.tpdetail.tpstatus == 0 && !this.tpdetail.tpreason) {
        this.$alert('退票理由不能为空！')
        return false
      }
      let text = ''
      if (this.tpdetail.tpstatus == 0) {
        text += '当前退款还没有登记过退票，此操作将同时执行退票操作。请注意，该操作不可逆！'
      } else {
        text += '当前退款已操作过退票，本次操作将绑定回单信息。'
      }
      text += '您确定继续操作吗？'
      const res = await this.$confirm(text).catch((e) => {
        // console.log("error",e);
        this.$message.error('已取消')
      })
      if (!res) {
        // console.log("已取消")
        return false
      }

      // 以下开始执行退票操作
      const query = Object.assign({}, this.tpdetail)
      if (query.ismerge) {
        query.id = this.checkedInfo.id
      }
      query.bankbillno = this.detail.banklsh

      const res2 = await caseapi.bankpdf.bindBankTpInfo(query).catch((e) => {
        const message = e.message
        this.$alert(message)
      })
      if (!res2) {
        return false
      }

      // 完成，做提示
      // this.$alert("绑定成功！");
      // 准备关闭窗口
      this.closeWin()
    },
    checkSelectable(row) {
      return true
      // console.log('checkSelectable', row)
      // if (row.bankaccount && row.isvoid === 0) {
      //   return true;
      // }
      // return false;
    },
    resetTpInfo() {
      this.tpdetail.id = 0
      this.tpdetail.tpstatus = 0
      this.tpdetail.tpdate = ''
      this.tpdetail.tpreason = ''
      this.tpdetail.caseinfo = ''
      this.tpdetail.bankbillno = ''
      this.tpdetail.frombill = ''
      this.tpdetail.ismerge = false
      this.tabCode = 'tklist'
    },
    resetQuery() {
      // console.log("this.detail", this.detail);
      // this.listQuery.ismerge = 0;// 默认不支持合并
      // this.listQuery.tpstatus = 0;// 默认只出现未退票的
      this.listQuery.page = 1
      this.listQuery.total = 0
      this.listQuery.dwname = this.detail.dwname
      this.listQuery.bankname = this.detail.bankname
      this.listQuery.bankaccount = this.detail.bankaccount
      this.listQuery.je = this.detail.je
      this.listQuery.bankdate = this.detail.bankdate
    },
    handleFilter() {
      this.resetQuery()
      // this.listQuery.tpstatus = 0;
      this.getList()
    },
    getList() {
      this.listLoading = true
      caseapi.bankpdf.queryTpList(this.listQuery).then((res) => {
        this.listQuery.total = res.total
        this.tableData = res.items
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },

    changeCheck(val) {
      this.checkedInfo.id = []
      this.checkedInfo.detail = []
      this.checkedInfo.num = 0
      this.checkedInfo.je = 0

      val.forEach((item) => {
        this.checkedInfo.id.push(item.id)
        this.checkedInfo.num++
        this.checkedInfo.je += item.je - 0
        this.checkedInfo.detail.push(item)
      })
    },
    handleMerge() {

    },
    closeWin() {
      // this.showWindow = false;
      this.$nextTick(() => {
        this.loading = false
        this.$alert('操作完成！')
        this.showWindow = false
        this.$emit('done')
      })
    }

  }
}
</script>
<style>
.form-item {
  width: 100%;
}

.pdfiframe {
  height: 500px;
  width: 100%;
  border: 0;
}

.checklist {
  height: 40px;
  line-height: 40px;
}
</style>
