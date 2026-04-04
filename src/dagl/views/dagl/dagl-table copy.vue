<template>
  <div class="app-container">
    <div class="filter-container">

      <el-select
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
      </el-select>

      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字：原告、被告、审判长、书记员、经办人 等信息"
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
    >
      <el-table-column type="index" width="50" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="案号" prop="classcode" align="center" width="250">
        <template slot-scope="{ row }">
          （{{ row.ND }}）{{ row.ZHI }}字第{{ row.HAO }}号
        </template>
      </el-table-column>
      <el-table-column label="案由" prop="AY" align="center" width="120" />
      <el-table-column
        label="应诉结果"
        prop="YSJG"
        align="center"
        width="120"
      />
      <el-table-column
        label="保管期限"
        prop="BGQX"
        align="center"
        width="120"
      />
      <el-table-column label="接收人" prop="JSR" align="center" width="120" />
      <el-table-column label="当事人" prop="dsr" align="center" width="150">
        <template slot-scope="{ row }">
          原告：{{ row.YGR }}
          <br>
          被告：{{ row.BGR }}
        </template>
      </el-table-column>

      <el-table-column label="归档日期" prop="dsr" align="center" width="200">
        <template slot-scope="{ row }">
          结案日期：{{ row.JARQ }}
          <br>
          归档日期：{{ row.GDRQ }}
        </template>
      </el-table-column>
      <el-table-column label="审判组织" prop="dsr" align="center" width="200">
        <template slot-scope="{ row }">
          <div v-if="row.SPZ" class="spzz">审判长：{{ row.SPZ }}</div>
          <div v-if="row.CBR" class="spzz">承办人：{{ row.CBR }}</div>
          <div v-if="row.SJY" class="spzz">书记员：{{ row.SJY }}</div>
          <div v-if="row.SPY" class="spzz">审判员：{{ row.SPY }}</div>
          <div v-if="row.DLSPY" class="spzz">代理审判员：{{ row.DLSPY }}</div>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >
            查看</el-button>
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

    <el-dialog
      title="详情"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>

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
  type: '/dagl/type'
}

const CLASSTYPE = 'dagl'
const PAGENAME = '财产查封管理'
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
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: undefined,
        isvoid: '0',
        type: 'ms'
      },
      typeList: [],
      export: {
        title: '查询结果',
        header: ['年号', '字号', '案件序号', '案由', '应诉结果', '原告', '被告', '审判长', '审判员', '代理审判员', '书记员', '承办人', '结案日期', '归档日期', '保管期限', '接收人'],
        field: ['ND', 'ZHI', 'HAO', 'AY', 'YSJG', 'YGR', 'BGR', 'SPZ', 'SPY', 'DLSPY', 'SJY', 'CBR', 'JARQ', 'GDRQ', 'BGQX', 'JSR']
      },

      temp: {
        id: '',
        classtype: '',
        classcode: '',
        classname: '',
        classnote: '',
        rank: 0,
        isvoid: 0
      },
      temp_empty: {
        id: '',
        classtype: '',
        classcode: '',
        classname: '',
        classnote: '',
        rank: 0,
        isvoid: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑' + PAGENAME,
        create: '创建' + PAGENAME
      },

      downloadLoading: false,
      rules: {
        classcode: [
          { required: true, message: '代码不能为空', trigger: 'change' }
        ],
        classname: [
          { required: true, message: '名称不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {},
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getTypeList()
      this.getList()
    },

    getTypeList() {
      postdata(ACTION.type).then((res) => {
        this.typeList = res.data
      })
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
      this.temp.classtype = CLASSTYPE
      postdata(ACTION.newcode, { classtype: CLASSTYPE }).then((res) => {
        this.temp.classcode = res.data
      })
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
          this.temp.classtype = CLASSTYPE
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
      this.temp.classtype = CLASSTYPE
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
        newtemp.classtype = CLASSTYPE
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
        postdata(ACTION.del, { id: row.id, classtype: CLASSTYPE }).then(
          (response) => {
            const data = response
            if (data.code === 20000) {
              this.$alert('操作完成')
              this.getList()
            }
          }
        )
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
</style>
