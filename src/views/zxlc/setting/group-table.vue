<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input v-model="listQuery.keyword" placeholder="请输入关键字" style="width: 40%;" class="filter-item" @keyup.enter.native="handleFilter"> <i slot="prefix" class="el-input__icon el-icon-search" /></el-input>

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

    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="groupid" align="center" width="120" />
      <el-table-column label="权限组代码" prop="groupcode" align="center" width="120" />
      <el-table-column label="权限组名称" prop="groupname" align="center" width="120" />
      <el-table-column label="备注信息" prop="note" align="center" width="120" />
      <el-table-column label="创建时间" prop="createtime" align="center" width="120" />
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

    <pagination v-show="total>1" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="70%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 700px; margin-left:50px;">
        <el-form-item label="代码" prop="groupcode">
          <el-input v-model="temp.groupcode" />
        </el-form-item>
        <el-form-item label="名称" prop="groupname">
          <el-input v-model="temp.groupname" />
        </el-form-item>
        <el-form-item label="权限" prop="grouprule">
          <el-transfer v-model="temp.grouprule" :data="authList" :titles="trans_title" style="Extra Small" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.note" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="备注" />
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

  </div>
</template>

<script>
import { GroupList, GroupAdd, GroupSave, GroupDel, GroupInfo } from '@/api/zxlc/group'
import { DataList } from '@/api/zxlc/data'

import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'GroupTable',
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
      trans_title: ['权限列表', '用户组权限'],

      listQuery: {
        page: 1,
        pagesize: 20,
        keyword: undefined,
        isvoid: '0'

      },
      authList: null,

      temp: {
        groupid: 0,
        groupcode: undefined,
        groupname: '',
        isvoid: '0',
        grouprule: [] // 权限组相关的动作

      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑权限组',
        create: '创建权限组'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        groupcode: [{ required: true, message: '权限组代码不能为空', trigger: 'change' }],
        groupname: [{ required: true, message: '权限组名称不能为空', trigger: 'change' }]

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
      DataList({ type: 'authlist' }).then(response => {
        const data = response.data.data

        this.authList = []
        for (var i in data) {
          var obj = { key: data[i].ruleid + '', label: data[i].ruletitle, disabled: false }
          this.authList.push(obj)
        }
      })
    },

    getList() {
      this.listLoading = true
      GroupList(this.listQuery).then(response => {
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

    resetTemp() {
      this.temp = {
        groupid: 0,
        groupcode: undefined,
        groupname: '',
        isvoid: 0,
        grouprule: [] // 权限组相关的动作
      }
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
          GroupAdd(this.temp).then(response => {
            // console.log(data);
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: response.message,
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          }).catch((error) => {
            this.$message.error('保存失败：' + error)
          })
        }
      })
    },

    handleUpdate(row) {
      // 改成从info里获取数据
      GroupInfo(row).then(response => {
        const data = response.data
        this.temp = Object.assign({}, data) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          GroupSave(this.temp).then(response => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: response.message,
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
      this.$confirm('此操作将删除用户组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        GroupDel(row).then(response => {
          this.$notify({
            title: '操作完成',
            message: response.message,
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    }
  }
}
</script>

<style>
    .el-transfer-panel{
        width: 200px;
        height: 300px;
    }
</style>
