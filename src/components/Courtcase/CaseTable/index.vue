<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">

    <pagination
      v-if="tableData && total && config && config.doublePageNav"
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <el-table
      v-if="tableData"
      :key="tableKey"
      v-loading="listLoading"
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
      @selection-change="changeCheck"
    >
      <el-table-column v-if="checkbox" type="selection" label="选择" />

      <el-table-column type="index" width="80" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showStatus" label="状态" class-name="status-col" width="100">
        <template slot-scope="{ row }">
          <el-tag :type="row.isvoid | statusFilter">
            {{
              row.isvoid == '0' ? '正常' : (row.tpstatus=='1' ? '已退票' : '已作废')
            }}
          </el-tag>
        </template>
      </el-table-column>

      <template v-for="field in tableField">
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

      <el-table-column
        v-if="showButton"
        label="操作"
        align="center"
        width="150"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-dropdown
            split-button
            type="primary"
            icon="el-icon-edit"
            trigger="click"
            @click="handleCommand({id:defaultButton.action,data:row})"
            @command="handleCommand"
          >
            <i v-if="defaultButton.icon" :class="[defaultButton.icon]" />{{ defaultButton.title }}
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="hasMenu('print')" icon="el-icon-printer" :command="{id:'print',data:row}">打印单据</el-dropdown-item>
              <el-dropdown-item v-if="hasMenu('tobank')" :disabled="!(row.isvoid==0 && row.bankaccount)" icon="el-icon-refresh-right" :command="{id:'tobank',data:row}">银行票据</el-dropdown-item>
              <el-dropdown-item v-if="hasMenu('stlist')" icon="el-icon-view" :command="{id:'stlist',data:row}">查询收退</el-dropdown-item>
              <el-dropdown-item v-if="hasMenu('banktp') && row.tpstatus==0 && row.isvoid==0 && row.bankaccount" icon="el-icon-refresh-right" :command="{id:'banktp',data:row}">银行退票</el-dropdown-item>
              <el-dropdown-item v-if="hasMenu('viewlog')" icon="el-icon-time" :command="{id:'viewlog',data:row}">查看日志</el-dropdown-item>
              <el-dropdown-item v-if="hasMenu('void') && row.isvoid==0 && canVoid" icon="el-icon-delete" :command="{id:'void',data:row}">作废单据</el-dropdown-item>
              <template v-for="(item,index) in buttonPlus">
                <el-dropdown-item v-if="hasMenu(item.id)" :key="'plusbutton_'+index" :icon="item.icon" :command="{id:item.id,data:row}">{{ item.title }}</el-dropdown-item>

              </template>

            </el-dropdown-menu>
          </el-dropdown>

        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="tableData && total && config && config.doublePageNav"
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <Caselog ref="caselog" />
    <hiprint ref="hiprint" @doPrint="afterPrint" />
    <Banktp ref="banktp" @dotp="getList" />
    <CasetoBank ref="CasetoBank" />
    <LoadingProgress ref="progress" @cancel="stopExport" />
    <CaseStList ref="STlist" @jump="checkAndJump" />

  </div>
</template>

<script>

/**
 * 便捷生成各页面的列表，便于今后统一调整与管理
 */
import caseapi from '@/courtcase/api'
import CaseStList from '@/components/Courtcase/CaseStlist' // secondary package based on el-pagination
import Caselog from '@/components/Courtcase/CaseLog' // secondary package based on el-pagination
import hiprint from '@/components/Courtcase/hiprint' // 引入打印控件
// import Casecount from '@/components/Courtcase/Casecount' // secondary package based on el-pagination
import Banktp from '@/components/Courtcase/Banktp' // 银行退票
import CasetoBank from '@/components/Courtcase/CasetoBank' // 银行票据
import LoadingProgress from '@/components/Courtcase/LoadingProgress'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'CaseTable',
  components: { Pagination, CaseStList, Caselog, hiprint, Banktp, CasetoBank, LoadingProgress },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
    }
  },
  props: {
    // 报表类型
    typeid: {
      type: String,
      default: ''
    },
    // 表格列名
    tableField: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 是否显示状态列
    showStatus: {
      type: Boolean,
      default: false
    },
    // 是否显示选择框
    checkbox: {
      type: Boolean,
      default: false
    },
    showButton: {
      type: Boolean,
      default: false
    },
    defaultButton: {
      type: Object,
      default: function() {
        return { action: 'edit', title: '详情', icon: 'el-icon-edit' }
      }
    },
    buttonPlus: {
      type: Array,
      default: function() {
        []
      }
    },
    button: {
      type: Array,
      default: function() {
        return ['stlist', 'viewlog', 'print', 'void', 'banktp']
      }
    },
    // 是否加载中的状态
    listLoading: {
      type: Boolean,
      default: false
    },
    pagesize: {
      type: Number,
      default: 10
    },
    // 表格名称
    tableName: {
      type: String,
      default: 'table'
    },
    total: {
      type: Number,
      default: 0
    },
    // 表格数据
    tableData: {
      type: Array,
      default: function() {
        return []
      }
    }

  },
  data() {
    return {
      tableKey: '', // 表主键
      // listLoading: false, // 正在加载中
      isExporting: false, // 正在导出的状态
      downloadLoading: false,
      config: null,
      // 导出时的数据情况
      listQuery: {
        page: 1,
        pagesize: 10,
        sort: ''
      },

      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 100 // 默认分页数
      },
      export: {
        title: '',
        header: [],
        field: []
      }

    }
  },

  computed: {

    canNew() {
      const roles = this.$store.state.user.roles
      const key = 'BILLNEW_' + this.typeid

      if (roles && roles.includes(key)) {
        return true
      }
      return false
    },
    // 是否允许作废
    canVoid() {
      const roles = this.$store.state.user.roles
      const key = 'BILLVOID_' + this.typeid

      if (roles && roles.includes(key)) {
        return true
      }
      return false
    },
    // 是否允许编辑
    canEdit() {
      const roles = this.$store.state.user.roles
      const key = 'BILLEDIT_' + this.typeid
      if (this.dialogStatus === 'create') {
        return true
      }
      if (roles && roles.includes(key)) {
        return true
      }
      return false
    }

  },
  watch: {
    pagesize(newval) {
      this.listQuery.pagesize = newval
    }
  },

  mounted() {
    this.init()
  },
  methods: {
    async init() {
      // console.log('buttonPlus', this.buttonPlus)
      this.tableKey = 'table_' + Math.random()
      this.config = await caseapi.base.getBillConfig()
      // this.listQuery.pagesize = this.config.defaultPagesize || 10 // 默认10
      this.initExport()
    },
    hasMenu(id) {
      return this.button.indexOf(id) > -1
    },
    // 初始化 导出的列表
    initExport() {
      this.export.header = []
      this.export.field = []
      this.export.title = this.tableName
      for (let i = 0; i < this.tableField.length; i++) {
        const field = this.tableField[i]
        if (field['export'] === true) {
          this.export.header.push(field['label'])
          this.export.field.push(field)
        }
      }
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },
    stopExport() {
      this.isExporting = false
    },
    sortChange(data) {
      const { prop, order } = data
      const order2 = order === 'ascending' ? 'asc' : 'desc'
      this.listQuery.sort = prop + ' ' + order2
      this.getList()
    },
    changeCheck(val) {
      this.emit('checked', val)
    },
    handleUpdate(row) {
      this.emit('edit', row)
    },
    getList() {
      const data = { page: this.listQuery.page, pagesize: this.listQuery.pagesize, sort: this.listQuery.sort }
      this.emit('pagination', data)
      // this.$emit('change', 'pagination', data)
    },
    /**
     * 统一的反馈路径
     *
     */
    emit(action, data) {
      this.$emit('change', action, data)
    },
    afterPrint() {

    },
    checkAndJump(query) {
      // const page = query.path
      // const cururl = this.$route.path
      // if (page === cururl) {
      //   // this.checkUrl()
      // }
    },
    async exportTable(param, func) {
      // console.log('exportTable', param, func)
      // console.log(this.config)

      const maxnum = this.config.ExportConfirmNum
      const total = this.total || 0
      // const sumje = this.tableData.total.je || 0
      // 判断数据量有没有超过1000条，如果未超1000条，则不分段
      const pagemax = 1000

      if (this.config.exportConfirm) {
        try {
          const confirm = await this.$confirm('当前列表共' + total + '笔，是否确认导出?', '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
          console.log(confirm)
        } catch (e) {
          // 说明点击了取消
          return
        }
      }

      if (total > maxnum) {
        // 做提示
        try {
          const confirm = await this.$confirm('当前记录数超过' + maxnum + '笔,导出可能较慢,是否继续导出?', '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
          console.log(confirm)
        } catch (e) {
          // 说明点击了取消
          return
        }
      }

      // let query = Object.assign({}, this.listQuery)
      // query.page = 1
      // query.pagesize = 999999
      // caseapi.report.getCaseYeBill(query).then((res) => {
      //   const alldata = res.items
      //   this.handleDownload(alldata)
      // })

      // 以下改用分页导出数据的方法，用以实现超大数据量级的导出

      if (total <= pagemax) {
        const query = Object.assign({}, param)
        // query.flesh = 0
        this.isExporting = true // 标志 是否正在导出

        query.page = 1
        query.pagesize = pagemax
        const res = await func(query)
        // console.log('after call func', func)
        const data = res.items
        this.handleDownload(data)
        setTimeout(() => {
          this.isExporting = false
          this.hideProgress()
        }, 500)
      } else {
        this.exportstatus.total = this.total
        this.exportstatus.done = 0
        this.exportstatus.page = 1
        this.exportstatus.totalpage = Math.floor(this.total / this.exportstatus.pagesize)
        if (this.total > this.exportstatus.pagesize * this.exportstatus.totalpage) {
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
          const query = Object.assign({}, param)
          // query.flesh = 0
          query.page = i
          query.pagesize = this.exportstatus.pagesize
          // console.log('before call func', func, query)
          const res = await func(query)
          // console.log('after call func', func)
          const data = res.items
          for (let idx = 0; idx < data.length; idx++) {
            const row = data[idx]
            row['_index'] = (i - 1) * this.exportstatus.pagesize + idx + 1
            alldata.push(row)
          }
          this.exportstatus.done += data.length
          // alldata = alldata.concat(data) // 合并数组
          this.showProgress('正在读取数据', this.exportstatus.done, this.exportstatus.total)
        }
        if (this.isExporting && alldata.length) {
          this.handleDownload(alldata)
        }

        setTimeout(() => {
          this.isExporting = false
          this.hideProgress()
        }, 500)
      }
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
    // stopExport() {
    //   this.isExporting = false
    // },

    handleDownload(alldata) {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = this.export.header
        const filterVal = this.export.field
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: this.export.title,
          // filename: "table-list"
          filename: this.export.title
        })
        this.downloadLoading = false
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

    showStList(row) {
      try {
        const stobj = this.$refs['STlist']
        if (stobj) {
          stobj.showList(
            row.typeid || 0,
            row.billno || '',
            row.caseyear || '',
            row.casetype || '',
            row.casenum || ''
          )
        } else {
          this.$message.error('显示收退列表错误：对象没找到')
        }
      } catch (e) {
        console.log(e)
        this.$message.error('显示收退列表发生错误:' + e.description)
      }
    },
    showCaseLog(typeid, id) {
      try {
        this.$refs['caselog'].showList(typeid, id)
      } catch (e) {
        console.log('弹出日志报错：' + e.description)
      }
    },
    showPrint(typeid, id, inlist = false) {
      try {
        this.printInList = inlist
        this.$refs['hiprint'].showPrint(typeid, id)
      } catch (e) {
        console.log('显示打印窗口出错', e)
      }
    },
    handleCommand(command) {
      // console.log('handleCommand', command)
      const { id, data } = command
      switch (id) {
        case 'edit': // 编辑
          this.handleUpdate(data)
          break
        case 'stlist': // 查看收退记录
          this.showStList(data)
          break
        case 'print': // 打印单据
          this.showPrint(data.typeid, data.id)
          break
        case 'void': // 作废单据
          this.handleDelete(data)
          break
        case 'viewlog': // 查看日志
          this.showCaseLog(data.typeid, data.id)
          break
        default:
          // do nothing
      }

      const param = { id: id, data: data }
      this.emit('command', param)
    }

  }
}
</script>

<style >

</style>
