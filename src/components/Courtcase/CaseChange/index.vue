<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      title="变更案号及承办人"
      :close-on-click-modal="false"
      width="1000px"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="detail"
        label-position="right"
        label-width="100px"
        style="width: 90%; margin-left: 50px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="单据号">
              <span>{{ detail.billno }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入账子账号">
              <span>{{ detail.subaccount }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="当前案号">
              <span>{{ detail.oldinfo.caseinfo }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前承办人">
              <span>{{ detail.oldinfo.deptname }} / {{ detail.oldinfo.cbr }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="变更记录">
              <el-button
                @click="showLoglist = !showLoglist"
                :icon="logLoading ? 'el-icon-loading' : 'el-icon-time'"
                >{{ showLoglist ? "隐藏" : "显示" }}变更记录{{
                  logList.length > 0
                    ? "(" + logList.length + ")"
                    : logLoading
                    ? ""
                    : "(暂无记录)"
                }}</el-button
              >
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前状态">
              <span>{{ detail.statusText }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-collapse-transition>
          <div v-show="showLoglist" style="margin-top: 5px; margin-bottom: 15px">
            <el-table
              key="loglist"
              v-loading="listLoading"
              :data="logList"
              border
              fit
              highlight-current-row
              style="width: 100%; min-height: 100px"
              height="200"
              size="mini"
            >
              <el-table-column type="index" width="80" align="center" label="序号">
                <template slot-scope="{ $index }">
                  {{ $index + 1 }}
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
                    :sortable="field.order ? field.order : false"
                  >
                    <template slot-scope="{ row }">
                      <template v-if="field.align == 'right'">
                        {{ formatNumber(row[field.field]) }}
                      </template>
                      <template v-else-if="field.type && field.type == 'switch'">
                        {{ row[field.field] == 1 ? "√" : "" }}
                      </template>
                      <template v-else>
                        {{ row[field.field] }}
                      </template>
                    </template>
                  </el-table-column>
                </template>
              </template>
            </el-table>
          </div>
        </el-collapse-transition>

        <template v-if="canChange">
          <el-form-item label="关联案件">
            <el-select v-model="linkcase" style="width: 90%">
              <el-option value="">该子账号关联案件</el-option>
              <template v-for="(item, index) in caseList">
                <el-option :key="index" :value="index" :label="item.caseinfo">
                  <span style="float: left">{{ item.caseinfo }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px"
                    >{{ item.deptname }} / {{ item.cbr }}</span
                  >
                </el-option>
              </template>
            </el-select>
            <el-button
              type="success"
              size="mini"
              @click="setLinkCase"
              style="margin-left: 10px"
              >填写</el-button
            >
          </el-form-item>

          <el-form-item label="新案号" prop="caseinfo">
            <span>（</span
            ><el-select v-model="detail.caseyear" style="width: 120px">
              <template v-for="yearnum in basedata.yearList">
                <el-option :key="yearnum" :value="yearnum" :label="yearnum" />
              </template>
            </el-select>
            <span>）</span>
            <el-select v-model="detail.casetype" style="width: 150px" filterable>
              <el-option
                v-for="aj in basedata.casetypeList"
                :key="aj.id"
                :value="aj.casetypename"
                :label="aj.casetypename"
              />
            </el-select>
            <span v-if="detail.caseyear && detail.caseyear < 2016">字第</span
            ><el-input v-model="detail.casenum" style="width: 100px" />号

            <el-button
              type="success"
              size="mini"
              class="form-button"
              :disabled="getajxxing"
              @click="getAjjbxx"
              >导入</el-button
            >
          </el-form-item>

          <el-form-item label="新承办部门" prop="deptname">
            <el-select v-model="detail.deptname" class="form-item" filterable>
              <el-option
                v-for="item in basedata.deptList"
                :key="item.deptid"
                :label="item.deptname"
                :value="item.deptname"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="新承办人" prop="cbr">
            <el-select v-model="detail.cbr" class="form-item" filterable>
              <el-option
                v-for="item in basedata.userList"
                :key="item.userid"
                :value="item.username"
                :label="item.username"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="变更理由" prop="note">
            <el-input
              v-model="detail.note"
              type="textarea"
              maxlength="50"
              :rows="3"
              show-word-limit
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button type="primary" icon="el-icon-edit" @click="doSave" v-if="canChange">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from "@/courtcase/api";
// 手工设置款项入账的案号信息
const fieldList = [
  { field: "statusText", label: "当前状态", width: 150, align: "center", show: true },
  { field: "oldcaseinfo", label: "原案号", width: 180, align: "center", show: true },
  { field: "caseinfo", label: "新案号", width: 180, align: "center", show: true },
  { field: "olddeptname", label: "原承办部门", width: 100, align: "center", show: true },
  { field: "deptname", label: "新承办部门", width: 100, align: "center", show: true },
  { field: "oldcbr", label: "原承办人", width: 100, align: "center", show: true },
  { field: "cbr", label: "新承办人", width: 100, align: "center", show: true },
  { field: "note", label: "变更说明", width: 120, align: "center", show: true },
  { field: "opertime", label: "操作时间", width: 160, align: "center", show: true },
  { field: "username", label: "操作人", width: 100, align: "center", show: true },
  { field: "checker", label: "审批人", width: 100, align: "center", show: true },
  { field: "checktime", label: "审批时间", width: 100, align: "center", show: true },
  { field: "checknote", label: "审批意见", width: 100, align: "center", show: true },
  { field: "revusername", label: "接收人", width: 120, align: "center", show: true },
  { field: "revtime", label: "接收时间", width: 120, align: "center", show: true },
];
export default {
  name: "CasebillChange",
  props: {},
  data() {
    return {
      showWindow: false,
      showLoglist: false,
      fieldList: fieldList,

      logList: [],
      listLoading: false,
      logLoading: false, // 正在加载日志

      dateRange: "",
      basedata: {
        deptList: [],
        userList: [],
        casetypeList: [],
        yearList: [],
      },

      linkcase: "", // 当前选中项，默认是-1
      caseList: [], // 通过子账号关联的案号

      detail: {
        billno: "",
        typeid: 0,
        caseyear: "",
        casetype: "",
        casenum: "",
        deptname: "",
        statusText: "",

        cbr: "",
        note: "",
        oldinfo: {
          billno: "",
          caseinfo: "",
          deptname: "",
          cbr: "",
        },
      },
      getajxxing: false,

      rules: {
        caseyear: [{ required: true, message: "案号年不能为空", trigger: "change" }],
        casetype: [{ required: true, message: "案号字号不能为空", trigger: "change" }],
        casenum: [{ required: true, message: "案件序号不能为空", trigger: "change" }],
        deptname: [{ required: true, message: "变更部门不能为空", trigger: "change" }],
        cbr: [{ required: true, message: "承办人不能为空", trigger: "change" }],
        note: [{ required: true, message: "变更理由不能为空", trigger: "change" }],
      },

      // 判断是否提交变更
      canChange: false, // 默认不允许，仅在无变更记录，或是最后一条变更记录为 已接收时，才允许新增变更
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    showWin(info) {
      this.canChange = false; // 默认不允许为真
      // console.log("casechange > show > data:", info);
      const { billno, caseinfo, deptname, cbr, subaccount, typeid } = info;
      this.resetTemp();
      this.detail.billno = billno;
      this.detail.typeid = typeid;

      this.detail.oldinfo.billno = billno;
      this.detail.oldinfo.caseinfo = caseinfo;
      this.detail.oldinfo.deptname = deptname;
      this.detail.oldinfo.cbr = cbr;
      this.detail.subaccount = subaccount;

      this.getBasedata();
      this.getLogList(billno);
      if (subaccount) {
        this.getSubLink(subaccount);
      } else {
        this.caseList = [];
      }

      this.showWindow = true;
    },

    checkCanChange() {
      this.showLoglist = false;
      this.canChange = false;
      this.detail.status = "";

      const data = this.logList;

      // 没有记录，则允许变更
      if (!data || data.length < 1) {
        this.canChange = true;
        return false;
      }

      // 如果有记录则要判断最后一条的状态，是不是已接收
      const row = data[data.length - 1];

      if (!row) {
        // 没有记录，则允许变更
        return false;
      }

      if (row) {
        this.detail.statusText = row.statusText;
      }

      // 如果没有记录，则不展开，如果有记录并且末条未审核，则自动展开
      if (data.length > 0 && !row.revtime) {
        this.showLoglist = true;
      }

      // 被拒绝的，允许变更
      if (row.checkstatus == 2) {
        this.canChange = true;
        return true;
      }

      if (row.checkstatus == 1 && row.revtime && row.revusername) {
        this.canChange = true;
      } else {
        this.canChange = false;
      }
    },
    getSubLink(subaccount) {
      this.caseList = [];
      const param = { subaccount: subaccount };
      caseapi.plugins.caselog_casebill_getcaselink(param).then((res) => {
        console.log("getSubLink", res);
        this.caseList = res;
      });
    },
    getLogList(billno) {
      this.logLoading = true;
      const param = { billno: billno, typeid: this.detail.typeid };
      caseapi.plugins.caselog_casebill_getlog(param).then((res) => {
        // console.log("getLogList", res);
        this.logList = res.items;

        this.checkCanChange();
        // console.log("logList", this.logList);
        this.$nextTick(() => {
          this.logLoading = false;
        });
      });
    },
    resetTemp() {
      this.detail.billno = "";
      this.detail.caseyear = "";
      this.detail.casetype = "";
      this.detail.casenum = "";
      this.detail.deptname = "";
      this.detail.cbr = "";
      this.detail.note = "";
      this.logList = [];
      this.logLoading = false;
      this.linkcase = "";

      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },

    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      caseapi.base.getBasedata(["casetype", "deptlist"]).then((res) => {
        this.basedata.casetypeList = res["casetype"];
        this.basedata.deptList = res["deptlist"];
      });

      caseapi.base.getYearList().then((res) => {
        this.basedata.yearList = res;
      });

      caseapi.base.getCbrList().then((data) => {
        this.basedata.userList = data;
      });
      // console.log(this.basedata)

      return true;
    },

    getAjjbxx() {
      const caseyear = this.detail.caseyear;
      const casetype = this.detail.casetype;
      const casenum = this.detail.casenum;
      if (!caseyear || !casetype || !casenum) {
        this.$alert("请填入完整案号");
        return false;
      }

      this.getajxxing = true;
      setTimeout(() => {
        this.getajxxing = false;
      }, 3000);

      caseapi.casesk.getajjbxx(caseyear, casetype, casenum).then((data) => {
        this.getajxxing = false;
        if (!data) {
          this.$alert("未找到案件！");
          return false;
        }

        this.detail.deptname = data.deptname;
        this.detail.cbr = data.cbrname;
      });
    },

    async doSave() {
      const valid = await this.$refs["dataForm"].validate();
      if (!valid) {
        return false;
      }

      // 判断案号三要素是否为空

      if (!this.detail.caseyear || !this.detail.casetype || !this.detail.casenum) {
        this.$alert("案号信息不完整！");
        return false;
      }

      const res = await caseapi.plugins
        .caselog_casebill_setcaseinfo(this.detail)
        .catch((e) => {
          this.$message.error("发生错误");
          console.log(e);
        });

      if (res > 0) {
        this.$alert("设置成功");
        this.resetTemp();
        this.$nextTick(() => {
          this.showWindow = false;
        });
      } else {
        this.$message.error("发生错误");
      }
    },

    setLinkCase() {
      const linkcase = this.linkcase;
      if (linkcase === "") {
        return false;
      }

      if (linkcase < 0 || linkcase > this.caseList.length - 1) {
        return false;
      }

      const item = this.caseList[linkcase];
      let field = ["caseyear", "casetype", "casenum", "deptname", "cbr"];
      for (let i = 0; i < field.length; i++) {
        const f = field[i];
        this.detail[f] = item[f];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.form-item {
  width: 100%;
}

.form-label {
  font-weight: bold;
  padding: 10px;
}

.el-form-item__label {
  text-align: justify;
}
</style>
