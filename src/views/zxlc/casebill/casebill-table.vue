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
      />

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
    >
      <!-- <el-table-column type="selection" label="选择" /> -->
      <el-table-column
        type="index"
        label="序号"
        align="center"
        width="50"
        :index="indexMethod"
      />
      <el-table-column label="单据号" prop="djcode" align="center" width="80" />
      <el-table-column label="款项来源" prop="kxly" align="center" width="100" />
      <el-table-column label="缴款单位" prop="jkdw" align="center" width="220" sortable="khh">
        <template slot-scope="{row}">
          <span>{{ row.jkdw }}</span>
          <br>
          备注：<span>{{ row.note }}</span>
          <br>
          入账账号：<span>{{ row.fullaccount }}</span>

        </template>
      </el-table-column>
      <!-- <el-table-column label="入账账号" prop="fullaccount" align="center" width="220" sortable="khh">
        <template slot-scope="{row}">
          <span>{{ row.fullaccount }}</span>

        </template>
      </el-table-column> -->
      <el-table-column label="余额" prop="ye2" align="center" width="180" sortable="kyye">
        <template slot-scope="{row}">
          <span>入账余额：{{ row.ye }}</span>
          <br>待认领：
          <span class="money">{{ row.ye2 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入账信息" prop="querytime" align="center" width="250" sortable="querytime">
        <template slot-scope="{row}">
          <span>到账时间：{{ row.skdate }}</span>
          <br>
          <span>制单时间：{{ row.zhidandate }}</span>
          <br>
          <span>制单人：{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="{row}">

          <el-button type="success" size="mini" icon="el-icon-search" @click="handleRead(row)">智能匹配</el-button>
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
  name: 'CasebillTable',
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

      type: 'casebill',
      // 导出的相关配置
      export: {
        title: '不明款项表',
        header: [
          'ID',
          '单据号',
          '款项来源',
          '入账时间',
          '制单时间',
          '入账金额',
          '可用余额',
          '缴款单位',
          '入账账号',
          '银行流水号'
        ],
        field: [
          'id',
          'djcode',
          'kxly',
          'skdate',
          'zhidandate',
          'je',
          'ye2',
          'jkdw',
          'fullaccount',
          'idkey'
        ]
      },

      temp: {
        id: 0,
        djcode: '',
        kxly: '',
        skdate: '',
        zhidandate: '',
        je: '',
        ye2: '',
        jkdw: '',
        fullaccount: '',
        idkey: ''
      }
    }
  },

  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {

    },
    indexMethod(index) {
      return (this.listQuery.page - 1) * this.listQuery.pagesize + index + 1
    },
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/casebill/query', this.listQuery).then((response) => {
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
        djcode: '',
        kxly: '',
        skdate: '',
        zhidandate: '',
        je: '',
        ye2: '',
        jkdw: '',
        fullaccount: '',
        idkey: ''
      }
    },

    handleExport() {
      // 导出数据
      postdata('/casebill/down', this.listQuery).then((res) => {
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
