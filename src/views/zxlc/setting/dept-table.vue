<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input v-model="listQuery.keyword" placeholder="请输入关键字,支持部门代码,部门名称" style="width: 40%;" class="filter-item" @keyup.enter.native="handleFilter"> <i slot="prefix" class="el-input__icon el-icon-search" /></el-input>
      <!-- <el-select v-model="listQuery.deptcode" placeholder="请选择部门" clearable style="width: 120px" class="filter-item">
        <el-option label="所有部门" value="" />
        <el-option v-for="item in DeptList" :key="item.code" :label="item.name" :value="item.code" />
      </el-select> -->
      <el-select v-model="listQuery.isvoid" placeholder="请选择状态" clearable style="width: 120px" class="filter-item" @change="handleFilter">
        <el-option label="所有" value="" />
        <el-option label="正常" value="0" />
        <el-option label="停用" value="1" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button> -->

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="部门代码" prop="deptcode" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.deptcode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门名称" prop="deptname" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.deptname }}</span>
        </template>
      </el-table-column>

      <el-table-column label="电话" prop="telphone" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.telphone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门人员数" prop="usernum" align="center" width="120" />

      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.isvoid | statusFilter">
            {{ row.isvoid=="0" ? "正常":"停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">

          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>

          <el-button size="mini" type="danger" click2="handleModifyStatus(row,'deleted')" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">

        <el-form-item label="部门代码" prop="deptcode">
          <el-input v-model="temp.deptcode" />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptname">
          <el-input v-model="temp.deptname" />
        </el-form-item>
        <el-form-item label="联系电话" prop="telphone">
          <el-input v-model="temp.telphone" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="isvoid2"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
          <el-tag>
            {{ isvoid2 ? "正常" : "停用" }}
          </el-tag>

        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">

        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { DeptList, DeptSave, DeptAdd, DeptDel, DeptNewCode } from '@/api/zxlc/dept'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'DeptTable',
  components: { Pagination },
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
        pagesize: 20,
        importance: undefined,
        keyword: undefined,
        type: undefined,
        sort: '+id',
        isvoid: '0'

      },
      importanceOptions: [1, 2, 3],

      temp: {
        deptid: undefined,
        deptcode: '',
        deptname: '',
        telphone: '',
        isvoid: 0

      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑部门信息',
        create: '创建新的部门'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        deptcode: [{ required: true, message: '部门代码不能为空', trigger: 'change' }],
        deptname: [{ required: true, message: '部门名称不能为空', trigger: 'change' }]

      }
    }
  },
  computed: {

    isvoid2: {
      get: function() {
        return this.temp.isvoid === 0 || this.temp.isvoid === undefined || this.temp.isvoid === ''
      },
      set: function(newvalue) {
        this.temp.isvoid = newvalue ? '0' : '1'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {

    getList() {
      this.listLoading = true
      DeptList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        deptid: undefined,
        deptcode: '',
        deptname: '',
        isvoid: 0,
        telphone: ''

      }
      DeptNewCode().then((response) => {
        // console.log(response)
        const newcode = response.data
        this.temp.deptcode = newcode
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.deptid = 0

          DeptAdd(this.temp).then(response => {
            // console.log(data);
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          })
        }
      })
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          DeptSave(this.temp).then(response => {
            // console.log(data);
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: '保存成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          })
        }
      })
    },
    handleDelete(row) {
      // 删除数据
      // 判断是否要删除
      this.$confirm('此操作将删除部门, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeptDel({ deptid: row.deptid }).then(response => {
          const data = response
          if (data.code === 20000) {
            this.$notify({
              title: '操作完成',
              message: data.message,
              type: 'success',
              duration: 2000
            })
            this.getList()
          }
        })
      })
    },

    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
