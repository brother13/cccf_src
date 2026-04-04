<template>
  <el-dialog
    v-dialogDrag
    append-to-body
    v-loading="loading"
    title="扫描文件"
    :visible.sync="showWindow"
    :close-on-click-modal="false"
    width="90%"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row :gutter="20">
      <el-col :span="6">
        <!-- 以下是相关的图片资源 -->

        <div class="scan-title">
          <span>标题：</span><el-input v-model="pdftitle" placeholder="文件名"></el-input>
        </div>

        <div style="imageList">
          <template v-for="(item, index) in imageListPreview">
            <div :key="index" class="image-item">
              <el-row :gutter="20">
                <el-col :span="18">
                  <el-image
                    :src="item"
                    style="width: 150px; height: 200px"
                    :previewSrcList="imageListPreview"
                  >
                  </el-image>
                </el-col>
                <el-col :span="6">
                  <el-popconfirm
                    @confirm="removeImage(index)"
                    title="是否删除图片？此操作不可逆，请谨慎操作！"
                  >
                    <el-button
                      icon="el-icon-delete"
                      size="mini"
                      type="danger"
                      slot="reference"
                      class="removeBtn"
                    >
                    </el-button>
                  </el-popconfirm>
                </el-col>
              </el-row>
            </div>
          </template>
          <div v-if="imageList.length < 1">
            <el-empty description="请扫描图片"></el-empty>
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div id="CameraCtl" style="width: 1000px; height: 800px"></div>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <div v-show="showSetting">
        <span class="form-input">设备</span>
        <el-select
          v-model="info.scan"
          placeholder="请选择"
          @change="changeScaner"
          style="width: 200px"
        >
          <el-option
            v-for="(item, index) in basedata.scanerList"
            :key="index"
            :label="item"
            :value="index"
          />
        </el-select>

        <span class="form-input">分辨率</span>
        <el-select
          v-model="info.resolution"
          placeholder="请选择"
          @change="changeScaner"
          style="width: 200px"
        >
          <el-option
            v-for="(item, index) in basedata.ResolutionList"
            :key="index"
            :label="item"
            :value="index"
          />
        </el-select>
        <span class="form-input">颜色</span>
        <el-select
          v-model="info.ColorMode"
          placeholder="请选择"
          @change="changeScaner"
          style="width: 200px"
        >
          <el-option
            v-for="(item, index) in basedata.colorModeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="form-input">自动裁切</span>
        <el-select
          v-model="info.autocut"
          placeholder="请选择"
          @change="setAutoCutAndBlack"
          style="width: 200px"
        >
          <el-option
            v-for="(item, index) in basedata.autoCutList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="form-input">去黑边</span>
        <el-select
          v-model="info.removeBlack"
          placeholder="请选择"
          @change="setAutoCutAndBlack"
          style="width: 200px"
        >
          <el-option
            v-for="(item, index) in basedata.removeBlackList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <el-button-group>
        <el-button
          icon="el-icon-setting"
          @click="showSetting = !showSetting"
          class="form-input"
        >
          设置
        </el-button>
        <el-button
          icon="el-icon-refresh-left"
          @click="changeDirect('left')"
          class="form-input"
        >
          左转
        </el-button>
        <el-button
          icon="el-icon-refresh-right"
          @click="changeDirect('right')"
          class="form-input"
        >
          右转
        </el-button>
      </el-button-group>

      <el-button
        icon="el-icon-close"
        :disabled="loading"
        @click="closeWin"
        class="form-input"
      >
        取消
      </el-button>
      <el-button type="primary" icon="el-icon-printer" @click="addimage">
        拍摄
      </el-button>
      <el-button
        type="primary"
        icon="el-icon-printer"
        @click="savePdf"
        :disabled="imageList.length < 1"
      >
        生成pdf<template v-if="imageList.length > 0"
          >(共{{ imageList.length }}页)</template
        >
      </el-button>

      <canvas id="pdf-canvas" style="width: 10px; height: 10px" />
    </div>
  </el-dialog>
</template>
<script>
import caseapi from "@/courtcase/api";
// import $ from 'jquery'
// import printPreview from './preview'

// import { hiprint } from '../../vue-plugin-hiprint/src/index'

// import * as scaner from "./gpyhsapi.js";

// hiPrintPlugin.disAutoConnect()
const scanapi_win = "./assets/js/gpyhs_win.js";
const scanapi_linux = "./assets/js/gpyhs_linux.js";
import load from "./dynamicLoadScript";
// import { showSettings } from "@/settings";

const colorModeList = [
  { label: "彩色", value: 0 },
  { label: "灰度", value: 1 },
  { label: "黑白", value: 2 },
];
const autoCutList = [
  { label: "不裁剪", value: 0 },
  { label: "自动裁剪", value: 1 },
];
const removeBlackList = [
  { label: "不移除", value: 0 },
  { label: "去黑色背景", value: 1 },
];
import { PDFDocument } from "pdf-lib";
// import {
//   saveAs
// } from 'file-saver'

export default {
  name: "Scaner",
  // components: { printPreview },

  props: {},
  computed: {
    imageListPreview() {
      let arr = [];
      for (let i = 0; i < this.imageList.length; i++) {
        arr.push("data:;base64," + this.imageList[i]);
      }
      return arr;
    },
  },
  data() {
    return {
      showWindow: false,

      pdftitle: "扫描文件",

      showSetting: false, // 是否显示设置
      loading: false,
      showPreview: false,
      basedata: {
        // templateList: [],
        scanerList: [], // 扫描仪列表
        ResolutionList: [], // 分辨率

        colorModeList: colorModeList,
        autoCutList: autoCutList,
        removeBlackList: removeBlackList,
      },

      info: {
        scan: 0,
        resolution: 0,
        ColorMode: 0,
        autocut: 0,
        removeBlack: 0,
      },

      imageList: [], // 图片列表

      temp: {
        templateid: undefined,
        typeid: 0,
        id: 0,
      },
      printinfo: {
        lastprint: "",
        printnum: 0,
      },
      config: null,
    };
  },

  mounted() {
    // disAutoConnect()
    this.init();
  },
  methods: {
    getOs() {
      const plat = navigator.platform;

      console.log(plat);
      if (plat.indexOf("Win") > -1) {
        return "win";
      } else if (plat.indexOf("Linux") > -1) {
        return "linux";
      }

      return "other";
    },
    init() {},

    resetTemp() {
      this.imageList = [];
      this.info.scan = 0;

      const obj = document.getElementById("CameraCtl");
      if (obj) {
        obj.innerHTML = "";
      }
      // Cam_Close();

      this.pdftitle =
        "扫描文件" + caseapi.util.formatDate(new Date(), "{yyyy}{mm}{dd}_{hh}{min}{ss}");
    },
    showWin() {
      this.showWindow = true;
      this.loading = true;
      this.resetTemp();
      setTimeout(() => {
        this.showScaner();
      }, 100);
    },

    showScaner() {
      console.log("showScaner > ");

      // scaner.ConnectServer();

      let apiurl = scanapi_win;
      const os = this.getOs();
      if (os == "linux") {
        apiurl = scanapi_linux;
      }
      load(apiurl, (err) => {
        if (err) {
          this.$message.error(err.message);
          return;
        }
        this.initScaner();
      });
    },

    /**
     * 获取基础资料，可用模板内容
     *
     */
    async getBasedata() {
      // 获取模板列表
      return true;
    },

    ShowInfo(text) {
      this.$message.info(text);
    },

    initScaner() {
      var obj = document.getElementById("CameraCtl");
      // scaner.ConnectServer();

      console.log("initScaner", obj);
      Cam_ControlInit(obj, 0, 0, 800, 800, this.scanCallback);

      // reconnect();

      // setTimeout(() => {
      //   Cam_GetDevCount();
      // }, 1000)
      // window.GetDevCountAndNameResultCB =null;

      // window.GetDevCountAndNameResultCB = (devCount, devNameArr)=>{
      //   console.log("GetDevCountAndNameResultCB",devCount,devNameArr);
      // }
    },

    GetDevCountAndNameResultCB(param) {
      this.basedata.scanerList = param.camName;
      // console.log("all device",this.basedata.scanerList);
      if (param.camName.length > 0) {
        this.info.scan = 0;
        Cam_GetDevResolution(0);
      }
    },
    async GetResolutionResultCB(param) {
      console.log("GetResolutionResultCB", param);
      const { resCount, resArr } = param;
      this.basedata.ResolutionList = resArr;

      if (resCount > 0) {
        let selectIndex = 0;

        for (var i = 0; i < resArr.length; i++) {
          //默认500万分辨率打开
          if (resArr[i] == "2592*1944") {
            selectIndex = i;
            break;
          }
        }

        this.info.resolution = selectIndex;

        this.changeScaner();

        // //打开摄像头
        // Cam_Close();
        // await caseapi.util.waitTime(100); // 等100ms

        // var restr = resArr[this.info.resolution];
        // var pos = restr.lastIndexOf("*");
        // var width = parseInt(restr.substring(0, pos));
        // var height = parseInt(restr.substring(pos + 1, restr.length));
        // Cam_Open(this.info.scaner, width, height);
      } else {
        this.ShowInfo("获取分辨率信息失败！");
      }
    },

    async changeScaner() {
      Cam_Close();
      await caseapi.util.waitTime(100); // 等100ms
      const resArr = this.basedata.ResolutionList;
      var restr = resArr[this.info.resolution];
      var pos = restr.lastIndexOf("*");
      var width = parseInt(restr.substring(0, pos));
      var height = parseInt(restr.substring(pos + 1, restr.length));
      Cam_Open(this.info.scaner, width, height);
      await caseapi.util.waitTime(100);

      // 设置图片为png 0-jpg,1-png,2-tif,3-pdf
      Cam_SetFileType(1);

      // 设置质量，0-10%，1-20%…………,9-100%

      // 设置灰度
      Cam_SetColorMode(this.info.ColorMode);

      Cam_SetJpgQuality(9);

      // 去黑边
      Cam_SetDeleteBlackEdge(0);
      await caseapi.util.waitTime(100);
      // await caseapi.util.waitTime(100);
      Cam_SetCutMode(this.info.autocut); // 自动裁切

      Cam_SetDeleteBlackEdge(this.info.removeBlack);
      // Cam_SetCutMode(1); // 自动裁切

      Cam_Focus();

      this.loading = false;

      this.info.autocut = 1;
      this.info.removeBlack = 1;
      setTimeout(() => {
        this.setAutoCutAndBlack();
      }, 1000);
    },
    GetCaptrueImgResultCB(param) {
      console.log("GetCaptrueImgResultCB", param);

      const { flag, base64Str } = param;
      if (flag == 0) {
        // 成功
        this.imageList.push(base64Str);
      }
    },
    GetCameraOnOffStatus(data) {
      console.log("GetCameraOnOffStatus", data);
    },

    PdfCombineResultCB(data) {
      const { flag, base64Str } = data;

      console.log("生成的pdf文件内容", base64Str);
    },
    scanCallback(param) {
      console.log("scanCallback", param);
      const func = param.func;
      const data = param.data;
      switch (func) {
        case "GetDevCountAndNameResultCB": // 获取设备列表
          this.GetDevCountAndNameResultCB(data);

          break;
        case "GetCaptrueImgResultCB": // 抓取图片
          this.GetCaptrueImgResultCB(data);
          break;

        case "GetResolutionResultCB": // 获取分辨率
          this.GetResolutionResultCB(data);
          break;
        case "GetCameraOnOffStatus":
          this.GetCameraOnOffStatus(data); // 摄像头状态
          break;
        case "AddImgFileToPDFResultCB": // 添加图片到pdf
          this.AddImgFileToPDFResultCB(data);
          break;
        case "PdfCombineResultCB": // 合并pdf
          this.PdfCombineResultCB(data);
          break;
        default:
          break;
      }
    },

    AddImgFileToPDFResultCB(data) {
      const { flag, base64Str } = data;

      if (flag == 0) {
        // 成功
        this.imageList.push(base64Str);
      }
    },
    changeDirect(action = "left") {
      if (action == "left") {
        Cam_RotateLeft();
      } else if (action == "right") {
        Cam_RotateRight();
      }
    },

    async addimage() {
      // AddImgFileToPDF("");
      Cam_Focus();
      await caseapi.util.waitTime(100);
      Cam_Photo("");
    },
    async savePdf() {
      // Cam_CombinePDF();

      // 改用pdfjs来生成PDF
      console.log("正在生成PDF");
      if (this.imageList.length < 1) {
        this.$alert("没有足够的图片，无法生成PDF");
        return;
      }

      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < this.imageList.length; i++) {
        const image = this.imageList[i];
        console.log("image is ", image);
        const pngImage = await pdfDoc.embedJpg(image);
        const pngDims = pngImage.scale(1);

        const page = pdfDoc.addPage();
        page.setHeight(pngDims.height);
        page.setWidth(pngDims.width);
        // 取图片宽度和长度
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngDims.width,
          height: pngDims.height,
        });
      }
      const pdfBytes = await pdfDoc.saveAsBase64();

      // 输出pdfbytes
      this.$emit("savepdf", { title: this.pdftitle, data: pdfBytes });
      this.$nextTick(() => {
        this.closeWin();
      });

      // console.log("pdffile is ",pdfBytes);

      // saveAs(new Blob([csvdata], { type: 'text/plain;charset=utf-8' }), filename)
    },

    closeWin() {
      Cam_Close();
      this.showWindow = false;
    },
    removeImage(index) {
      // 移除imageList的的指定位置元素
      this.imageList.splice(index, 1);
    },
    setAutoCutAndBlack() {
      Cam_SetCutMode(this.info.autocut); // 自动裁切
      Cam_SetDeleteBlackEdge(this.info.removeBlack);
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

.removeBtn {
  margin-top: auto;

  // width:50px;
  // height:50px;
  /* 使得按钮为圆形 */
}

.imageList {
  height: 100%;
  width: 150px;
}

.scan-title {
  height: 40px;
  margin-bottom: 20px;
}
</style>
