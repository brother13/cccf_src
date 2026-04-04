<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入案号、当事人名称、法官等"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <el-select
        v-model="listQuery.ajlb"
        placeholder="请选择案件类型"
        clearable
        style="width: 150px"
        multiple
        class="filter-item"
        @change="handleFilter"
      >
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

      <template v-if="checkedList.length>0">
        模板
        <el-select
          v-model="batchPrint.emstemplate"
          placeholder="运单模板"
          style="width: 80px"
          class="filter-item"
        >
          <el-option
            v-for="item in templateEms"
            :key="item.id+50000"
            :label="item.tplname"
            :value="item.id"
          />
        </el-select>

        <el-button
          v-waves
          class="filter-item"
          icon="el-icon-search"
          type="success"
          @click="handlePrint"
        >打印选中的{{ checkedList.length }}个运单</el-button>
      </template>
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
      @selection-change="changeCheck"
    >
      <el-table-column type="selection" label="选择" />
      <el-table-column label="案号" prop="caseinfo" align="center" width="200" />
      <el-table-column label="当事人" prop="dsrmc" align="center" width="200">
        <template slot-scope="{row}">{{ row.ssdw }}:{{ row.dsrmc }}</template>
      </el-table-column>

      <el-table-column label="承办部门" prop="deptname" align="center" width="100" />
      <el-table-column label="承办人" prop="cbrmc" align="center" width="80" />

      <el-table-column label="生成时间" prop="createtime" align="center" width="120">
        <template slot-scope="{row}">{{ row.createtime }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="success" @click="handleShowPrint(row)">操作</el-button>
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

    <el-dialog v-loading="printLoading" title="生成文书" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="案号" prop="caseinfo">{{ temp.caseinfo }}</el-form-item>

        <el-form-item label="当事人" prop="dsrmc">{{ temp.dsrmc }}</el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="当事人电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" placeholder="地址" />
        </el-form-item>
        <el-form-item label="邮编" prop="post">
          <el-input v-model="temp.post" placeholder="邮编" />
        </el-form-item>

        <el-form-item label="预约时间" prop="ordertime">
          <el-date-picker
            v-model="temp.ordertime"
            type="datetime"
            placeholder="选择预约时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预约庭室" prop="orderroom">
          <el-select
            v-model="temp.orderroom"
            placeholder="请选择预约庭室"
            style="width: 100%"
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
        <el-form-item label="运单模板">
          <el-select
            v-model="temp.emstemplate"
            placeholder="请选择运单模板"
            style="width: 100%"
            class="filter-item"
          >
            <el-option
              v-for="item in templateEms"
              :key="item.id+20000"
              :label="item.tplname"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文书模板" prop="template">
          <el-checkbox-group v-model="temp.templateList">
            <template v-for="(template,index) in templateList">
              <el-checkbox
                :key="10000+template.id"
                :label="template.id"
              >{{ index+1 }}.{{ template.tplname }}</el-checkbox>
              <br :key="20000+template.id">
            </template>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="现有文书" prop="doclist">
          <!-- <el-link type="primary" @click="DownDocZip()">
            <i class="el-icon-download" />全部打包下载
          </el-link> -->
          <br>
          <template v-for="(doc,index) in Doclist">
            <div :key="doc.id+50000">
              {{ index+1 }}.{{ doc.filename }}({{ doc.filesize|showFileSize }})
              <!-- <el-link :key="doc.id+30000" type="primary" @click="func_download_doc(doc.id)">
                <i class="el-icon-download" />下载
              </el-link>&nbsp;&nbsp; -->
              <el-link :key="doc.id+40000" type="primary" @click="func_print_doc(doc.id)">
                <i class="el-icon-printer" />打印
              </el-link>
            </div>
          </template>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="PrintEms()">打印运单</el-button>
        <!-- <el-button @click="CreateAndDown()">重新生成并下载</el-button> -->
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
import { postdata } from '@/api/doc/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'

export default {
  name: 'DocprintTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === '0' ? 'success' : 'danger'
    },
    getajlbname(ajlb) {
      let ajlbmc = ''
      switch (ajlb) {
        case '1':
          ajlbmc = '刑事'
          break
        case '2':
          ajlbmc = '民事'
          break
        case '6':
          ajlbmc = '行政'
          break
        case '7':
          ajlbmc = '赔偿'
          break
        case '8':
          ajlbmc = '执行'
          break
        case '21':
          ajlbmc = '调解'
          break
        default:
          ajlbmc = ajlb
      }
      return ajlbmc
    },
    showFileSize(oldsize) {
      return Math.floor((oldsize * 100) / 1024) / 100 + ' KB'
    }
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      checkAll: false,
      checkedList: [],
      batchPrint: {
        emstemplate: 0,
        id: []
      },
      tableIsIndeterminate: false,
      listLoading: true,
      uploading: false,
      printLoading: false,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: '',
        ajlb: [],
        isvoid: '0'
      },
      loadajbs: '',
      ajlbList: [],

      qrdata: { ajbs: '', data: '', caseinfo: '', index: 1 },
      loadupload: false,
      showUpload: false,
      UploadTypeList: [],
      fileReader: '',
      upload: { filetypeid: 0, filedata: '', filename: '' },
      temp: {
        id: '', // 主键
        dwid: '', // 单位主键
        ajbs: '', // 案件主键
        caseinfo: '', // 案号名称
        laay: '', // 案件案由
        ajlb: '', // 案件类别
        ssdw: '', // 当事人诉讼地位
        dsrmc: '', // 当事人名称
        address: '', // 当事人地址
        mobile: '', // 当事人电话
        post: '', // 邮编号码
        casedata: '', // 案件数据
        cbr: '', // 承办人
        cbrmc: '', // 承办人名称
        deptname: '', // 承办部门
        doc: '', // 1-已生成，0-未生成，默认0
        pdf: '', // 1-已生成，0-未生成，默认0
        seal: '', // 1-已生成，0-未生成，默认0
        orderroom: '', // 开庭地点
        ordertime: '', // 开庭时间
        template: '', // 从文书模板类型中取
        doclist: '', // 已生成的文书ID，从文书记录里找
        userid: '', // 操作员
        expressno: '', // 邮政运单号
        emsuser: '', // 邮政操作员
        isvoid: '', // 0-正常，1-停用
        createtime: '', // 创建时间
        updatetime: '', // 修改时间
        isdel: '', // 0-正常，1-已删除
        deltime: '', // 删除时间
        rank: '', // 从小到大排序
        templateList: [],
        emstemplate: 0
      },

      roomList: [],
      templateList: [],
      templateEms: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑信息',
        create: '创建信息'
      },
      dialogPvVisible: false,
      pvData: [],
      Doclist: [],

      downloadLoading: false,
      rules: {
        dsr: [{ required: true, message: '当事人不能为空', trigger: 'change' }],
        template: [
          { required: true, message: '文书模板不能为空', trigger: 'change' }
        ],
        ordertime: [
          { required: false, message: '预约时间不能为空', trigger: 'change' }
        ],
        orderroom: [
          { required: false, message: '预约地点不能为空', trigger: 'change' }
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
      this.loadajbs = this.$route.query.ajbs

      if (this.loadajbs !== '' && this.loadajbs !== null) {
        this.loadCase(this.loadajbs)
      }

      this.fileReader = new FileReader()
      postdata('/data/list', { type: 'ajlb' }).then(res => {
        const resdata = res.data
        this.ajlbList = resdata.items
      })
      postdata('/import/typelist', {}).then(res => {
        this.UploadTypeList = res.data
        if (this.UploadTypeList.length > 0) {
          this.upload.filetypeid = this.UploadTypeList[0].filetypeid
        }
      })

      postdata('/template/list', { type: 'docx' }).then(res => {
        const resdata = res.data

        this.templateList = resdata.items
      })
      postdata('/template/list', { type: 'grf' }).then(res => {
        const resdata = res.data

        this.templateEms = resdata.items

        if (this.templateEms.length > 0) {
          this.batchPrint.emstemplate = this.templateEms[0].id
        }
        // 设置默认值
      })

      postdata('/room/list', {}).then(res => {
        const resdata = res.data
        this.roomList = resdata.items
      })
    },
    getList() {
      this.listLoading = true
      this.checkedList = []
      postdata('/docprint/list', this.listQuery).then(response => {
        const resdata = response.data
        this.list = resdata.data
        this.total = resdata.total

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
      this.temp = {}
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
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          postdata('/nodetype/add', this.temp).then(response => {
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
    // 弹框显示
    showMsg(str) {
      this.$notify.error({
        title: '提示',
        message: str,
        duration: 3000
      })
    },
    // 重新生成文书
    CreateDoc(method) {
      // 先检查数据是否可用

      if (this.temp.ajbs === '') {
        this.showMsg('案件不能为空')
        return
      }

      if (this.temp.templateList.length < 1) {
        this.showMsg('至少选择一个模板')
        return
      }

      if (this.temp.ordertime === '' || this.temp.ordertime === null) {
        this.showMsg('预约时间为空！')
        return
      }
      if (this.temp.orderroom === '' || this.temp.orderroom === null) {
        this.showMsg('预约地点为空！')
        return
      }

      const casedata = {}
      casedata.ajbs = this.temp.ajbs
      casedata.caseinfo = this.temp.caseinfo
      casedata.ordertime = this.temp.ordertime
      casedata.orderroom = this.temp.orderroom

      const dsr = []
      dsr.push({ dsrmc: this.temp.dsrmc })

      casedata.dsr = dsr
      const data = {
        casedata: [casedata],
        template: this.temp.templateList,
        check: false
      }

      postdata('/docprint/adddoc', data).then(res => {
        if (res.code === 20000) {
          switch (method) {
            case 'download':
              this.func_download(res.data)
              break
            case 'print':
              this.func_print(res.data)
              break
            default:
              this.func_download(res.data)
          }
        } else {
          this.showMsg('执行出错：' + res.message)
        }
        // console.log(res)
      })
    },

    // 打印文书（调用本地服务）
    PrintDoc() {
      this.CreateDoc('print')
    },
    CreateAndDown() {
      this.CreateDoc('download')
    },
    // 下载zip包
    DownDocZip() {
      // this.CreateDoc("download");

      const ids = [this.temp.id]
      this.func_download(ids)
    },
    func_print(docid) {
      // 通过jsonp调用接口
    },
    // 下载zip文件
    func_download(docid) {
      const data = { id: docid }

      postdata('/docprint/downzip', data).then(res => {
        if (res.code !== 20000) {
          this.showMsg('下载文书出错：' + res.message)
          return
        }
        const resdata = res.data
        const newblob = this.func_base64_to_blob(
          resdata.data,
          resdata.filetype
        )
        saveAs(newblob, resdata.filename)
      })
    },
    // 下载文档
    func_download_doc(id) {
      const data = { id: id }
      postdata('/docprint/getdoc', data).then(res => {
        if (res.code !== 20000) {
          this.showMsg('下载文书出错：' + res.message)
          return
        }
        const resdata = res.data
        const newblob = this.func_base64_to_blob(resdata.doc, resdata.filetype)
        saveAs(newblob, resdata.filename)
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
    // 获取打印信息并打印
    handleShowPrint(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.initTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 初始化tempdoc里的信息
    // 将所有的当事人选中，将所有的文书模板选中
    initTemp() {
      // templateList赋值
      // console.log(this.temp);
      const usetemp = this.temp.template.split(',')
      this.temp.templateList = []
      usetemp.forEach(val => {
        this.temp.templateList.push(parseInt(val))
      })
      // console.log(this.temp.templateList);
      if (this.templateEms.length > 0) {
        this.temp.emstemplate = this.templateEms[0].id
      }

      this.getDoclist()
    },

    updateData() {
      this.$refs['dataForm'].validate(valid => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

        if (valid) {
          postdata('/docprint/save', newtemp).then(response => {
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
      this.$confirm('此操作将删除节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postdata('/nodetype/del', { id: row.id }).then(response => {
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
    },

    handAddDoc(data) {},

    handleUpload() {
      // 导入数据
      this.showUpload = true
    },
    handlePreview(file) {
      // console.log(file);
    },
    checkFile(file, filelist) {
      // console.log("on-change:checkFile");
      // console.log(file);
      if (file) {
        this.fileReader = new FileReader()
        this.fileReader.readAsDataURL(file)
      }
      this.fileReader.onload = () => {
        // console.log("checkFile > fileReader onload > ");
        // console.log(filename);
        const base64Str = this.fileReader.result
        this.upload.filedata = base64Str
        // console.log("base64:");
        // console.log(base64Str);
      }
    },
    uploadFile() {
      postdata('/import/import', this.upload).then(res => {
        // console.log(res);
      })
    },
    httpRequest(options) {
      // console.log('httpRequest')
      const file = options.file

      const filename = file.name
      if (file) {
        this.fileReader.readAsDataURL(file)
      }
      // console.log('file.raw')
      // console.log(file.raw)
      this.fileReader.onload = () => {
        // console.log(filename)
        this.upload.filename = filename
        let base64Str = this.fileReader.result
        base64Str = base64Str.split(',')[1]
        this.upload.filedata = base64Str

        postdata('/import/import', this.upload).then(res => {
          // console.log(res)
          const resdata = res.data
          var msg = []
          if (resdata.caseadd > 0) {
            msg.push('新增' + resdata.caseadd + '条案件信息')
          }
          if (resdata.caseupdate > 0) {
            msg.push('修改' + resdata.caseupdate + '条案件信息')
          }
          if (resdata.dsradd > 0) {
            msg.push('新增' + resdata.dsradd + '条当事人信息')
          }
          if (resdata.dsrupdate) {
            msg.push('修改' + resdata.dsrupdate + '条当事人信息')
          }
          let msgtext = msg.join('\n')
          msgtext = '导入成功！\n' + msgtext
          this.$alert(msgtext, '导入成功')
          this.loadupload = false
        })
        // console.log(base64Str)
      }
    },

    beforeUpload(file) {
      console.log(file)
    },
    uploadSuccess(res, file, fileList) {
      const data = res.data
      console.log('upload result:', res, file)
      file.key = data.key
    },

    // 根据ajbs加载案号
    loadCase(ajbs) {
      if (ajbs === null || ajbs === '') {
        return
      }
      this.listQuery.keyword = ajbs
      this.handleFilter()
    },

    handleCheckAllChange(val) {
      setTimeout(() => {
        this.checkAll = val
        for (var i = 0; i < this.list.length; i++) {
          this.list[i].checked = this.checkAll
        }

        this.tableIsIndeterminate = false
      })
    },
    tableCheckboxChange() {
      setTimeout(() => {
        const isAllTrue = this.list.every(item => item.checked === true)
        const isAllFalse = this.list.every(item => item.checked === false)
        if (isAllTrue) {
          this.tableIsIndeterminate = false
          this.checkAll = true
        } else if (isAllFalse) {
          this.tableIsIndeterminate = false
          this.checkAll = false
        } else {
          this.checkAll = false
          this.tableIsIndeterminate = true
        }
      }, 0)
    },
    // 打印运单
    PrintEms() {
      this.saveInfo(res => {
        this.printLoading = true
        const token = getToken()
        const data = {
          template: this.temp.emstemplate,
          id: res.data,
          token: token
        }
        this.jsp('printems.html', data)
          .then(res => {
            this.$message('完成打印')
            this.printLoading = false
          })
          .catch(err => {
            let errmsg = ''
            if (err.status === 400) {
              errmsg = '无法连接本地服务。请检查本地服务是否已经启动！\n\n'
            }
            this.showMsg(
              errmsg +
                '错误代码：' +
                err.status +
                '，错误信息：' +
                err.statusText
            )
            this.printLoading = false
          })
      })
    },
    // 获取已生成的文书列表
    getDoclist() {
      const doclist = { id: [this.temp.id] }
      postdata('/docprint/doclist', doclist).then(res => {
        this.Doclist = res.data
        // console.log(this.Doclist);
      })
    },

    saveInfo(func) {
      postdata('/docprint/save', this.temp).then(res => {
        func(res)
      })
    },

    changeCheck(val) {
      this.checkedList = []
      val.forEach(item => {
        this.checkedList.push(item.id)
      })
    },
    // 打印文书
    func_print_doc(docid) {
      this.printLoading = true
      const token = getToken()
      const data = { id: docid, token: token }
      this.jsp('printdoc.html', data)
        .then(res => {
          this.$message('完成打印')
          this.printLoading = false
        })
        .catch(err => {
          let errmsg = ''
          if (err.status === 400) {
            errmsg = '无法连接本地服务。请检查本地服务是否已经启动！\n\n'
          }
          this.showMsg(
            errmsg + '错误代码：' + err.status + '，错误信息：' + err.statusText
          )
          this.printLoading = false
        })
    },
    // 批量打印运单
    handlePrint() {
      //  console.log(this.checkedList);
      this.batchPrint.id = this.checkedList
      if (this.batchPrint.id.length > 0) {
        const token = getToken()
        const data = {
          template: this.batchPrint.emstemplate,
          id: this.batchPrint.id,
          token: token
        }
        this.jsp('printems.html', data)
          .then(res => {
            this.$message('完成打印')
          })
          .catch(err => {
            let errmsg = ''
            if (err.status === 400) {
              errmsg = '无法连接本地服务。请检查本地服务是否已经启动！\n\n'
            }
            this.showMsg(
              errmsg +
                '错误代码：' +
                err.status +
                '，错误信息：' +
                err.statusText
            )
          })
      } else {
        this.showMsg('您需要先选择一条记录才可操作！')
        return
      }
    }
  }
}
</script>

