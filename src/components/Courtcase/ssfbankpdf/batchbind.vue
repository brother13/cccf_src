<template>
  <el-dialog
    v-dialogDrag
    v-loading="loading"
    title="批量绑定票据"
    :visible.sync="showWindow"
    :close-on-click-modal="false"
    width="90%"
    :before-close="checkClose"
    :show-close="!batchinfo.isdoing"
  >
    <el-row :gutter="20">
      <el-col :span="7">
        <!--  显示票据列表  -->
        <ol>
          <li v-for="(item, index) in batchinfo.items" :key="index">
            <el-link
              :icon="batchinfo.viewed == item.bankbillno ? 'el-icon-view' : ''"
              type="primary"
              :underline="false"
              class="bankbillLink"
              @click="showInfo(item)"
            >{{ item.bankbillno }}</el-link>
          </li>
        </ol>
      </el-col>
      <el-col :span="8">
        <iframe ref="pdfiframe" class="pdfiframe" src="about:blank" />
      </el-col>

      <el-col :span="8">
        <div>
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="batchinfo"
            label-position="right"
            label-width="100px"
            style="width: 80%; margin-left: 50px; margin-top: 50px"
          >
            <el-form-item label="起始编号" prop="billno">
              <el-row>
                <el-col :span="14">
                  <el-input ref="billno" v-model="batchinfo.billno" style="width: 100%" />
                </el-col>
                <el-col :span="10">
                  <el-button
                    icon="el-icon-refresh"
                    style="margin-left: 10px"
                    @click="getNewCode"
                  >取新号</el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="回单编号" prop="banklsh">
              <span>{{ showBillText(batchinfo.bankbillno) }}</span>
            </el-form-item>

            <el-form-item label="款项类型" prop="banktype">
              <el-select
                v-model="batchinfo.banktype"
                style="width: 100%"
                placeholder="款项类型"
              >
                <el-option
                  v-for="(item, index) in basedata.banktypeList"
                  :key="index"
                  :label="item.itemname"
                  :value="item.itemname"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="制单日期" prop="operdate">
              <Operdate
                v-model="batchinfo.operdate"
                type="date"
                placeholder="制单日期"
                style="width: 80%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>

            <!-- <el-form-item label="流水日期" prop="bankdate">
              <el-date-picker
                v-model="batchinfo.bankdate"
                type="date"
                placeholder="流水日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item> -->

            <!-- <el-form-item label="小写金额" prop="je">
              <el-row :gutter="10">
                <el-col :span="10">
                  <Moneyinput v-model.trim="detail.je" style="text-align: right; width: 100%" />
                </el-col>
                <el-col :span="13">
                  <div style="margin-left: 0px; width: 100%; display: inline" v-text="getBigNumber(detail.je)" />
                </el-col>
              </el-row>
            </el-form-item> -->
            <el-form-item label="备注信息" prop="notetype">
              <el-select
                v-model="batchinfo.notetype"
                style="width: 100%"
                placeholder="备注内容"
              >
                <el-option
                  v-for="(item, index) in basedata.noteTypeList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-show="batchinfo.notetype == 1" label="备注信息" prop="note">
              <el-input
                v-model="batchinfo.note"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                placeholder="自定义备注"
              />
            </el-form-item>

            <el-form-item v-show="batchinfo.isdoing" label="执行进度">
              正在生成第 {{ batchinfo.done + 1 }} / {{ batchinfo.total }} 笔
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button
              :disabled="batchinfo.isdoing"
              @click="showWindow = false"
            >取消</el-button>
            <el-button
              type="primary"
              :icon="batchinfo.isdoing ? 'el-icon-loading' : ''"
              :disabled="batchinfo.isdoing"
              @click="saveData"
            >{{ batchinfo.isdoing ? "正在生成" : "批量生成" }}</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'
import Moneyinput from '@/components/Courtcase/MoneyInput' // secondary package based on el-pagination
import Operdate from '@/components/Courtcase/Operdate' // secondary package based on el-pagination
// import { mapGetters } from 'vuex'
const PAGECONOFIG = {
  typename: '银行流水记录',
  typeid: 310
}
// 备注内容
const noteTypeList = [
  { label: '同银行回单内容', value: 0 },
  { label: '自定义', value: 1 }
]

export default {
  name: 'SsfbankpdfForm',
  components: { Moneyinput, Operdate },
  inheritAttrs: false,

  props: {},
  data: () => {
    return {
      loading: false,
      showWindow: false,

      batchinfo: {
        bankbillno: [],
        isdoing: false, // 正在导入，默认为false
        total: 0,
        done: 0,
        fydm: '',
        items: [],
        billno: '', // 起始流水号
        viewed: '', // 当前查看的单据
        notetype: 0, // 自动跟随
        note: '',
        banktype: '',
        batchinfo: '',
        bankdate: '',
        operdate: ''
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
        noteTypeList: noteTypeList
      },

      rules: {
        billno: [{ required: true, message: '单据号不能为空', trigger: 'change' }],
        operdate: [{ required: true, message: '制单日期不能为空', trigger: 'change' }],
        banktype: [
          {
            required: true,
            message: '款项类型不能为空',
            trigger: 'change'
          }
        ],
        dwname: [{ required: true, message: '类型不能为空', trigger: 'change' }],
        je: [{ required: true, message: '金额不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {},
  computed: {},
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

    async showBatchInfo(data) {
      if (data.length < 1) {
        return false
      }
      const info = data[0] // 取第一行

      const allbillno = []
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        allbillno.push(row.bankbillno)
      }

      const fydm = info.fydm
      this.batchinfo.fydm = fydm
      this.batchinfo.bankbillno = allbillno
      this.batchinfo.items = data
      this.batchinfo.total = data.length
      this.batchinfo.isdoing = false
      this.batchinfo.done = 0
      this.batchinfo.viewed = ''
      this.batchinfo.notetype = 0 // 默认跟随

      this.showInfo(info)
      // const info = await caseapi.bankpdf.getBankpdf(query);
      // this.resetTemp(info);

      // const pdfdata = info.pdfdata;

      // const pdf = caseapi.util.pdf_base64_to_byte(pdfdata);
      // const url = caseapi.util.pdf_getObjectURL(pdf);
      // this.showPdf(url);
    },

    async showInfo(data) {
      const fydm = data.fydm
      const bankbillno = data.bankbillno
      this.batchinfo.viewed = bankbillno
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
    },
    resetTemp(info) {
      // this.detail = Object.assign({}, this.detail_temp);

      if (info) {
        this.batchinfo.note = ''
        this.batchinfo.bankdate = info.transtime
        // this.detail.je = info.je;
      }
      this.batchinfo.operdate = caseapi.base.getLogindate()
      // this.batchinfo.banklsh = info.bankbillno;
      this.loading = false

      // 智能判断款项类型

      for (let i = 0; i < this.basedata.banktypeList.length; i++) {
        const row = this.basedata.banktypeList[i]
        if (row.note && row.note.indexOf(info.note) >= 0) {
          this.batchinfo.banktype = row.itemname
          break
        }
        if (row.keyword) {
          const allkey = row.keyword.split(',')
          for (let j = 0; j < allkey.length; j++) {
            const key = allkey[j]
            if (info.remark.indexOf(key) >= 0) {
              this.batchinfo.banktype = row.itemname
              break
            }
          }
        }
      }

      this.getNewCode()
      // @todo 智能判断款项类型
    },
    async saveData() {
      // 确认一下

      if (this.batchinfo.items.length1 < 1) {
        this.$alert('未找到记录')
        return false
      }
      const confirm = await this.$confirm(
        '此操作将批量生成' + this.batchinfo.total + '笔流水，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((e) => {
        this.$message.info('已取消')
      })
      if (!confirm) {
        return false
      }

      this.batchinfo.isdoing = true

      // this.loading = true;

      for (let i = 0; i < this.batchinfo.items.length; i++) {
        const row = this.batchinfo.items[i]

        const info = Object.assign({}, this.detail_temp)
        info.banklsh = row.bankbillno
        info.billno = await caseapi.casebank.getNewCode(info.typeid)
        info.banktype = this.batchinfo.banktype
        info.operdate = this.batchinfo.operdate
        info.bankdate = row.transtime
        info.je = row.je
        info.dwname = row.sk_dwname
        info.bankname = row.sk_bankname
        info.bankaccount = row.sk_bankaccount
        if (this.batchinfo.notetype == 1) {
          info.note = this.batchinfo.note
        } else {
          info.note = row.remark
        }

        const res = await caseapi.bankpdf.ssfother_save(info).catch((e) => {
          this.$message.error('发生错误：' + e.message)
        })
        this.batchinfo.done++
      }

      this.batchinfo.isdoing = false

      this.$nextTick(() => {
        // this.loading = true;
        this.$alert('保存成功，共保存' + this.batchinfo.done + '条数据！')
        this.$nextTick(() => {
          this.showWindow = false
          this.$emit('done')
        })
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
        this.batchinfo.billno = data
      })
    },
    showBillText(billList) {
      let text = ''
      const maxnum = 5
      const firstnum = 3 // 最前面最多只取5个
      const lastnum = 3 // 最后面只取最多三个
      if (billList.length <= maxnum) {
        text = billList.join('、')
      } else {
        // 取前几项和后几项
        text = billList.slice(0, firstnum).join('、') + ' 等共 ' + billList.length + '笔'
      }

      return text
    },
    checkClose(done) {
      if (this.batchinfo.isdoing) {
        done(false) // 禁止关闭
      } else {
        done(true)
      }
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
.bankbillLink {
  min-height: 30px;
}
</style>
