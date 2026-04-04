<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字，如姓名,手机号码"
        style="width: 300px"
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
          :key="item.deptid"
          :label="item.fullname"
          :value="item.deptid"
        >{{ item.deptname }}</el-option>
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
        style="margin-left: 10px"
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
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column type="index" width="50" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>

      <el-table-column
        label="部门"
        prop="deptname"
        align="center"
        width="150"
      />
      <el-table-column
        label="姓名"
        prop="username"
        align="center"
        width="120"
      />
      <el-table-column label="头像" prop="avatar" align="center" width="120">
        <template slot-scope="{ row }">
          <template v-if="row.avatar">
            <el-image :src="row.avatar" style="avatar" />
          </template>
          <template v-else> - </template>
        </template>
      </el-table-column>
      <el-table-column label="房间" prop="useroom" align="center" width="120" />
      <el-table-column label="电话" prop="mobile" align="center" width="200">
        <template slot-scope="{ row }">
          <ul>
            <template v-if="row.mobile">
              <li>
                手机：<span>{{ row.mobile }}</span>
              </li>
            </template>
            <template v-if="row.mobile2">
              <li>
                小号：<span>{{ row.mobile2 }}</span>
              </li>
            </template>
            <template v-if="row.telphone">
              <li>
                座机：<span>{{ row.telphone }}</span>
              </li>
            </template>
            <template v-if="row.telphone2">
              <li>
                备用：<span>{{ row.telphone2 }}</span>
              </li>
            </template>
          </ul>
        </template>
      </el-table-column>

      <el-table-column label="编制" prop="jobauth" align="center" width="120" />
      <el-table-column
        label="领导职务"
        prop="joblevel"
        align="center"
        width="120"
      />
      <el-table-column label="岗位" prop="jobpost" align="center" width="120" />
      <el-table-column
        label="政治面貌"
        prop="zzmm"
        align="center"
        width="120"
      />

      <el-table-column
        label="车牌"
        prop="licenseplate"
        align="center"
        width="120"
      />

      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{ row }">
          <el-tag :type="row.isvoid | statusFilter">{{
            row.isvoid == '0' ? '正常' : '停用'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >编辑</el-button>

          <el-button
            size="mini"
            type="danger"
            click2="handleModifyStatus(row,'deleted')"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="用户姓名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="用户代码" prop="usercode">
          <el-input v-model="temp.usercode" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="temp.gender"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in genderList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input
            v-model="temp.userpass"
            placeholder="留空不修改密码"
            show-password
            :style="{ width: dialogStatus == 'update' ? '70%' : '100%' }"
          /><el-button
            v-if="dialogStatus == 'update'"
            type="danger"
            size="mini"
            icon="el-icon-reset"
            style="width: 60px; margin-left: 10px"
            @click="resetPwd"
          >重置</el-button>
        </el-form-item>
        <el-form-item
          v-if="temp.userpass != ''"
          label="重复密码"
          prop="password2"
        >
          <el-input v-model="temp.userpass2" show-password />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptcode">
          <el-select
            v-model="temp.deptcode"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in DeptList"
              :key="item.deptid"
              :disabled="item.hasChildren"
              :label="item.fullname"
              :value="item.deptid"
            >{{ item.deptname }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="用户权限" prop="usergroup">
          <el-select
            v-model="temp.usergroup"
            style="width: 100%"
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
        <el-form-item label="头像" prop="">
          <el-upload
            class="avatar-uploader"
            action="./index.php/web/index/uploadfile"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleSuccess_thumb"
            :before-upload="beforeThumbUpload"
            :data="thumbdata"
          >
            <img v-if="temp.avatar" :src="temp.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="证件照" prop="">
          <el-upload
            class="avatar-uploader"
            action="./index.php/web/index/uploadfile"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleSuccess_photo"
            :before-upload="beforeThumbUpload_photo"
            :data="photodata"
          >
            <el-image
              v-if="temp.photo"
              :src="temp.photo"
              class="avatar"
              :preview-src-list="[temp.photo]"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>

        <el-form-item label="身份证号" prop="cardno">
          <el-input v-model="temp.cardno" />
        </el-form-item>
        <el-form-item label="手机大号" prop="mobile">
          <el-input v-model="temp.mobile" />
        </el-form-item>
        <el-form-item label="手机小号" prop="mobile2">
          <el-input v-model="temp.mobile2" />
        </el-form-item>
        <el-form-item label="办公室" prop="useroom">
          <el-input v-model="temp.useroom" />
        </el-form-item>
        <el-form-item label="办公座机" prop="telphone">
          <el-input v-model="temp.telphone" />
        </el-form-item>
        <el-form-item label="备用电话" prop="telphone2">
          <el-input v-model="temp.telphone2" />
        </el-form-item>
        <el-form-item label="车牌号码" prop="licenseplate">
          <el-input v-model="temp.licenseplate" />
        </el-form-item>

        <el-form-item label="岗位" prop="jobpost">
          <el-select
            v-model="temp.jobpost"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in jobPostList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="编制" prop="jobauth">
          <el-select
            v-model="temp.jobauth"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in jobAuthList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="政治面貌" prop="zzmm">
          <el-select
            v-model="temp.zzmm"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in zzmmList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="领导职务" prop="joblevel">
          <el-select
            v-model="temp.joblevel"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in jobLevelList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="您可以填定用户备注"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="temp.isvoid"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :inactive-value="1"
            :active-value="0"
          />
          <el-tag>{{ temp.isvoid == 0 ? '正常' : '停用' }}</el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="dialogPvVisible = false"
        >确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { userlist, userupdate, useradd, userdel } from '@/web/api/user'
import { DataList, LabelList } from '@/web/api/data'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'js-md5'
import { postdata } from '@/web/api/common'

// const DeptList = [{ deptid: '', deptcode: '', deptname: '' }]

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
      selectedFile: '',

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
      thumbdata: {
        caseid: '',
        uploadtype: 'profile',
        filetype: 'avatar'
      },
      photodata: {
        caseid: '',
        uploadtype: 'profile',
        filetype: 'photo'
      },

      DeptList: [],
      GroupList: [],
      labelList: [],
      allUserList: [],
      jobLevelList: [], // 领导级别
      jobAuthList: [], // 编制
      jobPostList: [], // 岗位
      genderList: [], // 性别
      zzmmList: [],

      temp: {
        userid: undefined,
        deptcode: '',
        usercode: '',
        username: '',
        gender: '',
        isvoid: 0,
        userpass: '',
        userpass2: '',
        telphone: '',
        mobile: '',
        mobile2: '',
        cardno: '',
        bankcard: '',
        avatar: '',
        photo: '',
        note: '',
        usergroup: [],
        userlabel: [],
        useroom: '',
        joblevel: '',
        jobpost: '',
        jobauth: '',
        zzmm: '',
        licenseplate: ''
      },
      // roomList: [],
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
        // usercode: [
        //   { required: true, message: '用户代码不能为空', trigger: 'change' }
        // ],
        username: [
          { required: true, message: '用户名称不能为空', trigger: 'change' }
        ],
        // mobile: [
        //   { required: true, message: '手机号码不能为空', trigger: 'change' }
        // ],
        deptcode: [
          { required: true, message: '部门不能为空', trigger: 'change' }
        ],
        usergroup: [
          {
            required: true,
            message: '至少要选择一个用户组',
            trigger: 'change'
          }
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
    this.getBaseData()
    this.getList()
  },
  methods: {
    getBaseData() {
      this.getDept()
      this.getGroupList()
      this.getLabelList()
      // this.getRoom()

      this.getAllUser()
      this.getBaseClass()
      // this.getJobLevel()
      //       this.getJobPost()
      //       this.getJobAuth()
    },
    getBaseClass() {
      postdata('/class/all', {
        classtype: ['gender', 'jobauth', 'jobpost', 'joblevel', 'zzmm']
      }).then((res) => {
        const data = res.data
        this.jobAuthList = data['jobauth']
        this.jobPostList = data['jobpost']
        this.jobLevelList = data['joblevel']
        this.genderList = data['gender']
        this.zzmmList = data['zzmm']
      })
    },
    // getJobLevel() {
    //   postdata('/user/joblevel').then((res) => {
    //     this.jobLevelList = res.data
    //   })
    // },
    // getJobPost() {
    //   postdata('/user/jobpost').then((res) => {
    //     this.jobPostList = res.data
    //   })
    // },
    // getJobAuth() {
    //   postdata('/user/jobauth').then((res) => {
    //     this.jobAuthList = res.data
    //   })
    // },
    getLabelList() {
      LabelList().then((response) => {
        this.labelList = response.data
      })
    },
    getGroupList() {
      DataList({ type: 'grouplist' }).then((response) => {
        this.GroupList = response.data.items
      })
    },
    getAllUser() {
      userlist({ page: 1, pagesize: 10000 }).then((response) => {
        this.allUserList = response.data.items
      })
    },
    getDept() {
      // DataList({ type: 'deptlist' }).then((response) => {
      //   this.DeptList = response.data
      // })
      postdata('/dept/tree', {}).then((res) => {
        this.DeptList = res.data.list
      })
    },

    // getRoom() {
    //   postdata('/room/list', {}).then((res) => {
    //     const resdata = res.data
    //     this.roomList = resdata.items
    //   })
    // },
    getnewcode() {
      postdata('/user/newcode', {}).then((res) => {
        // console.log(res)
        this.temp.usercode = res.data
        console.log(res.data)
      })
    },
    getList() {
      this.listLoading = true
      userlist(this.listQuery).then((response) => {
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
        gender: '',
        isvoid: 0,
        userpass: '',
        userpass2: '',
        telphone: '',
        mobile: '',
        mobile2: '',
        cardno: '',
        bankcard: '',
        avatar: '',
        note: '',
        usergroup: [],
        userlabel: [],
        useroom: '',
        joblevel: '',
        jobpost: '',
        jobauth: '',
        zzmm: '',
        licenseplate: ''
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
      this.$refs['dataForm'].validate((valid) => {
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
            newpass = md5(newpass + '_RLF2020')
          }

          console.log(newpass)

          const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
          newtemp.userpass = newpass
          newtemp.userpass2 = newpass

          useradd(newtemp).then((response) => {
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

      this.$confirm('您是否要重置用户密码？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((resp) => {
        postdata('/user/resetPwd', { userid: this.temp.userid }).then((res) => {
          this.$message(res.message)
        })
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj

      this.temp.userpass = ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true

      // 获取用户头像
      // postdata('/user/getsign', { userid: this.temp.userid }).then((res) => {
      //   this.temp.sign = res.data
      // })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
        if (newtemp.userpass !== '' && newtemp.userpass !== newtemp.userpass2) {
          this.$message.error('密码不匹配')
          return
        }
        if (newtemp.userpass !== '') {
          newtemp.userpass = md5(newtemp.userpass + '_RLF2020')
          newtemp.userpass2 = newtemp.userpass
        }

        if (valid) {
          userupdate(newtemp).then((response) => {
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
        userdel(row.userid).then((response) => {
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
      import('@/vendor/Export2Excel').then((excel) => {
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
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    },
    selectFile(e) {
      // alert("selected file");
      const fileupload = e.target.files[0]

      // console.log(fileupload);
      // 判断文件后缀是否正确
      const filename = fileupload.name
      const fileext = filename
        .substr(filename.lastIndexOf('.') + 1)
        .toLowerCase()
      const fileshortname = filename.substr(0, filename.lastIndexOf('.'))
      if (fileext !== '') {
        this.temp.fileext = fileext
      }
      this.temp.tplname = fileshortname
      this.temp.filename = filename
      // console.log(fileshortname);

      this.filesize = fileupload.size

      var reader = new FileReader() // 实例化文件读取对象

      reader.readAsDataURL(fileupload)
      reader.onload = (ev) => {
        // 文件读取成功完成时触发
        // 必须采用此方法方式来命名函数， (ev) =>{}，不然无法引用this对象
        var dataURL = ev.target.result // 获得文件读取成功后的DataURL,也就是base64编码
        dataURL = dataURL.split(',')[1]
        this.temp.signdata = dataURL
        this.temp.sign = ev.target.result

        // console.log(dataURL);
      }
    },

    handleSuccess_thumb(res) {
      // 获取当前附件列表
      if (res.code === 20000) {
        const resdata = res.data
        const id = resdata[0].id
        const url = './index.php/web/file/getImage/id/' + id
        this.temp.avatar = url
      }
      // this.getUserinfo()
    },
    handleSuccess_photo(res) {
      // 获取当前附件列表
      if (res.code === 20000) {
        const resdata = res.data
        const id = resdata[0].id
        const url = './index.php/web/file/getImage/id/' + id
        this.temp.photo = url
      }
      // this.getUserinfo()
    },
    beforeThumbUpload(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$message.error('上传文件并非图片！') // 判断是否是图片
        return false
      }

      // 判断文件大小
      const filesize = file.size
      if (filesize > 1024 * 1024) {
        this.$message.error('大小不能超过1MB') // 判断是否是图片
        return false
      }
      return true
    },
    beforeThumbUpload_photo(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$message.error('上传文件并非图片！') // 判断是否是图片
        return false
      }

      // 判断文件大小
      const filesize = file.size
      if (filesize > 1024 * 1024 * 4) {
        this.$message.error('大小不能超过4MB') // 判断是否是图片
        return false
      }
      return true
    }
  }
}
</script>
<style>
.usersign {
  width: 160px;
  height: 120px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
