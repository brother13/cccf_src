<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">

    <el-dialog :visible.sync="showWindow" title="导入诉讼费票据" width="80%">
      <div style="width: 80%; min-height: 600px; min-width: 1000px">
        <div class="filter-container">
          <el-input
            v-model="listQuery.keyword"
            clearable
            placeholder="请输入关键字"
            style="width: 70%"
            class="filter-item"
            @keyup.enter.native="getList"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
          <el-select v-model="listQuery.isused" style="width:120px;" class="filter-item">
            <el-option :value="-1" label="所有状态" />
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
                @click="importNotice(row.billno)"
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
 * 获取待办通知书信息，并进行标注
 */

import caseapi from '@/courtcase/api'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const fieldList = [
  { field: 'billno', label: '电子票据号', export: true, show: true, width: 180 },
  { field: 'ssftypename', label: '单据类型', export: true, show: true, width: 100 },
  { field: 'bankdate', label: '入账时间', export: true, show: true, width: 100 },
  { field: 'caseinfo', label: '案号', export: true, show: true, width: 180 },
  { field: 'dwname', label: '缴款单位', export: true, show: true, width: 200 },
  { field: 'je', label: '金额', export: true, show: true, align: 'right' },
  { field: 'areaje', label: '区级金额', export: true, show: true, align: 'right' },
  { field: 'cityje', label: '市级金额', export: true, show: true, align: 'right' },
  { field: 'createtime', label: '导入时间', export: true, show: true, width: 180 },
  { field: 'username', label: '操作员', export: true, show: true }
]

export default {
  name: 'SSFBank',
  components: { Pagination },

  props: {
    text: {
      type: String,
      default: '待复核'
    },
    icon: {
      type: String,
      default: 'el-icon-search'
    },
    showtip: {
      type: Boolean,
      default: true
    },

    typeid: {
      type: Number,
      default: 104
    }
  },
  data() {
    return {
      showWindow: false,
      tableData: [],
      tableKey: 'ssfBank',
      loading: false,
      fieldList: fieldList,

      listQuery: {
        page: 1,
        pagesize: 10,
        total: 0,
        keyword: '',
        typeid: '',
        isused: 0
      }
    }
  },
  computed: {},

  mounted() {
    this.listQuery.typeid = this.typeid
    this.getList()
  },
  methods: {
    showFilter() {
      this.showWindow = true
    },
    getList() {
      this.loading = true
      caseapi.notice.getSSFList(this.listQuery).then((res) => {
        this.listQuery.total = res.total
        this.tableData = res.items
        this.loading = false
      })
    },
    importNotice(notice) {
      this.$emit('import', notice)
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
