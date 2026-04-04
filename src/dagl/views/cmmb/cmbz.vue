<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.parentid"
        placeholder="请选择尺码模板"
        clearable
        style="width: 250px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in cmmbupList"
          :key="item.cmmbid"
          :label="item.fullname"
          :value="item.cmmbid"
        >{{ item.cmmbname }}</el-option>
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>

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
      <el-table-column type="index" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="尺码" prop="cmmbname" align="center" />

      <el-table-column label="性别" prop="sex" align="center" />
      <el-table-column label="身高" prop="height" align="center" />
      <el-table-column label="净胸围" prop="bust" align="center" />

      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>

          <!--          <el-button
            size="mini"
            type="danger"
            click2="handleModifyStatus(row,'deleted')"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >删除</el-button> -->
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
        <el-form-item label="尺码" prop="cmmbname">
          <el-input v-model="temp.cmmbname" :disabled="true" />
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-select v-model="temp.sex" style="width: 100%" class="filter-item" placeholder="请选择" clearable>
            <el-option
              v-for="item in Sextype"
              :key="item.id"
              :label="item.typename"
              :value="item.typename"
            >{{ item.typename }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身高" prop="mobile">
          <el-col :span="11">
            <el-input v-model="temp.heightlow" />
          </el-col>
          <el-col class="line" align="center" :span="2">~</el-col>
          <el-col :span="11">
            <el-input v-model="temp.heightup" />
          </el-col>
        </el-form-item>

        <el-form-item label="净胸围" prop="mobile">
          <el-col :span="11">
            <el-input v-model="temp.bustlow" />
          </el-col>
          <el-col class="line" align="center" :span="2">~</el-col>
          <el-col :span="11">
            <el-input v-model="temp.bustup" />
          </el-col>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">保存</el-button>
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
import {
  CmmbList,
  CmmbSave,
  CmmbAdd,
  CmmbDel
} from '@/dagl/api/cmmb'
import {
  DataList,
  LabelList
} from '@/dagl/api/data'

import waves from '@/directive/waves' // waves directive
import {
  parseTime
} from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'js-md5'
import {
  postdata
} from '@/dagl/api/common'

export default {
  name: 'UserTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
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
        parentid: '选择尺码模板'
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
      Sextype: [{
        'id': 1,
        'typename': '男'
      },
      {
        'id': 2,
        'typename': '女'
      }
      ],

      cmmbList: [],
      cmmbupList: [],
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
        cmmbcode: '',
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
        update: '编辑标准',
        create: '创建标准'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        username: [{
          required: true,
          message: '名称不能为空',
          trigger: 'change'
        }],
        cmmbcode: [{
          required: true,
          message: '尺码不能为空',
          trigger: 'change'
        }]
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
    // this.handleFilter()
    this.listLoading = false
  },
  mounted() {
    this.handleFilter()
  },
  methods: {
    getBaseData() {
      this.getCmmb()
    },

    getCmmb() {
      postdata('/cmmb/tree', {}).then((res) => {
        this.cmmbList = res.data.list
        var tmp = []
        for (var i in this.cmmbList) {
          if (this.cmmbList[i]['parentid'] == 0) {
            tmp.push(this.cmmbList[i])
          }
        }
        this.cmmbupList = tmp
      })
    },

    getList() {
      this.listLoading = true
      CmmbList(this.listQuery).then((response) => {
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
      const {
        prop,
        order
      } = data
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
        cmmbcode: '',
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
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.userid = 0

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
          CmmbSave(newtemp).then((response) => {
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
      this.$confirm('此操作将删除, 是否继续?', '提示', {
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
