<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      :title="tableTitle"
      width="80%"
    >
      <!-- 放置查询条件 -->

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          clearable
          placeholder="请输入关键字"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="getAllData"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
        <el-date-picker
          v-model="listQuery.date"
          type="date"
          placeholder="入账日期"
          style="width: 150px"
          value-format="yyyy-MM-dd"
          class="filter-item"
          @change="getAllData"
        />
        <el-button
          class="filter-item"
          type="primary"
          style="margin-left: 10px"
          icon="el-icon-search"
          @click="getAllData"
        >查询</el-button>
      </div>
      <el-tabs v-model="activeName" type="border-card">
        <template v-for="(item, index) in tabData">
          <el-tab-pane
            :key="'tab' + index"
            :name="'type' + index"
            :label="item.label + (item.total > 0 ? '(' + item.total + ')' : '')"
          >
            <template v-if="index == 0">
              <!-- 仅第一页显示 -->
              <el-button
                v-if="checkedInfo.num"
                class="filter-item"
                style="margin-left: 10px"
                type="success"
                :disabled="doBatching"
                :icon="doBatching ? 'el-icon-loading' : 'el-icon-right'"
                @click="showBatch(checkedInfo.banklsh)"
              >导入生成 {{ checkedInfo.num }} 条款项入账</el-button>
              <span v-if="doBatching">{{ donenum }} / {{ checkedInfo.num }}</span>
            </template>
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-download"
              @click="handleExport(index)"
            >导出</el-button>

            <el-table
              :key="'key' + index"
              v-loading="item.loading"
              :data="item.data"
              border
              fit
              highlight-current-row
              size="mini"
              height="400"
              style="width: 100%"
              :row-class-name="tableRowClassName"
              @selection-change="changeCheck"
            >
              <el-table-column
                v-if="index == 0 && canImport"
                type="selection"
                label="选择"
                :selectable="checkSelectable"
              />

              <el-table-column
                type="index"
                width="50"
                align="center"
                label="序号"
              >
                <template slot-scope="{ $index }">
                  {{
                    $index +
                      item.listQuery.pagesize * (item.listQuery.page - 1) +
                      1
                  }}
                </template>
              </el-table-column>
              <el-table-column
                v-if="index == 0"
                label="操作"
                align="center"
                width="100"
                class-name="small-padding fixed-width"
              >
                <template slot-scope="{ row }">
                  <el-button
                    v-show="row.isused == ''"
                    type="primary"
                    size="mini"
                    icon="el-icon-position"
                    @click="getLsh(row.bank_lsh)"
                  >
                    导入</el-button>
                </template>
              </el-table-column>

              <template v-for="field in fieldList">
                <template v-if="field.show">
                  <el-table-column
                    :key="field.field"
                    :label="field.label"
                    :prop="field.field"
                    :align="field.align ? field.align : 'center'"
                    :width="field.width ? field.width : 100"
                  >
                    <template slot-scope="{ row }">
                      <template v-if="field.align == 'right'">
                        {{ formatNumber(row[field.field]) }}
                      </template>
                      <template v-else>
                        {{ row[field.field] }}
                      </template>
                    </template>
                  </el-table-column>
                </template>
              </template>
            </el-table>

            <pagination
              v-show="item.total > 0"
              :total="item.total"
              :page.sync="item.listQuery.page"
              :limit.sync="item.listQuery.pagesize"
              @pagination="getList(index)"
            />
          </el-tab-pane>
        </template>
      </el-tabs>
      <LoadingProgress ref="progress" @cancel="stopExport" />
    </el-dialog>

    <el-dialog
      v-dialogDrag
      :visible.sync="showBatchWin"
      title="批量入账"
      append-to-body
    >
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 90%; margin-left: 50px"
      >
        <el-form-item label="数据预览">
          当前共选中 {{ checkedInfo.num }} 笔银行流水记录,共计金额
          {{ formatNumber(checkedInfo.je) }} 元。
        </el-form-item>

        <el-form-item label="制单日期" prop="operdate">
          <el-date-picker
            v-model="temp.operdate"
            type="date"
            placeholder="制单日期"
            style="width: 100%"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="收款方式">
          <el-select v-model="temp.accountid" class="form-item">
            <el-option
              v-for="item in basedata.accountList"
              :key="item.id"
              :label="item.accountname"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBatchWin = false"> 取消 </el-button>
        <el-button
          icon="el-icon-check"
          :disabled="checkedInfo.num < 1"
          type="success"
          @click="batchSaveCasebill"
        >
          批量生成
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import LoadingProgress from '@/components/Courtcase/LoadingProgress'

const typeList = [
  { value: 1, label: '银行流水' },
  { value: 2, label: '特殊账号' },
  { value: 3, label: '本院内转' },
  { value: 4, label: '现场缴纳' }
]

const fieldList = [
  {
    field: 'isused',
    label: '使用状态',
    export: true,
    show: true,
    width: 100,
    order: true
  },
  {
    field: 'accnt_date',
    label: '入账日期',
    export: true,
    show: true,
    width: 100,
    order: true
  },

  {
    field: 'bank_lsh',
    label: '银行流水号',
    export: true,
    show: true,
    width: 120,
    order: true
  },

  {
    field: 'accnt_no',
    label: '入账子账号',
    export: true,
    show: true,
    width: 200,
    order: true
  },
  {
    field: 'je',
    label: '金额',
    export: true,
    show: true,
    width: 100,
    order: true,
    align: 'right'
  },
  {
    field: 'pay_accntno',
    label: '付款账号',
    export: true,
    show: true,
    width: 180,
    order: true
  },
  {
    field: 'pay_accntname',
    label: '付款单位',
    export: true,
    show: true,
    width: 200
  },
  {
    field: 'remark',
    label: '摘要信息',
    export: true,
    show: true,
    width: 200,
    order: true
  },
  { field: 'note', label: '备注', export: true, show: true, width: 150 }
]

export default {
  name: 'BankMx',
  components: { Pagination, LoadingProgress },

  props: {},
  data() {
    return {
      activeName: 'type0',
      showWindow: false,
      tableTitle: '银行流水明细',

      basedata: {
        accountList: []
      },

      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 50 // 默认分页数
      },
      isExporting: false, // 正在导出

      fieldList: fieldList,
      typeList: typeList,
      listQuery: {
        page: 1,
        pagesize: 20,
        keyword: '',
        type: 0,
        sort: '',
        date: ''
      },
      tabData: [],

      export: {
        title: 'export',
        header: [],
        field: [],
        field2: []
      },
      checkedInfo: {
        num: 0,
        je: 0,
        banklsh: []
      },
      showBatchWin: false, // 是否显示批量导入窗口
      doBatching: false,
      donenum: 0,

      temp: {
        banklsh: [],
        accountid: 0,
        operdate: ''
      },

      lskey: 'bankdaymx_query' // 保存快捷搜索的key
    }
  },
  computed: {
    canImport() {
      const roles = this.$store.state.user.roles
      const key = 'CASEBILL_AUTO'

      if (roles && roles.includes(key)) {
        return true
      }
      return false
    }

  },

  mounted() {
    this.init()
  },
  methods: {
    showWin() {
      this.init()

      setTimeout(() => {
        this.getAllData(false)
      }, 100)

      this.$nextTick(() => {
        this.showWindow = true
      })
    },
    init() {
      this.doBatching = false
      this.checkedInfo.banklsh = []

      this.initExport()
      this.initTable()

      this.getbasedata()
      // this.getCacheConfig()
      this.$nextTick(() => {
        // this.getAllData()
      })
    },

    getbasedata() {
      caseapi.base.getBasedata(['account']).then((res) => {
        this.basedata.accountList = res['account']
      })
    },

    saveCacheConfig() {
      // 保存当前的配置信息
      let data = {}
      data.keyword = this.listQuery.keyword
      data.date = this.listQuery.date
      if (this.tabData && this.tabData.length) {
        data.page = this.tabData[0].listQuery.page
        data.pagesize = this.tabData[0].listQuery.pagesize
      }

      const str = JSON.stringify(data)

      return localStorage.setItem(this.lskey, str)
    },

    getCacheConfig() {
      let str = localStorage.getItem(this.lskey)
      if (str) {
        const config = JSON.parse(str)
        return config
        //   if(config){
        //     this.listQuery.keyword = config.keyword || '';

        //      const dayinfo = caseapi.base.getDateRange('today')
        // const theday = dayinfo.starttime
        //     this.listQuery.date = config.date || theday;

        //   }
      }
      return false
    },

    // 初始化表格
    initTable() {
      this.tabData = []
      const dayinfo = caseapi.base.getDateRange('today')
      const theday = dayinfo.starttime

      this.listQuery.date = theday

      // 读取上次保存的配置
      const config = this.getCacheConfig()
      if (config) {
        if (config.date) {
          this.listQuery.date = config.date
        }
        if (config.keyword) {
          this.listQuery.keyword = config.keyword
        }
      }

      for (let i in this.typeList) {
        const info = this.typeList[i]

        let newobj = {}
        let newquery = Object.assign({}, this.listQuery)
        newquery.type = info.value

        newobj['listQuery'] = newquery
        newobj['total'] = 0
        newobj['loading'] = false
        newobj['label'] = info.label
        newobj['data'] = []

        this.tabData.push(newobj)
      }

      if (this.tabData && this.tabData.length > 0) {
        if (config.page) {
          this.tabData[0].listQuery.page = config.page
        }
        if (config.pagesize) {
          this.tabData[0].listQuery.pagesize = config.pagesize
        }
      }
    },
    getAllData(isnew = true) {
      if (isnew) {
        this.saveCacheConfig()
      }

      for (let i in this.tabData) {
        this.tabData[i].listQuery.date = this.listQuery.date
        this.tabData[i].listQuery.keyword = this.listQuery.keyword
        if (isnew) {
          this.tabData[i].listQuery.page = 1
        }

        this.getList(i, isnew)
      }
    },
    // 获取某一项
    getList(index, isnew = true) {
      if (index === 0 && isnew) {
        // 保存第一项的配置
        this.saveCacheConfig()
      }
      if (this.tabData.length > index) {
        const query = this.tabData[index].listQuery
        this.tabData[index].loading = true
        caseapi.casesk.getBankMxList(query).then((res) => {
          this.tabData[index].total = res.total
          this.tabData[index].data = res.items
          this.tabData[index].loading = false
        })
      }
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },

    async handleExport(index) {
      // 分页获取数据情况
      this.exportstatus.total = this.tabData[index].total
      this.exportstatus.done = 0
      this.exportstatus.page = 1
      this.exportstatus.totalpage = Math.floor(
        this.tabData[index].total / this.exportstatus.pagesize
      )
      if (
        this.tabData[index].total >
        this.exportstatus.pagesize * this.exportstatus.totalpage
      ) {
        this.exportstatus.totalpage++ // 判断分页
      }
      let alldata = []
      this.isExporting = true // 标志 是否正在导出
      this.showProgress(
        '正在读取数据',
        this.exportstatus.done,
        this.exportstatus.total
      )
      for (let i = 1; i <= this.exportstatus.totalpage; i++) {
        if (!this.isExporting) {
          this.$message.error('已取消')
          return false
          // break
        }
        let query = Object.assign({}, this.tabData[index].listQuery)
        query.page = i
        query.pagesize = this.exportstatus.pagesize
        const res = await caseapi.casesk.getBankMxList(query)
        const data = res.items
        for (let idx = 0; idx < data.length; idx++) {
          let row = data[idx]
          row['_index'] = (i - 1) * this.exportstatus.pagesize + idx + 1
          alldata.push(row)
        }
        this.exportstatus.done += data.length
        // alldata = alldata.concat(data) // 合并数组
        this.showProgress(
          '正在读取数据',
          this.exportstatus.done,
          this.exportstatus.total
        )
      }
      let title = this.tabData[index].label

      if (this.isExporting && alldata.length) {
        this.handleDownload(alldata, title)

        // this.handleDownload(alldata)
      }

      setTimeout(() => {
        this.isExporting = false
        this.hideProgress()
      }, 500)

      // const alldata = this.table_case.data

      // this.handleDownload(alldata, title)
    },
    stopExport() {
      this.isExporting = false
    },
    showProgress(title, num, total) {
      try {
        this.$refs['progress'].showInfo(title, num, total)
      } catch (e) {
        // console.log(e)
      }
    },
    hideProgress() {
      try {
        this.$refs['progress'].close()
      } catch (e) {
        // console.log(e)
      }
    },

    initExport() {
      this.export.header = []
      this.export.field = []
      this.export.field2 = []
      for (let i = 0; i < this.fieldList.length; i++) {
        const field = this.fieldList[i]
        if (field['export'] === true) {
          this.export.header.push(field['label'])
          this.export.field.push(field['field'])
          this.export.field2.push(field)
        }
      }
    },

    handleDownload(alldata, title) {
      // this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = this.export.header
        const filterVal = this.export.field2
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: title,
          // filename: "table-list"
          filename: title
        })
        // this.downloadLoading = false
      })
    },

    formatJson_old(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return v[j]
          } else {
            return v[j]
          }
        })
      )
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((field) => {
          const j = field.field
          let value = v[j]
          if (field.align && field.align === 'right') {
            // 数字
            value = this.formatNumber(value)
            value = value.replace(/,/g, '')
            // console.log(value)
            if (value === '-') {
              value = 0
            }
            return value - 0
          }

          return value
          // if (j === 'timestamp') {
          //   return parseTime(v[j])
          // } else {
          //   return v[j]
          // }
        })
      )
    },

    tableRowClassName({ row, rowIndex }) {
      if (row.isused !== '') {
        return 'warning-row'
      }
      return ''
    },
    changeCheck(val) {
      this.checkedInfo.banklsh = []
      this.checkedInfo.num = 0
      this.checkedInfo.je = 0

      val.forEach((item) => {
        this.checkedInfo.banklsh.push(item.bank_lsh)
        this.checkedInfo.num++
        this.checkedInfo.je += item.je - 0
      })
    },

    checkSelectable(row) {
      if (this.doBatching) {
        return false // 正在导入时，所有的记录都不允许打开
      }
      if (row.isused === '') {
        return true
      }
      return false
    },

    getLsh(lsh) {
      this.$emit('getlsh', lsh)
      this.$nextTick(() => {
        this.showWindow = false
      })
    },
    showBatch() {
      this.temp.operdate = caseapi.base.getLogindate() // 获取登录日期
      caseapi.userconfig.getDefaultAccountId(401).then((accountid) => {
        if (accountid) {
          this.temp.accountid = accountid
        }
      })
      this.showBatchWin = true
    },

    async batchSaveCasebill() {
      // 批量生成

      // 判断是否选中的收退款方式

      if (!this.temp.accountid) {
        this.$alert('收款方式不能为空！')
        return false
      }
      // 判断是否填写了制单日期
      if (!this.temp.operdate) {
        this.$alert('制单日期不能为空！')
        return false
      }

      const res2 = await this.$confirm(
        '是否批量生成' + this.checkedInfo.num + '笔款项入账？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => console.log(err))
      if (res2 !== 'confirm') {
        console.log('已取消')
        return false
      }

      // 根据流水号、制单日期、收款方式，自动生成款项入账
      // console.log(this.tabData)
      const data = this.tabData[0]['data']

      this.doBatching = true
      this.showBatchWin = false

      let num = 0
      this.donenum = 0
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const lsh = row['bank_lsh']
        if (this.checkedInfo.banklsh.indexOf(lsh) > -1) {
          // 说明已选中
          // 开始执行业务
          const param = { banklsh: lsh, operdate: this.temp.operdate, accountid: this.temp.accountid }

          const res = await caseapi.casesk.saveCasebillByBanklsh(param)
          if (res['message'] !== 'OK') {
            // this.$alert(res['message'])
            this.tabData[0]['data'][i]['isused'] = res['message']
          } else {
            this.tabData[0]['data'][i]['isused'] = res.data
            num++
            this.donenum = num
          }
        } else {
          continue
        }
      }

      this.$alert('导入完成，共生成' + num + '笔数据')

      this.doBatching = false
    }
  }
}
</script>

<style >
.el-table .warning-row {
  background-color: oldlace;
}

.success-row {
  background: #f0f9eb;
}
</style>
