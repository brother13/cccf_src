<template>
  <el-dialog v-dialogDrag :visible.sync="showWindow" title="银行退票" :close-on-click-modal="false" width="90%">
    <el-form ref="dataForm" :model="temp" label-position="left" label-width="80px" style="padding: 30px">

      <transition name="fade">
        <el-table key="ssftemp" v-loading="listLoading" :data="tableData" border fit highlight-current-row
          style="width: 100%" height="250" size="mini">
          <el-table-column type="index" width="180" align="center" label="操作">
            <template slot-scope="{ row }">


              <el-button-group>
                <el-button size="mini" @click="importfrombankbill(row.bankbillno)">导入</el-button>
                <el-button size="mini" @click="showbankbill(row.bankbillno)" icon="el-icon-view">查看</el-button>
              </el-button-group>

            </template>
          </el-table-column>

          <template v-for="field in fieldList">
            <template v-if="field.show">
              <el-table-column :key="field.field" :label="field.label" :prop="field.field"
                :align="field.align ? field.align : 'center'" :width="field.width ? field.width : 120"
                :sortable="field.order ? field.order : false">
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

      </transition>
      <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
        @pagination="getBankList" />


      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="回单编号">
            <el-input v-model="temp.tpbankbillno" class="form-item" placeholder="请输入回单编号" />
            <!-- <el-button @click="importfrombankbill" icon="el-icon-search">导入</el-button> -->
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退票日期">
            <el-date-picker v-model="temp.tpdate" type="date" placeholder="退票日期" style="width: 100%"
              value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
      </el-row>



      <el-form-item label="退票理由">
        <el-input v-model="temp.tpreason" class="form-item" placeholder="请输入退票理由" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" @click="doTP">
        退票
      </el-button>
    </div>
    <previewfile ref="previewfile"></previewfile>

  </el-dialog>

</template>
<script>
import caseapi from '@/courtcase/api'

import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import previewfile from "@/components/Courtcase/previewfile"

const fieldList = [


  {
    field: "bankbillno",
    label: "回单编号",
    export: true,
    show: true,
    order: true,
    width: 180
  },
  {
    field: "transtime",
    label: "交易时间",
    export: true,
    show: true,
    order: true,
    width: 180
  },
  {
    field: "je",
    label: "金额",
    export: true,
    show: true,
    align: "right",
    order: true,
  },
  { field: "sk_dwname", label: "收款单位", export: true, show: true, width: 180 },
  { field: "sk_bankaccount", label: "收款账号", export: true, show: true, width: 160 },
  { field: "sk_bankname", label: "收款开户行", export: true, show: true, width: 160 },
  { field: "tk_dwname", label: "付款单位", export: true, show: true, width: 180 },
  { field: "tk_bankaccount", label: "付款账号", export: true, show: true, width: 160 },
  { field: "tk_bankname", label: "付款开户行", export: true, show: true, width: 160 },



  // { field: "bankvoucherno", label: "银行凭证号", export: true, show: true, order: true },
  { field: "note", label: "摘要", export: true, show: true, order: true },
  { field: "remark", label: "附言", export: true, show: true, order: true, width: 250 },

  {
    field: "bindstatus",
    label: "绑定状态",
    export: true,
    show: true,
    order: false,
    width: 180
  },
  {
    field: "createtime",
    label: "导入时间",
    export: true,
    show: true,
    width: 180,
    order: true,
  },

]
export default {
  name: 'Banktp_new',
  inheritAttrs: false,
  props: {},
  components: {
    Pagination,
    previewfile

  },
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      tpReasonList: [],
      listLoading: false,

      fieldList: fieldList,
      tableData: [],
      listQuery: {
        page: 1,
        pagesize: 10
      },
      total: 0,
      info: {

      },

      temp: {
        typeid: 0,
        id: 0,
        tpreason: '',
        tpreason2: '',
        tpdate: ''
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

      const data = await caseapi.casetk.info(id, typeid);
      this.info = data;
      this.temp.tpreason = ''
      this.listQuery.page = 1;
      this.getBankList();



      this.showWindow = true
    },
    getBankList() {

      let query = Object.assign({}, this.info);
      query.page = this.listQuery.page;
      query.pagesize = this.listQuery.pagesize;
      caseapi.bankpdf.queryBanktpFile(query).then((res) => {
        this.total = res.total;
        this.tableData = res.items;

        if(this.tableData && this.tableData.length==1){
          this.importfrombankbill(this.tableData[0].bankbillno);
        }
      })
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

    async importfrombankbill(bankbillno) {
      const info = await caseapi.bankpdf.getBankpdf({ bankbillno: bankbillno }).catch((err) => {
        this.$message.error('获取银行流水信息失败')
        return
      });
      this.temp.tpbankbillno = bankbillno;

      this.temp.tpdate = info.transtime.substr(0, 10);
      this.temp.tpreason = info.remark;

    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2);
    },

    async doTP() {
      const tpreason =
        this.temp.tpreason
      if (!tpreason || tpreason === '') {
        this.$message.error('退票理由不能为空')
      }
      const res = await caseapi.casetk.billTP(
        this.temp.typeid,
        this.temp.id,
        tpreason,
        this.temp.tpdate,
        this.temp.tpbankbillno
      )
      if (res.code !== 20000) {
        this.$message.error(res.message)
      } else {
        this.$message('退票完成')
        this.$emit('dotp')
        this.showWindow = false
      }
    },

    showbankbill(billno) {
      this.$refs['previewfile'].showBankpdf(billno);

    }
  }
}
</script>
<style>
.form-item {
  width: 100%;
}
</style>
