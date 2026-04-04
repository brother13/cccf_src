<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <el-select
        v-model="listQuery.type"
        placeholder="请选择模板分类"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option key value="all" label="全部" />
        <el-option
          v-for="item in templateType"
          :key="item.type"
          :label="item.name"
          :value="item.type"
        />
      </el-select>
      <el-select
        v-model="listQuery.ajlb"
        placeholder="适合类型"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option key value="" label="全部" />
        <el-option
          v-for="item in ajlbList"
          :key="item.classcode"
          :label="item.classname"
          :value="item.classcode"
        />
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
        icon="el-icon-document-add"
        @click="handleCreate"
      >新增</el-button>
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
      <!-- <el-table-column label="ID" prop="id" align="center" width="120" /> -->
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      >
        <template slot-scope="{$index}">
          {{ $index+listQuery.pagesize*(listQuery.page-1)+1 }}
        </template>
      </el-table-column>
      <el-table-column label="模板名称" prop="tplname" align="center" width="120" />
      <el-table-column label="模板类型" prop="tpltype" align="center" width="120">
        <template slot-scope="{row}">{{ row.tpltype|showTypeFilter }}</template>
      </el-table-column>
      <el-table-column label="适用任务" prop="ajlb" align="center" width="120">
        <template slot-scope="{row}">{{ row.ajlb|showAjlb(ajlbList) }}</template>
      </el-table-column>
      <el-table-column label="文件大小" prop="tplsize" align="center" width="120">
        <template slot-scope="{row}">{{ row.tplsize|showFileSize }}</template>
      </el-table-column>
      <el-table-column label="排序" prop="rank" align="center" width="120" />
      <el-table-column label="默认选择" prop="checked" align="center" width="120">
        <template slot-scope="{row}">{{ row.checked==1 ? '默认选中' : '' }}</template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updatetime" align="center" width="120" />
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.isvoid | statusFilter">{{ row.isvoid=="0" ? "正常":"停用" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>

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
        <el-form-item label="模板名称" prop="tplname">
          <el-input v-model="temp.tplname" />
        </el-form-item>

        <el-form-item label="模板类型" prop="tpltype">
          <el-select
            v-model="temp.tpltype"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in templateType"
              :key="item.type"
              :label="item.name"
              :value="item.type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="适用类型" prop="ajlb">
          <el-select
            v-model="temp.ajlb"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in ajlbList"
              :key="item.classcode"
              :label="item.classname"
              :value="item.classcode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="默认选择">
          <el-switch v-model="temp.checked" active-color="#13ce66" inactive-color="#ff4949" />
          <el-tag>{{ temp.checked ? "默认选中" : "不选择" }}</el-tag>
        </el-form-item>
        <el-form-item label="排序" prop="rank">
          <el-input v-model="temp.rank" type="number" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="您可以填定模板备注"
          />
        </el-form-item>

        <el-form-item v-if="temp.tplsize>0" label="模板大小" prop="tpl">
          {{ temp.tplsize|showFileSize }}
          <el-button type="primary" @click="downTemplate">下载</el-button>
        </el-form-item>

        <el-form-item label="上传模板" prop="tpldata">
          <div v-if="filesize>0">文件大小：{{ filesize|showFileSize }}</div>
          <input id="fileupload" type="file" :value="selectedFile" @change="selectFile">
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
import { postdata } from '@/jcy/api/common'

import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { saveAs } from 'file-saver'

export default {
  name: 'TemplateTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === '0' ? 'success' : 'danger'
    },
    showTypeFilter(type) {
      return type === 'docx' ? 'Word文书模板' : '套打打印模板'
    },
    showFileSize(oldsize) {
      return Math.floor((oldsize * 100) / 1024) / 100 + ' KB'
    },
    showAjlb(ajlb, ajlbList) {
      for (var i = 0; i < ajlbList.length; i++) {
        if (ajlbList[i].classcode === ajlb) {
          return ajlbList[i].classname
        }
      }
      return ajlbList[0].classname
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
        type: 'all',
        isvoid: '0',
        ajlb: ''
      },
      filesize: 0,
      temp: {
        id: 0,
        tplname: '',
        tpltype: '',
        tplsize: 0,
        tpl: '',
        note: '',
        isvoid: 0,
        tpldata: '',
        checked: 0,
        rank: 0,
        ajlb: ''
      },
      selectedFile: '',
      ajlbList: [],
      templateType: [
        { name: 'word模板（*.docx）', type: 'docx' },
        { name: '套打打印（*.grf）', type: 'grf' }
      ],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑模板',
        create: '创建模板'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        tplname: [
          { required: true, message: '模板名称不能为空', trigger: 'change' }
        ],
        tpltype: [
          { required: true, message: '模板类型不能为空', trigger: 'change' }
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
    this.init()
    this.getList()
  },
  methods: {
    init() {
      // 获取模板类型
      postdata('/data/list', { type: 'templatetype' }).then((res) => {
        // console.log(res)
        this.ajlbList = res.data.items
      })
      postdata('/template/list', { all: 1 }).then((res) => {
        const resdata = res.data
        this.templateList = resdata
      })
    },

    getList() {
      this.listLoading = true

      postdata('/template/list', this.listQuery).then((response) => {
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
        id: 0,
        tplname: '',
        tplsize: 0,
        tpltype: 'docx',
        tpldata: '',
        tplext: '',
        tpl: '',
        note: '',
        fileext: '',
        checked: 0,
        isvoid: 0,
        rank: 0,
        ajlb: ''
      }
      this.filesize = 0
      this.selectedFile = ''
      this.temp.checked = false
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
          postdata('/template/add', this.temp).then((response) => {
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
      this.temp.tpldata = ''
      this.temp.fileext = ''
      this.filesize = 0
      this.selectedFile = ''
      this.dialogStatus = 'update'
      if (this.temp.checked === 1 || this.temp.checked) {
        this.temp.checked = true
      } else {
        this.temp.checked = false
      }
      // this.temp.checked = this.temp.checked || this.temp.checked === 1
      // console.log(this.temp)

      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

        if (valid) {
          postdata('/template/save', newtemp).then((response) => {
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: '修改成功',
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
      this.$confirm('此操作将删除模板, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postdata('/template/del', { id: row.id }).then((response) => {
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

    // 弹框显示
    showMsg(str) {
      this.$notify.error({
        title: '提示',
        message: str,
        duration: 3000
      })
    },
    // 下载当前模板
    downTemplate() {
      const data = { id: this.temp.id }
      postdata('/template/get', data).then((res) => {
        // 获取模板
        const resdata = res.data
        const newblob = this.func_base64_to_blob(
          resdata.data,
          resdata.filetype
        )
        const filename = resdata.tplname + '.' + resdata.tplext
        saveAs(newblob, filename)
      })
    },
    func_base64_to_blob(data, mime) {
      data = window.atob(data)
      var ia = new Uint8Array(data.length)
      for (var i = 0; i < data.length; i++) {
        ia[i] = data.charCodeAt(i)
      }
      return new Blob([ia], {
        type: mime
      })
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

      switch (fileext) {
        case 'grf':
          this.temp.tpltype = 'grf'
          break
        case 'docx':
          this.temp.tpltype = 'docx'
          break
        default:
          this.showMsg('文件类型不正确！您需要选择docx文件或grf打印模板')
          return
      }
      this.filesize = fileupload.size

      var reader = new FileReader() // 实例化文件读取对象

      reader.readAsDataURL(fileupload)
      reader.onload = (ev) => {
        // 文件读取成功完成时触发
        // 必须采用此方法方式来命名函数， (ev) =>{}，不然无法引用this对象
        var dataURL = ev.target.result // 获得文件读取成功后的DataURL,也就是base64编码
        dataURL = dataURL.split(',')[1]
        this.temp.tpldata = dataURL

        // console.log(dataURL);
      }
    }
  }
}
</script>
