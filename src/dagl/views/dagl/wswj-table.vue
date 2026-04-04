<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-select
        v-model="listQuery.type"
        placeholder="请选择类型"
        clearable
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in typeList"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        />
      </el-select> -->

      <el-input
        v-model="listQuery_tpl.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 400px"
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
    </div>

    <el-tabs type="border-card">
      <template v-for="(type, inx) in typeList">
        <el-tab-pane v-if="type.iscase == iscase" :key="type.code + '_' + inx">
          <span slot="label">
            <template
              v-if="listQuery[type.code].total > 0"
            ><b>{{ type.name }}</b></template><template v-else>{{ type.name }}</template><span
              v-if="listQuery[type.code].total > 0"
            >({{ listQuery[type.code].total }})</span></span>
          <!-- 表格内容 -->

          <el-table
            :key="tableKey"
            v-loading="listLoading[type.code]"
            :data="tableData[type.code]"
            border
            fit
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            >
              <template slot-scope="{ $index }">
                {{
                  $index +
                    listQuery[type.code].pagesize *
                    (listQuery[type.code].page - 1) +
                    1
                }}
              </template>
            </el-table-column>

            <el-table-column
              v-if="type.iscase"
              label="案号"
              prop="classcode"
              align="center"
              width="250"
            >
              <template slot-scope="{ row }">
                （{{ row.ND }}）{{ row.ZHI }}字第{{ row.HAO }}号
              </template>
            </el-table-column>

            <template v-for="(field, index) in tableField[type.code]">
              <el-table-column
                v-if="field.show"
                :key="field.field + '_' + index"
                :label="field.name"
                :prop="field.field"
                align="center"
                :width="field.width"
              >
                <template slot-scope="{ row }">
                  <div v-html="checkKeyword(type.code,row[field.field])" />
                  <!-- {{ checkKeyword(type.code,row[field.field]) }} -->
                  <!-- {{ checkKeyword(type.code,row[field.field]) }} -->
                </template>
              </el-table-column>
            </template>

            <el-table-column
              label="操作"
              align="center"
              width="120"
              fixed="right"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="{ row }">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-view"
                  @click="viewInfo(row.RECID,type.code)"
                >
                  查看</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="listQuery[type.code].total > 0"
            :total="listQuery[type.code].total"
            :page.sync="listQuery[type.code].page"
            :limit.sync="listQuery[type.code].pagesize"
            @pagination="getList_type(type.code)"
          />
        </el-tab-pane>
      </template>
    </el-tabs>

    <el-dialog
      title="详情"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item v-for="(item,index) in temp" :key="index" :label="item.name">
          {{ item.data }}
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const ACTION = {
  list: '/dagl/list',
  down: '/dagl/down',
  type: '/dagl/type',
  info: '/dagl/info'
}

const ISCASEQUERY = false // 是否只查询案件内容

const CLASSTYPE = 'dagl'
const PAGENAME = '文书档案'
export default {
  name: CLASSTYPE + 'Table',
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
      iscase: ISCASEQUERY,
      total: 0,
      listLoading: {
        ms: false,
        zx: false,
        xs: false,
        sx: false,
        jinji: false,
        xz: false,
        wswj: false,
        sj: false
      },
      listQuery_tpl: {
        page: 1,
        pagesize: 20,
        keyword: undefined,
        isvoid: '0',
        type: '',
        total: 0
      },
      typeList: [],
      tableData: {
        ms: [],
        zx: [],
        xs: [],
        sx: [],
        jinji: [],
        xz: [],
        wswj: [],
        sj: []
      },
      listQuery: {
        ms: {},
        zx: {},
        xs: {},
        sx: {},
        jinji: {},
        xz: {},
        wswj: {},
        sj: {}
      },
      tableField: {
        ms: [],
        zx: [],
        xs: [],
        sx: [],
        jinji: [],
        xz: [],
        wswj: [],
        sj: []
      },

      export: {
        title: '查询结果',
        header: [

        ],
        field: [

        ]
      },

      temp: [],
      temp_empty: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑' + PAGENAME,
        create: '创建' + PAGENAME
      },

      downloadLoading: false,
      rules: {}
    }
  },
  computed: {},
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getTypeList()
    },

    getTypeList() {
      postdata(ACTION.type).then((res) => {
        // 初始化tableData的值
        // 初始化ListQuery 的内容
        const data = res.data
        // console.log('getTypeList', data)

        for (const i in data) {
          const obj = data[i]
          const query = Object.assign({}, this.listQuery_tpl)
          query.type = obj.code
          this.listQuery[obj.code] = query

          // 设置表格空数据
          this.tableData[obj.code] = []
          this.listLoading[obj.code] = false

          this.tableField[obj.code] = obj.field
        }

        this.typeList = res.data
      })
    },

    getAllList() {
      for (const i in this.typeList) {
        this.listQuery[i].keyword = this.listQuery_tpl.keyword
        if (this.typeList[i].iscase === this.iscase) {
          this.getList_type(i)
        }
      }
    },
    viewInfo(id, type) {
      postdata(ACTION.info, { id: id, type: type }).then((res) => {
        this.temp = res.data
        this.dialogFormVisible = true
      })
    },
    checkKeyword(type, text) {
      if (typeof (text) !== 'string') {
        return text
      }
      const keyword = this.listQuery[type].keyword
      if (keyword) {
        const newtext = text.replace(keyword, "<span style='background: #FFFF00;'>" + keyword + '</span>')
        return newtext
      } else {
        return text
      }
    },

    getList_type(type) {
      this.listLoading[type] = true
      postdata(ACTION.list, this.listQuery[type]).then((res) => {
        const data = res.data
        // console.log('getList_type', data)
        this.listQuery[type].total = data.total
        this.tableData[type] = data.items
        this.listLoading[type] = false
      })
    },

    handleFilter() {
      // this.listQuery.page = 1
      for (const i in this.typeList) {
        this.listQuery[i].keyword = this.listQuery_tpl.keyword
        this.listQuery[i].page = 1
      }
      this.getAllList()
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
    }
  }
}
</script>
<style lang="scss" scoped>
.icon-image {
  width: 20px;
  height: 20px;
}
.spzz {
  width: 100%;
}
.filter-item {
  margin-left: 10px;
}
</style>
