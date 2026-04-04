<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 300px;"
        class="filter-item"
        @change="handleFilter"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>余额
      <el-input
        v-model="listQuery.ye_min"
        clearable
        placeholder="最小余额"
        style="width: 120px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />~
      <el-input
        v-model="listQuery.ye_max"
        clearable
        placeholder="最大余额"
        style="width: 120px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />字号
      <el-select
        v-model="listQuery.casetype"
        placeholder="案件字号"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="全部" value />
        <template v-for="item in casetypeList">
          <el-option
            :key="item.casetypename"
            :label="item.casetypename"
            :value="item.casetypename"
          />
        </template>
      </el-select>
      <br>
      <el-select
        v-model="listQuery.timetype"
        placeholder="根据时间筛选"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option label="立案时间" value="larq" />
        <el-option label="联查时间" value="query" />
      </el-select>
      <el-date-picker
        v-model="listQuery.time1"
        type="date"
        placeholder="起始日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />
      <el-date-picker
        v-model="listQuery.time2"
        type="date"
        placeholder="截止日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />查控情况
      <el-select
        v-model="listQuery.enough"
        placeholder="查控情况"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter_type"
      >
        <el-option label="全部" value="-1" />
        <el-option label="所有已联查" value="2" />
        <el-option label="足额案件" value="1" />
        <el-option label="标的10%以上" value="10%" />
        <el-option label="标的20%以上" value="20%" />
        <el-option label="未发起联查" value="-2" />
      </el-select>

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >导出</el-button>

      <el-button
        v-if="checkedList.length"
        v-waves
        class="filter-item"
        icon="el-icon-check"
        type="primary"
        @click="handleBatch"
      >批量处理{{ checkedList.length }}项</el-button>

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      stripe
      fit
      highlight-current-row
      style="width: 100%;"
      height="600px"
      @selection-change="changeCheck"
      @sort-change="sortChange"
    >
      <el-table-column label="案件信息" prop="casenum" sortable="custom" align="center" width="250" :class-name="getSortClass('casenum')">
        <template slot-scope="{row}">
          <span>{{ row.caseinfo }}</span>
          <br>
          <span>{{ row.deptname }} / {{ row.cbrmc }}</span>
          <br>
          <span>立案时间：{{ row.larq }}</span>
          <br>
          <span v-if="row.querytime">查询：{{ row.querytime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="查控概览" prop="cxinfo" align="center" width="220">
        <template slot-scope="{row}">
          <span>发起{{ row.cknum }}次</span>
          <br>
          <span>案件标的：{{ row.labd }}元</span>
          <br>
          <span>可用金额：{{ row.totalje }} 元</span>
        </template>
      </el-table-column>
      <el-table-column label="是否足额" prop="sfze" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.totalje - row.labd >=0 ? '足额' : '不足额' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="银行/网络银行" prop="ye" align="center" width="180">
        <template slot-scope="{row}">
          <span>银行：{{ row.yhje }}</span>
          <br>网络银行：
          <span>{{ row.wlyhje }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其它财产线索" prop="other" align="center" width="180">
        <template slot-scope="{row}">
          <span>车辆：{{ row.carnum }} 辆</span>
          <br>
          <span>不动产：{{ row.bdcnum }} 处</span>
          <!-- <br>
          <span>证券：{{ row.zqnum }}</span>-->
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button
            type="success"
            size="mini"
            icon="el-icon-view"
            @click="gotoCase(row.caseinfo)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-loading="saveLoading" title="处理标志" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="处理状态">
          <el-switch
            v-model="temp.readed"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value
          />
        </el-form-item>
        <el-form-item label="处理时间" prop="readtime">
          <el-date-picker v-model="temp.readtime" type="datetime" placeholder="请选择处理时间" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.readnote"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="本次操作的备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRead()">我已处理</el-button>
      </div>
    </el-dialog>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { postdata } from '@/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'CaselistTable',
  components: { Pagination },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      downloadLoading: false,
      dialogFormVisible: false,
      saveLoading: false,
      listQuery: {
        type: '',
        page: 1,
        pagesize: 10,
        read: '0',
        keyword: undefined,
        ye_min: undefined,
        ye_max: undefined,
        casetype: undefined,
        timetype: '',
        time1: '',
        time2: '',
        enough: '2',
        sort: undefined
      },
      checkedList: [],
      querytimeList: [],
      casetypeList: [],

      type: 'bank',
      // 导出的相关配置
      export: {
        title: '案件查控情况表',
        header: [
          '承办部门',
          '承办人',
          '案号',
          '立案日期',
          '立案标的',
          '查控次数',
          '有余额银行账户',
          '银行总余额',
          '有余额网络资金',
          '网络资金余额',
          '银行与网络资金总余额',
          '房产数量',
          '车辆数量',
          '证券',
          '工商信息',
          '最新查询',
          '更新查询时间'
        ],
        field: [
          'deptname',
          'cbrmc',
          'caseinfo',

          'larq',
          'labd',
          'cknum',
          'yhnum',
          'yhje',
          'wlyhnum',
          'wlyhje',
          'totalje',
          'bdcnum',
          'carnum',
          'zqnum',
          'gsnum',
          'querytime',
          'updateTime'
        ]
      },

      temp: {
        id: 0,
        ahdm: '',
        ah: '',
        bzxr: '',
        khh: '',
        khxx: '',
        ye: '',
        kyye: '',
        note: '',
        readed: 0,
        readtime: '',
        readnote: ''
      }
    }
  },
  mounted() {
    // console.log("caselist-table mounted");
    this.init()
    this.getList()
  },
  created() {

    // console.log("caselist-table - created");
    // this.init();
    // this.getList();
  },
  methods: {
    init() {
      postdata('/data/list', { type: 'querytime' }).then((res) => {
        const resdata = res.data
        this.querytimeList = resdata.items
      })

      postdata('/case/casetype').then((res) => {
        const resdata = res.data
        this.casetypeList = resdata
      })
    },
    gotoCase(caseinfo) {
      const link = '/zxlc-caselist/cxlog-table'
      const query = { caseinfo: caseinfo }
      this.$router.push({ path: link, query: query })
    },
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/zxlc/querycase', this.listQuery).then((response) => {
        this.list = response.data
        this.total = response.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    saveRead() {
      this.saveLoading = true
      const data = {
        type: this.type,
        id: this.temp.id,
        readed: this.temp.readed,
        readtime: this.temp.readtime,
        readnote: this.temp.readnote
      }

      postdata('/zxlc/updateread', data).then((res) => {
        this.$message(res.message)
        this.saveLoading = false
        this.dialogFormVisible = false
        this.getList()
      })
    },

    resetTemp() {
      this.temp = {
        id: 0,
        ahdm: '',
        ah: '',
        bzxr: '',
        khh: '',
        khxx: '',
        ye: '',
        kyye: '',
        note: '',
        readed: 0,
        readtime: '',
        readnote: ''
      }
    },

    handleExport() {
      // 导出数据
      postdata('/zxlc/downcase', this.listQuery).then((res) => {
        const alldata = res.data
        this.handleDownload(alldata)
      })
    },

    handleBatch(row) {
      this.temp = {
        id: this.checkedList,
        readed: false,
        readtime: parseTime(new Date()),
        readnote: ''
      }

      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    handlePrint(row) {
      this.temp = Object.assign({}, row) // copy obj

      // 初始化阅读时间

      if (this.temp.readtime === '' || this.temp.readtime == null) {
        this.temp.readtime = parseTime(new Date())
      }

      this.temp.readed = this.temp.readed === 1
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    changeCheck(val) {
      this.checkedList = []
      val.forEach((item) => {
        this.checkedList.push(item.id)
      })
    },

    sortChange(data) {
      const { prop, order } = data
      if (prop === 'casenum') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'casenum asc'
      } else {
        this.listQuery.sort = 'casenum desc'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },

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
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    handleFilter_type() {
      const val = this.listQuery.enough
      switch (val) {
        case '1':
          this.listQuery.ye_min = '100%'
          this.listQuery.ye_max = ''
          break
        case '10%':
          this.listQuery.ye_min = '10%'
          this.listQuery.ye_max = ''
          break
        case '20%':
          this.listQuery.ye_min = '20%'
          this.listQuery.ye_max = ''
          break
      }
      this.handleFilter()
    }
  }
}
</script>
<style>
.money {
  font-size: 16px;
  color: #f56c6c;
}
</style>
