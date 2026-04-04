<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      title="正在执行，请稍候"
      v-dialogDrag
      :visible.sync="stepinfo.loading"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div style="height: 400px">
        <el-steps direction="vertical" :active="stepinfo.step" finish-status="success">
          <template v-for="(item, index) in stepinfo.items">
            <el-step
              :key="index"
              :title="item.title"
              :description="item.notetext"
              :icon="stepinfo.step == index ? 'el-icon-loading' : ''"
            />
          </template>
        </el-steps>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from "@/courtcase/api";

export default {
  name: "CasebillFresh",
  props: {},
  data() {
    return {
      showWindow: false,

      listLoading: false,

      fleshye: {
        endtime: "",
        datetype: "operdate",
        yetype: 1,
        updatetime: "",
        lasttime: "",
      },
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    async handleRefreshCaseinfo() {
      // 导出数据
      // console.log("handleRefreshCaseinfo", this.config);

      try {
        let confirm = await this.$confirm("是否重新计算，该操作将需要一些时间", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        console.log(confirm);
      } catch (e) {
        // 说明点击了取消
        // console.log(e)
        return;
      }

      // 刷新显示的标题
      for (let i = 1; i < this.stepinfo.items.length - 1; i++) {
        this.stepinfo.items[i].notetext = this.stepinfo.items[i].note;
      }

      this.stepinfo.step = 0;
      this.stepinfo.loading = true;
      // 以下改用分页导出数据的方法，用以实现超大数据量级的导出

      // 开始计算数据
      let query = {
        endtime: this.fleshye.endtime,
        refresh: true,
        type: this.listQuery.type,
      };

      await caseapi.report.report_casebill_CasebillByDept(query);

      // 第二步，获取明细数据，并开始进行数据刷新

      this.stepinfo.step = 1;

      const pagesize = 100; // 每次刷新一百条
      query = { type: 0, page: 1, pagesize: pagesize };

      let step_tip = this.stepinfo.items[1].note;
      this.stepinfo.items[1].notetext = step_tip + "(0/" + total + ")";

      let data = await caseapi.report.report_casebill_getList(query);
      let total = data.total.num;
      let items = data.items;

      let ids = []; // 获取所有的ID
      let maxpage = total / pagesize;

      if (maxpage % pagesize > 0) {
        maxpage++; // 加一页
      }

      let allid = [];

      let done = 0;
      for (let i = 0; i < items.length; i++) {
        ids.push(items[i]["id"]);
        done++;
      }

      allid.push(ids);
      this.stepinfo.items[1].notetext = step_tip + "(" + done + "/" + total + ")";

      for (let page = 2; page <= maxpage; page++) {
        query = { type: 0, page: page, pagesize: pagesize };
        data = await caseapi.report.report_casebill_getList(query);
        items = data.items;
        ids = [];
        for (let i = 0; i < items.length; i++) {
          ids.push(items[i]["id"]);
          done++;
        }
        allid.push(ids);
        this.stepinfo.items[1].notetext = step_tip + "(" + done + "/" + total + ")";
      }

      console.log("allid", allid);
      for (let p = 2; p < this.stepinfo.items.length - 1; p++) {
        // 开始从第二项执行到倒数第二项
        this.stepinfo.step = p;
        const item = this.stepinfo.items[p];
        const key = item.key;
        const step2_tip = item.note;

        done = 0;

        for (let i = 0; i < allid.length; i++) {
          const taskid = allid[i];
          this.stepinfo.items[p].notetext = step2_tip + "(" + done + "/" + total + ")";
          await caseapi.report.advcasebill_updatecbrinfo(taskid, key);
          done += taskid.length;
          this.stepinfo.items[p].notetext = step2_tip + "(" + done + "/" + total + ")";
          if (key === "cbr") {
            // 只执行一次
            this.stepinfo.items[p].notetext = step2_tip + "(" + total + "/" + total + ")";
            break;
          }
        }
      }

      // 第三步，开始获取数据
      this.stepinfo.step = this.stepinfo.items.length - 1; // 最后一步

      this.handleFilter();

      this.stepinfo.loading = false;

      this.$alert("执行完成！");
      // this.handleFilter()
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
