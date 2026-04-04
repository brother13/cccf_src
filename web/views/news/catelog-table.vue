<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字"
        style="width: 300px"
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
      >搜索</el-button> -->
      <el-button
        class="filter-item"
        style="margin-left: 10px"
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

    <!-- <el-table
      :data="list"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    > -->

    <el-table
      :data="list"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      default-expand-all
    >
      <!-- <el-table-column type="index" width="80" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="ID" prop="id" align="center" width="120" /> -->
      <el-table-column
        label="分类名称"
        prop="catalogname"
        align="center"
        width="200"
      />
      <el-table-column label="图标" prop="icon" align="center" width="80">
        <template slot-scope="{ row }">
          <LinkIcon :src="row.icon" />
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="栏目名称"
        prop="catelogname"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          <LinkIcon :src="row.icon">{{ row.catalogname }}</LinkIcon>
        </template>
      </el-table-column> -->

      <el-table-column
        label="是否显示"
        prop="isshow"
        align="center"
        width="160"
      ><template slot-scope="{ row }">
        <el-tag :type="row.isshow | isshowFilter">{{
          row.isshow==1 ? '可见' : '隐藏'
        }}</el-tag>

      </template>
      </el-table-column>
      <el-table-column label="备注" prop="note" align="center" width="120" />
      <el-table-column label="排序" prop="rank" align="center" width="80" />
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{ row }">
          <el-tag :type="row.isvoid | statusFilter">{{
            row.isvoid == "0" ? "正常" : "停用"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >
            编辑</el-button>
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

    <!-- <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    /> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 600px; margin-left: 50px"
      >
        <el-form-item label="分类名称" prop="catalogname">
          <el-input v-model="temp.catalogname" />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <iconSelect v-model="temp.icon" style="width: 100%" />
        </el-form-item>
        <!-- <el-form-item label="上级栏目">
          <el-select
            v-model="temp.parentid"
            style="width: 100%"
            class="filter-item"
            placeholder="请选择"
            clearable
          >
            <el-option label="最上级" :value="0" />
            <el-option
              v-for="item in CatalogList"
              :key="item.id"
              :disabled="item.id == temp.id || item.parentid==temp.id"
              :label="item.fullname"
              :value="item.id"
            >{{ item.catalogname }}</el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="排序" prop="rank">
          <el-input v-model="temp.rank" type="number" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="您可以填写备注"
          />
        </el-form-item>
        <el-form-item label="列表样式">
          <el-switch
            v-model="temp.showimage"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
          <el-tag>{{ temp.showimage==1 ? "显示图片列表" : "普通列表" }}</el-tag>
        </el-form-item>

        <el-form-item label="附件是否加水印">
          <el-switch
            v-model="temp.addpdfwater"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
          <el-tag>{{ temp.addpdfwater==1 ? "上传的PDF下载时加水印" : "无水印" }}</el-tag>
        </el-form-item>

        <el-form-item label="是否仅下载文件">
          <el-switch
            v-model="temp.onlyfile"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
          <el-tag>{{ temp.onlyfile==1 ? "仅用于下载文件" : "普通栏目" }}</el-tag>
        </el-form-item>

        <el-form-item label="是否可见">
          <el-switch
            v-model="temp.isshow"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
          <el-tag>{{ temp.isshow==1 ? "可见" : "隐藏" }}</el-tag>
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
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="dialogPvVisible = false"
        >确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { postdata } from '@/web/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import iconSelect from '@/components/IconSelect' // secondary package based on el-pagination
import LinkIcon from '@/components/LinkIcon'

const ACTION = {
  add: '/catalog/add',
  save: '/catalog/save',
  del: '/catalog/del',
  list: '/catalog/tree',
  down: '/catalog/down'
}
const PAGENAME = '分类'
export default {
  name: 'CatalogTable',
  components: { iconSelect, LinkIcon },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
    },
    isshowFilter(status) {
      return status === 1 ? 'success' : 'danger'
    }
  },

  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      CatalogList: [],
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: undefined,
        parent: '',
        isvoid: '0'
      },
      tableData: [

      ],

      jailtypeList: [],
      export: {
        title: '分类',
        header: ['ID', '分类名称', '备注', '更新时间'],
        field: ['id', 'catalogname', 'note', 'updatetime']
      },

      temp: {
        id: '',
        dwid: '',
        icon: '',
        catalog: '',
        parentid: '',
        addpdfwater: 0,
        showimage: 0,
        ishow: 1,
        onlyfile: 0,
        grouplist: '',
        note: '',
        rank: 0,
        isvoid: 0
      },
      temp_empty: {
        id: '',
        dwid: '',
        icon: '',
        catalog: '',
        parentid: '',
        addpdfwater: 0,
        showimage: 0,
        ishow: 1,
        onlyfile: 0,
        grouplist: '',
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
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        catalogname: [
          { required: true, message: '分类名称不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isvoid2: {
      get: function() {
        return (
          this.temp.isvoid === 0 ||
          this.temp.isvoid === undefined ||
          this.temp.isvoid === ''
        )
      },
      set: function(newvalue) {
        this.temp.isvoid = newvalue ? '0' : '1'
      }
    }
  },
  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      this.getCataTree()
    },
    getCataTree() {
      // 获取所有的catalog
      postdata(ACTION.list).then((res) => {
        this.CatalogList = res.data.list
      })
    },

    getList() {
      this.listLoading = true

      postdata(ACTION.list, this.listQuery).then((response) => {
        // console.log(response);
        this.list = response.data.tree

        // this.list = this.tableData;
        // console.log(response.data);
        // console.log(this.tableData);
        // this.list = response.data.items;
        // this.total = response.data.total;

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
    },
    handleCreate() {
      this.resetTemp()
      this.getCataTree()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
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
      this.getCataTree()
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

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
        postdata(ACTION.del, { id: row.id }).then((response) => {
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
</style>
