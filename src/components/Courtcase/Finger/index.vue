<template>
  <el-dialog
    v-dialogDrag
    append-to-body
    :visible.sync="showFinger"
    title="请录入指纹"
    :close-on-click-modal="false"
    width="80%"
  >
    <el-form
      ref="dataForm"
      label-position="left"
      label-width="80px"
      style="padding: 30px"
    >
      <el-form-item label="接口地址">
        <el-input v-model="url" />
      </el-form-item>
      <el-form-item label="当前指纹">
        {{ finger.length ? finger.length + "字节" : "无" }}
        <el-button type="primary" @click="getFingerData">读取指纹</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="delFinger">删除指纹</el-button>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showFinger = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" @click="doSaveFinger">
        更新指纹
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'
import axios from 'axios'

export default {
  name: 'Finger',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      userid: 0,
      showFinger: false,

      finger: '',
      url: 'http://localhost/finger/public/index.php'
    }
  },
  computed: {},
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {},

    showWin(userid) {
      this.userid = userid
      this.finger = ''
      this.getUserFinger(userid).then((res) => {
        this.showFinger = true
      })
    },

    callapi(action, data) {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const param = {
        action: action,
        data: data
      }

      console.log('callapi', param)

      return axios({ method: 'post', url: this.url, data: param, head: config.header })
    },

    async getUserFinger(userid) {
      const res = await caseapi.machine.getUserFinger(userid)
      const resdata = res.data
      if (resdata) {
        if (resdata.finger) {
          this.finger = resdata.finger
        } else {
          this.finger = ''
        }
      }

      return resdata
    },

    getFingerData() {
      this.$message.info('请按压手指')

      this.callapi('/finger/getFingerData').then((res) => {
        console.log('读取指纹成功', res)

        const resdata = res.data.data

        if (resdata.templatelen < 10) {
          this.$message.error('读取指纹失败，请重试！')
        } else {
          const finger = resdata.templatedata

          this.checkFinger(finger).then((bl) => {
            if (bl) {
              this.$message.success('读取指纹成功！')
              this.finger = finger
            } else {
              return false
            }
          })
        }
        // this.$message.success('读取指纹成功')
      })
    },

    async doSaveFinger() {
      if (this.finger == null || this.finger.length < 1) {
        this.$alert('指纹数据不能为空！')
        return false
      }

      const res = await caseapi.machine.updateUserFinger(this.userid, this.finger)
      if (res.code === 20000) {
        this.$alert('更新成功')
        this.showFinger = false
      } else {
        this.$alert('更新失败！' + res.message)
      }
      return res
    },
    async delFinger() {
      const res = await caseapi.machine.updateUserFinger(this.userid, '')
      if (res.code === 20000) {
        this.$alert('删除成功')
        this.finger = ''
        this.showFinger = false
      } else {
        this.$alert('删除失败！' + res.message)
      }
      return res
    },

    async checkFinger(finger) {
      const action = '/finger/getUserinfoByFingerTemplate'
      const param = { template: finger }

      const res = await this.callapi(action, param)
      const resdata = res.data.data

      if (resdata.userid > 0) {
        if (resdata.userid === this.userid) {
          // 指纹是当前用户的
          this.$alert('已是当前用户的指纹，无需重复录入')
          return false
        }
        const userinfo = resdata.userinfo
        const username = userinfo.username
        this.$alert('当前指纹已识别为【' + username + '】，请勿重复录入')
        return false
      }
      return true
    }
  }
}
</script>
<style>
.form-item {
  width: 100%;
}
</style>
