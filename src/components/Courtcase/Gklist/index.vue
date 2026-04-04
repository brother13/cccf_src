<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">

    <el-dialog v-dialogDrag :visible.sync="showWindow" title="查询提存库" width="80%">
      <div style="width: 80%; min-height: 600px; min-width: 1000px">
        <div class="filter-container">
          <el-input
            v-model="listQuery.keyword"
            clearable
            placeholder="请输入关键字"
            style="width: 400px;"
            class="filter-item"
            @keyup.enter.native="getList"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>

          <el-button
            class="filter-item"
            type="primary"
            style="margin-left: 10px"
            icon="el-icon-search"
            @click="getList"
          >搜索</el-button>
        </div>
        <el-table
          :key="tableKey"
          v-loading="loading"
          :data="tableData"
          border
          fit
          highlight-current-row
          size="mini"
          height="400"
          style="width: 100%; "
        >
          <el-table-column type="index" width="50" align="center" label="序号">
            <template slot-scope="{ $index }">
              {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="100"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="{ row }">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-circle-check"
                @click="importBillno(row.billno)"
              >
                转出</el-button>
            </template>
          </el-table-column>

          <template v-for="field in fieldList">
            <template v-if="field.show">
              <el-table-column
                :key="field.field"
                :label="field.label"
                :prop="field.field"
                :align="field.align ? field.align : 'center'"
                :width="field.width ? field.width : 120"
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
          v-show="listQuery.total > 0"
          :total="listQuery.total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.pagesize"
          @pagination="getList"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 获取银行流水日志，并进行标注
 */

import caseapi from '@/courtcase/api'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const fieldList = [
  { field: 'billno', label: '原单据号', export: true, show: true },
  { field: 'caseinfo', label: '案号', export: true, show: true, width: 180 },
  { field: 'operdate', label: '入库时间', export: true, show: true, width: 150 },
  { field: 'dwname', label: '原缴款单位', export: true, show: true, width: 180 },
  { field: 'gkye', label: '提存库余额', export: true, show: true, align: 'right' },
  { field: 'subaccount', label: '原入账子账号', export: true, show: true, width: 150 }

]

export default {
  name: 'GkList',
  components: { Pagination },

  props: {

    icon: {
      type: String,
      default: 'el-icon-search'
    },
    showtip: {
      type: Boolean,
      default: true
    }

  },
  data() {
    return {
      showWindow: false,
      tableData: [],
      tableKey: 'gkListTable',
      loading: false,
      fieldList: fieldList,

      listQuery: {
        page: 1,
        pagesize: 10,
        total: 0,
        caseyear: '',
        casetype: '',
        casenum: '',
        keyword: ''
      }
    }
  },
  computed: {},

  mounted() {
    // this.getList()
  },
  methods: {

    queryList(caseyear, casetype, casenum) {
      this.listQuery = {
        page: 1,
        pagesize: 10,
        total: 0,
        caseyear: '',
        casetype: '',
        casenum: '',
        keyword: ''
      }
      this.listQuery.caseyear = caseyear
      this.listQuery.casetype = casetype
      this.listQuery.casenum = casenum

      this.listQuery.page = 1
      this.listQuery.keyword = ''
      this.getList()
    },

    getList() {
      this.loading = true
      caseapi.casetk.gk_getskListByCaseinfo(this.listQuery).then((res) => {
        this.tableData = res.items
        this.listQuery.total = res.total

        if (res.total == 1) {
          // 空的
          const row = res.items[0]
          this.importBillno(row.billno)
        } else if (res.total == 0) {
          this.$message('未找到相应案号的提存款记录')
          this.showWindow = false
        } else if (res.total > 1) {
          this.showWindow = true
        }

        this.loading = false
      })
    },
    importBillno(billno) {
      this.$emit('import', billno)
      this.showWindow = false
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
