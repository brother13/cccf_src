<template>
  <el-dialog v-dialogDrag v-loading="loading" title="绑定票据" :visible.sync="showWindow" :close-on-click-modal="false"
    width="90%">
    <el-row :gutter="20">

      <el-col :span="12">
        <iframe ref="pdfiframe" class="pdfiframe" src="about:blank" />
      </el-col>

      <el-col :span="12">

        <div>

          <el-form ref="dataForm" :rules="rules" :model="detail" label-position="right" label-width="100px"
            style="width: 80%; margin-left: 50px; margin-top: 50px">
            <el-form-item label="单据编号" prop="billno">
              <el-row>
                <el-col :span="14">
                  <el-input ref="billno" v-model="detail.billno" style="width:100%; " />
                </el-col>
                <el-col :span="10">
                  <el-button icon="el-icon-refresh" @click="getNewCode" style="margin-left:10px;">取新号</el-button>
                </el-col>
              </el-row>

            </el-form-item>
            <el-form-item label="回单编号" prop="banklsh">
             <span>{{ detail.banklsh }}</span>
            </el-form-item>


            <el-form-item label="款项类型" prop="banktype">

              <el-select v-model="detail.banktype" style="width: 100%" placeholder="款项类型">
                <el-option v-for="(item, index) in basedata.banktypeList" :key="index" :label="item.itemname"
                  :value="item.itemname" />
              </el-select>
            </el-form-item>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="制单日期" prop="operdate">

                  <Operdate v-model="detail.operdate" type="date" placeholder="制单日期" style="width: 80%"
                    value-format="yyyy-MM-dd" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="流水日期" prop="bankdate">
                  <el-date-picker v-model="detail.bankdate" type="date" placeholder="流水日期" style="width: 100%"
                    value-format="yyyy-MM-dd" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="小写金额" prop="je">
              <el-row :gutter="10">
                <el-col :span="10">
                  <Moneyinput v-model.trim="detail.je" style="text-align: right; width: 100%" />
                </el-col>
                <el-col :span="13">
                  <div style="margin-left: 0px; width: 100%; display: inline" v-text="getBigNumber(detail.je)" />
                </el-col>
              </el-row>
            </el-form-item>

            <el-form-item label="备注信息" prop="note">
              <el-input v-model="detail.note" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                placeholder="备注信息" />
            </el-form-item>


          </el-form>
          <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button @click="showWindow = false">取消</el-button>
            <el-button type="primary" @click="saveData">保存并绑定</el-button>

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
  typeid: 310,
}


export default {
  name: 'ssfbankpdf-form',
  inheritAttrs: false,
  components: { Moneyinput, Operdate },

  props: {

  },
  computed: {
   
  },
  data: () => {
    return {
      loading: false,
      showWindow: false,

      
      detail: {
        id: 0,
        dwid: '',
        typeid: PAGECONOFIG.typeid,
        billno: '',
        banklsh:'',
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
        updatetime: '',


      },
      detail_temp: {
        id: 0,
        dwid: '',
        typeid: PAGECONOFIG.typeid,
        billno: '',
        banklsh:'',
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
        updatetime: '',

      },
      basedata: {
        banktypeList: [],
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
  computed: {},
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getBasedata();
    },

    getBasedata() {

      caseapi.bankpdf.banktype_getList().then((res) => {
        this.basedata.banktypeList = res;
      })
    },

    async showInfo(data) {
      const fydm = data.fydm;
      const bankbillno = data.bankbillno;
      const query = {
        fydm: fydm,
        bankbillno: bankbillno,
        getfile: true
      };
      const info = await caseapi.bankpdf.getBankpdf(query);
      this.resetTemp(info);

      const pdfdata = info.pdfdata;

      const pdf = caseapi.util.pdf_base64_to_byte(pdfdata);
      const url = caseapi.util.pdf_getObjectURL(pdf)
      this.showPdf(url);

    },
    resetTemp(info) {
      this.detail = Object.assign({}, this.detail_temp);

      if (info) {
        this.detail.note = info.remark;
        this.detail.bankdate = info.transtime;
        this.detail.je = info.je;
      }
      this.detail.operdate = caseapi.base.getLogindate()
      this.detail.banklsh = info.bankbillno;
      this.loading = false;



      // 智能判断款项类型

      for (let i = 0; i < this.basedata.banktypeList.length; i++) {
        const row = this.basedata.banktypeList[i];
        if (row.note && row.note.indexOf(info.note) >= 0) {
          this.detail.banktype = row.itemname;
          break;
        }
        if (row.keyword) {
          const allkey = row.keyword.split(',');
          for (let j = 0; j < allkey.length; j++) {
            const key = allkey[j];
            if (info.remark.indexOf(key) >= 0) {
              this.detail.banktype = row.itemname;
              break;
            }
          }
        }
      }

      this.getNewCode();
      // @todo 智能判断款项类型



    },
    async saveData() {
      this.loading = true;

      const res = await caseapi.bankpdf.ssfother_save(this.detail).catch((e) => {
        this.$message.error("发生错误：" + e.message);
      })

      this.$nextTick(() => {
        this.loading = true;
        this.$message.success("保存成功");
        this.showWindow = false;
        this.$emit("done");
      })
    },
    async showPdf(url) {
      this.showWindow = true;
      this.$nextTick(() => {
        this.$refs["pdfiframe"].src = url;
      });
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
