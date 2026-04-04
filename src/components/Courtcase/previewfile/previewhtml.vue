<template>
  <el-dialog v-dialogDrag v-loading="loading" :title="title" :visible.sync="showWindow" :close-on-click-modal="false"
    append-to-body width="90%">
    <iframe ref="pdfiframe" class="pdfiframe" src="about:blank" style="height: 100%; width: 100%; min-height: 600px" />

    <div slot="footer" class="dialog-footer">
      <el-button icon="el-icon-close" @click="showWindow = false"> 取消 </el-button>

      <el-button type="primary" icon="el-icon-printer" @click="doPrint">
        打印
      </el-button>

    </div>

  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'
// import Moneyinput from '@/components/Courtcase/MoneyInput' // secondary package based on el-pagination
// import Operdate from '@/components/Courtcase/Operdate' // secondary package based on el-pagination
// import { mapGetters } from 'vuex'
const PAGECONOFIG = {
  typename: '文件预览',
  typeid: 310,
}
export default {
  name: 'ssfbankpdf-preview',
  inheritAttrs: false,
  // components: { Moneyinput, Operdate },

  props: {
    title: {
      type: String,
      default: '预览'
    }
  },
  computed: {
  },
  data: () => {
    return {
      showWindow: false,

      loading: false,
      // title:'预览'





    }
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


    async showHTML(html) {
      this.loading = true;
      this.showWindow = true;
      
      setTimeout(() => {
        // this.$refs["pdfiframe"].src = url;
        this.insertHtml('pdfiframe', html)

        this.loading = false
      },1000);
    },

    insertHtml(id, html) {
      // let obj = document.getElementById(id)
      let obj = this.$refs["pdfiframe"];
      let doc = obj.contentDocument || obj.contentWindow.document

      // console.log('insertHTML', doc)
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
        // obj.contentWindow.contents = html
      }
    },



  }
}
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

.checklist {
  height: 40px;
  line-height: 40px;
}
</style>
