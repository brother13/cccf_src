<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog v-dialogDrag :visible.sync="showWindow" :title="tableTitle" width="80%">
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane
          v-if="caseinfo.billno"
          :label="
            '根据收据号' +
              (table_bill.count.total ? '(' + table_bill.count.total + ')' : '')
          "
          name="bill"
        >
          <div v-if="caseinfo.typeid != 401">
            收据总收
            <el-tag type="success"> {{ table_bill.count.snum }} </el-tag>
            笔，共计
            <el-tag type="success">{{ formatNumber(table_bill.count.sje) }}</el-tag>
            元，退款
            <el-tag type="danger"> {{ table_bill.count.tnum }} </el-tag>
            笔，共计
            <el-tag type="danger">{{ formatNumber(table_bill.count.tje) }}</el-tag>元。
            <template v-if="table_bill.count.tpnum">
              银行退票<el-tag type="success"> {{ table_bill.count.tpnum }} </el-tag>
              笔，共计
              <el-tag type="success">{{ formatNumber(table_bill.count.tpje) }}</el-tag>元。
            </template>

            当前余额
            <el-tag type="success">{{ formatNumber(table_bill.count.ye) }}</el-tag>
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-download"
              @click="handleExport_sk"
            >导出</el-button>
          </div>
          <div v-else>
            款项入账共计<el-tag type="success">{{
              formatNumber(table_bill.count.sje)
            }}</el-tag>元，已认领 {{ table_bill.count.tnum }} 笔，共计<el-tag type="danger">{{
              formatNumber(table_bill.count.tje)
            }}</el-tag>元。剩余可认领金额<el-tag type="success">{{
              formatNumber(table_bill.count.ye)
            }}</el-tag>。
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-download"
              @click="handleExport_sk"
            >导出</el-button>
          </div>
          <el-table
            :key="table_bill.key"
            v-loading="table_bill.loading"
            :data="table_bill.data"
            border
            fit
            highlight-current-row
            size="mini"
            height="400"
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            <el-table-column type="index" width="50" align="center" label="序号">
              <template slot-scope="{ $index }">
                {{
                  $index +
                    table_bill.listQuery.pagesize * (table_bill.listQuery.page - 1) +
                    1
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="100"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="{ row }">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-position"
                  @click="jumpToPage(row.typeid, row.billno, row.id)"
                >
                  详情</el-button>
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
                    <template v-else>
                      {{ row[field.field] }}
                    </template>
                  </template>
                </el-table-column>
              </template>
            </template>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="
            caseinfo.typeid != 401 &&
              caseinfo.caseyear &&
              caseinfo.casetype &&
              caseinfo.casenum
          "
          :label="
            '根据案号' +
              (table_case.count.total ? '(' + table_case.count.total + ')' : '')
          "
          name="caseinfo"
        >
          <div>
            收据总收
            <el-tag type="success">{{ table_case.count.snum }}</el-tag> 笔，共计
            <el-tag type="success">{{ formatNumber(table_case.count.sje) }}</el-tag>
            元，退款
            <el-tag type="danger">{{ table_case.count.tnum }}</el-tag> 笔，共计
            <el-tag type="danger">{{ formatNumber(table_case.count.tje) }}</el-tag>元。

            <template v-if="table_case.count.tpnum">
              银行退票<el-tag type="success"> {{ table_case.count.tpnum }} </el-tag>
              笔，共计
              <el-tag type="success">{{ formatNumber(table_case.count.tpje) }}</el-tag>元。
            </template>

            当前余额
            <el-tag type="success">{{ formatNumber(table_case.count.ye) }}</el-tag>
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-download"
              @click="handleExport_case"
            >导出</el-button>
          </div>

          <el-table
            :key="table_case.key"
            v-loading="table_case.loading"
            :data="table_case.data"
            border
            fit
            highlight-current-row
            size="mini"
            height="400"
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            <el-table-column type="index" width="50" align="center" label="序号">
              <template slot-scope="{ $index }">
                {{
                  $index +
                    table_case.listQuery.pagesize * (table_case.listQuery.page - 1) +
                    1
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="100"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="{ row }">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-position"
                  @click="jumpToPage(row.typeid, row.billno, row.id)"
                >
                  详情</el-button>
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
                    <template v-else>
                      {{ row[field.field] }}
                    </template>
                  </template>
                </el-table-column>
              </template>
            </template>
          </el-table>
          <pagination
            v-show="
              table_case.listQuery.total > 0 &&
                table_case.listQuery.total > table_case.listQuery.pagesize
            "
            :total="table_case.listQuery.total"
            :page.sync="table_case.listQuery.page"
            :limit.sync="table_case.listQuery.pagesize"
            @pagination="getList_case"
          />
        </el-tab-pane>
      </el-tabs>
      <LoadingProgress ref="progress" @cancel="stopExport" />
    </el-dialog>
  </div>
</template>

<script>
/**
 * 获取待办通知书信息，并进行标注
 */

import caseapi from '@/courtcase/api'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import LoadingProgress from '@/components/Courtcase/LoadingProgress'

// const fieldList = [
//   {
//     field: 'typename',
//     label: '款项类型',
//     export: true,
//     show: true,
//     width: 100,
//     order: true
//   },
//   {
//     field: 'st',
//     label: '收退',
//     export: true,
//     show: true,
//     width: 80,
//     order: true
//   },
//   {
//     field: 'operdate',
//     label: '制单日期',
//     export: true,
//     show: true,
//     order: true
//   },
//   {
//     field: 'billno',
//     label: '单据号',
//     export: true,
//     show: true,
//     width: 100,
//     order: true
//   },
//   {
//     field: 'caseinfo',
//     label: '案号',
//     export: true,
//     show: true,
//     width: 180,
//     order: true
//   },
//   { field: 'dwname', label: '单位名称', export: true, show: true, width: 180 },
//   {
//     field: 'je',
//     label: '金额',
//     export: true,
//     show: true,
//     align: 'right',
//     order: true
//   },
//   {
//     field: 'deptname',
//     label: '承办部门',
//     export: true,
//     show: true,
//     order: true
//   },
//   { field: 'cbr', label: '承办人', export: true, show: true, order: true },
//   { field: 'noticenum', label: '通知书号', export: true, show: true },
//   { field: 'opername', label: '操作员', export: true, show: true },
//   { field: 'note', label: '备注', export: true, show: true, width: 100 }
// ]

export default {
  name: 'CaseStList',
  components: { Pagination, LoadingProgress },

  props: {},
  data() {
    return {
      activeName: 'bill',
      showWindow: false,
      tableTitle: '案款收退情况',
      table_bill: {
        key: 'tablebill',
        listQuery: {
          page: 1,
          pagesize: 10,
          total: 0
        },
        count: {
          snum: 0,
          tnum: 0,
          sje: 0,
          tje: 0,
          ye: 0,
          total: 0,
          tpnum: 0,
          tpje: 0
        },
        loading: false,
        data: []
      },
      table_case: {
        key: 'tablecase',
        listQuery: {
          page: 1,
          pagesize: 10,
          total: 0
        },
        count: {
          snum: 0,
          tnum: 0,
          sje: 0,
          tje: 0,
          ye: 0,
          total: 0,
          tpnum: 0,
          tpje: 0
        },
        loading: false,
        data: []
      },
      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 50 // 默认分页数
      },
      isExporting: false, // 正在导出

      fieldList: [],
      caseinfo: {
        typeid: 0,
        caseyear: '',
        casetype: '',
        casenum: '',
        billno: ''
      },
      export: {
        title: 'export',
        header: [],
        field: []
      }
    }
  },
  computed: {},

  mounted() {},
  methods: {
    showList(typeid, billno, caseyear, casetype, casenum) {
      this.caseinfo.typeid = typeid
      this.caseinfo.billno = billno
      this.caseinfo.caseyear = caseyear
      this.caseinfo.casetype = casetype
      this.caseinfo.casenum = casenum

      this.initField(typeid)
      if (billno) {
        this.activeName = 'bill'
        this.getList_bill()
      } else {
        this.activeName = 'caseinfo'
      }

      if (
        typeid !== 401 &&
        this.caseinfo.casenum &&
        this.caseinfo.caseyear &&
        this.caseinfo.casetype
      ) {
        this.getList_case()
      }

      this.initExport()

      this.showWindow = true
    },
    getList_bill() {
      this.table_bill.loading = true
      this.table_bill.count.total = 0
      caseapi.casesk
        .getStList_by_billno(this.caseinfo.typeid, this.caseinfo.billno)
        .then((res) => {
          this.table_bill.count = res.count
          this.table_bill.data = res.data
          this.table_bill.loading = false
        })
    },
    initField(typeid) {
      // console.log('initField', typeid)
      if (typeid === 401) {
        this.tableTitle = '款项认领情况'
      } else {
        this.tableTitle = '案款收退情况'
      }
      this.fieldList = []
      this.fieldList.push({
        field: 'typename',
        label: '款项类型',
        export: true,
        show: true,
        width: 100,
        order: true
      })

      // this.fieldList.push({
      //   field: 'st',
      //   label: '收退',
      //   export: true,
      //   show: true,
      //   width: 80,
      //   order: true
      // })

      this.fieldList.push({
        field: 'operdate',
        label: '制单日期',
        export: true,
        show: true,
        order: true
      })
      if (typeid === 101 || typeid === 102 || typeid === 103 || typeid === 108) {
        this.fieldList.push({
          field: 'casebill_operdate',
          label: '款项入账日期',
          export: true,
          show: true,
          width: 120,
          order: true
        })
      }

      this.fieldList.push({
        field: 'billno',
        label: '单据号',
        export: true,
        show: true,
        width: 150,
        order: true
      })
      if (typeid === 104 || typeid === 205 || typeid === 109 || typeid === 201) {
        this.fieldList.push({
          field: 'fsbillno',
          label: '非税票据号',
          export: true,
          show: true,
          width: 150,
          order: true
        })
      }
      this.fieldList.push({
        field: 'caseinfo',
        label: '案号',
        export: true,
        show: true,
        width: 180,
        order: true
      })
      this.fieldList.push({
        field: 'dwname',
        label: '单位名称',
        export: true,
        show: true,
        width: 180
      })

      if (typeid === 401) {
        this.fieldList.push({
          field: 'je',
          label: '入账金额',
          export: true,
          show: true,
          align: 'right',
          order: true
        })
        this.fieldList.push({
          field: 'tje',
          label: '认领金额',
          export: true,
          show: true,
          align: 'right',
          order: true
        })
        this.fieldList.push({
          field: 'ye',
          label: '余额',
          export: true,
          show: true,
          align: 'right',
          order: true
        })
      } else {
        this.fieldList.push({
          field: 'sje',
          label: '收款金额',
          export: true,
          show: true,
          align: 'right',
          order: true
        })
        this.fieldList.push({
          field: 'tje',
          label: '退款金额',
          export: true,
          show: true,
          align: 'right',
          order: true
        })
      }
      this.fieldList.push({
        field: 'deptname',
        label: '承办部门',
        export: true,
        show: true,
        order: true
      })
      this.fieldList.push({
        field: 'cbr',
        label: '承办人',
        export: true,
        show: true,
        order: true
      })
      this.fieldList.push({
        field: 'noticenum',
        label: '通知书号',
        export: true,
        show: true,
        width: 140
      })
      this.fieldList.push({
        field: 'username',
        label: '操作员',
        export: true,
        show: true
      })
      this.fieldList.push({
        field: 'oldcaseinfo',
        label: '关联案号',
        export: true,
        show: true
      })
      this.fieldList.push({
        field: 'note',
        label: '备注',
        export: true,
        show: true,
        width: 100
      })
    },
    getList_case() {
      this.table_case.loading = true
      this.table_case.count.total = 0
      caseapi.casesk
        .getStList_by_caseinfo(
          this.caseinfo.typeid,
          this.caseinfo.caseyear,
          this.caseinfo.casetype,
          this.caseinfo.casenum,
          this.table_case.listQuery.page,
          this.table_case.listQuery.pagesize
        )
        .then((res) => {
          this.table_case.count = res.count
          this.table_case.data = res.data
          this.table_case.listQuery.total = res.count.total

          this.table_case.loading = false
        })
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },
    // 如果有ID则跳转ID
    jumpToPage(typeid, billno, id = 0) {
      // console.log('正在跳转至单据类型' + typeid + '，单据号为' + billno)
      let page = ''
      const rn = Math.random()
      const query = { key: billno, id: id, t: rn }
      switch (typeid) {
        case 101: // 收代管款
          page = '/casesk/dgksk'
          break
        case 102: // 收保证金
          page = '/casesk/bzjsk'
          break
        case 103: // 收罚没款
          page = '/casesk/fmksk'
          break
        case 108: // 收公告费
          page = '/casesk/ggfsk'
          break
        case 110: // 二审诉讼费
          page = '/casesk/secssf'
          break
        case 104: // 收诉讼费
          page = '/casesk/ssfsk'
          break
        case 201: // 退诉讼费
          page = '/casetk/ssftk'
          break
        case 203: // 退代管款
          page = '/casetk/dgktk'
          break
        case 204: // 退保证金
          page = '/casetk/bzjtk'
          break
        case 205: // 移送诉讼费
          page = '/casetk/ssfys'
          break
        case 401: // 款项入账
          page = '/casesk/casebill'
          break
      }
      if (page !== '') {
        // console.log('即将跳转:' + page)
        try {
          this.$emit('jump', { path: page, query: query })
          this.$router.push({ path: page, query: query })
        } catch (e) {
          console.log(e)
        }
      }
      this.showWindow = false
    },
    handleExport_sk() {
      const alldata = this.table_bill.data
      const title = '案款收退情况【' + this.caseinfo.billno + '】'
      this.handleDownload(alldata, title)
    },
    handleExport_case_old() {
      const alldata = this.table_case.data
      const title = '案款收退情况'
      this.handleDownload(alldata, title)
    },
    async handleExport_case() {
      // 分页获取数据情况
      this.exportstatus.total = this.table_case.listQuery.total
      this.exportstatus.done = 0
      this.exportstatus.page = 1
      this.exportstatus.totalpage = Math.floor(
        this.table_case.listQuery.total / this.exportstatus.pagesize
      )
      if (
        this.table_case.listQuery.total >
        this.exportstatus.pagesize * this.exportstatus.totalpage
      ) {
        this.exportstatus.totalpage++ // 判断分页
      }
      const alldata = []
      this.isExporting = true // 标志 是否正在导出
      this.showProgress('正在读取数据', this.exportstatus.done, this.exportstatus.total)
      for (let i = 1; i <= this.exportstatus.totalpage; i++) {
        if (!this.isExporting) {
          this.$message.error('已取消')
          return false
          // break
        }
        // let query = Object.assign({}, this.listQuery)
        // this.table_case.listQuery.page = i
        // this.table_case.listQuery.pagesize = this.exportstatus.pagesize
        const res = await caseapi.casesk.getStList_by_caseinfo(
          this.caseinfo.typeid,
          this.caseinfo.caseyear,
          this.caseinfo.casetype,
          this.caseinfo.casenum,
          i,
          this.exportstatus.pagesize
        )
        const data = res.data
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx]
          row['_index'] = (i - 1) * this.exportstatus.pagesize + idx + 1
          alldata.push(row)
        }
        this.exportstatus.done += data.length
        // alldata = alldata.concat(data) // 合并数组
        this.showProgress(
          '正在读取数据',
          this.exportstatus.done,
          this.exportstatus.total
        )
      }
      const title = '案款收退情况'

      if (this.isExporting && alldata.length) {
        this.handleDownload(alldata, title)

        // this.handleDownload(alldata)
      }

      setTimeout(() => {
        this.isExporting = false
        this.hideProgress()
      }, 500)

      // const alldata = this.table_case.data

      // this.handleDownload(alldata, title)
    },
    stopExport() {
      this.isExporting = false
    },
    showProgress(title, num, total) {
      try {
        this.$refs['progress'].showInfo(title, num, total)
      } catch (e) {
        // console.log(e)
      }
    },
    hideProgress() {
      try {
        this.$refs['progress'].close()
      } catch (e) {
        // console.log(e)
      }
    },

    initExport() {
      this.export.header = []
      this.export.field = []
      this.export.field2 = []
      for (let i = 0; i < this.fieldList.length; i++) {
        const field = this.fieldList[i]
        if (field['export'] === true) {
          this.export.header.push(field['label'])
          this.export.field.push(field['field'])
          this.export.field2.push(field)
        }
      }
    },

    handleDownload(alldata, title) {
      // this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = this.export.header
        const filterVal = this.export.field2
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: title,
          // filename: "table-list"
          filename: title
        })
        // this.downloadLoading = false
      })
    },

    formatJson_old(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return v[j]
          } else {
            return v[j]
          }
        })
      )
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((field) => {
          const j = field.field
          let value = v[j]
          if (field.align && field.align === 'right') {
            // 数字
            value = this.formatNumber(value)
            value = value.replace(/,/g, '')
            // console.log(value)
            if (value === '-') {
              value = 0
            }
            return value - 0
          }

          return value
          // if (j === 'timestamp') {
          //   return parseTime(v[j])
          // } else {
          //   return v[j]
          // }
        })
      )
    },

    tableRowClassName({ row, rowIndex }) {
      if (row.st !== '收款') {
        return 'warning-row'
      }
      return ''
    }
  }
}
</script>

<style>
.el-table .warning-row {
  background-color: oldlace;
}

.success-row {
  background: #f0f9eb;
}
</style>
