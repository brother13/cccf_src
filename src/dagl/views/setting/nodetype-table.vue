<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input v-model="listQuery.keyword" clearable placeholder="请输入关键字" style="width: 300px;" class="filter-item" @keyup.enter.native="handleFilter"> <i slot="prefix" class="el-input__icon el-icon-search" /></el-input>
      <el-select v-model="listQuery.ajlb" placeholder="请选择案件类型" clearable style="width: 150px" multiple class="filter-item" @change="handleFilter">
        <el-option v-for="item in ajlbList" :key="item.classcode" :label="item.classname" :value="item.classcode" />
      </el-select>

      <el-select v-model="listQuery.all" placeholder="请选择类型" clearable style="width: 120px" class="filter-item" @change="handleFilter">
        <el-option label="所有" value="1" />
        <el-option label="仅本单位" value="0" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>

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
      <el-table-column label="案件类型" prop="ajlbmc" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.ajlbmc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="节点分类" prop="nodename" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.nodename }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="note" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.isvoid | statusFilter">
            {{ row.isvoid=="0" ? "正常":"停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <template v-if="row.dwid==0">
            系统内置节点
          </template>
          <template v-else>
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>

            <el-button size="mini" type="danger" click2="handleModifyStatus(row,'deleted')" @click="handleDelete(row)">
              删除
            </el-button>
          </template>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">

        <el-form-item label="分类名称" prop="nodename">
          <el-input v-model="temp.nodename" />
        </el-form-item>
        <el-form-item label="案件类型" prop="ajlb">
          <el-select v-model="temp.ajlb" placeholder="请选择案件类型" clearable style="width: 250px" class="filter-item" @change="handleFilter">
            <el-option v-for="item in ajlbList" :key="item.classcode" :label="item.classname" :value="item.classcode" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="temp.note" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="您可以填定节点备注" />
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
import { postdata } from '@/jcy/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'NodeTypeTable',
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
        pagesize: 10,
        keyword: '',
        ajlb: [],
        isvoid: '0',
        all: '0'

      },
      ajlbList: [],
      temp: {
        id: 0,
        nodename: '',
        ajlb: '',
        note: '',
        isvoid: 0

      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑分类',
        create: '创建分类'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        nodename: [{ required: true, message: '节点名称不能为空', trigger: 'change' }],
        ajlb: [{ required: true, message: '案件类型不能为空', trigger: 'change' }]

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
    this.init()
    this.getList()
  },
  methods: {
    init() {
      postdata('/data/list', { type: 'ajlb' }).then((res) => {
        const resdata = res.data
        this.ajlbList = resdata.items
      })
    },
    getList() {
      this.listLoading = true

      postdata('/nodetype/list', this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

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
        id: 0,
        nodename: '',
        nodetype: '',
        ajlb: '',
        note: '',
        isvoid: 0
      }
      this.temp.isvoid = 1
      this.temp.isvoid = 0
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
          postdata('/nodetype/add', this.temp).then(response => {
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
    resetPwd() {
      // 重置密码
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
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

        if (valid) {
          postdata('/nodetype/save', newtemp).then(response => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: '修改成功',
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
      this.$confirm('此操作将删除节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postdata('/nodetype/del', { id: row.id }).then(response => {
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
