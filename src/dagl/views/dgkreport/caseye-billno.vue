<template>
  <div class="app-container">
    <div>
      <div class="filter-container">
        <!-- <span class="filter-item">数据类型</span>
        <el-select v-model="fleshye.yetype" style="width: 120px" class="filter-item">
          <el-option
            v-for="(item, index) in basedata.yestatusList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
        <span class="filter-item">余额截止日期</span>
        <el-date-picker v-model="fleshye.endtime" type="date" placeholder="截止日期" style="width: 150px"
          value-format="yyyy-MM-dd" class="filter-item" />
        <el-button v-waves class="filter-item" type="danger" :icon="fleshing ? 'el-icon-loading' : 'el-icon-refresh'"
          :disabled="fleshing" @click="fleshData">重新计算</el-button>


        <span v-if="fleshye.lasttime" class="filter-item">数据刷新时间：{{ fleshye.lasttime }}，余额截止时间为{{ fleshye.endtime
        }}</span>
      </div>

      <div class="filter-container">
        <el-input v-model="listQuery.keyword" clearable placeholder="请输入关键字" style="width: 300px" class="filter-item"
          @keyup.enter.native="handleFilter">
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
        <!-- <span class="filter-item">时间范围：</span>

        <el-date-picker v-model="listQuery.starttime" type="date" placeholder="起始日期" style="width: 150px"
          value-format="yyyy-MM-dd" class="filter-item" />
        <span class="filter-item">~</span>

        <span class="filter-item">截止日期：</span>
        <el-date-picker v-model="listQuery.endtime" type="date" placeholder="截止日期" style="width: 150px"
          value-format="yyyy-MM-dd" class="filter-item" /> -->

        <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" icon="el-icon-search"
          @click="handleFilter">搜索</el-button>




        <el-dropdown split-button type="primary" icon="el-icon-download" trigger="click" class="filter-item"
          @command="handleCommand" @click="handleExport_table">
          <i class="el-icon-download" />导出数据
          <el-dropdown-menu slot="dropdown">
            <!-- <el-dropdown-item icon="el-icon-download"
                            :command="{ id: 'handleExport_table' }">导出总表</el-dropdown-item> -->
            <template v-for="(tab, index) in detailList">
              <el-dropdown-item icon="el-icon-download" :command="{ id: 'handleExportTable', data: index }">导出{{
                tab.info.label }}</el-dropdown-item>

            </template>
          </el-dropdown-menu>
        </el-dropdown>
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






      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="汇总统计" name="count">
          <div class="report-chart">
            <el-row :gutter="10" class="panel-group">
              <template v-for="(item, index) in countList">
                <el-col :span="6">
                  <count-card :key="index" :cardname="item.label" :num="item.num" :money="item.ye" :icon="item.icon"
                    :code="item.code" @clicklink="clicklink" />
                </el-col>
              </template>
            </el-row>
          </div>
        </el-tab-pane>

        <template v-for="(item, index) in detailList">
          <el-tab-pane :label="item.info.label + '(' + item.total.num + ')'" :name="item.info.code">

            <el-table v-loading="listLoading" :data="item.items" border fit highlight-current-row style="width: 100%"
              :row-class-name="tableRowClassName">
              <el-table-column type="index" width="80" align="center" label="序号">
                <template slot-scope="{ $index }">
                  {{ $index + item.query.pagesize * (item.query.page - 1) + 1 }}
                </template>
              </el-table-column>
              <template v-for="field in fieldList">
                <template v-if="field.show">
                  <el-table-column :key="field.field" :label="field.label" :prop="field.field"
                    :align="field.align ? field.align : 'center'" :width="field.width ? field.width : 120"
                    :sortable="field.order ? 'custom' : false">
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


              <el-table-column label="操作" align="center" width="150" fixed="right"
                class-name="small-padding fixed-width">
                <template slot-scope="{ row }">
                  <el-dropdown split-button type="primary" icon="el-icon-edit" trigger="click" @click="handleQuery(row)"
                    @command="handleCommand">
                    <i class="el-icon-edit" />查询
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item icon="el-icon-view"
                        :command="{ id: 'stlist', data: row }">查询收退</el-dropdown-item>
                      <el-dropdown-item icon="el-icon-edit"
                        :command="{ id: 'viewnote', data: row }">备注</el-dropdown-item>

                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>


            </el-table>

            <div v-if="item.total.num" class="courtcase-countinfo">
              当前记录数
              <el-tag> {{ item.total.num }} </el-tag>
              笔，现有余额<el-tag>{{ formatNumber(item.total.ye) }}元</el-tag>
            </div>
            <pagination v-show="item.total.num > 0" :total="item.total.num" :page.sync="item.query.page"
              :limit.sync="item.query.pagesize" @pagination="getDetail(item.info.code)" />
          </el-tab-pane>
        </template>
      </el-tabs>






    </div>

    <el-dialog title="单据备注" :visible.sync="noteinfo.showWin" :close-on-click-modal="false">
      <el-form ref="dataForm" label-position="left" label-width="120px" style="width: 600px; margin-left:50px;">

        <el-form-item label="单据信息" v-if="noteinfo.info">
          单据号：【{{ noteinfo.info.billno }}】，案号：【{{ noteinfo.info.caseinfo }}】
        </el-form-item>
        <el-form-item label="备注内容">
          <el-input v-model="noteinfo.note" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" maxlength="180"
            show-word-limit />
        </el-form-item>
        <el-form-item label="信息" v-if="noteinfo.username">操作员：{{ noteinfo.username }}，
          首次备注时间：{{ noteinfo.createtime }}<template v-if="noteinfo.updatetime != noteinfo.createtime">，最后一次修改时间：{{
            noteinfo.updatetime
          }}</template>。</el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="noteinfo.showWin = false">取消</el-button>
        <el-button type="primary" @click="addNote">保存</el-button>
      </div>
    </el-dialog>


    <div id="temp_html2text" style="display: none" />
    <Caselog ref="caselog" />
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
  { field: '_index', label: '序号', export: true, show: false },
  { field: 'id', label: 'ID', export: false, show: false },
  // { field: 'typename', label: '款项类型', export: true, show: true },
  { field: 'days', label: '留存时间', export: true, show: true, width: 100 },
  { field: 'leftdays', label: '超期剩余天数', export: true, show: true, width: 120 },
  {
    field: 'enddate',
    label: '截止日期',
    export: true,
    show: true,
    order: true
  },

  { field: 'billno', label: '单据号', export: true, show: true, order: true },
  { field: 'caseinfo', label: '案号', export: true, show: true, width: 220 },

  // {
  //   field: 'operdate',
  //   label: '开票日期',
  //   export: true,
  //   show: true,
  //   order: true
  // },
  {
    field: 'bankdate',
    label: '入账日期',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'yhzt',
    label: '延缓状态',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'yhlx',
    label: '延缓类型',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'yhreason',
    label: '延缓原因',
    export: true,
    show: true,
    width: 200,
    order: true
  },
  {
    field: 'note',
    label: '备注',
    export: true,
    show: true,
    width: 200,
    order: true
  },
  {
    field: 'noteuser',
    label: '备注用户',
    export: true,
    show: true,
    width: 200,
    order: true
  },
  {
    field: 'notetime',
    label: '备注时间',
    export: true,
    show: true,
    width: 180,
    order: true
  },
  // { field: 'ay', label: '案由', export: true, show: true, width: 140 },
  // { field: 'yg', label: '申请执行人', export: true, show: true, width: 140 },
  { field: 'dsr', label: '当事人', export: true, show: true, width: 160 },
  // { field: 'larq', label: '立案日期', export: true, show: true, width: 140 },
  // { field: 'jarq', label: '结案日期', export: true, show: true, width: 140 },
  // { field: 'bd', label: '标的', export: true, show: true, align: 'right', width: 140 },


  // {
  //   field: 'dwname',
  //   label: '缴款单位',
  //   export: true,
  //   show: true,
  //   width: 200,
  //   order: true
  // },

  {
    field: 'je',
    label: '收款金额',
    export: true,
    show: true,
    align: 'right',
    order: true
  },

  {
    field: 'tje',
    label: '已退金额',
    export: true,
    show: true,
    align: 'right',
    order: true
  },
  {
    field: 'ye',
    label: '余额',
    export: true,
    show: true,
    align: 'right',
    order: true
  },

  {
    field: 'deptname',
    label: '承办部门',
    export: true,
    show: true,
    order: true
  },

  { field: 'cbr', label: '承办人', export: true, show: true, order: true },
  { field: 'sjy', label: '书记员', export: true, show: true, order: true },

  { field: 'username', label: '操作员', export: true, show: true },

]

const yestatusList = [
  { value: 1, label: '有余额' },
  { value: 2, label: '余额为零' },
  { value: 3, label: '所有数据' }
]

const PAGECONFIG = {
  pagename: '代管款台账', // 标题
  typeid: 101,
  pagecode: 'caseye_bill' // 页面名称,
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
      dateRange: '',
      showcaselabel: '',

      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: undefined,
        sort: ''
      },
      basedata: {
        deptList: [],
        userList: [],
        accountList: [],
        casetypeList: [],
        casetypeClassList: [],
        yearList: [],
        dateRangeList: [],
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
      alltype: [

      ], // 所有的分类信息

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
    ...mapGetters(['name'])
  },
  watch: {
    $route() {
      this.init()
    }
  },
  created() {
    this.init()

    // this.getList()
  },
  methods: {


    /**
     * 检查地址变化，并自动进行搜索
     */
    async checkUrl() {

    },
    async init() {


      this.getLasttime();
      this.getReport();
      this.initExport()
      this.getBasedata()

    },

    async getReport() {
      const res = await caseapi.plugins.dgkreport_count();
      this.countList = res;

      const alltype = await caseapi.plugins.dgkreport_getDataRange()

      this.alltype = alltype;

      this.detailList = [];
      for (let i = 0; i < alltype.length; i++) {
        let type = alltype[i];
        let info = {};
        info['query'] = Object.assign({}, this.listQuery);
        info['query']['loading'] = false;
        info['query']['code'] = type.code;
        info['info'] = type;
        info['total'] = { num: 0, je: 0 }
        info['items'] = [];
        this.detailList.push(info);
      }

      console.log("detailList:", this.detailList);

      // 创建分级并开始获取列表

      this.getDetail('ALL');




      return true;



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

      // this.getRefreshConfig();


      return true
    },

    async getLasttime() {
      caseapi.plugins.dgkreport_getendtime().then((res) => {
        this.fleshye.endtime = res.endtime
        this.fleshye.lasttime = res.lasttime;
      });
    },

    getIndexMap() {
      let indexMap = {};
      for (let i = 0; i < this.detailList.length; i++) {
        const row = this.detailList[i];
        const scode = row.info.code;
        indexMap[scode] = i;
      }
      return indexMap;
    },
    async getDetail(code = 'ALL') {
      const indexMap = this.getIndexMap();
      this.listLoading = true;




      let query = Object.assign({}, this.listQuery);
      if (code != 'ALL') {
        const index = indexMap[code];
        query = this.detailList[index].query;
        query['code'] = code;
      }
      const res = await caseapi.plugins.dgkreport_getList(query).finally(() => {
        this.listLoading = false;

      });



      if (code == 'ALL') {
        for (let k in res) {
          const info = res[k];
          const scode = info.info.code;
          const index = indexMap[scode];
          this.detailList[index].total = info.total;
          this.detailList[index].items = info.items;
        }
      } else {
        const index = indexMap[code];
        const info = res[code];
        this.detailList[index].total = info.total;
        this.detailList[index].items = info.items;
      }

    },



    changeDateRange() {
      // 调整日期范围
      const data = caseapi.base.getDateRange(this.dateRange)
      this.listQuery.starttime = data.starttime
      this.listQuery.endtime = data.endtime
    },
    handleFilter() {
      this.listQuery.page = 1
      // this.getDetail()
      this.getReport();
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
      const maxnum = this.config.ExportConfirmNum
      if (this.config.exportConfirm) {
        try {
          let confirm = await this.$confirm(
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
      }

      if (this.total > maxnum) {
        // 做提示
        try {
          let confirm = await this.$confirm(
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

      this.exportstatus.total = this.total
      this.exportstatus.done = 0
      this.exportstatus.page = 1
      this.exportstatus.totalpage = Math.floor(this.total / this.exportstatus.pagesize)
      if (this.total > this.exportstatus.pagesize * this.exportstatus.totalpage) {
        this.exportstatus.totalpage++ // 判断分页
      }
      let alldata = []
      this.isExporting = true // 标志 是否正在导出
      this.showProgress('正在读取数据', this.exportstatus.done, this.exportstatus.total)
      for (let i = 1; i <= this.exportstatus.totalpage; i++) {
        if (!this.isExporting) {
          this.$message.error('已取消')
          return false
          // break
        }
        let query = Object.assign({}, this.listQuery)
        query.page = i
        query.pagesize = this.exportstatus.pagesize
        const res = await caseapi.report.getCaseYeBill(query)
        const data = res.items
        for (let idx = 0; idx < data.length; idx++) {
          let row = data[idx]
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
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : sort === `-${key}` ? 'descending' : ''
    },

    handleCommand(command) {
      const { id, data } = command
      switch (id) {
        case 'handleExportTable':
          this.handleExportTable(data);
          break;
        case 'stlist': // 查询收退情况
          this.showStList(data);
          break;
        case 'viewnote': // 查看备注
          this.showNote(data);
          break;

        default:
        // do nothing
      }
    },

    // 显示收退情况
    showStList(row) {
      try {
        const stobj = this.$refs["STlist"];
        if (stobj) {
          stobj.showListByBill(row.billno, row.caseinfo);
        } else {
          this.$message.error("显示收退列表错误：对象没找到");
        }
      } catch (e) {
        console.log(e);
        this.$message.error("显示收退列表发生错误:" + e.description);
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
      this.activeName = code;

    },
    tableRowClassName({ row, rowIndex }) {


      const leftdays = row.leftdays;

      if (leftdays >= 0 && leftdays <= 5) {
        return 'row-warning';
      } else if (leftdays < 0) {
        return 'row-danger';
      }
      return '';
    },
    async handleExport_table() {


      this.downloadLoading = true;

      // console.log("handleExportTable:", typeinfo);

      let query = Object.assign({}, this.listQuery);
      query['page'] = 1;
      query['pagesize'] = 99999;
      query['code'] = 'ALL';
      const res = await caseapi.plugins.dgkreport_getList(query);


      let alldata = [];
      const filterVal = this.export.field2;
      for (let k in res) {
        const item = res[k];
        let info = {};
        info['sheet'] = item.info.label + "(" + item.total.num + ")";
        info['head'] = this.export.header;
        for (let j = 0; j < item.items.length; j++) {
          item.items[j]['_index'] = j + 1;
        }


        info['data'] = this.formatJson_new(filterVal, item.items);
        alldata.push(info);
      }
      const filename = '代管款台账';

      const excel = await import('@/vendor/Export2Excel');
      excel.export_json_to_excel_multiTabs({
        alldata: alldata,
        filename: filename
      })
      // this.listLoading = false

      this.downloadLoading = false;



      // this.listLoading = false

      this.downloadLoading = false;

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
          const j = field.field;
          if (field.align && field.align === "right") {
            return v[j] - 0;
          } else {
            return v[j];
          }
        })
      );
    },
    async handleExportTable(index) {

      this.downloadLoading = true;
      const info = this.detailList[index]
      const code = info.info.code;
      console.log("handleExportTable:", info);

      let query = Object.assign({}, info.query);
      query['page'] = 1;
      query['pagesize'] = 99999;
      const res = await caseapi.plugins.dgkreport_getList(query);
      let alldata = res[code].items;

      for (let i = 0; i < alldata.length; i++) {
        alldata[i]['_index'] = i + 1;
      }

      import("@/vendor/Export2Excel").then((excel) => {

        const filterVal = this.export.field2
        const tHeader = this.export.header;
        const data = this.formatJson(filterVal, alldata);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: info.info.label,
          // filename: "table-list"
          filename: "代管款台账_" + info.info.label,
        });
      })




      // this.listLoading = false

      this.downloadLoading = false;

    },
    handleQuery(row) {

      this.showStList(row);
    },
    showNote(row) {

      this.noteinfo.username = '';
      this.noteinfo.createtime = '';
      this.noteinfo.note = "";
      this.noteinfo.updatetime = '';
      this.noteinfo.info = null;
      this.noteinfo.info = Object.assign({}, row);
      caseapi.plugins.getNote(row).then((res) => {

        if (res) {
          this.noteinfo.username = res.username;
          this.noteinfo.createtime = res.createtime;
          this.noteinfo.note = res.note;
          this.noteinfo.updatetime = res.updatetime;
        }


        this.$nextTick(() => {
          this.noteinfo.showWin = true;
        })

      })

    },

    async addNote() {


      console.log("addNote > noteinfo", this.noteinfo);

      const billno = this.noteinfo.info.billno || '';
      const caseinfo = this.noteinfo.info.caseinfo || ''
      const note = this.noteinfo.note;
      const bankdate = this.noteinfo.info.bankdate || '';
      if (!note || note.length < 3) {
        this.$alert("备注不能少于3个字")
        return false;
      }


      let query = { note: note, billno: billno, caseinfo: caseinfo, bankdate: bankdate }
      const res = await caseapi.plugins.addNote(query);

      this.$alert("保存成功");
      this.freshAllList();
      this.$nextTick(() => {
        this.noteinfo.showWin = false;
      })
      // this.getDetail();
    },

    freshAllList() {

      for (let i = 0; i < this.detailList.length; i++) {
        const code = this.detailList[i].info.code;
        this.getDetail(code);
      }

    }

  }
}
</script>
<style lang="scss" scoped>
.report-chart {

  margin-top: 100px;
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
