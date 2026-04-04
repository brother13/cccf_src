<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog
      v-dialogDrag
      :visible.sync="showWindow"
      title="未发还理由及不上缴时间设置"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="config"
        label-position="left"
        label-width="150px"
        style="width: 600px; margin-left: 50px"
      >
        <el-divider>未发还理由设置</el-divider>

        <el-form-item label="是否启用" prop="enable_dgk">
          <el-select v-model="config.enable_dgk" style="width: 100%">
            <el-option
              v-for="(item, index) in basedata.enableList"
              :key="index"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <template v-if="config.enable_dgk">
          <el-form-item label="未发还时间节点" prop="dgk">
            <el-date-picker
              v-model="config.dgk"
              type="date"
              placeholder="需要填写未发还理由的时间"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="填报时间节点" prop="dgk_notetime">
            <el-date-picker
              v-model="config.dgk_notetime"
              type="date"
              placeholder="填报的时间节点"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="显示未发还数据列" prop="show_dgk">
            <el-select v-model="config.show_dgk" style="width: 100%">
              <el-option
                v-for="(item, index) in basedata.dgktimeShowList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="导出未发还数据列" prop="export_dgk">
            <el-select v-model="config.export_dgk" style="width: 100%">
              <el-option
                v-for="(item, index) in basedata.dgktimeShowList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </template>

        <el-divider>暂不上缴设置</el-divider>
        <el-form-item label="是否启用" prop="enable_oldcase">
          <el-select v-model="config.enable_oldcase" style="width: 100%">
            <el-option
              v-for="(item, index) in basedata.enableList"
              :key="index"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <template v-if="config.enable_oldcase == 1">
          <el-form-item label="不上缴时间节点" prop="oldcase">
            <el-date-picker
              v-model="config.oldcase"
              type="date"
              placeholder="需要填写不上缴的时间"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="显示不上缴数据列" prop="show_oldcase">
            <el-select v-model="config.show_oldcase" style="width: 100%">
              <el-option
                v-for="(item, index) in basedata.dgktimeShowList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="导出不上缴数据列" prop="export_oldcase">
            <el-select v-model="config.export_oldcase" style="width: 100%">
              <el-option
                v-for="(item, index) in basedata.dgktimeShowList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button type="primary" icon="el-icon-save" @click="saveConfig">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from "@/courtcase/api";
const enableList = [
  { label: "启用", value: 1 },
  { label: "停用", value: 0 },
];
const dgktimeShowList = [
  { label: "显示", value: 1 },
  { label: "隐藏", value: 0 },
];

export default {
  name: "SSFTKConfig",
  props: {},
  data() {
    return {
      showWindow: false,
      // configfield: CONFIG_FIELD,
      config: {
        dgk: "",
        dgk_notetime:'',
        oldcase: "",
        enable_dgk: 0,
        enable_oldcase: 0,
        show_dgk: 0,
        show_oldcase: 0,
        export_dgk: 0, // 是否导出未发还理由的列
        export_oldcase: 0, // 是否导出不上缴的相关列
      },
      basedata: {
        enableList: enableList,
        dgktimeShowList: dgktimeShowList,
      },
      fields: [
        "dgk",
        'dgk_notetime',
        "oldcase",
        "enable_dgk",
        "enable_oldcase",
        "show_dgk",
        "show_oldcase",
        "export_dgk",
        "export_oldcase",
      ],
    };
  },
  computed: {},

  mounted() {
    // this.getConfig();
  },
  methods: {
    async showWin() {
      await this.getConfig();
      this.showWindow = true;
    },
    async getConfig() {
      const data = await caseapi.userconfig.dgktime_get();
      // this.config = data
      for (let i = 0; i < this.fields.length; i++) {
        const f = this.fields[i];
        this.config[f] = data[f];
      }
    },
    saveConfig() {
      caseapi.userconfig.dgktime_set(this.config).then((res) => {
        this.$alert("保存配置成功！");
        this.$emit("done");
        this.$nextTick(() => {
          this.showWindow = false;
        });
        // this.$emit("done");
      });
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
</style>
