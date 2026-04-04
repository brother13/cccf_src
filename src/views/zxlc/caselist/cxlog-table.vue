<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 300px;"
        class="filter-item"
        @change="handleFilter"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>余额
      <el-input
        v-model="listQuery.ye_min"
        clearable
        placeholder="最小余额"
        style="width: 120px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />~
      <el-input
        v-model="listQuery.ye_max"
        clearable
        placeholder="最大余额"
        style="width: 120px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />查控情况
      <el-select
        v-model="listQuery.ckzt"
        placeholder="查控状态"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="全部" value />
        <template v-for="item in ckztList">
          <el-option :key="item.ckzt" :label="item.ckzt" :value="item.ckzt" />
        </template>
      </el-select>
      <br>
      <el-select
        v-model="listQuery.timetype"
        placeholder="根据时间筛选"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option label="立案时间" value="larq" />
        <el-option label="联查时间" value="query" />
      </el-select>
      <el-date-picker
        v-model="listQuery.time1"
        type="date"
        placeholder="起始日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />
      <el-date-picker
        v-model="listQuery.time2"
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
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >导出</el-button>

      <el-button
        v-if="checkedList.length"
        v-waves
        class="filter-item"
        icon="el-icon-check"
        type="primary"
        @click="handleBatch"
      >批量处理{{ checkedList.length }}项</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      stripe
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="changeCheck"
    >
      <el-table-column label="案件信息" prop="ah" align="center" width="200">
        <template slot-scope="{row}">
          <span>{{ row.caseinfo }}</span>
          <br>
          <span>{{ row.deptname }} / {{ row.cbr }}</span>
          <br>
          <span>立案时间：{{ row.larq }}</span>
          <br>
          <span>标的：{{ row.labd }}</span>
          <br>
          <span v-if="row.querytime">查询：{{ row.querytime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当事人信息" prop="ah" align="center" width="220">
        <template slot-scope="{row}">
          <span>{{ row.dsrmc }}</span>
          <br>
          <span>{{ row.zjhm }}</span>
        </template>
      </el-table-column>
      <el-table-column label="查控信息" prop="cxinfo" align="center" width="220">
        <template slot-scope="{row}">
          <span>状态：{{ row.ckzt }}</span>
          <br>
          <span>时间：{{ row.opertime }}</span>
          <br>
          <span>范围：{{ row.ckfw }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否足额" prop="sfze" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.totalje - row.labd >=0 ? '足额' : '不足额' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="银行/网络银行" prop="ye" align="center" width="180">
        <template slot-scope="{row}">
          <span>银行：{{ row.yhje }}</span>
          <br>网络银行：
          <span>{{ row.wlyhje }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其它财产线索" prop="other" align="center" width="120">
        <template slot-scope="{row}">
          <span>车辆：{{ row.carnum }} 辆</span>
          <br>
          <span>不动产：{{ row.bdcnum }} 处</span>
          <!-- <br>
          <span>证券：{{ row.zqnum }}</span>-->
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="success" size="mini" icon="el-icon-view" @click="handlePrint(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-loading="showCxinfo"
      title="财产查询反馈汇总表"
      :visible.sync="dialogFormVisible"
      width="900px"
      @opened="loadCxinfo"
    >
      <!-- <div class="cxinfo" id="cxinfo" v-html="ckinfohtml"></div> -->
      <iframe id="cxinfo_frame" src="about:blank" class="cxinfo" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button icon="el-icon-download" @click="cxinfoExport()">下载</el-button>
        <!-- <el-button type="primary" icon="el-icon-printer" v-print="print_cxinfo">打印</el-button> -->
        <el-button type="primary" icon="el-icon-printer" @click="cxinfoPrint()">打印</el-button>
      </div>
    </el-dialog>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { postdata } from '@/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'

export default {
  name: 'CxlogTable',
  components: { Pagination },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      caseinfo: undefined,
      listLoading: true,
      downloadLoading: false,
      dialogFormVisible: false,
      saveLoading: false,
      showCxinfo: false,
      ckinfohtml: undefined,
      listQuery: {
        type: '',
        page: 1,
        pagesize: 10,
        read: '0',
        keyword: undefined,
        ye_min: undefined,
        ye_max: undefined,
        timetype: '',
        time1: '',
        time2: '',
        enough: '2',
        ckzt: '已反馈'
      },

      print_cxinfo: {
        id: 'cxinfo',
        popTitle: '' // 打印的标题
      },
      checkedList: [],
      querytimeList: [],
      ckztList: [],
      cxinfohtml: '',

      type: 'bank',
      // 导出的相关配置
      export: {
        title: '联查情况记录表',
        header: [
          '案件标识',
          '查询流水号',
          '承办部门',
          '承办人',
          '案号',
          '当事人名称',
          '证件号码',
          '立案日期',
          '立案标的',
          '查控发起时间',
          '查询状态',
          '查询范围',
          '有余额银行账户',
          '银行总余额',
          '有余额网络资金',
          '网络资金余额',
          '银行与网络资金总余额',
          '房产数量',
          '车辆数量',
          '证券',
          '工商信息',
          '更新查询时间'
        ],
        field: [
          'ajbs',
          'cklsh',
          'deptname',
          'cbr',
          'caseinfo',
          'dsrmc',
          'zjhm',
          'larq',
          'labd',
          'opertime',
          'ckzt',
          'ckfw',
          'yhnum',
          'yhje',
          'wlyhnum',
          'wlyhje',
          'totalje',
          'bdcnum',
          'carnum',
          'zqnum',
          'gsnum',
          'updateTime'
        ]
      },

      temp: {
        id: 0,
        ajbs: '',
        caseinfo: '',
        deptname: '',
        cbr: '',
        cklsh: ''
      }
    }
  },

  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      postdata('/data/list', { type: 'querytime' }).then((res) => {
        const resdata = res.data
        this.querytimeList = resdata.items
      })

      // ckztList
      postdata('/data/list', { type: 'ckzt' }).then((res) => {
        const resdata = res.data
        this.ckztList = resdata
      })

      this.caseinfo = this.$route.query.caseinfo

      if (this.caseinfo !== '' && this.caseinfo !== null) {
        this.loadCase(this.caseinfo)
      }
    },
    loadCase(caseinfo) {
      this.listQuery.keyword = caseinfo
      this.handleFilter()
    },
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/zxlc/cxlog', this.listQuery).then((response) => {
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

    resetTemp() {
      this.temp = {
        id: 0,
        ajbs: '',
        caseinfo: '',
        deptname: '',
        cbr: '',
        cklsh: ''
      }
    },

    handleExport() {
      // 导出数据
      postdata('/zxlc/downcxlog', this.listQuery).then((res) => {
        const alldata = res.data
        this.handleDownload(alldata)
      })
    },

    handlePrint(row) {
      // this.showCxinfo = true;
      this.temp = Object.assign({}, row) // copy obj
      // const data = { ajbs: row.ajbs, cklsh: row.cklsh };
      // this.print_cxinfo.popTitle =
      //   row.caseinfo + "_" + row.dsr + "财产查询反馈汇总表";

      this.dialogFormVisible = true
      // postdata("/html/gdlcinfo", data).then((res) => {
      //   this.ckinfohtml = res.data;
      //   // console.log(this.ckinfohtml);
      //   this.dialogFormVisible = true;
      //   let obj = document.getElementById("cxinfo_frame");
      //   console.log(obj);
      //   var iwindow = obj.contentWindow;
      //   iwindow.innerHTML = res.data;
      // });

      // this.$nextTick(() => {
      //   this.$refs["dataForm"].clearValidate();
      // });
    },
    loadCxinfo() {
      const row = this.temp
      const data = { ajbs: row.ajbs, cklsh: row.cklsh }
      this.print_cxinfo.popTitle =
        row.caseinfo + '_' + row.dsrmc + '_' + row.cklsh + '财产查询反馈汇总表'
      const obj = document.getElementById('cxinfo_frame')
      // console.log(obj);
      var iwindow = obj.contentWindow
      iwindow.document.body.innerHTML = ''

      postdata('/html/gdlcinfo', data).then((res) => {
        this.ckinfohtml = res.data
        // console.log(this.ckinfohtml);
        // this.dialogFormVisible = true;

        iwindow.document.body.innerHTML = res.data
        this.showCxinfo = false
        // console.log(obj);
      })
    },

    cxinfoPrint() {
      // 设置标题
      const oldtitle = document.title
      document.title = this.print_cxinfo.popTitle
      const obj = document.getElementById('cxinfo_frame')
      obj.contentWindow.print()
      document.title = oldtitle
    },
    cxinfoExport() {
      const filename =
        this.temp.caseinfo +
        '_' +
        this.temp.dsrmc +
        '_' +
        this.temp.cklsh +
        '_财产查询反馈汇总表.docx'
      console.log(this.ckinfohtml)
      asBlob(this.ckinfohtml).then((data) => {
        saveAs(data, filename) // 保存为docx文件
      }) // asBlob() 返回 Promise<Blob|Buffer>，用promise.then还是async语法都行
    },

    changeCheck(val) {
      this.checkedList = []
      val.forEach((item) => {
        this.checkedList.push(item.id)
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
    }
  }
}
</script>
<style>
.money {
  font-size: 16px;
  color: #f56c6c;
}
.cxinfo {
  width: 100%;
  height: 500px;
  overflow-y: auto;
  border: none;
}
</style>
