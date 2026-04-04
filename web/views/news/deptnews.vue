<template>
  <div class="app-container">
    <div v-if="!dialogFormVisible">
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

        <el-select
          v-model="listQuery.catalog"
          style="width: 300px;margin-left:10px;"
          class="filter-item"
          :placeholder="'请选择'+pageconfig.catalogname"
          clearable
        >

          <el-option
            :value="0"
            :label="'所有'+pageconfig.catalogname"
          > 所有{{ pageconfig.catalogname }} </el-option>
          <el-option
            v-for="item in CatalogList"
            :key="item.id"
            :label="item.fullname"
            :value="item.id"
          >{{ item.catalogname }}</el-option>
        </el-select>

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          style="margin-left:10px;"
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
        <!-- <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >导出</el-button> -->
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
          :label="pageconfig.catalogname"
          prop="catalog"
          align="center"
          width="200"
        />
        <el-table-column
          label="标题"
          prop="newstitle"
          align="center"
          width="200"
        />
        <el-table-column
          label="内容概述"
          prop="description"
          align="center"
          width="200"
        />
        <el-table-column
          label="发布时间"
          prop="posttime"
          align="center"
          width="180"
        />
        <el-table-column
          label="发布人"
          prop="postdept"
          align="center"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.postdept }} / {{ row.postusername }}
          </template>
        </el-table-column>

        <el-table-column label="排序" prop="rank" align="center" width="80" />
        <el-table-column label="状态" class-name="status-col" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="row.isvoid | statusFilter">{{
              row.isvoid == '0' ? '正常' : '隐藏'
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
    </div>
    <div v-if="dialogFormVisible">

      <el-page-header :content="(dialogStatus=='create' ? '创建' : '编辑')+pageconfig.pagename" @back="closeWin" />

      <!-- <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="90%" style="width:90%;z-index:9"> -->
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 80%; margin-left: 50px;margin-top:50px;"
      >
        <el-form-item label="标题" prop="newstitle">
          <el-input v-model="temp.newstitle" placeholder="填写标题" />
        </el-form-item>
        <el-form-item :label="pageconfig.catalogname" prop="catid">
          <el-select
            v-model="temp.catid"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in CatalogList"
              :key="item.id"
              :disabled="item.hasChildren"
              :label="item.fullname"
              :value="item.id"
            >{{ item.catalogname }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键字" prop="keywords">
          <el-input v-model="temp.keywords" placeholder="关键字，以空格隔开" />
        </el-form-item>

        <el-form-item v-if="pageconfig.showthumb" label="缩略图" prop="">

          <el-upload
            class="avatar-uploader"
            action="./index.php/web/index/uploadfile"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleSuccess_thumb"
            :before-upload="beforeThumbUpload"
            :data="thumbdata"
          >
            <img v-if="temp.thumb" :src="getImageUrl(temp.thumb)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>

        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 3, maxRows: 6 }"
            type="textarea"
            placeholder="内容描述"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <Tinymce ref="editor" v-model="temp.content" :height="400" :idlabel="temp.id" />
        </el-form-item>
        <el-form-item v-if="temp.attachment.length>0" label="附件">
          <div class="fujian-cell">
            <ul>

              <li v-for="(item,index) in temp.attachment" :key="index" class="attachment-list">
                <el-link class="f-link" @click="downFile(item.id,index)">
                  {{ index+1 }}.<Filetype :filetype="item.ext" />
                  <span class="item">{{
                    item.oldname
                  }}</span><span class="attachment-size">({{ item.filelen }})</span><span class="item">下载次数：{{ item.downnum }}</span></el-link>

                <el-link class="f-link" style="margin-left:20px;" @click="delAttachment(item.id)">
                  <i class="el-icon-delete" />
                </el-link>
              </li>

            </ul>

          </div>

        </el-form-item>
        <el-form-item label="附件" prop="">
          <el-upload
            ref="upload"
            class="upload-file"
            multiple
            action="./index.php/web/index/uploadfile"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            :auto-upload="true"
            :data="otherdata"
            :header="headers"
            :show-file-list="false"
            :on-success="handleSuccess"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
            <!-- <div slot="tip" class="el-upload__tip">请选择</div> -->
          </el-upload>

        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="temp.isvoid"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
          />
          <el-tag>{{ temp.isvoid == 1 ? '停用' : '正常' }}</el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:center;">
        <el-button @click="closeWin">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >保存</el-button>
      </div>
      <!-- </el-dialog> -->
    </div>
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'
import Tinymce from '@/components/Tinymce'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import iconSelect from '@/components/IconSelect' // secondary package based on el-pagination
// import LinkIcon from '@/components/LinkIcon'
import { getToken } from '@/utils/auth.js'

import Filetype from '@/components/Filetype'

const ACTION = {
  add: '/news/add',
  save: '/news/save',
  del: '/news/del',
  list: '/news/list',
  down: '/news/down',
  info: '/news/info',
  catalog: '/catalog/tree',
  tempid: '/news/newid',
  deltempid: '/news/deltempid',
  depttree: '/dept/tree',
  thumb: '/news/Thumb'
}

const PAGECONFIG = {
  pagename: '部门动态', // 标题
  pagecode: 'News', // 页面名称
  typeid: 2, // 1-普通内容,2-部门动态,3-图片新闻,4-通知公告
  catalogname: '部门', // 标题名称，2为 部门，其它为栏目
  showthumb: true // 是否显示缩略图

}

export default {
  name: PAGECONFIG.pagecode + 'Table',
  components: { Pagination, Tinymce, Filetype },
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
      pageconfig: PAGECONFIG,
      listQuery: {
        page: 1,
        pagesize: 10,
        catalog: undefined,
        keyword: undefined,
        isvoid: '0',
        type: PAGECONFIG.typeid
      },
      CatalogList: [

      ],
      fileList: [],

      otherdata: {
        caseid: '',
        uploadtype: 'news',
        filetype: 'file'
      },
      thumbdata: {
        caseid: '',
        uploadtype: 'news',
        filetype: 'thumb'
      },
      headers: {
        'WEB-TOKEN': ''
      },
      export: {
        title: '内容',
        header: ['ID', '标题', '关键字', '描述', '发布时间'],
        field: ['id', 'newstitle', 'keywords', 'description', 'posttime']
      },

      temp: {
        id: 0,
        newstitle: '',
        typeid: 0,
        // typename:'',
        catid: undefined,
        // catalog:'',
        thumb: '',
        icon: '',
        keywords: '',
        description: '',
        islink: 0,
        linkurl: '',
        postdate: '',
        posttime: '',
        postdept: '',
        postuserid: 0,
        postusername: '',
        appurl: '',
        appscript: '',
        istop: '',
        topendtime: '',
        content: '',
        grouplist: [],
        attachment: [],
        next: [],
        catalogpath: [],
        rank: 0,
        isvoid: 0
      },
      temp_empty: {
        id: 0,
        newstitle: '',
        typeid: 0,
        // typename:'',
        catid: undefined,
        // catalog:'',
        thumb: '',
        icon: '',
        keywords: '',
        description: '',
        islink: 0,
        linkurl: '',
        postdate: '',
        posttime: '',
        postdept: '',
        postuserid: 0,
        postusername: '',
        appurl: '',
        appscript: '',
        istop: '',
        topendtime: '',
        content: '',
        grouplist: [],
        attachment: [],
        next: [],
        catalogpath: [],
        rank: 0,
        isvoid: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑' + PAGECONFIG.pagename,
        create: '创建' + PAGECONFIG.pagename
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        newstitle: [
          { required: true, message: '标题不能为空', trigger: 'change' }
        ],
        catid: [{ required: true, message: PAGECONFIG.catalogname + '不能为空', trigger: 'change' }],
        keywords: [
          { required: true, message: '关键字不能为空', trigger: 'change' }
        ],
        description: [
          { required: true, message: '描述不能为空', trigger: 'change' }
        ],
        content: [
          { required: true, message: '内容不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {

  },
  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      this.headers['WEB-TOKEN'] = getToken()
      this.getCataTree()
    },
    async getCataTree() {
      // 获取所有的catalog
      if (this.pageconfig.typeid !== 2) {
        const res = await postdata(ACTION.catalog)
        this.CatalogList = res.data.list
      } else if (this.pageconfig.typeid === 2) {
        // 如果是部门时，另外处理，将栏目改为部门
        const res = await postdata(ACTION.depttree)
        const deptList = res.data.list
        for (var i = 0; i < deptList.length; i++) {
          deptList[i]['catalogname'] = deptList[i]['deptname']
        }
        this.CatalogList = deptList
      }
    },
    getImageUrl(id) {
      const url = './index.php/web/file/getImage?id=' + id
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
      this.temp.typeid = this.pageconfig.typeid
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      const newid = 0
      this.temp.id = newid
      this.otherdata.caseid = newid
      this.thumbdata.caseid = newid
      this.dialogFormVisible = true
      this.getCataTree()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // console.log('ready getNewId')
      // this.getNewId().then((newid) => {
      //   // console.log('good')
      //   // console.log(newid)

      //   if (newid) {
      //     this.temp.id = newid
      //     this.otherdata.caseid = newid
      //     this.thumbdata.caseid = newid
      //     this.dialogFormVisible = true
      //     this.getCataTree()
      //     this.$nextTick(() => {
      //       this.$refs['dataForm'].clearValidate()
      //     })
      //   }
      // })
    },
    async removeNewId() {
      return
      // postdata(ACTION.deltempid, { id: this.temp.id }).then((res) => {
      //   // this.$message(res.message)
      // })
      // return 1
    },
    closeWin() {
      if (this.dialogStatus === 'create') {
        if (this.temp.newstitle !== '') {
          this.$confirm('您已修改了内容，退出将不会保存数据，是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.removeNewId()
            this.dialogFormVisible = false
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        } else {
          this.removeNewId()
          this.dialogFormVisible = false
        }
      } else if (this.dialogStatus === 'update') {
        this.dialogFormVisible = false
      }
    },
    async getNewId() {
      // console.log('getNewId')
      if (this.dialogStatus === 'create' && (this.temp.id === '' || this.temp.id === 0)) {
        const res = await postdata(ACTION.tempid, {})
        const id = res.data
        return id - 0
      }
      return 0
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.typeid = this.pageconfig.typeid
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
      this.getCataTree()
      // this.temp = Object.assign({}, row); // copy obj
      const id = row.id
      postdata(ACTION.info, { id: id }).then((res) => {
        const data = res.data
        this.temp = data

        this.otherdata.caseid = id
        this.thumbdata.caseid = id
        this.temp.typeid = this.pageconfig.typeid
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
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
    downFile(id, index) {
      const url = './index.php/web/file/getfile/id/' + id

      try {
        if (index > -1 && index < this.temp.attachment.length) {
          this.temp.attachment[index].downnum++
        }
      } catch (e) {
        console.log(e)
      }
      window.open(url)
      return false
    },
    delAttachment(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning' }).then((response) => {
        postdata('/news/delfile', { id: id }).then((res) => {
          if (res.code === 20000) {
            this.$message('删除成功')
            // 开始重新读取数据
            this.fleshAttache()
          }
        })
      })
    },

    submitUpload() {
      this.$refs.upload.submit()
    },
    handleSuccess(response, file, fileList) {
      // 获取当前附件列表
      this.fleshAttache()
    },
    handleSuccess_thumb(response, file, fileList) {
      // 获取当前附件列表
      this.fleshThumb()
    },
    fleshThumb() {
      postdata(ACTION.thumb, { id: this.temp.id }).then((res) => {
        const data = res.data
        // const url = './index.php/web/file/getImage?id=' + data.id
        this.temp.thumb = data.id
      })
    },
    fleshAttache() {
      postdata('/news/filelist', { id: this.temp.id }).then((res) => {
        const data = res.data
        this.temp.attachment = data
      })
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    beforeThumbUpload(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$message.error('上传文件并非图片！') // 判断是否是图片
        return false
      }
    }

  }
}
</script>
<style lang="scss" scoped>
.icon-image {
  width: 20px;
  height: 20px;
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
