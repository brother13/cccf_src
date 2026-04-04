<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog v-dialogDrag :visible.sync="showWindow" :title="tableTitle" width="80%">
      <div v-if="info" class="caseinfo">
        款项入账编号：{{ info.billno }}，入账日期：{{ info.bankdate }}，金额:{{ info.je }} ，当前关联案号：{{ info.caseinfo }} / {{ info.cbr }}
      </div>
      <el-table
        key="casebilllink"
        v-loading="listloading"
        :data="tableData"
        border
        fit
        highlight-current-row
        size="mini"
        height="400"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        >
          <template slot-scope="{ $index }">
            {{
              $index + 1
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
              icon="el-icon-paperclip"
              @click="linkcase( row.ah,row.cbrxm,row.cbbm,cbbmdm)"
            >
              关联</el-button>
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

        <!-- <LoadingProgress ref="progress" @cancel="stopExport" /> -->

      </el-table></el-dialog>
  </div>
</template>

<script>
/**
 * 获取待办通知书信息，并进行标注
 */

import caseapi from '@/courtcase/api'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import LoadingProgress from '@/components/Courtcase/LoadingProgress'

const fieldList = [
  {
    field: 'accnt_no',
    label: '子账号',
    export: true,
    show: true,
    width: 180,
    order: true
  },
  {
    field: 'ah',
    label: '案号',
    export: true,
    show: true,
    width: 180,
    order: true
  },
  {
    field: 'cbrxm',
    label: '承办人',
    export: true,
    show: true,
    width: 100,
    order: true
  },
  {
    field: 'cbbm',
    label: '承办部门',
    export: true,
    show: true,
    width: 100,
    order: true
  },
  {
    field: 'ssdwmc',
    label: '诉讼地位',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'dsr',
    label: '当事人',
    export: true,
    show: true,
    width: 200,
    order: true
  },

  { field: 'bind_date', label: '绑定时间', export: true, show: true, width: 150, order: true }
]

export default {
  name: 'Casebilllink',
  // components: { Pagination, LoadingProgress },

  props: {},
  data() {
    return {
      // activeName: 'bill',
      showWindow: false,
      listloading: false,
      tableTitle: '子账号关联信息',
      tableData: [],
      info: null,
      listQuery: {
        id: 0

      },
      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 50 // 默认分页数
      },
      isExporting: false, // 正在导出

      fieldList: fieldList,
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

    showList(id) {
      this.listQuery.id = id

      this.getList()

      this.showWindow = true
    },
    getList() {
      this.listloading = true
      caseapi.casesk.casebill_getbanklist_new(this.listQuery).then((data) => {
        // console.log(data)
        this.tableData = data.data
        this.info = data.info
        this.listloading = false
      })
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
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
    },
    // 关联案号
    linkcase(caseinfo, cbr, cbbm, cbbmdm) {
      let data = { id: this.listQuery.id, caseinfo: caseinfo, cbr: cbr, cbbm: cbbm, cbbmdm: cbbmdm }

      let str = '您是否要将单据【' + this.info.billno + '】的关联案号调整为【' + caseinfo + '】，承办人调整为【' + (cbbm || '') + '  /  ' + cbr + '】？'

      this.$confirm(str, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        caseapi.casesk.updateCasebill_caseinfo_new(data).then((res) => {
          if (res.code === 20000) {
            this.$alert('关联完成！')
            this.$emit('update', data) // 提交更新状态
          } else {
            this.$alert('关联失败：' + res.message)
          }
        })
      })
    }
  }
}
</script>

<style >
.el-table .warning-row {
  background-color: oldlace;
}

.success-row {
  background: #f0f9eb;
}
.caseinfo{
  margin-bottom: 20px;
}
</style>
