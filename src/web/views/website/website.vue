<template>
  <div class="app-container">

    <el-tabs type="border-card">
      <el-tab-pane label="网站信息">

        <el-form
          ref="dataForm"
          :rules="rules"
          :model="temp"
          label-position="left"
          label-width="80px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item label="网站名称" prop="sitename">
            <el-input v-model="webconfig.sitename" placeholder="请填写网站名称" />
          </el-form-item>
          <el-form-item label="网站ICP" prop="icp">
            <el-input v-model="webconfig.icp" placeholder="请填写网站ICP信息" />
          </el-form-item>
          <el-form-item label="版本信息" prop="copyright">
            <el-input v-model="webconfig.copyright" placeholder="请填写网站版权信息" />
          </el-form-item>

        </el-form>
        <div style="text-align:center">
          <el-button type="primary" @click="updateWebConfig()">保存</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="功能配置">配置管理</el-tab-pane>
      <el-tab-pane label="其它">其它</el-tab-pane>

    </el-tabs>

  </div>
</template>

<script>

import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import { postdata } from '@/web/api/common'
const ACTION = {
  info: '/website/info',
  save: '/website/save'
}
export default {
  name: 'WebsiteConfig',
  directives: { waves },
  filters: {

  },

  data() {
    return {
      webconfig: {
        type: 'website',
        sitename: '',
        icp: '',
        copyright: ''
      },
      rules: {

      }
    }
  },
  computed: {

  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getWebConfig()
    },
    getWebConfig() {
      postdata(ACTION.info, { type: 'website' }).then((res) => {
        this.webconfig = res.data
        this.webconfig['type'] = 'website'
      })
    },
    updateWebConfig() {
      postdata(ACTION.save, this.webconfig).then((res) => {
        this.$message('保存成功！')
        this.init()
      })
    }

  }

}
</script>
<style>

</style>
