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
      <!-- <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-upload2"
        @click="handleUpload"
      >导入案件</el-button>-->
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
      <el-table-column label="案号" prop="caseinfo" align="center" width="200" />
      <el-table-column label="当事人" prop="dsr" align="center" width="200" />
      <el-table-column label="案件类型" prop="ajlbmc" align="center" width="80">
        <template slot-scope="{row}">{{ row.ajlb|getajlbname }}</template>
      </el-table-column>
      <el-table-column label="立案时间" prop="larq" align="center" width="120" />
      <el-table-column label="标的" prop="labd" align="center" width="100" />
      <el-table-column label="案由" prop="laay" align="center" width="120" />
      <el-table-column label="承办部门" prop="deptname" align="center" width="100" />
      <el-table-column label="承办人" prop="cbrmc" align="center" width="80" />
      <el-table-column label="更新时间" prop="cbrmc" align="center" width="80">
        <template
          slot-scope="{row}"
        >{{ row.createtime>row.updatetime ? row.createtime : row.updatetime }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="success" @click="handelShowType(row)">文书</el-button>
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

    <el-dialog v-loading="printLoading" title="执行送达文书" :visible.sync="dialog_zxsdws">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="案号" prop="caseinfo">{{ temp.caseinfo }}</el-form-item>
        <el-form-item label="打印时间" prop="printdate">
          <el-date-picker
            v-model="tempdoc.printdate"
            type="date"
            placeholder="选择打印时间"
            class="doc-input"
          />
        </el-form-item>
        <el-form-item label="立案案由" prop="laay">
          <el-input v-model="temp.laay" style="doc-input" />
        </el-form-item>
        <el-form-item label="依据单位" prop="zxyjfy">
          <el-input v-model="temp.zxyjfy" style="doc-input" />
        </el-form-item>

        <el-form-item label="依据文号" prop="zxyjah">
          <el-input v-model="temp.zxyjah" style="doc-input" />
        </el-form-item>
        <el-form-item label="依据文书" prop="zxyjws">
          <el-select v-model="temp.zxyjws" placeholder="请选择文书类型" class="filter-item doc-input">
            <el-option
              v-for="item in zxyjwsList"
              :key="item.classcode"
              :label="item.classname"
              :value="item.classname"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间" prop="ordertime">
          <el-date-picker
            v-model="tempdoc.ordertime"
            type="datetime"
            placeholder="选择预约时间"
            class="doc-input"
            default-time="09:30:00"
          />
        </el-form-item>
        <el-form-item label="预约庭室" prop="orderroom">
          <el-select
            v-model="tempdoc.orderroom"
            placeholder="请选择预约庭室"
            class="filter-item doc-input"
          >
            <el-option
              v-for="item in roomList"
              :key="item.roomcode"
              :label="item.roomname"
              :value="item.roomname"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="传唤事由" prop="chsy">
          <el-select v-model="tempdoc.chsy" placeholder="请选择传唤事由" class="filter-item doc-input">
            <el-option
              v-for="item in chsyList"
              :key="item.classcode"
              :label="item.classname"
              :value="item.classname"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当事人" prop="dsr">
          <el-checkbox-group v-model="tempdoc.dsr">
            <template v-for="(dsr,index) in temp.dsrlist">
              <el-checkbox
                :key="index+50000"
                :label="dsr.dsrid"
                :value="dsr.dsrid"
                @change="showtempdoc()"
              >{{ dsr.ssdw }} : {{ dsr.dsrmc }}</el-checkbox>
              <template v-if="tempdoc.dsr.includes(dsr.dsrid)">
                <el-form-item :key="index+40000" label="姓名">
                  <el-input
                    v-model="temp.dsrlist[index].dsrmc"
                    clearable
                    placeholder="当事人名称"
                    style="width: 300px;"
                    class="filter-item"
                  />
                </el-form-item>
                <el-form-item :key="index+10000" label="地址">
                  <el-input
                    v-model="temp.dsrlist[index].address"
                    clearable
                    placeholder="当事人地址"
                    style="width: 300px;"
                    class="filter-item"
                  />
                </el-form-item>
                <el-form-item :key="index+20000" label="电话">
                  <el-input
                    v-model="temp.dsrlist[index].mobile"
                    clearable
                    placeholder="当事人电话"
                    style="width: 300px;"
                    class="filter-item"
                  />
                </el-form-item>
                <el-form-item :key="index+30000" label="邮编">
                  <el-input
                    v-model="temp.dsrlist[index].post"
                    clearable
                    placeholder="当事人邮编"
                    style="width: 300px;"
                    class="filter-item"
                  />
                </el-form-item>
              </template>
              <br :key="index+60000">
            </template>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="文书模板" prop="template">
          <el-checkbox-group v-model="tempdoc.template">
            <template v-for="(template,index) in templateList">
              <el-checkbox
                :key="10000+template.id"
                :label="template.id"
              >{{ index+1 }}.{{ template.tplname }}</el-checkbox>
              <br :key="20000+template.id">
            </template>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog_zxsdws = false">取消</el-button>
        <el-button type="primary" @click="PrintDoc()">打印文书</el-button>
        <!-- <el-button type="primary" @click="DownDocZip()">下载文书</el-button> -->
      </div>
    </el-dialog>

    <el-dialog v-loading="printLoading" title="执保文书" :visible.sync="dialog_zbws" />

    <el-dialog :visible.sync="dialog_selectType" title="选择文书类型">
      <el-row type="flex" class="row-bg" justify="center">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="handleShowAdd_Zxsdws()">执行送达文书</el-button>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple-light" />
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button type="primary" disabled @click="handleShowAdd_Zbws()">执保文书</el-button>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <el-dialog
      v-loading="loadQrcode"
      :visible.sync="showqrcode"
      center
      width="400px"
      title="案件二维码信息"
      @open="openQrCode"
    >
      <div class="qrcode">
        <div id="qrcode" class="qrcodeimage" />
        <div class="qrcodetext">{{ qrdata.caseinfo }} 第 {{ qrdata.index }} 卷</div>
      </div>
    </el-dialog>

    <el-dialog v-loading="loadupload" :visible.sync="showUpload" title="导入数据">
      <div class="uploadform">
        <el-form
          ref="uploadForm"
          label-position="left"
          label-width="80px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item label="文件类型" prop="filetype">
            <el-select
              v-model="upload.filetypeid"
              placeholder="上传文件类型"
              clearable
              style="width:100%;"
              class="filter-item"
            >
              <el-option
                v-for="(item ,i) in UploadTypeList"
                :key="item.filetypeid"
                :label="(i+1)+'.'+item.filetypename"
                :value="item.filetypeid"
              />
            </el-select>
          </el-form-item>
          <el-upload ref="upload" action="/dev-api/index.php" :http-request="httpRequest">
            <el-button type="success">上传并导入</el-button>
          </el-upload>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { postdata } from '@/api/doc/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import QRcode from 'qrcodejs2'
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'

export default {
  name: 'CaseinfoTable',
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
    }
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      uploading: false,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: '',
        ajlb: [],
        isvoid: '0'
      },
      printLoading: false,
      loadajbs: '',
      ajlbList: [],
      qrcode: null,
      loadQrcode: false,
      qrdata: { ajbs: '', data: '', caseinfo: '', index: 1 },
      showqrcode: false,
      loadupload: false,
      showUpload: false,
      dialog_selectType: false,
      dialog_zbws: false, // 执保文书
      dialog_zxsdws: false, // 执行送达文书

      UploadTypeList: [],
      unselected_dsr_list: [],
      zxyjwsList: [], // 执行依据文书
      chsyList: [], // 传唤事由
      fileReader: '',
      upload: { filetypeid: 0, filedata: '', filename: '' },
      temp: {
        id: 0,
        dwid: 0,
        fycode: '',
        appid: '',
        ajbs: '',
        caseinfo: '',
        ajlb: '',
        caseyear: '',
        casetypename: '',
        casenum: null,
        larq: null,
        oldfyname: null,
        oldcaseinfo: null,
        laay: null,
        labd: null,
        deptcode: null,
        deptname: null,
        cbr: null,
        cbrmc: null,
        sjy: null,
        sjymc: null,
        zxyjfy: '',
        zxyjah: '',
        zxyjzl: '',
        zxyjws: '',
        dsrnum: null,
        createtime: null,
        updatetime: null,
        dsr: null,
        useroom: '',
        dsrlist: [{ dsrid: 0, ssdw: '', dsrmc: '' }]
      },
      tempdoc: {
        ajbs: '',
        caseinfo: '',
        dsr: [],
        zxyjfy: '',
        zxyjah: '',
        zxyjws: '',
        chsy: '',
        printdate: '',
        template: [],
        ordertime: '',
        orderroom: ''
      },
      roomList: [],
      templateList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑案号',
        create: '创建案号'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        dsr: [{ required: true, message: '当事人不能为空', trigger: 'change' }],

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
    // console.log("caseinfo - created")
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

      postdata('/room/list', {}).then(res => {
        const resdata = res.data
        this.roomList = resdata.items
      })

      postdata('/data/list', { type: 'zxws' }).then(res => {
        const resdata = res.data
        this.zxyjwsList = resdata.items
      })
      postdata('/data/list', { type: 'chsy' }).then(res => {
        const resdata = res.data
        this.chsyList = resdata.items
      })

      postdata('/data/list', { type: 'unselected_dsr' }).then(res => {
        this.unselected_dsr_list = res.data.items
      })
    },
    getList() {
      this.listLoading = true

      postdata('/case/list', this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total

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
    // 生成文书
    CreateDoc(method) {
      // 先检查数据是否可用

      if (this.tempdoc.ajbs === '') {
        this.showMsg('案件不能为空')
        return
      }

      if (this.tempdoc.dsr.length < 1) {
        this.showMsg('您至少需要选择一位以上的当事人')
        return
      }
      if (this.tempdoc.template.length < 1) {
        this.showMsg('您至少要选择一种以上文书')
        return
      }
      if (this.tempdoc.ordertime === '' || this.tempdoc.ordertime === null) {
        this.showMsg('预约时间为空！')
        return
      }
      if (this.tempdoc.orderroom === '' || this.tempdoc.orderroom === null) {
        this.showMsg('预约地点为空！')
        return
      }

      this.saveCase(method)
    },

    showtempdoc() {
      console.log(this.tempdoc)
    },
    // 生成文书
    addDoc(method) {
      const casedata = {}
      casedata.ajbs = this.tempdoc.ajbs
      casedata.caseinfo = this.tempdoc.caseinfo
      casedata.ordertime = this.tempdoc.ordertime
      casedata.orderroom = this.tempdoc.orderroom
      casedata.printdate = this.tempdoc.printdate

      const dsr = []
      for (var i = 0; i < this.tempdoc.dsr.length; i++) {
        const dsrid = this.tempdoc.dsr[i]
        let dsrmc = ''
        for (var j = 0; j < this.temp.dsrlist.length; j++) {
          if (this.temp.dsrlist[j].dsrid === dsrid) {
            dsrmc = this.temp.dsrlist[j].dsrmc
            break
          }
        }
        dsr.push({ dsrid: dsrid, dsrmc: dsrmc })
      }
      casedata.dsr = dsr
      const data = {
        casedata: [casedata],
        printdata: this.tempdoc,
        template: this.tempdoc.template,
        check: false
      }

      // 先保存案件信息

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
    // 保存案件信息
    saveCase(method) {
      // 先保存案件信息
      const data = { casedata: this.temp, printdata: this.tempdoc }
      postdata('/case/save', data).then(res => {
        if (res.code === 20000) {
          this.addDoc(method)
        } else {
          this.showMsg(res.message)
        }
      })
    },
    // 打印文书（调用本地服务）
    PrintDoc() {
      this.CreateDoc('print')
    },
    // 下载zip包
    DownDocZip() {
      this.CreateDoc('download')
    },
    func_print(docid) {
      this.printLoading = true
      const token = getToken()

      // 先获取doclist，再添加打印任务
      const docdata = { id: docid }
      postdata('/docprint/doclist', docdata).then(res => {
        if (res.code !== 20000) {
          this.showMsg('出错：' + res.message)
          return
        }
        const resdata = res.data
        const idarr = []
        for (const i in resdata) {
          idarr.push(resdata[i].id)
        }
        const data = { id: idarr, token: token }
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
    // 显示选择文书类型的按钮
    handelShowType(row) {
      this.temprow = row
      if (this.temprow.dsrlist == null) {
        this.showMsg('当事人不能为空！')
        return
      }
      this.dialog_selectType = true
    },

    // 获取案件信息，并打开增加文书的界面
    handleShowAdd_Zxsdws() {
      this.dialog_selectType = false
      this.temp = Object.assign({}, this.temprow) // copy obj
      this.dialogStatus = 'update'

      if (this.temp.dsrlist == null) {
        this.showMsg('当事人不能为空！')
        return
      }
      this.initTempDoc()
      this.dialog_zxsdws = true

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 获取案件信息，并打开增加文书的界面 - 执保
    handleShowAdd_Zbws() {
      // let cando = false
      // if (!cando) {
      //   return
      // }
      // this.dialog_selectType = false
      // this.temp = Object.assign({}, this.temprow) // copy obj
      // this.dialogStatus = 'update'
      // if (this.temp.dsrlist == null) {
      //   this.showMsg('当事人不能为空！')
      //   return
      // }
      // this.initTempDoc()
      // this.dialog_zbws = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    // 初始化tempdoc里的信息
    // 将所有的当事人选中，将所有的文书模板选中
    initTempDoc() {
      this.tempdoc.ajbs = this.temp.ajbs
      this.tempdoc.caseinfo = this.temp.caseinfo
      this.tempdoc.ordertime = ''
      this.tempdoc.orderroom = ''
      // 将打印时间设定为 立案时间
      if (this.temp.zxyjfy == null) {
        this.temp.zxyjfy = this.temp.fyname
      }

      if (this.temp.zxyjzl != null) {
        // 取 的 字后面的值
        // @todo 先手工选择
      }

      this.tempdoc.printdate = this.temp.larq
      // 将单位设置为当前法院（默认）
      this.tempdoc.zxyjfy = this.temp.fyname
      // 执行文号
      this.tempdoc.zxyjah = this.temp.zxyjah

      const cbr = this.temp.cbrmc
      const data = { username: cbr }
      postdata('/user/userroom', data).then(res => {
        this.tempdoc.orderroom = res.data
      })

      // 获取当前用户的orderroom

      this.tempdoc.dsr = []
      if (this.temp.dsrlist != null) {
        for (var i = 0; i < this.temp.dsrlist.length; i++) {
          // const dsrname = this.temp.dsrlist[i].dsrmc
          const dsrssdw = this.temp.dsrlist[i].ssdw
          const dsrid = this.temp.dsrlist[i].dsrid
          // 判断是否在 unselected_dsr_list表中，如果不在，才加入

          const isUnDsr = this.unselected_dsr_list.every(
            item => item.classname !== dsrssdw
          )
          if (isUnDsr) {
            this.tempdoc.dsr.push(dsrid)
          }
        }
      }
      // console.log(this.tempdoc);
      if (this.chsyList.length > 0 && this.tempdoc.chsy === '') {
        this.tempdoc.chsy = this.chsyList[0].classname
      }

      // 将所有模板选中
      this.tempdoc.template = []
      for (var j = 0; j < this.templateList.length; j++) {
        this.tempdoc.template.push(this.templateList[j].id)
      }
    },

    updateData() {
      this.$refs['dataForm'].validate(valid => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

        if (valid) {
          postdata('/nodetype/save', newtemp).then(response => {
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
    // 显示二维码数据
    handShowQrcode(data) {
      this.qrdata.caseinfo = data.caseinfo
      this.qrdata.ajbs = data.ajbs

      this.showqrcode = true
    },

    handAddDoc(data) {},

    openQrCode() {
      // 打开 对话框时的操作
      postdata('/case/qrcode', this.qrdata).then(res => {
        this.qrdata.data = res.data
        document.getElementById('qrcode').innerHTML = '' // 清空

        const qrcode = new QRcode(document.getElementById('qrcode'), {
          text: '',
          width: 256,
          height: 256,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRcode.CorrectLevel.M
        })
        qrcode.clear()
        // console.log(this.qrdata)

        qrcode.makeCode(this.qrdata.data)
        this.loadQrcode = false
      })
    },

    handleUpload() {
      // 导入数据
      this.showUpload = true
    },
    handlePreview(file) {
      console.log(file)
    },
    checkFile(file, filelist) {
      console.log('on-change:checkFile')
      console.log(file)
      if (file) {
        this.fileReader = new FileReader()
        this.fileReader.readAsDataURL(file)
      }
      const filename = file.name
      this.fileReader.onload = () => {
        console.log('checkFile > fileReader onload > ')
        console.log(filename)
        const base64Str = this.fileReader.result
        this.upload.filedata = base64Str
        console.log('base64:')
        console.log(base64Str)
      }
    },
    uploadFile() {
      postdata('/import/import', this.upload).then(res => {
        console.log(res)
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
    }
  }
}
</script>

<style>
.qrcode {
  text-align: center;
  height: 100%;
  width: 100%;
}
.qrcodeimage {
  height: 256px;
  width: 256px;
  margin: auto;
  margin-bottom: 30px;
}
.qrcodetext {
  font-size: 16px;
  text-align: center;
}

.doc-input {
  width: 100%;
}
</style>
