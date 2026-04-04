<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        刷新
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-document-add" @click="handleCreate">
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
      row-key="cmmbid"
      border
      fit
      default-expand-all
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column type="index" width="50" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="编号" prop="cmmbcode" align="center" width="120"/>

      <el-table-column label="名称" prop="cmmbname" align="center" width="120"/>
      <el-table-column label="性别" prop="sex" align="center" width="120"/>
      <el-table-column label="已有数量" prop="usernum" align="center" width="120" />
      <el-table-column label="状态" class-name="status-col" width="100"/>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">

          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">
            编辑
          </el-button>

          <el-button size="mini" type="danger" icon="el-icon-delete" click2="handleModifyStatus(row,'deleted')" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">

        <el-form-item label="编号" prop="cmmbcode">
          <el-input v-model="temp.cmmbcode" />
        </el-form-item>
        <el-form-item label="名称" prop="cmmbname">
          <el-input v-model="temp.cmmbname" />
        </el-form-item>

        <el-form-item label="模板名称">
          <el-select
            v-model="temp.parentid"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option label="新模板" :value="0" />
            <el-option
              v-for="item in cmmbupList"
              :key="item.cmmbid"
              :disabled="item.cmmbid == temp.cmmbid || item.parentid==temp.cmmbid|| item.parentid!=0"
              :label="item.fullname"
              :value="item.cmmbid"
            >{{ item.cmmbname }}</el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="排序" prop="rank">
          <el-input v-model="temp.rank" type="number" />
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

<!--    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确认</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import { CmmbSave, CmmbAdd, CmmbDel, CmmbNewCode } from '@/dagl/api/cmmb'

import { postdata } from '@/dagl/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'CmmbTable',
  // components: { Pagination },
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
        keyword: undefined,
        type: undefined,
        sort: '+id',
        isvoid: '0'

      },

      temp: {
        cmmbid: undefined,
        cmmbcode: '',
        cmmbname: '',
        parentid: 0,
        telphone: '',
        isvoid: 0

      },
      cmmbList: [],
      cmmbupList: [],

      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑信息',
        create: '创建模板'
      },
      dialogPvVisible: false,
      /* pvData: [], */

      downloadLoading: false,
      rules: {
        cmmbcode: [{ required: true, message: '代码不能为空', trigger: 'change' }],
        cmmbname: [{ required: true, message: '名称不能为空', trigger: 'change' }]

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

      postdata('/cmmb/tree').then((response) => {
        this.list = response.data.tree
        this.cmmbList = response.data.list
        var tmp=[]
        this.total = response.data.total

        for (var i in this.cmmbList ){
          if(this.cmmbList[i]['parentid']==0){
            tmp.push(this.cmmbList[i])
          }
        }
        this.cmmbupList=tmp
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
      // CmmbList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.total = response.data.total

      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 0.5 * 100)
      // })
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
        cmmbid: undefined,
        cmmbcode: '',
        cmmbname: '',
        isvoid: 0,
        telphone: ''

      }
      CmmbNewCode().then((response) => {
        // console.log(response)
        const newcode = response.data
        this.temp.cmmbcode = newcode
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
          this.temp.cmmbid = 0

          CmmbAdd(this.temp).then(response => {
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
      this.temp.children = null

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          CmmbSave(this.temp).then(response => {
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
      this.$confirm('此操作将删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        CmmbDel({ cmmbid: row.cmmbid }).then(response => {
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

/*    handleDownload() {
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
    }, */
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
  }
}
</script>
