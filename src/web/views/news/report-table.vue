<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 300px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input> -->

      <el-select
        v-model="listQuery.report"
        placeholder="请选择类型"
        clearable
        style="width: 200px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="所有" value />
        <el-option
          v-for="(item, index) in reportList"
          :key="index"
          :label="item.name"
          :value="item.code"
        />
      </el-select>

      <el-select
        v-model="listQuery.showall"
        placeholder="请选择状态"
        clearable
        style="width: 180px; margin-left: 10px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="当前使用" value="" />
        <el-option label="所有历史数据" value="1" />
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
        icon="el-icon-document-add"
        @click="handleCreate"
      >导入新数据</el-button>
    </div>

    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
    >
      <el-table-column type="index" width="50" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="报表名称"
        prop="reportname"
        align="center"
        width="200"
      />
      <el-table-column
        label="起始日期"
        prop="startdate"
        align="center"
        width="150"
      />
      <el-table-column
        label="截止日期"
        prop="enddate"
        align="center"
        width="150"
      />
      <el-table-column
        label="法官人数"
        prop="judgenum"
        align="center"
        width="80"
      />
      <el-table-column
        label="原始文件"
        prop="importfilename"
        align="center"
        width="250"
      >
        <template slot-scope="{ row }">
          <template v-if="row.importfileid">
            <el-link :href="getUrl(row.importfileid)" target="_blank" alt="点击下载源文件">
              {{ row.importfilename }}
            </el-link>
          </template>
          <template v-else>
            -
          </template>

          <!-- {{ row.postdept }} / {{ row.postusername }} -->
        </template>
      </el-table-column>

      <el-table-column
        label="导入时间"
        prop="importtime"
        align="center"
        width="180"
      />
      <el-table-column
        label="操作人员"
        prop="username"
        align="center"
        width="100"
      />

      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >
            编辑</el-button>
          <!-- <el-button
            type="primary"
            size="mini"
            icon="el-icon-view"
            @click="handleUView(row)"
          >
            查看数据</el-button> -->
          <!-- <el-button
            size="mini"
            type="danger"
            click2="handleModifyStatus(row,'deleted')"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false>
      <el-form
        ref="
      data-form-
      :rules="rules"
      :model="temp"
      label-position="left"
      label-width="80px"
      style="width: 600px; margin-left: 50px"
    >
      <el-form-item label="数据类型" prop="reportcode">
        <el-select
          v-model="temp.reportcode"
          placeholder="数据类型"
          clearable
          style="width: 200px"
          class="filter-item"
          :disabled="dialogStatus == 'update'"
          @change="changeReportCode"
        >
          <el-option
            v-for="(item, index) in reportList"
            :key="index"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      <template v-if="temp.reportcode">
        <el-form-item label="数据来源" prop="">
          <el-upload
            class="avatar-uploader"
            action="./index.php/web/index/uploadfile"
            accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            :show-file-list="false"
            :on-success="handleSuccess_file"
            :before-upload="beforeFileUpload"
            :data="exceldata"
          >
            <template v-if="temp.importfileid">
              <el-link :href="getUrl(temp.importfileid)" target="_blank">{{
                temp.importfilename
              }}</el-link>
              <i class="el-icon-refresh-left avatar-uploader-icon" />
            </template>
            <template v-else>
              <i class="el-icon-upload avatar-uploader-icon" />
            </template>
          </el-upload>
          <button v-if="temp.importfileid" @click="getfileinfo(temp.reportcode,temp.importfileid)">获取数据</button>
        </el-form-item>
        <el-form-item label="数据说明" prop="note">
          <el-input v-model="temp.note" placeholder="请填写数据来源说明，例如“本数据取自华宇系统”" />
        </el-form-item>

        <el-form-item label="起始日期" prop="startdate">
          <el-input v-model="temp.startdate" placeholder="请填写起始日期，默认会读取Excel中信息" />
        </el-form-item>
        <el-form-item label="截止日期" prop="enddate">
          <el-input v-model="temp.enddate" placeholder="请填写截止日期，默认会读取Excel中信息" />
        </el-form-item>
        <el-form-item label="法官人数" prop="judgenum">
          <el-input v-model="temp.judgenum" placeholder="请填写法官人数，默认会读取Excel中信息" />
        </el-form-item>

      </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'

import waves from '@/directive/waves' // waves directive
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const ACTION = {
  save: '/report/save',
  del: '/report/del',
  reportlist: '/report/reportlist',
  list: '/report/list',
  getfiledata: '/report/getfiledata',
  lastnote: '/report/lastnote'
}
// const PAGENAME = '审判动态'
export default {
  name: 'ReportTable',
  components: {},
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
    },
    isshowFilter(status) {
      return status === 1 ? 'success' : 'danger'
    }
  },

  data() {
    return {
      tableKey: 0,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        report: undefined,
        showall: ''
      },
      reportList: [],

      tableData: [],

      temp: {
        id: 0,
        reportid: 0,
        reportcode: '',
        reportname: '',
        importtime: '',
        importfileid: '',
        importfilename: '',
        startdate: '',
        enddate: '',
        judgenum: '',
        note: '',
        isused: '',
        isvoid: 0
      },
      temp_empty: {
        id: 0,
        reportid: undefined,
        reportcode: '',
        reportname: '',
        importtime: '',
        importfileid: '',
        importfilename: '',
        startdate: '',
        enddate: '',
        judgenum: '',
        note: '',
        isused: '',
        isvoid: 0
      },
      exceldata: {
        caseid: '',
        uploadtype: 'report',
        filetype: 'excel'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑数据',
        create: '导入数据'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        reportcode: [
          { required: true, message: '数据类型不能为空', trigger: 'change' }
        ]
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
      this.getReportList()
    },

    getReportList() {
      postdata(ACTION.list).then((res) => {
        this.reportList = res.data
      })
    },

    getList() {
      this.listLoading = true

      postdata(ACTION.reportlist, this.listQuery).then((response) => {
        this.tableData = response.data.items
        this.listQuery.total = response.data.total

        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 生成下载文件的URL
    getUrl(id) {
      const url = 'index.php/web/File/getfile/id/' + id
      return url
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },

    resetTemp() {
      this.temp = Object.assign({}, this.temp_empty)
    },

    getLastnote(id) {
      postdata(ACTION.lastnote, { reportid: id }).then((data) => {
        this.temp.note = data
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
          console.log('准备保存数据')
          postdata(ACTION.save, this.temp).then((response) => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$alert('保存成功')
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
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

        if (valid) {
          postdata(ACTION.save, newtemp).then((response) => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$alert('修改成功')
              this.getList()
            }
          })
        }
      })
    },
    handleDelete(row) {
      // 删除数据
      // 判断是否要删除
      this.$confirm('数据删除之后将不能恢复，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postdata(ACTION.del, { id: row.id }).then((response) => {
          const data = response
          if (data.code === 20000) {
            this.$alert('操作完成')
            this.getList()
          }
        })
      })
    },

    getLastNote(id) {

    },

    // 获取附件内容
    async getfileinfo(report, fileid) {
      const param = { report: report, fileid: fileid }
      const res = await postdata(ACTION.getfiledata, param)
      // console.log('getfileinfo', res)
      this.temp.startdate = res.data.date_start
      this.temp.enddate = res.data.date_end
      this.temp.judgenum = res.data.total

      return res.data
    },
    beforeFileUpload(file) {
      // console.log('beforeFileUpload', file)
      // application/vnd.ms-excel
      if (
        file.type.indexOf('excel') === -1 &&
        file.type.indexOf('spreadsheetml') === -1
      ) {
        this.$message.error('上传文件并非Excel文件！') // 判断是否是Excel文件
        return false
      }

      this.exceldata.caseid = this.temp.reportcode// 填充数据类型
    },
    handleSuccess_file(response, file, fileList) {
      // 获取当前附件列表
      console.log('handleSuccess_file', response, file, fileList)
      const resdata = response.data[0]

      if (resdata) {
        this.temp.importfileid = resdata.id
        this.temp.importfilename = resdata.oldname

        // 获取文件数据
        this.getfileinfo(this.temp.reportcode, this.temp.importfileid).then((data) => {
          // this.temp.judgenum = data.total
          // this.temp.startdate = data.date_start
          // this.temp.enddate = data.date_end
        })
      }

      // this.fleshThumb()
    },

    changeReportCode(code) {
      // console.log('changeReportCode', code)
      this.getLastnote(code)
    }
  }
}
</script>
<style lang="scss" scoped>
.icon-image {
  width: 20px;
  height: 20px;
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
  width: 120px;
  height: 120px;
  display: block;
}
</style>
