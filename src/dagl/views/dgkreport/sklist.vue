<template>
  <div class="app-container">
    <div>
      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          clearable
          placeholder="请输入关键字"
          style="width: 300px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>

        <span class="filter-item">时间范围：</span>
        <el-select
          v-model="dateRange"
          style="width: 100px"
          class="filter-item"
          @change="changeDateRange"
        >
          <el-option
            v-for="(item, index) in basedata.dateRangeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-model="listQuery.datetype"
          style="width: 120px"
          class="filter-item"
        >
          <el-option
            v-for="(item, index) in basedata.datetypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-date-picker
          v-model="listQuery.starttime"
          type="date"
          placeholder="起始日期"
          style="width: 150px"
          value-format="yyyy-MM-dd"
          class="filter-item"
        />
        <span class="filter-item">~</span>
        <el-date-picker
          v-model="listQuery.endtime"
          type="date"
          placeholder="截止日期"
          style="width: 150px"
          value-format="yyyy-MM-dd"
          class="filter-item"
        />

        <span class="filter-item">金额</span>
        <el-input
          v-model="listQuery.je"
          type="number"
          clearable
          placeholder="精确金额"
          style="width: 120px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <template v-if="canQueryAll">
          <span class="filter-item">承办人</span>
          <el-input
            v-model="listQuery.cbr"
            clearable
            placeholder="承办人"
            style="width: 120px"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
        </template>

        <!-- <span class="filter-item">余额情况：</span>
        <el-select v-model="listQuery.yestatus" style="width: 100px" class="filter-item" @change="handleFilter">
          <el-option v-for="(item, index) in basedata.yestatusList" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
<span class="filter-item">状态：</span>
        <el-select v-model="listQuery.status" style="width: 100px" class="filter-item" @change="handleFilter">
          <el-option v-for="(item, index) in basedata.statusList" :key="index" :label="item.label"
            :value="item.value" />
        </el-select> -->
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          style="margin-left: 10px"
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          style="margin-left: 10px"
          :disabled="isExporting"
          :icon="isExporting ? 'el-icon-loading' : 'el-icon-download'"
          @click="handleExport"
        >导出</el-button>
        <!-- <el-dropdown split-button type="primary" icon="el-icon-download" trigger="click" class="filter-item"
          @command="handleCommand" @click="handleExport_table">
          <i class="el-icon-download" />导出数据
          <el-dropdown-menu slot="dropdown">
            <template v-for="(tab, index) in detailList">
              <el-dropdown-item icon="el-icon-download" :command="{ id: 'handleExportTable', data: index }">导出{{
                tab.info.label }}</el-dropdown-item>

            </template>
</el-dropdown-menu>
</el-dropdown> -->
        <!-- <Casefilter v-if="false" :query="listQuery" @doSearch="doSearch" /> -->

        <!-- <el-button
          class="filter-item"
          style="margin-left: 10px"
          type="primary"
          icon="el-icon-document-add"
          @click="handleCreate"
        >新增</el-button> -->

        <!-- <el-button v-waves class="filter-item" type="primary" icon="el-icon-download"
          @click="handleExport">导出</el-button> -->
      </div>

      <div v-if="count.num" class="courtcase-countinfo">
        当前记录数
        <el-tag> {{ count.num }} </el-tag>
        笔，合计金额<el-tag>{{ formatNumber(count.je) }}</el-tag>元
      </div>
      <pagination
        v-show="count.num > 0"
        :total="count.num"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pagesize"
        @pagination="getList"
      />

      <el-table
        v-loading="listLoading"
        :data="tableData"
        border
        fit
        highlight-current-row
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column type="index" width="80" align="center" label="序号">
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

        <!-- <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="{ row }">
            <el-dropdown split-button type="primary" icon="el-icon-edit" trigger="click" @click="handleQuery(row)"
              @command="handleCommand">
              <i class="el-icon-edit" />查询
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-view" :command="{ id: 'stlist', data: row }">查询收退</el-dropdown-item>

              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column> -->
      </el-table>

      <div v-if="count.num" class="courtcase-countinfo">
        当前记录数
        <el-tag> {{ count.num }} </el-tag>
        笔，现有余额<el-tag>{{ formatNumber(count.je) }}</el-tag>元
      </div>
      <pagination
        v-show="count.num > 0"
        :total="count.num"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pagesize"
        @pagination="getList"
      />
    </div>

    <div id="temp_html2text" style="display: none" />
    <!-- <Caselog ref="caselog" /> -->
    <LoadingProgress ref="progress" @cancel="stopExport" />
    <CaseStList ref="STlist" />
  </div>
</template>

<script>
// import { postdata } from '@/courtcase/api/common'

import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Casefilter from '@/components/Courtcase/CaseFilter' // secondary package based on el-pagination
import Casenotice from '@/components/Courtcase/CaseNotice' // secondary package based on el-pagination
import CaseStList from '@/components/Courtcase/CaseStlist/stlist2' // secondary package based on el-pagination
// import Moneyinput from '@/components/Courtcase/MoneyInput' // secondary package based on el-pagination
// import Caselog from '@/components/Courtcase/CaseLog' // secondary package based on el-pagination

// import hiprint from '@/components/Courtcase/hiprint' // 引入打印控件
import caseapi from '@/courtcase/api'
import Casecount from '@/components/Courtcase/Casecount' // secondary package based on el-pagination
import Operdate from '@/components/Courtcase/Operdate' // secondary package based on el-pagination
import { mapGetters } from 'vuex'
import LoadingProgress from '@/components/Courtcase/LoadingProgress'
import CountCard from '@/components/Courtcase/CountCard'

const fieldList = [
  // { field: '_index', label: '序号', export: true, show: false },
  // { field: 'id', label: 'ID', export: false, show: false },
  // { field: 'typename', label: '款项类型', export: true, show: true },
  // { field: 'days', label: '留存时间', export: true, show: true, width: 100 },
  // { field: 'leftdays', label: '超期剩余天数', export: true, show: true, width: 120 },
  // {
  //   field: 'enddate',
  //   label: '截止日期',
  //   export: true,
  //   show: true,
  //   order: true
  // },

  { field: 'djcode', label: '进账票号', export: true, show: true, order: true },
  {
    field: 'ah',
    label: '案号',
    export: true,
    show: true,
    width: 220,
    order: true
  },

  {
    field: 'kpdate',
    label: '开票日期',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'dzdate',
    label: '到账日期',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'jzdate',
    label: '进账日期',
    export: true,
    show: true,
    order: true
  },

  { field: 'dsr', label: '当事人', export: true, show: true, width: 300 },
  {
    field: 'jzje',
    label: '金额',
    export: true,
    show: true,
    align: 'right',
    order: true
  },

  {
    field: 'cbbm',
    label: '承办部门',
    export: true,
    show: true,
    order: true
  },

  { field: 'cbr', label: '承办人', export: true, show: true, order: true },
  { field: 'sjy', label: '书记员', export: true, show: true, order: true }
  // {
  //   field: 'yh_zt',
  //   label: '延缓状态',
  //   export: true,
  //   show: true,
  //   order: true
  // },
  // {
  //   field: 'yh_enddate',
  //   label: '延缓截止日期',
  //   export: true,
  //   show: true,
  //   order: true
  // },
  // {
  //   field: 'yh_reason',
  //   label: '延缓原因',
  //   export: true,
  //   show: true,
  //   width: 200,
  //   order: true
  // },
  // { field: 'username', label: '操作员', export: true, show: true },
]

const yestatusList = [
  { value: 1, label: '有余额' },
  { value: 2, label: '余额为零' },
  { value: 0, label: '所有数据' }
]

const statusList = [
  { value: 0, label: '所有数据' },
  { value: 1, label: '正常' },
  { value: 2, label: '已登记延缓' }
]
const datetypeList = [
  { label: '开票日期', value: 'kpdate' },
  { label: '到账日期', value: 'dzdate' },
  { label: '进账日期', value: 'jzdate' }
  // {label:'延缓日期',value:'yh_enddate'},
]
const PAGECONFIG = {
  pagename: '收款明细表', // 标题
  typeid: 101,
  pagecode: 'dgkye_sklist' // 页面名称,
}

export default {
  name: PAGECONFIG.pagecode + 'Table',
  components: {
    Pagination,
    Casefilter,
    Casenotice,
    CaseStList,
    // Moneyinput,
    // Caselog,
    // hiprint,
    Casecount,
    Operdate,
    LoadingProgress,
    CountCard
  },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
    }
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      pageconfig: PAGECONFIG,
      fieldList: fieldList,
      showcaselabel: '',
      tableData: [],
      dateRange: 'thismonth',
      store_key: PAGECONFIG.pagecode,

      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: undefined,
        sort: '',
        datetype: 'kpdate',
        je: undefined,
        cbr: undefined,
        starttime: undefined,
        endtime: undefined,
        yestatus: 0,
        status: 0
      },
      basedata: {
        deptList: [],
        userList: [],
        accountList: [],
        casetypeList: [],
        casetypeClassList: [],
        yearList: [],
        dateRangeList: [],
        datetypeList: datetypeList,
        yestatusList: yestatusList,
        statusList: statusList
      },
      count: {
        num: 0,
        je: 0,
        ye: 0
      },

      fleshye: {
        endtime: '',
        datetype: 'billno',
        yetype: 1,
        updatetime: '',
        lasttime: ''
      },
      fleshing: false,

      headers: {
        'RLF-TOKEN': ''
      },
      export: {
        title: PAGECONFIG.pagename,
        header: [],
        field: [],
        field2: []
      },

      config: null,
      downloadLoading: false,

      isExporting: false, // 正在导出
      // 导出时的数据情况
      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 5000 // 默认分页数
      },

      // 以下是汇总信息

      countList: [], // 统计汇总的
      activeName: 'count', // 当前激活的tab
      alltype: [], // 所有的分类信息

      detailList: [], // 明细记录

      noteinfo: {
        note: '',
        showWin: false,
        username: '',
        createtime: '',
        updatetime: '',
        info: null // 原收款记录
      }
    }
  },
  computed: {
    ...mapGetters(['name']),

    canQueryAll() {
      const roles = this.$store.state.user.roles
      const key = 'ZXTZ_QUERY_ALL'

      if (roles && roles.includes(key)) {
        return true
      }
      return false
    }
  },
  watch: {
    $route() {
      this.init()
    }
  },
  created() {
    this.init()

    this.getList()
  },
  methods: {
    /**
     * 检查地址变化，并自动进行搜索
     */
    async checkUrl() {},
    async init() {
      if (!this.canQueryAll) {
        this.listQuery.cbr = this.name
      }
      // this.getLasttime();
      // this.getReport();
      this.initExport()
      this.getBasedata()
    },

    async getList() {
      this.listLoading = true
      caseapi.plugins.queryList_sk(this.listQuery).then((res) => {
        this.count = res.total
        this.tableData = res.items
        this.listLoading = false
      })
    },
    // 初始化 导出的列表
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
    doSearch(param) {
      const page = this.listQuery.page
      const pagesize = this.listQuery.pagesize
      this.listQuery = param
      this.listQuery.page = page
      this.listQuery.pagesize = pagesize

      this.getList()
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

    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      caseapi.base.getYearList().then((res) => {
        this.basedata.yearList = res
      })

      this.basedata.dateRangeList = caseapi.base.getDateRangeList()
      // console.log(this.basedata)

      const datetype = caseapi.store.get(this.store_key)
      if (datetype) {
        this.dateRange = datetype
      }
      if (this.dateRange) {
        this.changeDateRange()
      }
      // this.getRefreshConfig();

      return true
    },

    async getLasttime() {
      caseapi.plugins.dgkreport_getendtime().then((res) => {
        this.fleshye.endtime = res.endtime
        this.fleshye.lasttime = res.lasttime
      })
    },

    getIndexMap() {
      const indexMap = {}
      for (let i = 0; i < this.detailList.length; i++) {
        const row = this.detailList[i]
        const scode = row.info.code
        indexMap[scode] = i
      }
      return indexMap
    },
    async getDetail(code = 'ALL') {
      const indexMap = this.getIndexMap()
      this.listLoading = true

      let query = Object.assign({}, this.listQuery)
      if (code != 'ALL') {
        const index = indexMap[code]
        query = this.detailList[index].query
        query['code'] = code
      }
      const res = await caseapi.plugins.dgkreport_getList(query).finally(() => {
        this.listLoading = false
      })

      if (code == 'ALL') {
        for (const k in res) {
          const info = res[k]
          const scode = info.info.code
          const index = indexMap[scode]
          this.detailList[index].total = info.total
          this.detailList[index].items = info.items
        }
      } else {
        const index = indexMap[code]
        const info = res[code]
        this.detailList[index].total = info.total
        this.detailList[index].items = info.items
      }
    },

    changeDateRange() {
      // 调整日期范围
      const data = caseapi.base.getDateRange(this.dateRange)
      this.listQuery.starttime = data.starttime
      this.listQuery.endtime = data.endtime

      caseapi.store.set(this.store_key, this.dateRange)
    },
    handleFilter() {
      this.listQuery.page = 1
      // this.getDetail()
      // this.getReport();
      this.getList()
    },

    sortChange(data) {
      const { prop, order } = data
      const order2 = order === 'ascending' ? 'asc' : 'desc'
      this.listQuery.sort = prop + ' ' + order2
      this.handleFilter()
      // if (prop === 'id') {
      //   this.sortByID(order)
      // }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },

    async handleExport() {
      // 导出数据
      const maxnum = 5000
      try {
        const confirm = await this.$confirm(
          '当前列表共' +
            this.count.num +
            '笔，共计' +
            this.formatNumber(this.count.je) +
            '元，是否确认导出?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        console.log(confirm)
      } catch (e) {
        // 说明点击了取消
        return
      }

      if (this.count.num > maxnum) {
        // 做提示
        try {
          const confirm = await this.$confirm(
            '当前记录数超过' + maxnum + '笔,导出可能较慢,是否继续导出?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
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

      this.total = this.count.num
      this.exportstatus.total = this.total
      this.exportstatus.done = 0
      this.exportstatus.page = 1
      this.exportstatus.totalpage = Math.floor(
        this.total / this.exportstatus.pagesize
      )
      if (
        this.total >
        this.exportstatus.pagesize * this.exportstatus.totalpage
      ) {
        this.exportstatus.totalpage++ // 判断分页
      }
      const alldata = []
      this.isExporting = true // 标志 是否正在导出
      this.showProgress(
        '正在读取数据',
        this.exportstatus.done,
        this.exportstatus.total
      )
      for (let i = 1; i <= this.exportstatus.totalpage; i++) {
        if (!this.isExporting) {
          this.$message.error('已取消')
          return false
          // break
        }
        const query = Object.assign({}, this.listQuery)
        query.page = i
        query.pagesize = this.exportstatus.pagesize
        const res = await caseapi.plugins.queryList_sk(query)
        const data = res.items
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
      if (this.isExporting && alldata.length) {
        this.handleDownload(alldata)
      }

      setTimeout(() => {
        this.isExporting = false
        this.hideProgress()
      }, 500)
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
    stopExport() {
      this.isExporting = false
    },

    handleDownload(alldata) {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = this.export.header
        const filterVal = this.export.field2
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: this.export.title,
          autoWidth: true,
          maxWidth: 80,
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
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    },

    handleCommand(command) {
      const { id, data } = command
      switch (id) {
        case 'handleExportTable':
          this.handleExportTable(data)
          break
        case 'stlist': // 查询收退情况
          this.showStList(data)
          break
        case 'viewnote': // 查看备注
          this.showNote(data)
          break

        default:
        // do nothing
      }
    },

    // 显示收退情况
    showStList(row) {
      try {
        const stobj = this.$refs['STlist']
        if (stobj) {
          stobj.showListByBill(row.djcode, row.ah)
        } else {
          this.$message.error('显示收退列表错误：对象没找到')
        }
      } catch (e) {
        console.log(e)
        this.$message.error('显示收退列表发生错误:' + e.description)
      }
    },

    fleshData() {
      this.fleshing = true
      this.listLoading = true
      caseapi.plugins.dgkreport_calc(this.fleshye).then((res) => {
        this.fleshing = false
        this.listQuery.page = 1
        this.getReport()
      })
    },

    // 控制是否显示
    checkFieldShow(fieldname, value) {
      for (let i = 0; i < this.fieldList.length; i++) {
        const field = this.fieldList[i]
        if (field.field == fieldname) {
          this.fieldList[i].export = value
          this.fieldList[i].show = value

          break
        }
      }
    },

    clicklink(code) {
      // console.log("clicklink", code);
      this.activeName = code
    },
    tableRowClassName({ row, rowIndex }) {
      const leftdays = row.leftdays

      if (leftdays >= 0 && leftdays <= 5) {
        return 'row-warning'
      } else if (leftdays < 0) {
        return 'row-danger'
      }
      return ''
    },
    async handleExport_table() {
      this.downloadLoading = true

      // console.log("handleExportTable:", typeinfo);

      const query = Object.assign({}, this.listQuery)
      query['page'] = 1
      query['pagesize'] = 99999
      query['code'] = 'ALL'
      const res = await caseapi.plugins.dgkreport_getList(query)

      const alldata = []
      const filterVal = this.export.field2
      for (const k in res) {
        const item = res[k]
        const info = {}
        info['sheet'] = item.info.label + '(' + item.total.num + ')'
        info['head'] = this.export.header
        for (let j = 0; j < item.items.length; j++) {
          item.items[j]['_index'] = j + 1
        }

        info['data'] = this.formatJson_new(filterVal, item.items)
        alldata.push(info)
      }
      const filename = '代管款台账'

      const excel = await import('@/vendor/Export2Excel')
      excel.export_json_to_excel_multiTabs({
        alldata: alldata,
        filename: filename
      })
      // this.listLoading = false

      this.downloadLoading = false

      // this.listLoading = false

      this.downloadLoading = false
    },
    func_base64_to_blob(data, mime) {
      data = window.atob(data)
      var ia = new Uint8Array(data.length)
      for (var i = 0; i < data.length; i++) {
        ia[i] = data.charCodeAt(i)
      }
      return new Blob([ia], {
        type: mime
      })
    },

    formatJson_new(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((field) => {
          // 判断是否居右，如果居右，则说明是数字
          const j = field.field
          if (field.align && field.align === 'right') {
            return v[j] - 0
          } else {
            return v[j]
          }
        })
      )
    },
    async handleExportTable(index) {
      this.downloadLoading = true
      const info = this.detailList[index]
      const code = info.info.code
      console.log('handleExportTable:', info)

      const query = Object.assign({}, info.query)
      query['page'] = 1
      query['pagesize'] = 99999
      const res = await caseapi.plugins.dgkreport_getList(query)
      const alldata = res[code].items

      for (let i = 0; i < alldata.length; i++) {
        alldata[i]['_index'] = i + 1
      }

      import('@/vendor/Export2Excel').then((excel) => {
        const filterVal = this.export.field2
        const tHeader = this.export.header
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: info.info.label,
          // filename: "table-list"
          filename: '代管款台账_' + info.info.label
        })
      })

      // this.listLoading = false

      this.downloadLoading = false
    },
    handleQuery(row) {
      this.showStList(row)
    },
    showNote(row) {
      this.noteinfo.username = ''
      this.noteinfo.createtime = ''
      this.noteinfo.note = ''
      this.noteinfo.updatetime = ''
      this.noteinfo.info = null
      this.noteinfo.info = Object.assign({}, row)
      caseapi.plugins.getNote(row).then((res) => {
        if (res) {
          this.noteinfo.username = res.username
          this.noteinfo.createtime = res.createtime
          this.noteinfo.note = res.note
          this.noteinfo.updatetime = res.updatetime
        }

        this.$nextTick(() => {
          this.noteinfo.showWin = true
        })
      })
    },

    async addNote() {
      console.log('addNote > noteinfo', this.noteinfo)

      const billno = this.noteinfo.info.billno || ''
      const caseinfo = this.noteinfo.info.caseinfo || ''
      const note = this.noteinfo.note
      const bankdate = this.noteinfo.info.bankdate || ''
      if (!note || note.length < 3) {
        this.$alert('备注不能少于3个字')
        return false
      }

      const query = {
        note: note,
        billno: billno,
        caseinfo: caseinfo,
        bankdate: bankdate
      }
      const res = await caseapi.plugins.addNote(query)

      this.$alert('保存成功')
      this.freshAllList()
      this.$nextTick(() => {
        this.noteinfo.showWin = false
      })
      // this.getDetail();
    },

    freshAllList() {
      for (let i = 0; i < this.detailList.length; i++) {
        const code = this.detailList[i].info.code
        this.getDetail(code)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.report-chart {
  margin-top: 100px;
}

.filter-item {
  margin-left: 10px;
}
</style>
<style>
.el-table .row-danger {
  background: rgb(253, 226, 226);
}

.el-table .row-warning {
  background: rgb(250, 236, 216);
}
</style>
