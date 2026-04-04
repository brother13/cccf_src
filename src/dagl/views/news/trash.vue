<template>
  <div class="app-container">
    <div v-if="!dialogFormVisible">
      <div class="filter-container">
        <el-select
          v-model="listQuery.type"
          style="width: 120px; margin-left: 10px"
          class="filter-item"
          placeholder="请选择类型"
          clearable
        >
          <el-option :value="0" label="所有">
            所有类型
          </el-option>
          <el-option
            v-for="item in newsTypeList"
            :key="item.id"
            :label="item.typename"
            :value="item.id"
          >{{ item.typename }}</el-option>
        </el-select>

        <el-input
          v-model="listQuery.keyword"
          clearable
          placeholder="请输入关键字"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>

        <el-select
          v-model="listQuery.catalog"
          style="width: 120px; margin-left: 10px"
          class="filter-item"
          placeholder="请选择栏目"
          clearable
        >
          <el-option :value="0" label="所有栏目">
            所有栏目
          </el-option>
          <el-option
            v-for="item in CatalogList"
            :key="item.id"
            :label="item.fullname"
            :value="item.id"
          >{{ item.catalogname }}</el-option>
        </el-select>

        <el-select
          v-model="listQuery.postdeptid"
          style="width: 400px; margin-left: 10px"
          class="filter-item"
          placeholder="请选择部门"
          clearable
          multiple
        >
          <el-option
            v-for="item in deptList"
            :key="item.deptid"
            :label="item.fullname"
            :value="item.deptid"
          >{{ item.deptname }}</el-option>
        </el-select>
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          style="margin-left: 10px"
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>
        <!-- <el-button
          class="filter-item"
          style="margin-left: 10px"
          type="primary"
          icon="el-icon-document-add"
          @click="handleCreate"
        >新增</el-button> -->

        <el-button
          v-if="checkedList.length"
          v-waves
          class="filter-item"
          icon="el-icon-refresh-left"
          type="success"
          @click="handleBatchRestore"
        >批量恢复{{ checkedList.length }}项</el-button>

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
        @selection-change="changeCheck"
      >
        <el-table-column type="selection" label="选择" />
        <el-table-column type="index" width="50" align="center" label="序号">
          <template slot-scope="{ $index }">
            {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="类型"
          prop="typename"
          align="center"
          width="120"
        />
        <el-table-column
          label="栏目"
          prop="catalog"
          align="center"
          width="120"
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
        <el-table-column
          label="标题"
          prop="newstitle"
          align="center"
          width="120"
        />
        <el-table-column
          label="内容概述"
          prop="description"
          align="left"
          width="300"
        >
          <template slot-scope="{ row }">
            {{ row.description | strleft }}
          </template>
        </el-table-column>
        <el-table-column
          label="删除时间"
          prop="deltime"
          align="center"
          width="200"
        >
          <template slot-scope="{ row }">
            {{ row.posttime }}<br>
            操作员：{{ row.delusername }}

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
              type="success"
              size="mini"
              icon="el-icon-refresh-left"
              @click="handleRestore([row.id])"
            >
              恢复</el-button>

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

    <div id="temp_html2text" style="display: none" />
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'
// import Tinymce from '@/components/Tinymce'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import iconSelect from '@/components/IconSelect' // secondary package based on el-pagination
// import LinkIcon from '@/components/LinkIcon'
import { getToken } from '@/utils/auth.js'

// import Filetype from '@/components/Filetype'

const ACTION = {
  add: '/news/add',
  save: '/news/save',
  del: '/news/del',
  list: '/news/trashlist',
  down: '/news/down',
  info: '/news/info',
  catalog: '/catalog/tree',
  tempid: '/news/newid',
  deltempid: '/news/deltempid',
  depttree: '/dept/tree',
  thumb: '/news/Thumb',
  userlist: '/user/list',
  typelist: '/catalog/typelist'
}

const PAGECONFIG = {
  pagename: '内容', // 标题
  pagecode: 'News', // 页面名称
  typeid: 1, // 1-普通内容,2-部门动态,3-图片新闻,4-通知公告
  catalogname: '分类', // 标题名称，2为 部门，其它为栏目
  showthumb: true // 是否显示缩略图
}

export default {
  name: PAGECONFIG.pagecode + 'Table',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
    },
    strleft(str) {
      return str.substring(0, 100) // 取前100个字
    }
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      pageconfig: PAGECONFIG,
      checkedList: [],

      listQuery: {
        page: 1,
        pagesize: 10,
        catalog: undefined,
        keyword: undefined,
        postdeptid: undefined,
        type: undefined,
        isvoid: '0'
      },
      newsTypeList: [],

      CatalogList: [],
      deptList: [],
      userList: [],

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
        postdeptid: undefined,
        postuserid: undefined,
        postusername: '',
        appurl: '',
        appscript: '',
        istop: 0,
        topendtime: '',
        content: '',
        grouplist: [],
        attachment: [],
        next: [],
        catalogpath: [],
        rank: 0,
        isvoid: 0,
        canreply: 1
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
        postdeptid: undefined,
        postuserid: undefined,
        postusername: '',
        appurl: '',
        appscript: '',
        istop: 0,
        topendtime: '',
        content: '',
        grouplist: [],
        attachment: [],
        next: [],
        catalogpath: [],
        rank: 0,
        isvoid: 0,
        canreply: 1
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
        catid: [
          {
            required: true,
            message: PAGECONFIG.catalogname + '不能为空',
            trigger: 'change'
          }
        ],
        // keywords: [
        //   { required: true, message: '关键字不能为空', trigger: 'change' }
        // ],
        description: [
          { required: true, message: '描述不能为空', trigger: 'change' }
        ],
        content: [
          { required: true, message: '内容不能为空', trigger: 'change' }
        ],
        postdeptid: [
          { required: true, message: '发布部门不能为空', trigger: 'change' }
        ],
        postuserid: [
          { required: true, message: '发布人不能为空', trigger: 'change' }
        ]
      },

      topendtimeOptions: {
        shortcuts: [
          {
            text: '下周',
            onClick(picker) {
              picker.$emit('pick', new Date() + 86400 * 7)
            }
          },
          {
            text: '下个月',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 86400 * 30)
              picker.$emit('pick', date)
            }
          },
          {
            text: '两个月',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 86400 * 60)
              picker.$emit('pick', date)
            }
          }
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
      this.headers['WEB-TOKEN'] = getToken()
      this.getCataTree()
      this.getDeptList()
    },
    async getTypeList() {
      postdata(ACTION.typelist).then((res) => {
        this.newsTypeList = res.data.list
      })
    },
    async getCataTree() {
      // 获取所有的catalog
      if (this.pageconfig.typeid !== 2) {
        const res = await postdata(ACTION.catalog, { isvoid: 0 })
        const datalist = res.data.list
        const dataarr = []
        for (let i = 0; i < datalist.length; i++) {
          const row = datalist[i]
          if (row.isvoid === 0) {
            dataarr.push(row)
          }
        }
        this.CatalogList = dataarr
      } else if (this.pageconfig.typeid === 2) {
        // 如果是部门时，另外处理，将栏目改为部门
        const res = await postdata(ACTION.depttree)
        const deptList = res.data.list
        for (let i = 0; i < deptList.length; i++) {
          deptList[i]['catalogname'] = deptList[i]['deptname']
        }
        this.CatalogList = deptList
      }
    },
    // 获取部门列表
    async getDeptList() {
      const res = await postdata(ACTION.depttree)
      const deptList = res.data.list
      for (let i = 0; i < deptList.length; i++) {
        deptList[i]['catalogname'] = deptList[i]['deptname']
      }
      this.deptList = deptList
      this.temp.postuserid = undefined
    },
    // 刷新用户列表
    async getUserList(deptid) {
      this.userList = []
      const res = await postdata(ACTION.userlist, { deptcode: [deptid] })
      this.userList = res.data.items
      return res.data.total
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
      this.getUserList(this.temp.postdeptid)
      this.dialogStatus = 'create'
      // console.log('ready getNewId')
      const newid = 0
      this.temp.id = newid
      this.otherdata.caseid = newid
      this.thumbdata.caseid = newid
      this.dialogFormVisible = true
      this.getCataTree()

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })

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
      postdata(ACTION.deltempid, { id: this.temp.id }).then((res) => {
        // this.$message(res.message)
      })
      return 1
    },
    closeWin() {
      if (this.dialogStatus === 'create') {
        if (this.temp.newstitle !== '') {
          this.$confirm(
            '您已修改了内容，退出将不会保存数据，是否继续?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
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
    getDescription() {
      // 测试获取tinycme里的文本内容
      const res = this.$refs['editor'].value
      this.temp.description = this.html2text(res)
      // console.log(res)
      // console.log(this.html2text(res))
    },
    html2text(html) {
      const div = document.getElementById('temp_html2text')
      if (div) {
        div.innerHTML = html
        const text = div.innerText
        div.innerHTML = ''
        return text
      } else {
        return ''
      }
    },
    async getNewId() {
      // console.log('getNewId')
      if (
        this.dialogStatus === 'create' &&
        (this.temp.id === '' || this.temp.id === 0)
      ) {
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
        this.getUserList(this.temp.postdeptid)

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
        type: 'warning'
      }).then((response) => {
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
    },
    handleBatchRestore() {
      this.handleRestore(this.checkedList)
    },
    handleRestore(id) {
      if (!Array.isArray(id)) {
        return
      }

      const num = id.length

      this.$confirm('是否确定恢复' + num + '笔记录?', '提示', {
        confirmButtonText: '恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((response) => {
        postdata('/news/trashrestore', { id: id }).then((res) => {
          this.getList()
        })
      })
    },
    changeCheck(val) {
      this.checkedList = []
      val.forEach(item => {
        this.checkedList.push(item.id)
      })
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
  margin-top: 10px;
}

.fujian-cell * {
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
}
.fujian-cell .f-link {
  margin-right: 20px;
}
.f-link .item {
  color: #999999;
  padding: 0 10px;
}
.attachment-size {
  margin-left: 10px;
  margin-right: 10px;
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
