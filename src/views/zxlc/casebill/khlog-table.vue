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
      </el-input>
     
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
      @sort-change="sortChange"
      
    >
      <!-- <el-table-column type="selection" label="选择" /> -->
      <el-table-column
      type="index"
      label="序号"
      align="center"
      width="50"
      :index="indexMethod">
     

    </el-table-column>
<el-table-column label="案号信息" prop="caseinfo" align="center" width="250" >
  <template slot-scope="{row}">
          <span>{{ row.caseinfo }}</span>
          <br>立案：{{row.larq}}
        
         
          
          
        </template>
      </el-table-column>
     
     <el-table-column label="查询结果" prop="ajresult" align="center" width="250" >
  <template slot-scope="{row}">
          <span>{{ row.ajresult }}</span>
        
         
          
          
        </template>
      </el-table-column>
     
      

      
<el-table-column label="任务时间" align="center" prop="starttime" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <span>开始：{{ row.querystart }}</span>
        <br><span>结束：{{ row.queryend }}</span>
         
          
          
        </template>
      </el-table-column>
      <el-table-column label="查询" align="center" prop="starttime" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <span>开始：{{ row.starttime }}</span>
        <br><span>结束：{{ row.endtime }}</span>
         
          
          
        </template>
      </el-table-column>
    </el-table>

    

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
  name: 'KhLogTable',
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
        time2: '',
        sort:''
      },
      checkedList: [],
      querytimeList: [],

      type: 'khlog',
      // 导出的相关配置
      export: {
        title: '查询日志表',
        header: [
          '案号',
          '查询时间',
          '结束时间',
          '查询结果',
          '立案日期',
          '任务开始日期',
          '任务结束日期'
         
        ],
        field: [
          'caseinfo',
          'starttime',
          'endtime',
          'ajresult',
          'larq',
          'querystart',
          'queryend'
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
        idkey: '',
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
    indexMethod(index){
      return (this.listQuery.page-1)*this.listQuery.pagesize+index+1
    },
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/casebill/khlog', this.listQuery).then((response) => {
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
        idkey: '',
      }
    },

    handleExport() {
      // 导出数据
      postdata('/casebill/khlogdown', this.listQuery).then((res) => {
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
        this.listQuery.sort = prop + ' asc'
      } else if (order === 'descending') {
        this.listQuery.sort = prop + ' desc'
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
