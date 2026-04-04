<template>
  <el-dialog v-dialogDrag :visible.sync="showWindow" title="银行退票" :close-on-click-modal="false" width="70%">
    <el-form ref="dataForm" :model="temp" label-position="left" label-width="80px" style="padding: 30px">

      <template v-if="showCaseinfo">

        <el-descriptions
          class="margin-top margin-bottom"
          title="退款信息"
          :column="2"
          :size="size"
          border
          style="margin-bottom:20px;"
        >

          <template v-for="(item, index) in FieldList">
            <el-descriptions-item :key="index" :label="item.label">
              {{ (item.align || '') == 'right' ? formatNumber(tkinfo[item.field]) : tkinfo[item.field] }}

            </el-descriptions-item>

          </template>
        </el-descriptions>

      </template>
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
        <!-- <el-autocomplete
          v-model="temp.tpreason"
          class="form-item"
          :fetch-suggestions="querySearch"
          placeholder="请输入退票理由"
        /> -->

        <!-- <el-input
            v-model="temp.tpreason"
            class="form-item"
            placeholder="请输入退票理由"
          /> -->
      </el-form-item>

      <el-form-item v-if="temp.tpreason2 == '-1'" label="退票理由">
        <el-input v-model="temp.tpreason" class="form-item" placeholder="请输入退票理由" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" @click="doTP">
        退票
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'

const FieldList = [
  { field: 'caseinfo', label: '案号' },
  { field: 'dwname', label: '领款人' },

  { field: 'operdate', label: '退款时间' },
  { field: 'bankaccount', label: '银行账号' },
  { field: 'je', label: '金额', align: 'right' },
  { field: 'bankname', label: '开户行' }

]
export default {
  name: 'Banktp',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      tpReasonList: [],
      showCaseinfo: false, // 是否显示案件信息

      FieldList: FieldList,
      tkinfo: {
        operdate: '',
        id: '',
        dwname: '',
        caseinfo: '',
        je: ''
      },
      temp: {
        typeid: 0,
        id: 0,
        tpreason: '',
        tpreason2: '',
        tpdate: ''
      }
    }
  },
  computed: {},
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.temp.tpdate = caseapi.base.getLogindate()
      this.getTpReason()
      this.showCaseinfo = false
    },
    async getConfig() {
      const config = await caseapi.notice.notice_getconfig()
      this.showCaseinfo = config.banktp_showcaseinfo || false
      if (this.showCaseinfo) {
        // 获取退款数据
        const info = await caseapi.casetk.info(this.temp.id, this.temp.typeid)
        this.tkinfo = info
      }
    },
    async showTp(typeid, id) {
      try {
        const t = await this.$confirm('您确定要发起退票吗？此操作不可逆！')
        console.log(t)
      } catch (e) {
        return false
      }

      this.temp.typeid = typeid
      this.temp.id = id
      this.temp.tpreason = ''
      this.showWindow = true

      this.getConfig()
    },
    getTpReason() {
      caseapi.base.getTpReasonList().then((data) => {
        // console.log(data)
        this.tpReasonList = data.items
      })
    },

    formatNumber(str) {
      return caseapi.util.formatNumber(str)
    },
    // querySearch(key, callback) {
    //   caseapi.casetk.getTpReason(key).then((data) => {
    //     callback(data)
    //   })
    // },
    async doTP() {
      const tpreason =
        this.temp.tpreason2 === '-1' ? this.temp.tpreason : this.temp.tpreason2
      if (!tpreason || tpreason === '') {
        this.$message.error('退票理由不能为空')
        return false
      }

      if (this.showCaseinfo) {
        try {
          const t = await this.$confirm('您确定要发起退票吗？此操作不可逆！')
          console.log(t)
        } catch (e) {
          return false
        }
      }

      const res = await caseapi.casetk.billTP(
        this.temp.typeid,
        this.temp.id,
        tpreason,
        this.temp.tpdate
      )
      if (res.code !== 20000) {
        this.$message.error(res.message)
      } else {
        this.$message('退票完成')
        this.$emit('dotp')
        this.showWindow = false
      }
    }
  }
}
</script>
<style>
.form-item {
  width: 100%;
}
</style>
