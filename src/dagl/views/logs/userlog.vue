<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
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
        >搜索</el-button
      >
      <!-- <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-document-add"
        @click="handleCreate"
        >新增</el-button
      > -->
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
        >导出</el-button
      >
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column type="index" width="50" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="日志时间"
        prop="updatetime"
        align="center"
        width="160"
      />
      <el-table-column
        label="操作类型"
        prop="logtype"
        align="center"
        width="120"
      />
      <el-table-column
        label="操作操作"
        prop="actionname"
        align="center"
        width="120"
      />
      <el-table-column
        label="操作内容"
        prop="lognote"
        align="center"
        width="200"
      />
      <el-table-column
        label="操作用户"
        prop="username"
        align="center"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ row.deptname }} / {{ row.username }}
        </template> </el-table-column
      >>

      <el-table-column
        label="IP地址"
        prop="ipaddress"
        align="center"
        width="120"
      />

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
            icon="el-icon-view"
            @click="handleUpdate(row)"
          >
            查看</el-button
          >
          <!-- <el-button
            size="mini"
            type="danger"
            click2="handleModifyStatus(row,'deleted')"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >删除</el-button> -->
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 600px; margin-left: 50px"
      >
        <el-form-item label="日志类型" prop="appname">
          {{ temp.logtype }} / {{ temp.actionname }}
        </el-form-item>
        <el-form-item label="操作人员" prop="icon">
          {{ temp.deptname }} / {{ temp.username }}
        </el-form-item>
        <el-form-item label="操作内容">
          {{ temp.lognote }}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <!-- <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { postdata } from "@/web/api/common";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import iconSelect from "@/components/IconSelect"; // secondary package based on el-pagination
import LinkIcon from "@/components/LinkIcon";

const ACTION = {
  add: "/log/add",
  save: "/log/save",
  del: "/log/del",
  list: "/log/list",
  down: "/log/down",
};
const PAGENAME = "应用管理";
export default {
  name: "AppTable",
  components: { Pagination, iconSelect, LinkIcon },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return status === "0" ? "success" : "danger";
    },
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
        isvoid: "0",
      },
      jailtypeList: [],
      export: {
        title: "操作日志",
        header: [
          "ID",
          "日志时间",
          "操作类型",
          "操作动作",
          "执行动作",
          "操作内容",
          "操作人员部门",
          "操作人员姓名",
          "IP地址",
        ],
        field: [
          "id",
          "updatetime",
          "logtype",
          "actionname",
          "logaction",
          "lognote",
          "deptname",
          "username",
          "ipaddress",
        ],
      },

      temp: {
        id: "",
        logtype: "",
        actionname: "",
        logaction: "",
        lognote: "",
        updatetime: "",
        deptname: "",
        username: "",
        userid: "",
        logdata: "",
      },
      temp_empty: {
        id: "",
        logtype: "",
        actionname: "",
        logaction: "",
        lognote: "",
        updatetime: "",
        deptname: "",
        username: "",
        userid: "",
        logdata: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑" + PAGENAME,
        create: "创建" + PAGENAME,
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        appname: [
          { required: true, message: "应用名称不能为空", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    isvoid2: {
      get: function () {
        return (
          this.temp.isvoid === 0 ||
          this.temp.isvoid === undefined ||
          this.temp.isvoid === ""
        );
      },
      set: function (newvalue) {
        this.temp.isvoid = newvalue ? "0" : "1";
      },
    },
  },
  created() {
    this.init();
    this.getList();
  },
  methods: {
    init() {},

    getList() {
      this.listLoading = true;

      postdata(ACTION.list, this.listQuery).then((response) => {
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 0.5 * 100);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success",
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = Object.assign({}, this.temp_empty);
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          postdata(ACTION.add, this.temp).then((response) => {
            const data = response;
            if (data.code === 20000) {
              this.dialogFormVisible = false;

              this.$alert("新增成功");
              this.getList();
            }
          });
        }
      });
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        const newtemp = Object.assign({}, this.temp); // 复制一个新组件出来，避免修改数据

        if (valid) {
          postdata(ACTION.save, newtemp).then((response) => {
            const data = response;
            if (data.code === 20000) {
              this.dialogFormVisible = false;

              this.$alert("修改成功");
              this.getList();
            }
          });
        }
      });
    },
    handleDelete(row) {
      // 删除数据
      // 判断是否要删除
      this.$confirm("数据删除之后将不能恢复，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        postdata(ACTION.del, { id: row.id }).then((response) => {
          const data = response;
          if (data.code === 20000) {
            this.$alert("操作完成");
            this.getList();
          }
        });
      });
    },
    handleExport() {
      // 导出数据
      postdata(ACTION.down, this.listQuery).then((res) => {
        const alldata = res.data.items;
        this.handleDownload(alldata);
      });
    },
    handleDownload(alldata) {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = this.export.header;
        const filterVal = this.export.field;
        const data = this.formatJson(filterVal, alldata);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: this.export.title,
          // filename: "table-list"
          filename: this.export.title,
        });
        this.downloadLoading = false;
      });
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}`
        ? "ascending"
        : sort === `-${key}`
        ? "descending"
        : "";
    },
  },
};
</script>
<style lang="scss" scoped>
.icon-image {
  width: 20px;
  height: 20px;
}
</style>
