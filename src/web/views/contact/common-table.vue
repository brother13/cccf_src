<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <!-- <el-select v-model="listQuery.dwname" :placeholder="'请选择'+dwtypename" clearable style="width: 260px;margin-right:20px;margin-left:10px;" class="filter-item" @change="handleFilter">
        <el-option label="所有" value="" />
        <el-option v-for="(item,index) in dwList" :key="index" :label="item.classname" :value="item.classname" />

      </el-select> -->
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-document-add"
        @click="handleCreate"
      >新增</el-button>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >导出</el-button>
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
      <el-table-column type="index" width="50" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column :label="dwtypename+'名称'" prop="dwname" align="center" width="200" />
      <el-table-column label="姓名" prop="username" align="center" width="120" />
      <el-table-column label="电话" prop="telphone" align="center" width="120" />
      <el-table-column label="备用电话" prop="telphone2" align="center" width="120" />

      <!-- <el-table-column label="证件类型" prop="cardtype" align="center" width="120" /> -->
      <!-- <el-table-column label="证件号码" prop="cardno" align="center" width="120" /> -->
      <el-table-column label="备注" prop="note" align="center" width="200" />
      <el-table-column label="排序" prop="rank" align="center" width="80" />
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.isvoid | statusFilter">{{ row.isvoid=="0" ? "正常":"停用" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)"> 编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            click2="handleModifyStatus(row,'deleted')"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >删除</el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 600px; margin-left:50px;"
      >

        <el-form-item :label="dwtypename+'名称'" prop="dwname">
          <!-- <el-select
            v-model="temp.dwname"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in dwList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select> -->

          <el-input v-model="temp.dwname" />
        </el-form-item>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <!-- <el-form-item label="性别" prop="gender">
          <el-select
            v-model="temp.gender"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in genderList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="联系电话" prop="telphone">
          <el-input v-model="temp.telphone" />
        </el-form-item>
        <el-form-item label="备用电话" prop="telphone2">
          <el-input v-model="temp.telphone2" />
        </el-form-item>
        <!-- <el-form-item label="证件类型" prop="cardtype">
          <el-select
            v-model="temp.cardtype"
            style="width:100%"
            class="filter-item"
            placeholder="请选择"
            clearable
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in cardTypeList"
              :key="item.classname"
              :label="item.classname"
              :value="item.classname"
            >{{ item.classname }}</el-option>
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="证件号码" prop="cardno">
          <el-input v-model="temp.cardno" />
        </el-form-item> -->

        <el-form-item label="排序" prop="rank">
          <el-input v-model="temp.rank" type="number" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="您可以填写备注"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="temp.isvoid"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
          />
          <el-tag>{{ temp.isvoid==0 ? "正常" : "停用" }}</el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
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
  add: '/contact/add',
  save: '/contact/save',
  del: '/contact/del',
  list: '/contact/list',
  down: '/contact/down',
  newcode: '/contact/newcode',
  dwlist: '/class/all'

}
const CLASSTYPE = 'common'
const DWTYPE = 'common'
const PAGENAME = '常用通讯录'
const DWTYPENAME = '项目'
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
      pagename: PAGENAME,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: undefined,
        isvoid: '0',
        contacttype: CLASSTYPE
      },
      dwList: [],
      cardTypeList: [],
      genderList: [],
      dwtypename: DWTYPENAME,
      export: {
        title: PAGENAME + '列表',
        header: [
          'ID',
          '单位名称',
          '姓名',
          '手机号码',
          '备用号码',
          '证件类型',
          '证件号码',
          '备注',
          '更新时间'
        ],
        field: [
          'id',
          'dwname',
          'username',
          'telphone',
          'telphone2',
          'cardtype',
          'cardno',
          'note',
          'updatetime'
        ]
      },

      temp: {
        id: '',
        contacttype: '',
        dwname: '',
        username: '',
        telphone: '',
        telphone2: '',
        cardtype: '',
        cardno: '',
        note: '',
        rank: 0,
        isvoid: 0
      },
      temp_empty: {
        id: '',
        contacttype: '',
        dwname: '',
        username: '',
        telphone: '',
        telphone2: '',
        cardtype: '',
        cardno: '',
        note: '',
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
        dwname: [
          { required: true, message: '单位不能为空', trigger: 'change' }
        ],
        username: [
          { required: true, message: '姓名不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {

  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getList()
      this.getDwList()
    },
    getDwList() {
      postdata(ACTION.dwlist).then((res) => {
        const data = res.data
        this.dwList = data[DWTYPE]
        this.cardTypeList = data['cardtype']
        this.genderList = data['gender']
      })
    },

    getList() {
      this.listLoading = true

      postdata(ACTION.list, this.listQuery).then(response => {
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
      this.temp.contacttype = CLASSTYPE
      postdata(ACTION.newcode, { contacttype: CLASSTYPE }).then((res) => {
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
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.contacttype = CLASSTYPE
          postdata(ACTION.add, this.temp).then(response => {
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
      this.temp.contacttype = CLASSTYPE
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
        newtemp.contacttype = CLASSTYPE
        if (valid) {
          postdata(ACTION.save, newtemp).then(response => {
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
        postdata(ACTION.del, { id: row.id, contacttype: CLASSTYPE }).then(response => {
          const data = response
          if (data.code === 20000) {
            this.$alert('操作完成')
            this.getList()
          }
        })
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
      return jsonData.map(v =>
        filterVal.map(j => {
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
</style>
