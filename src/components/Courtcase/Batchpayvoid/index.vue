<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    :title="actionName"
    :close-on-click-modal="false"
    width="70%"
    :show-close="!batchinfo.doing"
    :before-close="closeDialog"
    :close-on-press-escape="false"
  >
    <el-form
      ref="dataForm"
      :model="temp"
      label-position="left"
      label-width="80px"
      style="padding: 30px"
    >
      <!-- 信息展示 -->

      <el-descriptions class="margin-top" title="" :column="2" border>
        <el-descriptions-item
          v-for="(item, index) in fieldList"
          :label="item.label"
          :key="index"
        >
          {{ taskinfo[item.field] }}
        </el-descriptions-item>
      </el-descriptions>
      <div style="min-height: 20px">&nbsp;</div>

      <!-- <el-form-item label="操作内容">
        <el-select v-model="temp.action" style="width: 100%" class="form-item">
          <el-option
            v-for="(item, index) in actionList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->
      <template v-if="temp.action == 'banktp'">
        <el-form-item label="退票日期">
          <el-date-picker
            v-model="temp.tpdate"
            type="date"
            placeholder="退票日期"
            style="width: 100%"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="退票理由">
          <el-select v-model="temp.tpreason2" style="width: 100%" class="form-item">
            <el-option
              v-for="(item, index) in tpReasonList"
              :key="index"
              :label="item.classname"
              :value="item.classname"
            />
            <el-option label="其它" value="-1" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="temp.tpreason2 == '-1'" label="退票理由">
          <el-input
            v-model="temp.tpreason"
            class="form-item"
            placeholder="请输入退票理由"
          />
        </el-form-item>
      </template>
      <template v-else-if="temp.action == 'void'">
        <!-- 这里是批量作废 -->
        <el-form-item label="作废理由">
          <el-input v-model="temp.note" class="form-item" placeholder="请输入作废理由" />
        </el-form-item>
      </template>
      <el-form-item v-if="batchinfo.doing" label="进度">
        <div>{{ batchinfo.done }} / {{ batchinfo.total }}</div>
        <div>
          <el-progress
            :percentage="
              parseFloat(((batchinfo.done / batchinfo.total) * 100).toFixed(2))
            "
            :text-inside="true"
            :stroke-width="26"
            status="success"
          />
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button
        type="primary"
        icon="el-icon-edit"
        @click="doAction"
        :disabled="batchinfo.doing"
        v-show="temp.action"
        >执行</el-button
      >
    </div>
  </el-dialog>
</template>
<script>
import caseapi from "@/courtcase/api";

const actionList = [
  { label: "批量作废", value: "void" },
  { label: "批量退票", value: "banktp" },
];
const fieldList = [
  { label: "任务编号", field: "taskcode" },
  { label: "任务名称", field: "taskname" },
  { label: "任务类型", field: "typename" },
  { label: "任务状态", field: "statusText" },
  { label: "退款时间", field: "tkdate" },
  { label: "总笔数", field: "total" },
  { label: "领款单位", field: "dwname" },
  { label: "已退款", field: "num_tk" },
  { label: "开户行", field: "bankname" },
  { label: "已作废", field: "num_void" },
  { label: "银行账号", field: "bankaccount" },
  { label: "已退票", field: "num_banktp" },
];
export default {
  name: "Banktp",
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      tpReasonList: [],
      actionList: actionList,
      fieldList: fieldList,

      temp: {
        typeid: 0,
        id: 0,
        tpreason: "",
        tpreason2: "",
        tpdate: "",
        action: "",
        note: "",
      },
      temp_empty: {
        typeid: 0,
        id: 0,
        tpreason: "",
        tpreason2: "",
        tpdate: "",
        action: "",
        note: "",
      },
      taskinfo: {
        id: 0,
        taskcode: "",
        taskname: "",
        dwname: "",
        bankname: "",
        bankaccount: "",
        typeid: 0,
        tkdate: "",
        status: 0,
        statusText: "",
        typename: "",
        total: 0,
        num_void: 0, // 已作废
        num_banktp: 0, // 已退票
        num_tk: 0, // 已退款
      },
      batchinfo: {
        doing: false, // 默认未启用
        total: 0,
        done: 0,
      },
    };
  },
  computed: {
    actionName() {
      switch (this.temp.action) {
        case "void":
          return "批量作废";
        case "banktp":
          return "批量退票";
        default:
          return "";
      }
    },
  },
  watch: {},

  mounted() {
    // this.init();
  },
  methods: {
    init() {
      this.temp.tpdate = caseapi.base.getLogindate();
      this.getTpReason();
    },
    // 获取任务ID
    async showWin(taskid, action = "void") {
      try {
        const actionname = action == "void" ? "作废" : "退票";
        let text = `您确定要发起批量${actionname}吗？此操作不可逆！`;
        const t = await this.$confirm(text);
        console.log(t);
      } catch (e) {
        return false;
      }

      // 先清空再填写
      this.temp = Object.assign({}, this.temp_empty);

      this.temp.action = action;
      this.init();

      const taskinfo = await caseapi.batchpay.getTaskinfo(taskid);

      // console.log("taskinfo", taskinfo);

      this.temp.typeid = taskinfo.typeid;
      this.temp.id = taskid;
      this.temp.note = "";

      this.taskinfo.statusText = "";

      for (let i = 0; i < this.fieldList.length; i++) {
        const r = this.fieldList[i];
        const field = r["field"];
        this.taskinfo[field] = taskinfo[field] || 0;
      }
      this.taskinfo.typeid = taskinfo.typeid;

      // this.taskinfo.typename = taskinfo["typename"];
      // this.taskinfo.num_void = taskinfo["num_void"] || 0;
      // this.taskinfo.num_banktp = taskinfo["num_banktp"] || 0;
      // this.taskinfo.num_tk = taskinfo["num_tk"] || 0;
      // this.taskinfo.done = taskinfo["done"] || 0;
      // this.taskinfo.dwname = taskinfo["dwname"];
      // this.taskinfo.bankname = taskinfo["bankname"];
      // this.taskinfo.bankaccount = taskinfo["bankaccount"];

      // this.taskinfo.taskcode = taskinfo["taskcode"] || "";
      // this.taskinfo.taskname = taskinfo["taskname"] || "";
      this.taskinfo.id = taskinfo["id"];
      // this.taskinfo.tkdate = taskinfo["tkdate"];

      this.showWindow = true;
    },
    getTpReason() {
      caseapi.base.getTpReasonList().then((data) => {
        // console.log(data)
        this.tpReasonList = data.items;
      });
    },

    // querySearch(key, callback) {
    //   caseapi.casetk.getTpReason(key).then((data) => {
    //     callback(data)
    //   })
    // },
    async doAction() {
      let action = this.temp.action;
      let actionname = "";
      if (action == "void") {
        actionname = "作废";
      } else if (action == "banktp") {
        actionname = "退票";
      } else {
        this.$message.error("请选择操作类型");
        return false;
      }

      // 如果是作废，则判断note不能为空。如果是退票，则判断退票理由和退票日期不能为空

      if (action == "void") {
        if (!this.temp.note || this.temp.note == "") {
          this.$alert("请填写作废理由！");
          return false;
        }
      } else if (action == "banktp") {
        if (!this.temp.tpreason || this.temp.tpreason == "") {
          this.$alert("请选择退票理由！");
          return false;
        }
        if (!this.temp.tpdate || this.temp.tpdate == "") {
          this.$alert("请选择退票日期！");
          return false;
        }
      }
      const text = "您确定要发起批量" + actionname + "吗？此操作不可逆！";

      try {
        const t = await this.$confirm(text);
        console.log(t);
      } catch (e) {
        return false;
      }

      // 准备开始执行

      // 开始获取退款的ID
      const query = {
        page: 1,
        pagesize: 9999,
        id: this.taskinfo.id,
        typeid: this.temp.typeid,
      };

      const tkinfo = await caseapi.batchpay.getBatchTkList(query);

      this.batchinfo.total = tkinfo.total.num;
      this.batchinfo.done = 0;
      this.batchinfo.doing = true;

      // 开始执行
      for (let i = 0; i < tkinfo.items.length; i++) {
        const row = tkinfo.items[i];
        const tkid = row.id;
        const typeid = row.typeid;

        if (action == "void") {
          // 批量作废
          const note = this.temp.note;
          try {
            await caseapi.casetk.voidtk(tkid, note);
            this.batchinfo.done++;
          } catch (e) {
            this.$message.error("批量作废发生错误:" + e.message);
            return false;
          }
        }
        if (action == "banktp") {
          const tpreason =
            this.temp.tpreason2 === "-1" ? this.temp.tpreason : this.temp.tpreason2;

          try {
            const res = await caseapi.casetk.billTP(
              typeid,
              tkid,
              tpreason,
              this.temp.tpdate
            );
            this.batchinfo.done++;
          } catch (e) {
            this.$message.error("批量退票发生错误:" + e.message);
            return false;
          }
        }
      }

      // 更新任务状态为 已退票或已作废
      const updateinfo = {
        id: this.taskinfo.id,
        status: action,
      };
      await caseapi.batchpay.task_updateStatus(updateinfo);

      this.$alert("批量操作完成！");
      this.batchinfo.doing = false;
      this.$emit("done");
      this.$nextTick(() => {
        this.showWindow = false;
      });
    },
    closeDialog(done) {
      if (this.batchinfo.doing) {
        this.$alert("正在刷新数据，不能结束任务，请稍候！");
        done(false);
      } else {
        done(true);
      }
    },
    async doTP() {
      const tpreason =
        this.temp.tpreason2 === "-1" ? this.temp.tpreason : this.temp.tpreason2;
      if (!tpreason || tpreason === "") {
        this.$message.error("退票理由不能为空");
      }
      const res = await caseapi.casetk.billTP(
        this.temp.typeid,
        this.temp.id,
        tpreason,
        this.temp.tpdate
      );
      if (res.code !== 20000) {
        this.$message.error(res.message);
      } else {
        this.$message("退票完成");
        this.$emit("dotp");
        this.showWindow = false;
      }
    },
  },
};
</script>
<style>
.form-item {
  width: 100%;
}
</style>
