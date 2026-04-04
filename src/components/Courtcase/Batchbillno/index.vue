<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog v-dialogDrag :visible.sync="showWindow" :title="tableTitle" width="80%">
      <div class="filter-container">
        <el-input
          v-model="listQuery.billno"
          clearable
          placeholder="请输入单据号，如19000001-19000010,18090001"
          style="width: 500px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>

        <el-button
          class="filter-item"
          type="primary"
          style="margin-left: 10px"
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>
        <span v-if="tableData.length" class="filter-item">共{{ tableData.length }}笔单据</span><span v-if="changeNum" class="filter-item">，预计调整<el-tag>{{ changeNum }}</el-tag>条单据号</span>

        <div v-if="isExporting">当前进度：{{ exportstatus.done }} / {{ exportstatus.total }} </div>
      </div>
      <el-table
        key="batchbillno"
        v-loading="loading"
        :data="tableData"
        border
        fit
        highlight-current-row
        size="mini"
        height="400"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        >
          <template slot-scope="{ $index }">
            {{
              $index +1
            }}
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
                <template v-else-if="field.type && field.type == 'switch'">
                  {{ row[field.field] == 1 ? '√' : '' }}
                </template>
                <template v-else>
                  {{ row[field.field] }}
                </template>
              </template>
            </el-table-column>
          </template>
        </template>

        <el-table-column
          width="180"
          align="center"
          label="新单据号"
        >
          <template slot-scope="{ row ,$index}">
            <el-input v-model="row.newbillno" placeholder="新单据号" style="width: 100%" @change="batchUpdateBillno($index)" />
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false">取消</el-button>
        <el-button
          icon="el-icon-edit"
          type="warning"
          :disabled="loading || changeNum<1 || tableData.length<1"
          @click="doBatchEdit"
        >批量修改单据号</el-button>
        <el-button
          icon="el-icon-delete"
          type="danger"
          :disabled="loading || tableData.length<1"
          @click="doBatchVoid"
        >批量作废</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 获取待办通知书信息，并进行标注
 */

import caseapi from '@/courtcase/api'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const fieldList = [

  {
    field: 'operdate',
    label: '制单日期',
    export: true,
    show: true,
    order: true
  },
  {
    field: 'isvoid',
    label: '是否作废',
    export: true,
    show: true,
    order: true,
    type: 'switch'
  },
  {
    field: 'billno',
    label: '单据号',
    export: true,
    show: true,
    width: 100,
    order: true
  },
  {
    field: 'caseinfo',
    label: '案号',
    export: true,
    show: true,
    width: 180,
    order: true
  },
  { field: 'dwname', label: '单位名称', export: true, show: true, width: 180 },
  {
    field: 'je',
    label: '金额',
    export: true,
    show: true,
    align: 'right',
    order: true
  }

]

export default {
  name: 'CaseBatchBill',
  components: { },

  props: {},
  data() {
    return {
      activeName: 'bill',
      showWindow: false,
      tableTitle: '批量修改单据',
      fieldList: fieldList, // 字段列表

      loading: false,

      listQuery: {
        typeid: 0,
        billno: ''
      },
      tableData: [], // 数据

      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 50 // 默认分页数
      },
      isExporting: false, // 正在导出

      export: {
        title: 'export',
        header: [],
        field: []
      }
    }
  },
  computed: {

    changeNum() {
      let num = 0
      for (let i = 0; i < this.tableData.length; i++) {
        const row = this.tableData[i]
        if (row.billno !== row.newbillno) {
          num++
        }
      }
      return num
    }
  },

  mounted() {},
  methods: {

    showWin(typeid, billno) {
      this.listQuery.typeid = typeid

      // 判断billno是不是文本
      if (typeof billno === 'string') {
        this.listQuery.billno = billno
      }
      // 判断billno是不是数组
      if (Array.isArray(billno)) {
        this.listQuery.billno = billno.join(',')
      }

      this.getList()
    },

    getList() {
      this.loading = true
      caseapi.plugins.batchEdit_getList(this.listQuery).then((res) => {
        this.tableData = res
        this.showWindow = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
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
    handleFilter() {
      this.getList()
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
      if (row.billno !== row.newbillno) {
        return 'warning-row'
      }
      return ''
    },

    batchUpdateBillno(index) {
      const row = this.tableData[index]
      let billno = row.newbillno
      let oldbillno = row.billno
      // console.log('batchUpdateBillno', index, billno)

      // 循环此行以后的所有记录，并将单据号+1
      for (let i = index + 1; i < this.tableData.length; i++) {
        const newrow = this.tableData[i]

        // console.log('newrow', i, newrow)
        let newbillno = newrow.billno

        if (parseInt(oldbillno) + 1 === parseInt(newbillno)) {
          // 累加+1
          oldbillno = newbillno

          const newbill = parseInt(billno) + 1 + ''
          this.tableData[i].newbillno = newbill
          billno = newbill
        }
      }
    },

    // 批量修改
    async doBatchEdit() {
      // 判断一下变更的数据
      if (this.changeNum < 1) {
        this.$alert('没有需要修改的数据')
        return false
      }

      // 确认是否要处理
      try {
        const res = await this.$confirm('确认要修改' + this.changeNum + '个单据号吗？请仔细确认', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        console.log('取消操作', e)
        return false
      }

      // 修改数据

      // 检查单据号是否已存在
      let allid = [];
      let allnewbill = [];
      for(let i=0;i<this.tableData.length;i++){
        allid.push(this.tableData[i].id)
        allnewbill.push(this.tableData[i].newbillno)
      }
      


      const checkres = await caseapi.plugins.batchEdit_checkbill({id:allid,billno:allnewbill,typeid:this.listQuery.typeid});

      if(!checkres['result']){
        
        this.$alert(checkres.message);
        return false;
      }

      this.loading = true
      const res = await caseapi.plugins.batchEdit_changebill(this.listQuery.typeid, this.tableData)

      setTimeout(() => {
        this.loading = false
      }, 400)
      if (res.code === 20000) {
        this.$message({
          type: 'success',
          message: '修改成功，共修改' + res.data + '个单据号!'
        })

        this.$alert('修改成功，共修改' + res.data + '个单据号!')

        this.$nextTick(() => {
          this.showWindow = false
          this.listQuery.billno = ''
        })
      } else {
        this.$message({
          type: 'error',
          message: '修改失败!' + res.message
        })
        this.$alert('修改失败!' + res.message)
      }

      return true
    },
    async doBatchVoid() {
      // 作废

      // 判断一下变更的数据

      // 确认是否要处理
      let query = { id: 0, value: 1, note: '' }
      let res2 = { code: 0, message: '操作失败' }

      try {
        const rtdata = await this.$prompt('请填写作废理由', '作废单据', {
          confirmButtonText: '作废',
          cancelButtonText: '取消',
          inputValidator: (res) => {
            if (!res || res.length < 1) {
              return '作废理由不能为空！'
            }
            return true
          }
        })
        if (rtdata.action === 'confirm') {
          query.note = rtdata.value
          if (!query.note || query.note === '' || query.note === undefined || query.note === null) {
            // MessageBox.alert('作废理由不能为空！')
            res2.code = 0
            res2.message = '作废理由不能为空！'
            return res2
          }
        }
      } catch (e) {
        // 错误
        res2.code = 0
        res2.message = '取消操作'
        return res2
      }

      this.exportstatus.total = this.tableData.length
      this.exportstatus.done = 0
      this.isExporting = true
      for (let i = 0; i < this.tableData.length; i++) {
        const row = this.tableData[i]
        const id = row.id

        query['id'] = id

        const res = await caseapi.casesk.voidbill(query)
        this.exportstatus.done = i + 1

        if (res.code === 20000) {
          this.tableData[i].isvoid = 1
        }
      }

      this.isExporting = false
      this.loading = false
      this.$alert('作废完成！')
      this.showWindow = false
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
