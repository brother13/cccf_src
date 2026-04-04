<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-button type="success" class="filter-item" icon="el-icon-link" @click="showFile"
      >相关附件<template v-if="filenum + uploadList.length > 0"
        >({{ filenum + uploadList.length }})</template
      ></el-button
    >
    <el-dialog
      v-dialogDrag
      v-loading="loading"
      :title="title"
      :visible.sync="showWindow"
      :close-on-click-modal="false"
      append-to-body
      width="90%"
    >
      <div description="暂无附件" v-if="filenum < 1 && !showUpload">暂无文件</div>

      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 在此循环生成文件列表 -->
          <template v-for="(item, index) in fileList">
            <span :key="'span_' + index"
              >{{ item.typename }} ({{ item.detail.length }})</span
            >
            <ul :key="'ul_' + index">
              <li v-for="(file, idx) in item.detail" :key="idx" class="attachment-list">
                <el-link
                  @click="showFileData(file)"
                  :icon="file.id == viewid ? 'el-icon-right' : ''"
                >
                  <span class="item">{{ file.filename }}</span>
                </el-link>
                <el-button
                  size="mini"
                  type="danger"
                  class="form-input"
                  icon="el-icon-delete"
                  v-if="['attach'].indexOf(item.typecode) > -1"
                  circle
                  @click="removeFile(file.id)"
                ></el-button>
              </li>
            </ul>
          </template>

          <div v-if="uploadList.length > 0">
            <span>当前上传 ({{ uploadList.length }})</span>
            <ul>
              <li v-for="(file, idx) in uploadList" :key="idx" class="attachment-list">
                <el-link
                  @click="showUploadFile(file, idx)"
                  :icon="idx == viewid ? 'el-icon-right' : ''"
                >
                  <span class="item">{{ file.filename }}</span>
                </el-link>
                <el-button
                  size="mini"
                  type="danger"
                  class="form-input"
                  icon="el-icon-delete"
                  circle
                  @click="removeUploadFile(idx)"
                ></el-button>
              </li>
            </ul>
          </div>
          <div v-if="showUpload">
            <el-upload
              ref="upload"
              class="upload-file"
              multiple
              action="./index.php/courtcase/index/uploadfile"
              :auto-upload="false"
              :header="headers"
              :show-file-list="false"
              :on-change="handleSelectFile"
            >
              <el-button
                slot="trigger"
                size="small"
                type="primary"
                class="form-input"
                icon="el-icon-upload"
                >上传附件</el-button
              >
              <el-button
                size="small"
                type="success"
                @click="showScaner"
                class="form-input"
                icon="el-icon-camera-solid"
                >扫描文件</el-button
              >
            </el-upload>
          </div>
        </el-col>
        <el-col :span="16">
          <iframe
            ref="pdfiframe"
            class="pdfiframe"
            src="about:blank"
            style="height: 100%; width: 100%; min-height: 600px"
          />
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-close" @click="showWindow = false"> 取消 </el-button>

        <!-- <el-button type="primary" icon="el-icon-printer" @click="doPrint">
          打印
        </el-button> -->
        <el-button type="primary" icon="el-icon-check" @click="doSave"> 确定 </el-button>
      </div>
    </el-dialog>
    <Scaner ref="scaner" @savepdf="savepdf"></Scaner>
  </div>
</template>
<script>
import caseapi from "@/courtcase/api";
// import { mapGetters } from "vuex";
import Scaner from "@/components/Courtcase/Scaner";

const PAGECONOFIG = {
  typename: "文件预览",
  typeid: 310,
};
export default {
  name: "ssfbankpdf-preview",
  inheritAttrs: false,
  components: { Scaner },

  props: {
    title: {
      type: String,
      default: "附件管理",
    },

    typeid: {
      type: Number,
      default: 310,
    },
    id: {
      type: Number,
      default: 0,
    },
    showUpload: {
      type: Boolean,
      default: false,
    },
    // 通知书号
    noticenum: {
      type: String,
      default: "",
    },
  },
  computed: {},

  created() {
    console.log("filemanager created ");
    this.$nextTick(() => {
      this.resetUpload();
      this.refreshFile();
    });
  },
  //   mounted() {
  //     console.log("filemanager mounted ");
  //   },
  //   activated() {
  //     console.log("filemanager activated");
  //     // this.$nextTick(() => {
  //     //   this.refreshFile();
  //     // });
  //   },
  data: () => {
    return {
      showWindow: false,

      loading: false,
      fileList: [],
      filenum: 0,
      uploadList: [], // 本地上传的文件
      viewid: "",

      headers: {
        "RLF-TOKEN": "",
      },
    };
  },
  computed: {},
  watch: {},

  mounted() {
    // this.init()
  },
  methods: {
    async doPrint() {
      this.$refs["pdfiframe"].contentWindow.print();
    },
    // 重置上传文件列表

    async resetUpload() {
      this.uploadList = [];
    },
    async refreshFile() {
      this.getFileInfo(this.typeid, this.id);
    },
    async getFileInfo(typeid, id) {
      const query = { typeid: typeid, id: id, noticenum: this.noticenum };
      const res = await caseapi.bankpdf.getLinkedFileList(query);
      this.filenum = res.total;
      this.fileList = res.items;
    },

    async showFile() {
      this.viewid = "";
      this.loading = true;
      if (this.filenum < 1) {
        await this.getFileInfo(this.typeid, this.id);
      }

      if (this.filenum > 0) {
        const item = this.fileList[0].detail[0];
        if (item) {
          this.showFileData(item);
        }
      }
      this.showWindow = true;
      this.loading = false;
    },
    async showPdf(url) {
      this.loading = true;
      this.showWindow = true;
      this.$nextTick(() => {
        this.$refs["pdfiframe"].src = url;
        this.loading = false;
      });
    },
    showFileSize(oldsize) {
      return Math.floor((oldsize * 100) / 1024) / 100 + " KB";
    },
    // 显示文件内容
    showFileData(item) {
      const id = item.id;
      if (id) {
        this.viewid = id;
        // 存在信息
        const url = "./index.php/courtcase/file/getfile?id=" + id;
        this.showPdf(url);
      }
    },

    removeFile(id) {
      this.$confirm("是否要删除该附件？", "确认", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "danger",
      }).then(() => {
        caseapi.bankpdf
          .delFile({ id: id })
          .then((res) => {
            this.$alert("附件删除成功");
            this.getFileInfo(this.typeid, this.id);
          })
          .catch((e) => {
            this.$alert(e.message);
          });
        // const file = this.temp.files[index];
        // if (file) {
        //   if (file.id == 0) {
        //     this.temp.files.splice(index, 1);
        //   } else {
        //     this.$error("已保存的附件无法删除");
        //   }
        // }
      });
    },
    handleSelectFile(file, fileList) {
      // console.log(file)
      this.selectFile_2(file);
    },
    selectFile_2(upfile) {
      // console.log('selectFile_2', upfile)
      const fileupload = upfile.raw;

      console.log(fileupload);
      // 判断文件后缀是否正确
      const filename = fileupload.name;
      const fileext = filename.substr(filename.lastIndexOf(".") + 1).toLowerCase();

      // 判断文件名是否已存在
      for (let i = 0; i < this.uploadList.length; i++) {
        if (this.uploadList[i].filename == filename) {
          this.$message.error("文件名已存在，请重新选择！");
          return false;
        }
      }
      // console.log(fileshortname);

      if (fileext !== "pdf") {
        this.$message.error("仅支持上传pdf附件，请重新选择！");
        return false;
      }
      let fileinfo = {};
      fileinfo.id = 0; // 新增
      fileinfo.filename = filename;
      fileinfo.filesize = fileupload.size;
      fileinfo.filemime = fileupload.type;

      fileinfo.ext = fileext;

      // this.uploadInfo.filename = filename

      // this.uploadInfo.filesize = fileupload.size

      var reader = new FileReader(); // 实例化文件读取对象

      reader.readAsDataURL(fileupload);
      reader.onload = (ev) => {
        // 文件读取成功完成时触发
        // 必须采用此方法方式来命名函数， (ev) =>{}，不然无法引用this对象
        var dataURL = ev.target.result; // 获得文件读取成功后的DataURL,也就是base64编码
        dataURL = dataURL.split(",")[1];
        fileinfo.filedata = dataURL;
        this.uploadList.push(fileinfo);
        // this.uploadInfo.filedata = dataURL
        // this.SSF_checkFileInfo()

        // console.log(dataURL)
      };
    },

    showScaner() {
      try {
        const obj = this.$refs["scaner"];
        if (obj) {
          obj.showWin();
        } else {
          this.$error("未找到扫描仪组件");
        }
      } catch (e) {
        console.log("showscaner", e);
      }
    },
    savepdf(param) {
      console.log("savepdf", param);

      const { title, data } = param;
      let filesize = 0;
      const bytes = atob(data);
      filesize = bytes.length;

      let fileinfo = {};
      fileinfo.id = 0; // 新增
      fileinfo.filename = title + ".pdf";
      fileinfo.filesize = filesize;
      fileinfo.filemime = "application/pdf"; // 固定值
      fileinfo.filedata = data;

      fileinfo.ext = "pdf";
      this.uploadList.push(fileinfo);
      this.$alert("文件扫描成功！");
    },
    async showUploadFile(fileinfo, index) {
      if (fileinfo.filedata && !fileinfo.id) {
        // base64形式
        const pdf = caseapi.util.pdf_base64_to_byte(fileinfo.filedata);
        const url = caseapi.util.pdf_getObjectURL(pdf);
        this.showPdf(url);
      }
      if (fileinfo.table == "attachment" && fileinfo.id) {
        const info = await caseapi.bankpdf.getFile({ id: fileinfo.id, getfile: true });
        const pdfdata = info.filedata;
        const pdf = caseapi.util.pdf_base64_to_byte(pdfdata);
        const url = caseapi.util.pdf_getObjectURL(pdf);
        this.showPdf(url);
      }

      // else if (!fileinfo.filedata && fileinfo.id) {
      //   const info = await caseapi.bankpdf.getBankpdf({ id: fileinfo.id,getfile:true });
      //   const pdfdata = info.pdfdata;
      //   const pdf = caseapi.util.pdf_base64_to_byte(pdfdata);
      //   const url = caseapi.util.pdf_getObjectURL(pdf)
      //   this.showPdf(url);
      // }
      this.viewid = index;
    },

    removeUploadFile(index) {
      this.$confirm("是否要删除该附件？", "确认", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "danger",
      }).then(() => {
        const file = this.uploadList[index];
        if (file) {
          if (file.id == 0) {
            this.uploadList.splice(index, 1);
          }
        }
      });
    },

    doSave() {
      // 保存数据
      this.$emit("save", this.uploadList); // 回传文件列表
      // this.uploadList = [];
      this.showWindow = false;
    },
  },
};
</script>
<style>
.form-item {
  width: 100%;
}

.pdfiframe {
  height: 500px;
  width: 100%;
  border: 0;
}

.form-input {
  margin-left: 10px;
}

.checklist {
  height: 40px;
  line-height: 40px;
}

.attachment-list {
  width: 100%;
  margin-top: 10px;
}

.attachment-size {
  margin-left: 10px;
  margin-right: 10px;
  color: #999999;
}
</style>
