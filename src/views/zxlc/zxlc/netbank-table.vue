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
      />处理状态
      <el-select
        v-model="listQuery.read"
        placeholder="是否已处理"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="全部" value="-1" />
        <el-option label="未处理" value="0" />
        <el-option label="已处理" value="1" />
      </el-select>
      <br>
      <el-select
        v-model="listQuery.timetype"
        placeholder="根据时间筛选"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <template v-for="ttype in querytimeList">
          <el-option :key="ttype.classcode" :label="ttype.classname" :value="ttype.classcode" />
        </template>
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
      />

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
      <el-table-column type="selection" label="选择" />
      <el-table-column label="案件信息" prop="casenum" align="center" width="200" sortable="casenum">
        <template slot-scope="{row}">
          <span>{{ row.ah }}</span>
          <br>
          <span>{{ row.deptname }} / {{ row.cbr }}</span>
          <br>
          <span>立案时间：{{ row.larq }}</span>
          <br>
          <span>案件标的：{{ row.labd }}元</span>
        </template>
      </el-table-column>
      <el-table-column label="当事人" prop="bzxr" align="center" width="200" sortable="bzxr">
        <template slot-scope="{row}">
          <span>{{ row.bzxr }}</span>
          <br>
          <span>{{ row.zjhm }}</span>
        </template>
      </el-table-column>
      <el-table-column label="网络账户" prop="xcdw" align="center" width="220" sortable="xcdw">
        <template slot-scope="{row}">
          <span>{{ row.xcdw }}</span>
          <br>
          <span>{{ row.khzh }}</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" prop="kyzcse" align="center" width="180" sortable="casenum">
        <template slot-scope="{row}">
          <span>余额：{{ row.zcse }}</span>
          <br>可用：
          <span class="money">{{ row.kyzcse }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检查时间" prop="querytime" align="center" width="250" sortable="querytime">
        <template slot-scope="{row}">
          <span>查询时间：{{ row.querytime }}</span>
          <br>
          <span>反馈时间：{{ row.fksj }}</span>
          <br>
          <span>检测时间：{{ row.updateTime ? row.updateTime : row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <template v-if="row.readed==1">
            <el-link icon="el-icon-edit" @click="handleRead(row)">已处理</el-link>
            <br>
            ({{ row.readtime }})
          </template>
          <template v-else>
            <el-button type="success" size="mini" icon="el-icon-check" @click="handleRead(row)">处理</el-button>
          </template>
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
          <el-tag>{{ temp.readed ? "我已处理" : "未处理" }}</el-tag>
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
  name: 'NetBankTable',
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
        timetype: '',
        time1: '',
        time2: ''
      },
      checkedList: [],
      querytimeList: [],

      type: 'netbank',
      // 导出的相关配置
      export: {
        title: '网络银行账户信息',
        header: [
          'ID',
          '承办部门',
          '承办人',
          '案号',
          '立案日期',
          '立案标的',
          '当事人',
          '开户单位',
          '网络账号',
          '余额',
          '可用余额',
          '查询发起时间',
          '反馈时间',
          '更新查询时间',
          '处理时间'
        ],
        field: [
          'id',
          'deptname',
          'cbr',
          'ah',
          'larq',
          'labd',
          'bzxr',
          'xcdw',
          'khzh',
          'zcse',
          'kyzcse',
          'querytime',
          'fksj',
          'updateTime',
          'readtime'
        ]
      },

      temp: {
        id: 0,
        ahdm: '',
        ah: '',
        bzxr: '',
        zhlb: '',
        zh: '',
        ye: '',
        kyye: '',
        note: '',
        readed: 0,
        readtime: '',
        readnote: ''
      }
    }
  },

  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      postdata('/data/list', { type: 'querytime' }).then((res) => {
        const resdata = res.data
        this.querytimeList = resdata.items
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/zxlc/query', this.listQuery).then((response) => {
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
      postdata('/zxlc/down', this.listQuery).then((res) => {
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

    handleRead(row) {
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
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = prop + '+'
      } else if (order === 'descending') {
        this.listQuery.sort = prop + '-'
      } else {
        this.listQuery.sort = null
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
