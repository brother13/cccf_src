<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog v-dialogDrag :title="title" :visible.sync="showWindow" :close-on-click-modal="false">
      <el-form ref="dataForm" label-position="left" label-width="120px" style="width: 600px; margin-left:50px;">
        <el-form-item label="单据信息" v-if="noteinfo.billno">
          单据号：{{ noteinfo.billno }}<br>案号：{{ noteinfo.caseinfo }}
          <template v-if="noteinfo.st=='sk'"><br>到账时间：{{ noteinfo.bankdate }}</template>
          <template v-else><br>出账时间：{{ noteinfo.bankdate }}</template>
        </el-form-item>
        <el-form-item label="备注内容">
          <el-input v-model="noteinfo.note" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" maxlength="180"
            show-word-limit />
        </el-form-item>
        <el-form-item label="信息" v-if="noteinfo.username">操作员：{{ noteinfo.username }}<br>
          首次备注时间：{{ noteinfo.createtime }}<template v-if="noteinfo.updatetime != noteinfo.createtime"><br>最后修改时间：{{
            noteinfo.updatetime
          }}</template></el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showWindow = false">取消</el-button>
        <el-button type="primary" @click="addNote">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from "@/courtcase/api";



export default {
  name: "casereason",
  props: {
    title: { type: String, default: "备注信息" },

  },
  data() {
    return {
      showWindow: false,
      isLoading: false, // 是否加载中

      noteinfo: {
        note: '',
        username: '',
        createtime: '',
        updatetime: '',
        st: '',
        noticenum: '',
        billno: '',
        ah: '',
        bankdate: '',
      }

    };
  },
  computed: {},
  watch: {},
  mounted() { },
  methods: {

    showNote(info) {
      this.isLoading = true;

      this.noteinfo.caseinfo = info.ah || '';
      this.noteinfo.billno = info.djcode || '';
      this.noteinfo.noticenum = info.czdh || '';
      this.noteinfo.st = info.st || '';

      this.noteinfo.bankdate = '';
      if (info.st == 'sk') {
        this.noteinfo.bankdate = info.dzdate || '';
      }else if(info.st=='tk'){
        this.noteinfo.bankdate = info.czdate || ''
      }


      this.noteinfo.username = ''
      this.noteinfo.createtime = '';
      this.noteinfo.note = '';
      this.noteinfo.updatetime = '';

      caseapi.plugins.getNote(this.noteinfo).then((res) => {


        if (res) {
          this.noteinfo.username = res.username
          this.noteinfo.createtime = res.createtime;
          this.noteinfo.note = res.note;
          this.noteinfo.updatetime = res.updatetime;
          // this.noteinfo.st = res.st
          // this.noteinfo.noticenum = res.noticenum

        }

        this.showWindow = true;


      }).finally(() => {
        this.isLoading = false;
      });
    },

    async addNote() {


      console.log("addNote > noteinfo", this.noteinfo);

      const billno = this.noteinfo.billno || '';
      const caseinfo = this.noteinfo.caseinfo || ''
      const note = this.noteinfo.note;
      if (!note || note.length < 3) {
        this.$alert("备注不能少于3个字")
        return false;
      }


      let query = this.noteinfo
      const res = await caseapi.plugins.addNote(query);

      this.$alert("保存成功");
      // this.freshAllList();
      this.$nextTick(() => {
        this.showWindow = false;
      })
      // this.getDetail();
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
