<template>
  <div class="app-container">
    <div class="filter-container">

      <el-date-picker
        v-model="listQuery.starttime"
        type="date"
        placeholder="起始日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />
      <el-date-picker
        v-model="listQuery.endtime"
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
      >统计</el-button>

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit

      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      >
        <template slot-scope="{$index}">
          {{ $index+listQuery.pagesize*(listQuery.page-1)+1 }}
        </template>
      </el-table-column>
      <el-table-column label="小组成员" prop="username" align="center" width="200" />
      <el-table-column label="未巡检" prop="isok0" align="center" width="120" />
      <el-table-column label="巡检无异常" prop="isok1" align="center" width="120" />
      <el-table-column label="巡检有问题" prop="isok2" align="center" width="120" />
      <el-table-column label="巡检项目总数" prop="num" align="center" width="120" />

    </el-table>

  </div>
</template>

<script>
import { postdata } from '@/web/api/common'

import waves from '@/directive/waves' // waves directive

export default {
  name: 'GroupCountTable',
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === '0' ? 'success' : 'danger'
    }
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,

      listQuery: {
        page: 1,
        pagesize: 10,

        starttime: '',
        endtime: ''

      }

    }
  },
  computed: {},
  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {

    },

    getList() {
      this.listLoading = true

      postdata('/jcy/countuser', this.listQuery).then((response) => {
        this.list = response.data
        // this.total = response.total

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

    // 弹框显示
    showMsg(str) {
      this.$alert(str, '提示')
    }

  }
}
</script>

<style>
.qrcode {
  text-align: center;
  height: 100%;
  width: 100%;
}
.qrcodeimage {
  height: 256px;
  width: 256px;
  margin: auto;
  margin-bottom: 30px;
}
.qrcodetext {
  font-size: 16px;
  text-align: center;
}

.doc-input {
  width: 100%;
}

.el-checkbox__input {
  display: inline-grid;
  white-space: pre-line;
  word-wrap: break-word;
  overflow: hidden;
  line-height: 20px;
}

.el-checkbox, .el-checkbox__input {  white-space: normal;  word-break: break-all;
}

</style>
