<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="姓名"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <el-date-picker
        v-model="listQuery.starttime"
        type="date"
        placeholder="起始日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />
      <el-date-picker
        v-model="listQuery.endtime"
        type="date"
        placeholder="截止日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>

      文书模板：
      <el-select
        v-model="template"
        placeholder="文书模板"
        clearable
        style="width: 200px"
        class="filter-item"
      >
        <el-option
          v-for="item in templateList"
          :key="item.id"
          :label="item.tplname"
          :value="item.id"
        />
      </el-select>
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
      <el-table-column label="被巡检单位" prop="jail" align="center" width="130" />
      <el-table-column label="巡检人" prop="username" align="center" width="200" />
      <el-table-column label="巡检日期" prop="casedate" align="center" width="120" />
      <el-table-column label="数量" prop="num" align="center" width="80" />

      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">

          <el-button size="mini" type="primary" icon="el-icon-document" @click="showDocPage(row)">检察日志</el-button>
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

    <el-dialog v-loading="loading_doc" title="批量生成文书" :visible.sync="showBatchWin">
      <el-form label-position="left" label-width="120px" style="width: 600px; margin-left:50px;">
        <el-form-item label="案号" prop="caseinfo">
          <span>{{ caseinfo }}</span>
        </el-form-item>
        <el-form-item label="问题数量" prop="checknum">
          <span>{{ allid.length }}</span>
        </el-form-item>
        <el-form-item label="问题描述" prop="checknum">
          <el-checkbox-group v-model="allid">
            <template v-for="(item,index) in casedetail">
              <el-checkbox :key="item.id" :label="item.id">{{ index+1 }}.{{ item.checkitem }}</el-checkbox>
              <br :key="'20000'+item.id">
            </template>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="文书模板" prop="template">
          <el-checkbox-group v-model="template">
            <template v-for="(item,index) in templateList">
              <el-checkbox :key="item.id" :label="item.id">{{ index+1 }}.{{ item.tplname }}</el-checkbox>
              <br :key="'20000'+item.id">
            </template>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBatchWin = false">取消</el-button>
        <el-button type="primary" icon="el-icon-download" @click="DownDocZip(allid)">下载文书</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { saveAs } from 'file-saver'

const caseTypeList = [
  { label: '全部', value: '' },
  { label: '已完成', value: '1' },
  { label: '未完成', value: '2' }
]

const caseStatusList = [
  { label: '全部', value: '' },
  { label: '未归档', value: '0' },
  { label: '已归档', value: '1' }
]
export default {
  name: 'UserDailyTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === '0' ? 'success' : 'danger'
    }
  },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      uploading: false,
      caseTypeList,
      caseStatusList,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: '',
        ajlb: [],
        isvoid: '0',
        isprinted: '0',
        starttime: '',
        endtime: '',
        status: '',
        archive: ''
      },
      isPrintList: [
        { code: '', text: '全部' },
        { code: '0', text: '未打印' },
        { code: '1', text: '已打印' }
      ],
      templateList: [],
      showBatchWin: false,
      loading_doc: false,
      template: [],
      allid: [],
      caseinfo: '',
      casedetail: [{ id: '', checkitem: '' }],

      temp: {
        caseid: '',
        caseinfo: '',
        jail: '',
        checkitem: '',
        itemid: '',
        groupname: '',
        groupuser: '',
        groupusername: '',
        username: '',
        createtime: '',
        updatetime: '',
        synctime: ''
      },

      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '查看',
        create: '查看'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {}
    }
  },
  computed: {},
  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      postdata('/template/list', { type: 'docx', ajlb: '2' }).then((res) => {
        const resdata = res.data

        this.templateList = resdata.items
        if (resdata.items.length > 0) {
          this.template = resdata.items[0].id
        }
      })
    },
    archiveCase(caseid) {
      const msgtext = '您确定要归档案件吗'
      this.$confirm(msgtext, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 操作提交审批信息
        postdata('/jcy/archive', { caseid: caseid }).then((res) => {
          this.showMsg('完成！')
          this.getList()
        })
      })
    },
    showDetail(row) {
      const caseinfo = row.caseinfo

      const link = '/case/casedetail-table'
      const query = { caseinfo: caseinfo }
      this.$router.push({ path: link, query: query })
    },

    showDocPage(row) {
      const data = { caseid: row.caseid, username: row.username, casedate: row.casedate, template: this.template, jail: row.jail }
      postdata('/jcy/userdailydoc', data).then((response) => {
        const resdata = response.data
        // console.log(resdata)
        // this.loading_doc = false
        if (response.code !== 20000) {
          this.showMsg('下载文书出错：' + response.message)
          return
        }

        const newblob = this.func_base64_to_blob(
          resdata.data,
          resdata.filetype
        )
        saveAs(newblob, resdata.filename)
      })
    },

    DownDocZip(ids) {
      const data = { id: ids, template: this.template }
      if (this.template.length < 1) {
        this.showMsg('模板不能为空！')
        return
      }
      this.loading_doc = true
      postdata('/jcy/downzip', data).then((res) => {
        this.loading_doc = false
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
    getList() {
      this.listLoading = true

      postdata('/jcy/userdaily', this.listQuery).then((response) => {
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
      this.$alert('操作成功', '提示')
      // this.$message({
      //   message: '操作成功',
      //   type: 'success'
      // })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },

    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 弹框显示
    showMsg(str) {
      this.$alert(str, '提示')
    },
    // 生成文书
    CreateDoc(method) {
      // 先检查数据是否可用
    },

    // 下载zip文件
    func_download(docid) {
      const data = { id: docid }

      postdata('/docprint/downzip', data).then((res) => {
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

    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
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
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
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

.el-checkbox__input {
  display: inline-grid;
  white-space: pre-line;
  word-wrap: break-word;
  overflow: hidden;
  line-height: 20px;
}

.el-checkbox, .el-checkbox__input {  white-space: normal;  word-break: break-all;
}

</style>
