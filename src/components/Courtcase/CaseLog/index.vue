<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog v-dialogDrag :visible.sync="showWindow" :title="tableTitle" width="80%">

      <el-table
        :key="tableKey"
        v-loading="tableLoading"
        :data="tableData"
        border
        fit
        highlight-current-row
        size="mini"
        height="400"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form
              label-position="left"
              class="demo-table-expand"
              label-width="100px"
              style="width: 100%; margin-left: 50px; margin-top: 50px;margin-right:50px;"
            >
              <el-form-item label="日志方法">
                <span>{{ dict.action[props.row.opertype] }}</span>
              </el-form-item>
              <el-form-item label="操作细节">
                <el-input
                  v-model="props.row.logtext"
                  :autosize="{ minRows: 3, maxRows: 10 }"
                  type="textarea"
                  style="width:90%"

                  placeholder="操作细节"
                />
              </el-form-item>

            </el-form>
          </template>
        </el-table-column>

        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        >
          <template slot-scope="{ $index }">
            {{
              $index +
                listQuery.pagesize *
                (listQuery.page - 1) +
                1
            }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          align="center"
          width="100"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            {{ dict.action[row.opertype] }}
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
              :sortable="field.order ? field.order : false"
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

    </el-dialog>
  </div>
</template>

<script>
/**
 * 获取日志明细
 */

import caseapi from '@/courtcase/api'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const fieldList = [
  // { field: 'id', label: 'ID', export: true, show: true },
  { field: 'typename', label: '款项类型', export: true, show: true, width: 120 },
  { field: 'billno', label: '单据号', export: true, show: true, width: 120 },
  { field: 'opertime', label: '操作时间', export: true, show: true, width: 180 },
  { field: 'username', label: '操作人', export: true, show: true, width: 120 },
  { field: 'ipaddress', label: 'IP地址', export: true, show: true, width: 120 }

]
const dict_action = {
  update: '修改',
  delete: '删除',
  insert: '新增',
  void: '作废',
  unvoid: '取消作废',
  banktp: '银行退票'
}

export default {
  name: 'CaseLogList',
  components: { Pagination },

  props: {},
  data() {
    return {
      tableKey: 'CaseLogList',
      tableLoading: false,
      tableData: [],
      showWindow: false,
      tableTitle: '案款修改日志',
      fieldList: fieldList,
      dict: {
        action: dict_action
      },

      listQuery: {
        typeid: 0,
        id: 0,
        page: 1,
        pagesize: 10,
        total: 0
      }

    }
  },
  computed: {},

  mounted() {},
  methods: {
    showList(typeid, id) {
      this.listQuery.typeid = typeid
      this.listQuery.id = id
      this.listQuery.page = 1

      this.getList()

      this.showWindow = true
    },
    getList() {
      this.tableLoading = true
      caseapi.log
        .getList(this.listQuery)
        .then((res) => {
          this.listQuery.total = res.total
          this.tableData = res.items
          this.tableLoading = false
        })
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
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
