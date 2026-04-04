<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字，如姓名,手机号码"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <el-select
        v-model="listQuery.deptcode"
        placeholder="请选择部门"
        clearable
        style="width: 250px"
        multiple
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in DeptList"
          :key="item.deptcode"
          :label="item.deptname"
          :value="item.deptcode"
        />
      </el-select>
      <el-select
        v-model="listQuery.isvoid"
        placeholder="请选择状态"
        clearable
        style="width: 120px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="所有" value />
        <el-option label="正常" value="0" />
        <el-option label="停用" value="1" />
      </el-select>

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >新增</el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>-->
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
      <el-table-column label="用户代码" prop="usercode" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.usercode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门" prop="deptname" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.deptname }}</span>
        </template>
      </el-table-column>

      <el-table-column label="姓名" prop="id" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="手机号码" prop="id" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户标签" prop="userlabel" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.userlabel | joinstr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.isvoid | statusFilter">{{ row.isvoid=="0" ? "正常":"停用" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>

          <el-button
            size="mini"
            type="danger"
            click2="handleModifyStatus(row,'deleted')"
            @click="handleDelete(row)"
          >删除</el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="用户姓名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="用户代码" prop="usercode">
          <el-input v-model="temp.usercode" />
        </el-form-item>

        <el-form-item label="部门" prop="deptcode">
          <el-select
            v-model="temp.deptcode"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in DeptList"
              :key="item.deptcode"
              :label="item.deptname"
              :value="item.deptcode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="用户权限" prop="usergroup">
          <el-select
            v-model="temp.usergroup"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            multiple
          >
            <el-option
              v-for="group in GroupList"
              :key="group.groupid"
              :label="group.groupname"
              :value="group.groupid"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="temp.mobile" />
        </el-form-item>
        <el-form-item label="座机电话" prop="telphone">
          <el-input v-model="temp.telphone" />
        </el-form-item>
        <el-form-item label="证件号码" prop="cardno">
          <el-input v-model="temp.cardno" />
        </el-form-item>
        <!-- <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item> -->
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="temp.userpass" placeholder="留空不修改密码" show-password />
        </el-form-item>
        <el-form-item v-if="temp.userpass!=''" label="重复密码" prop="password2">
          <el-input v-model="temp.userpass2" show-password />
        </el-form-item>

        <el-form-item label="常用庭室" prop="orderroom">
          <el-select
            v-model="temp.useroom"
            placeholder="请选择常用庭室"
            style="width:100%"
            class="filter-item"
          >
            <el-option
              v-for="item in roomList"
              :key="item.roomcode"
              :label="item.roomname"
              :value="item.roomname"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="书记员" prop="linksjy">
          <el-select
            v-model="temp.linksjy"
            placeholder="请选择默认书记员"
            style="width:100%"
            class="filter-item"
            filterable
            clearable
          >
            <el-option
              v-for="item in allUserList"
              :key="item.userid"
              :label="item.username"
              :value="item.userid"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="用户标签" prop="userlabel">
          <el-select
            v-model="temp.userlabel"
            style="width:100%"
            class="filter-item"
            placeholder="请选择用户角色标签，支持多选"
            clearable
            multiple
          >
            <el-option
              v-for="label in labelList"
              :key="label.label"
              :label="label.label"
              :value="label.label"
            />
          </el-select>
        </el-form-item>-->
        <el-form-item label="备注">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="您可以填定用户备注"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="isvoid2" active-color="#13ce66" inactive-color="#ff4949" />
          <el-tag>{{ isvoid2 ? "正常" : "停用" }}</el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
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

import { postdata } from '@/api/common'

import { userlist, userupdate, useradd, userdel } from '@/api/zxlc/user'
import { DataList, LabelList } from '@/api/zxlc/data'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'js-md5'

const DeptList = [{ deptid: '', deptcode: '', deptname: '' }]

export default {
  name: 'UserTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === '0' ? 'success' : 'danger'
    },
    joinstr(str) {
      if (typeof str === 'string') {
        str = str.split(',')
      }
      if (Array.isArray(str)) {
        return str.join(' / ')
      }
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
        keyword: undefined,
        deptcode: [],
        isvoid: '0'
      },
      DeptList,
      GroupList: [],
      labelList: [],
      allUserList: [],
      temp: {
        userid: undefined,
        deptcode: '',
        usercode: '',
        username: '',
        linksjy: 0,
        isvoid: 0,
        userpass: '',
        userpass2: '',
        telphone: '',
        mobile: '',
        cardno: '',
        bankcard: '',
        avatar: '',
        note: '',
        usergroup: [],
        userlabel: [],
        useroom: ''
      },
      roomList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '创建用户'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        usercode: [
          { required: true, message: '用户代码不能为空', trigger: 'change' }
        ],
        username: [
          { required: true, message: '用户名称不能为空', trigger: 'change' }
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'change' }
        ],
        deptcode: [
          { required: true, message: '部门不能为空', trigger: 'change' }
        ],
        usergroup: [
          { required: true, message: '至少要选择一个用户组', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isvoid2: {
      get: function() {
        return (
          this.temp.isvoid === 0 ||
          this.temp.isvoid === undefined ||
          this.temp.isvoid === ''
        )
      },
      set: function(newvalue) {
        this.temp.isvoid = newvalue ? '0' : '1'
      }
    }
  },
  created() {
    this.getList()
    this.getDept()
    this.getGroupList()
    // this.getLabelList()
    // this.getRoom()
    // this.getAllUser()
  },
  methods: {
    getLabelList() {
      LabelList().then(response => {
        this.labelList = response.data
      })
    },
    getGroupList() {
      DataList({ type: 'grouplist' }).then(response => {
        this.GroupList = response.data.items
      })
    },
    getAllUser() {
      userlist({ page: 1, pagesize: 10000 }).then(response => {
        this.allUserList = response.data.items
      })
    },
    getDept() {
      DataList({ type: 'deptlist' }).then(response => {
        this.DeptList = response.data
      })
    },

    getRoom() {
      postdata('/room/list', {}).then(res => {
        const resdata = res.data
        this.roomList = resdata.items
      })
    },
    getnewcode() {
      postdata('/user/newcode', {}).then(res => {
        // console.log(res)
        this.temp.usercode = res.data
        console.log(res.data)
      })
    },
    getList() {
      this.listLoading = true
      userlist(this.listQuery).then(response => {
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
        userid: undefined,
        deptcode: '',
        usercode: '',
        username: '',
        linksjy: 0,
        isvoid: 0,
        userpass: '',
        userpass2: '',
        telphone: '',
        mobile: '',
        cardno: '',
        bankcard: '',
        avatar: '',
        note: '',
        usergroup: [],
        userlabel: []
      }
      this.temp.isvoid = 1
      this.temp.isvoid = 0
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getnewcode()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.userid = 0
          if (this.temp.userpass !== this.temp.userpass2) {
            this.$message.error('两次输入的密码不一致')
            this.temp.userpass2 = ''
            this.temp.userpass = ''
            return
          }

          let newpass = ''
          newpass = this.temp.userpass

          if (newpass !== '') {
            newpass = md5(newpass + '_salary')
          }

          const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
          newtemp.userpass = newpass

          useradd(newtemp).then(response => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: data.message,
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

      this.temp.userpass = ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
        if (newtemp.userpass !== '' && newtemp.userpass !== newtemp.userpass2) {
          this.$message.error('密码不匹配')
          return
        }
        newtemp.userpass = md5(newtemp.userpass + '_RLF2020')
        // const newpass = md5(password + '_RLF2020')
        newtemp.userpass2 = newtemp.userpass
        if (valid) {
          userupdate(newtemp).then(response => {
            // console.log(data);
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: data.message,
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
      this.$confirm('此操作将删除用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userdel(row.userid).then(response => {
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
        const filterVal = [
          'timestamp',
          'title',
          'type',
          'importance',
          'status'
        ]
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
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
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
