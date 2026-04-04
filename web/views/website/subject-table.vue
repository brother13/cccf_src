<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 300px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

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
      >新增</el-button>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >导出</el-button>
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
        label="专题名称"
        prop="subjectname"
        align="center"
        width="200"
      />
      <el-table-column label="专栏图片" prop="icon" align="center" width="120">
        <template slot-scope="{ row }">
          <template v-if="row.pic">
            <el-image :src="imageUrl(row.pic)" class="preview-image" :preview-src-list="[imageUrl(row.pic)]" />
          </template>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <!-- <el-table-column label="链接地址" prop="url" align="center" width="200" /> -->
      <!-- <el-table-column label="是否显示" prop="isshow" align="center" width="160" /> -->
      <el-table-column label="专题描述" prop="description" align="center" width="200" />
      <!-- <el-table-column label="发布时间" prop="posttime" align="center" width="150" /> -->
      <el-table-column label="排序" prop="rank" align="center" width="80" />
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{ row }">
          <el-tag :type="row.isvoid | statusFilter">{{
            row.isvoid == '0' ? '正常' : '停用'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
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
          >
            编辑</el-button>
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
        style="width: 600px; margin-left: 50px"
      >
        <el-form-item label="专栏名称" prop="subjectname">
          <el-input v-model="temp.subjectname" />
        </el-form-item>
        <el-form-item label="专题图片" prop="pic">
          <el-upload
            class="avatar-uploader"
            action="./index.php/web/index/uploadfile"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleSuccess_thumb"
            :before-upload="beforeThumbUpload"
            :data="thumbdata"
          >
            <el-image
              v-if="temp.pic"
              fit="fill"
              :src="imageUrl(temp.pic)"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="链接地址" prop="url">
          <el-input v-model="temp.url" />
        </el-form-item> -->

        <el-form-item label="描述">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="专题专栏描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="rank">
          <el-input v-model="temp.rank" type="number" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="temp.isvoid"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
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
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import iconSelect from '@/components/IconSelect' // secondary package based on el-pagination
// import LinkIcon from '@/components/LinkIcon'

const ACTION = {
  add: '/subject/add',
  save: '/subject/save',
  del: '/subject/del',
  list: '/subject/list',
  down: '/subject/down'
}
const PAGENAME = '专题专栏'
export default {
  name: 'SubjectTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
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
        isvoid: '0'
      },

      thumbdata: {
        caseid: '',
        uploadtype: 'subject',
        filetype: 'thumb'
      },
      headers: {
        'WEB-TOKEN': ''
      },

      export: {
        title: '专题专栏',
        header: ['ID', '专题名称', '地址', '备注', '更新时间'],
        field: ['id', 'subjectname', 'url', 'note', 'updatetime']
      },

      temp: {
        id: '',
        dwid: '',
        subjectname: '',
        description: '',
        pic: '',
        url: '',
        note: '',
        username: '',
        userid: '',
        deptid: '',
        deptname: '',
        posttime: '',
        isvoid: '',
        createtime: '',
        updatetime: '',
        isdel: '',
        deltime: '',
        rank: ''
      },
      temp_empty: {
        id: '',
        dwid: '',
        subjectname: '',
        description: '',
        pic: '',
        url: '',
        note: '',
        username: '',
        userid: '',
        deptid: '',
        deptname: '',
        posttime: '',
        isvoid: 0,
        createtime: '',
        updatetime: '',
        isdel: '',
        deltime: '',
        rank: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑' + PAGENAME,
        create: '创建' + PAGENAME
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        subjectname: [
          { required: true, message: '专题名称不能为空', trigger: 'change' }
        ],
        pic: [
          { required: true, message: '专题图片不能为空', trigger: 'change' }
        ],
        url: [
          { required: true, message: '链接地址不能为空', trigger: 'change' }
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
    init() {},

    imageUrl(id) {
      const url = './index.php/web/file/getImage/id/' + id
      return url
    },

    getList() {
      this.listLoading = true

      postdata(ACTION.list, this.listQuery).then((response) => {
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
      this.temp = Object.assign({}, this.temp_empty)
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
          postdata(ACTION.add, this.temp).then((response) => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$alert('新增成功')
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
    handleExport() {
      // 导出数据
      postdata(ACTION.down, this.listQuery).then((res) => {
        const alldata = res.data.items
        this.handleDownload(alldata)
      })
    },
    handleDownload(alldata) {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = this.export.header
        const filterVal = this.export.field
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: this.export.title,
          // filename: "table-list"
          filename: this.export.title
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
    beforeThumbUpload(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$message.error('上传文件并非图片！') // 判断是否是图片
        return false
      }
    },
    handleSuccess_thumb(response, file, fileList) {
      // 获取更新当前图片
      console.log(response)
      const res = response.data
      console.log(res)
      const pic = res[0].id
      this.temp.pic = pic
    }
  }
}
</script>

<style lang="scss" scoped>
.preview-image {
  width: 80px;
  height: 80px;
}
span#mceu_53 {
  display: none;
}

.attachment-list {
  width: 100%;
  margin-top:10px;
}

.fujian-cell *{
	line-height: 1;
	display: inline-block;
	vertical-align: middle;
}
.fujian-cell .f-link{
	margin-right:20px;
}
.f-link .item{
	color: #999999;
	padding: 0 10px;
}
.attachment-size{
  margin-left:10px;
  margin-right:10px;
  color: #999999;
}

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

</style>
