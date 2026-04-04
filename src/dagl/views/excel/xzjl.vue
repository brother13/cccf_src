<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字，姓名,案号"
        style="width: 220px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <el-date-picker
        label="起始日期"
        v-model="listQuery.startdate"
        type="date"
        placeholder="起始日期"
        class="filter-item"
        style="width: 150px"
        value-format="yyyy-MM-dd"
        @change="handleFilter"
      />
      <el-date-picker
        label="届满日期"
        v-model="listQuery.enddate"
        type="date"
        placeholder="届满日期"
        class="filter-item"
        style="width: 150px"
        value-format="yyyy-MM-dd"
        @change="handleFilter"
      />

      <el-select
        v-model="listQuery.deptcode"
        placeholder="请选择部门"
        clearable
        style="width:0px"
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
      <el-table-column type="index"  align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="办案人"
        prop="cbr"
        align="center"
        type="width:40px"

      />
      <el-table-column
        label="案号"
        prop="ah"
        align="center"
      />
      <el-table-column
        label="申请人"
        prop="sqzxr"
        align="center"
      />
      <el-table-column
        label="被申请人"
        prop="bzxr"
        align="center"
      />
      <el-table-column
        label="添加时间"
        prop="inserttime"
        align="center"
      />
      <el-table-column
        label="届满日期"
        prop="enddate"
        align="center"
      />
      <el-table-column
        label="财产类型"
        prop="type"
        align="center"
      />
      <el-table-column
        label="查封状态"
        prop="status"
        align="center"
      />

      <el-table-column
        label="备注"
        prop="note"
        align="center"
      />




      <el-table-column label="状态" class-name="status-col"  style="width: 50px">
        <template slot-scope="{ row }">
          <el-tag :type="row.isvoid== '0' ? 'success' : 'danger'">{{
            row.isvoid == '0' ? '正常' : '停用'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="100"
        label="操作" align="center"
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
        <el-form-item label="办案人" prop="cbr">
          <el-input v-model="temp.cbr" />
        </el-form-item>
        <el-form-item label="案号" prop="ah">
          <el-input v-model="temp.ah" />
        </el-form-item>
        <el-form-item label="申请人" prop="ah">
          <el-input v-model="temp.sqzxr" />
        </el-form-item>
        <el-form-item label="被申请人" prop="ah">
          <el-input v-model="temp.bzxr" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startdate">
          <el-date-picker label="开始日期" prop="startdate"
            v-model="temp.startdate"
            type="date"
            placeholder="开始日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="届满日期" prop="enddate">
          <el-date-picker label="届满日期" prop="enddate"
            v-model="temp.enddate"
            type="date"
            placeholder="届满日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="财产类型" prop="type">
          <el-select
            v-model="temp.type"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in Cftype"
              :key="item.id"
              :label="item.typename"
              :value="item.typename"
            >{{ item.typename }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="查封状态" prop="status">
          <el-input v-model="temp.status" />
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
import { DataList, LabelList } from '@/dagl/api/data'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'js-md5'
import { postdata,cflist,cflistadd,cflistdel,cflistupdate  } from '@/dagl/api/common'
import { mapGetters } from 'vuex'
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
        startdate:parseTime(new Date().getTime()- 0 * 60 * 60 * 1000, '{y}-{m}-{d}'),
        enddate:parseTime(new Date().getTime()+0*24 * 60 * 60 * 1000, '{y}-{m}-{d}'),
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
      Cftype:  [
            {
                "id": 1,
                "typename": "银行",
            },
           {
               "id": 2,
               "typename": "公积金",
           },
           {
               "id": 3,
               "typename": "股权",
           },
           {
               "id": 4,
               "typename": "房产",
           },
           {
               "id": 5,
               "typename": "车辆",
           },
        ],

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
        cflistid: undefined,
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
        update: '编辑提醒',
        create: '新增提醒'
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
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'deptname',
      // 'avatar',
      'device'
    ])
  },
  methods: {
    getBaseData() {
      this.getDept()
      this.getGroupList()
      this.getLabelList()
      // this.getRoom()

      //this.getAllUser()
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
      cflist({ page: 1, pagesize: 10000,myusername: this.$store.getters.name}).then((response) => {
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
      this.listQuery.myusername=this.$store.getters.name
      cflist(this.listQuery).then((response) => {
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
        cflistid: undefined,
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
          this.temp.cflistid = 0
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

          cflistadd(newtemp).then((response) => {
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
        postdata('/user/resetPwd', { cflistid: this.temp.cflistid }).then((res) => {
          this.$message(res.message)
        })
      })
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
          cflistupdate(newtemp).then((response) => {
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
      this.$confirm('此操作将删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cflistdel(row.cflistid).then((response) => {
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
        const url = './index.php/dagl/file/getImage/id/' + id
        this.temp.avatar = url
      }
      // this.getUserinfo()
    },
    handleSuccess_photo(res) {
      // 获取当前附件列表
      if (res.code === 20000) {
        const resdata = res.data
        const id = resdata[0].id
        const url = './index.php/dagl/file/getImage/id/' + id
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
