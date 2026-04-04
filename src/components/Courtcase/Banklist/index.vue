<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <template v-if="listQuery.total > 0 && showtip">
      <el-badge :value="listQuery.total" class="item">
        <el-button
          class="filter-item"
          style="margin-left: 10px"
          :icon="icon"
          @click="showFilter"
        >{{ text }}</el-button>
      </el-badge>
    </template>
    <template v-else>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        :icon="icon"
        @click="showFilter"
      >{{ text }}</el-button>
    </template>

    <el-dialog v-dialogDrag :visible.sync="showWindow" title="导入银行流水" width="80%">
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
          <el-select v-model="listQuery.isused" style="width:120px;" class="filter-item">
            <el-option value="" label="所有状态" />
            <el-option :value="0" label="未使用" />
            <el-option :value="1" label="已使用" />
          </el-select>
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
                @click="importNotice(row.banklsh)"
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
  { field: 'banktime', label: '流水时间', export: true, show: true },
  { field: 'banklsh', label: '银行流水号', export: true, show: true, width: 150 },
  { field: 'dwname', label: '缴款单位', export: true, show: true, width: 180 },
  { field: 'je', label: '金额', export: true, show: true, align: 'right' },
  { field: 'bankname', label: '缴款银行', export: true, show: true, width: 150 },
  { field: 'bankaccount', label: '缴款账号', export: true, show: true, width: 150 },
  { field: 'note', label: '附言', export: true, show: true, width: 100 }

]

export default {
  name: 'BankList',
  components: { Pagination },

  props: {
    text: {
      type: String,
      default: '银行流水'
    },
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
      tableKey: 'bankListTable',
      loading: false,
      fieldList: fieldList,

      listQuery: {
        page: 1,
        pagesize: 10,
        total: 0,
        isused: '',
        keyword: ''
      }
    }
  },
  computed: {},

  mounted() {
    this.getList()
  },
  methods: {
    showFilter() {
      this.showWindow = true
    },
    getList() {
      this.loading = true
      caseapi.notice.getBankList(this.listQuery).then((res) => {
        this.listQuery.total = res.total
        this.tableData = res.items
        this.loading = false
      })
    },
    importNotice(banklsh) {
      this.$emit('import', banklsh)
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
