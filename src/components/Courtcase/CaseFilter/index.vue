<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-button type="primary" class="filter-item" style="margin-left: 10px" :icon="icon" @click="showFilter">{{ text
    }}</el-button>
    <el-dialog v-dialogDrag :visible.sync="showWindow" title="高级搜索" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 600px; margin-left: 50px"
      >
        <el-form-item label="模糊搜索">
          <el-input v-model="temp.keyword" class="form-item" placeholder="请输入关键字：单据号、通知书号、案号、单位名称、操作员、承办人等信息" />
        </el-form-item>
        <!-- 收退款才有通知书号 -->
        <template v-if="temp.typeid < 300">
          <el-form-item label="通知书号">
            <el-input v-model="temp.noticenum" class="form-item" />
          </el-form-item>
        </template>
        <template v-if="temp.typeid < 300">
          <el-form-item :label="temp.typeid < 200 ? '缴款单位' : '领款单位'">
            <el-input v-model="temp.dwname" class="form-item" />
          </el-form-item>
        </template>

        <el-form-item
          :label="temp.typeid > 200 && temp.typeid < 300 ? '原单据号' : '单据编号'
          "
        >
          <el-input v-model="temp.billno" class="form-item" />
        </el-form-item>
        <!-- 银行没有银行流水号 -->
        <template v-if="temp.typeid < 300 && temp.typeid > 400">
          <el-form-item label="银行流水号">
            <el-input v-model="temp.banklsh" class="form-item" />
          </el-form-item>
        </template>
        <el-form-item label="制单日期">
          <el-select v-model="dateRange" style="width: 100px" placeholder="范围" @change="changeDateRange">
            <el-option
              v-for="(item, index) in basedata.dateRangeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-date-picker
            v-model="temp.starttime"
            type="date"
            placeholder="起始日期"
            style="width: 180px"
            value-format="yyyy-MM-dd"
          />
          ~
          <el-date-picker
            v-model="temp.endtime"
            type="date"
            placeholder="截止日期"
            style="width: 180px"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="入账时间">

          <el-date-picker
            v-model="temp.bankdate_start"
            type="date"
            placeholder="起始日期"
            style="width: 200px"
            value-format="yyyy-MM-dd"
          />
          ~
          <el-date-picker
            v-model="temp.bankdate_end"
            type="date"
            placeholder="截止日期"
            style="width: 200px"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="金　　额">
          <el-input v-model="temp.je_min" clearable placeholder="最小金额" style="width: 200px" class="filter-item" />~
          <el-input v-model="temp.je_max" clearable placeholder="最大金额" style="width: 200px" class="filter-item" />
        </el-form-item>
        <template v-if="temp.typeid < 200 || temp.typeid > 400">
          <el-form-item label="余　　额">
            <el-input v-model="temp.ye_min" clearable placeholder="最小余额" style="width: 200px" class="filter-item" />~
            <el-input v-model="temp.ye_max" clearable placeholder="最大余额" style="width: 200px" class="filter-item" />
          </el-form-item>
        </template>
        <!-- 只在收退款中 显示案号相关查询 -->
        <template v-if="temp.typeid < 300 && temp.typeid > 100">
          <el-form-item label="完整案号">
            <el-input v-model="temp.caseinfo" class="form-item" placeholder="支持模糊搜索案号" />
          </el-form-item>
          <el-form-item label="案件年号">
            <el-input v-model="temp.caseyear" class="form-item" style="width: 200px" />
            <span class="form-label">案件序号</span>
            <el-input v-model="temp.casenum" class="form-item" style="width: 200px" />
          </el-form-item>
          <el-form-item label="案件字号">
            <el-select v-model="temp.casetype" multiple class="form-item">
              <el-option
                v-for="item in basedata.casetypeList"
                :key="item.id"
                :label="item.casetypename"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="承办部门">
          <el-select v-model="temp.deptname" multiple class="form-item">
            <el-option
              v-for="item in basedata.deptList"
              :key="item.deptid"
              :label="item.deptname"
              :value="item.deptname"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收退方式">
          <el-select v-model="temp.accountid" multiple class="form-item">
            <el-option v-for="item in basedata.accountList" :key="item.id" :label="item.accountname" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人员">

          <el-select v-model="temp.username" multiple class="form-item">
            <el-option
              v-for="item in basedata.userList"
              :key="item.userid"
              :value="item.username"
              :label="item.username"
            />
          </el-select>
        </el-form-item>

        <template v-if="[301, 302, 303].indexOf(temp.typeid) > -1">
          <!-- 银行类筛选 -->

          <!-- 支票 增加账号全称 -->
          <el-form-item :label="temp.typeid == 303 ? '账户名称' : '收款人全称'">
            <el-input v-model="temp.dwname" class="form-item" placeholder="请输入账号名称" clearable />
          </el-form-item>

          <el-form-item v-if="temp.typeid != 303" label="汇款方全称">
            <el-input v-model="temp.myaccountname" class="form-item" placeholder="请输入账号名称" clearable />
          </el-form-item>

        </template>

        <el-form-item label="状　　态">
          <el-select v-model="temp.isvoid" class="form-item">
            <el-option v-for="item in basedata.voidStatusList" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="temp.typeid == 104 || temp.typeid == 110" label="入库状态">
          <el-select v-model="temp.fsstatus" class="form-item">
            <el-option
              v-for="item in basedata.fsstatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="clearFilter"> 清空条件 </el-button>
        <el-button @click="showWindow = false"> 取消 </el-button>
        <el-button type="primary" icon="el-icon-search" @click="doSearch">
          搜索
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
const voidStatusList = [
  { id: 1, label: '正常状态', value: '0' },
  { id: 2, label: '已作废单据', value: '1' },
  { id: 3, label: '所有状态', value: '' }
]

const fsstatusList = [
  { label: '全部', value: 0 },
  { label: '已入库', value: 1 },
  { label: '未入库', value: 2 }
]

export default {
  name: 'CaseFilter',
  props: {
    text: {
      type: String,
      default: '高级搜索'
    },
    icon: {
      type: String,
      default: 'el-icon-search'
    },
    typeid: {
      type: Number,
      default: 101
    },
    query: {
      type: Object,
      default: function() {
        return {
          keyword: undefined,
          isvoid: '0',
          typeid: 0,
          starttime: '',
          endtime: '',
          deptcode: [],
          deptname: [],

          dwname: '',

          username: [],
          accountid: [],
          caseyear: '',
          casetype: [],
          casenum: [],
          caseinfo: '',
          noticenum: '',
          bankdate_start: '',
          bankdate_end: '',
          je_min: '',
          je_max: '',
          ye_min: '',
          ye_max: ''
        }
      }
    }
  },
  data() {
    return {
      showWindow: false,
      fsstatusList: [],

      temp: {
        keyword: undefined,
        isvoid: '0',
        typeid: 0,
        starttime: '',
        endtime: '',
        dwname: '',
        deptcode: [],
        username: [],
        accountid: [],
        caseyear: '',
        casetype: [],
        casenum: '',
        noticenum: '',
        fsstatus: '',
        je_min: '',
        je_max: '',
        ye_min: '',
        ye_max: '',
        myaccountname: ''
      },
      dateRange: '',
      basedata: {
        deptList: [],
        userList: [],
        accountList: [],
        casetypeList: [],
        casetypeClassList: [],
        yearList: [],
        dateRangeList: [],
        fsstatusList: fsstatusList,
        voidStatusList: voidStatusList
      }
    }
  },
  computed: {},
  watch: {
    query(newval) {
      this.temp = newval
    }
  },
  mounted() {
    this.temp = this.query
    // this.getBasedata() // 改成显示时再使用
  },
  methods: {
    showFilter() {
      this.getBasedata()

      this.showWindow = true
    },
    clearFilter() {
      this.$confirm('您是否要清空所有搜索条件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clearFilter_action()
      })
    },
    /**
     * 清空搜索数据
     */
    clearFilter_action() {
      const field_str = [
        'keyword',
        'caseyear',
        'casenum',
        'noticenum',
        'billno',
        'je_min',
        'je_max',
        'ye_min',
        'ye_max',
        'starttime',
        'endtime',
        'dwname'
      ]
      const field_arr = [
        'deptcode',
        'username',
        'casetype',
        'accountid',
        'fsstatus'
      ]

      for (let i = 0; i < field_str.length; i++) {
        const f = field_str[i]
        this.temp[f] = ''
      }
      for (let i = 0; i < field_arr.length; i++) {
        const f = field_arr[i]
        this.temp[f] = []
      }
      // 设置isvoid
      this.temp['isvoid'] = '0'
      this.dateRange = ''
    },
    /**
     * 获取基础资料，如案件字号，部门，用户，收退款方式，案件类型 等
     *
     */
    async getBasedata() {
      // caseapi.base.getList('casetype').then((data) => {
      //   this.basedata.casetypeList = data.items
      // })
      // caseapi.base.getList('casetypeclass').then((data) => {
      //   this.basedata.casetypeClassList = data.items
      // })
      // caseapi.base.getList('deptlist').then((data) => {
      //   this.basedata.deptList = data
      // })
      // caseapi.base.getList('account').then((data) => {
      //   this.basedata.accountList = data.items
      // })
      caseapi.base
        .getBasedata(['casetype', 'casetypeclass', 'deptlist', 'account'])
        .then((res) => {
          this.basedata.casetypeList = res['casetype']
          this.basedata.casetypeClassList = res['casetypeclass']
          this.basedata.deptList = res['deptlist']
          this.basedata.accountList = res['account']
        })

      caseapi.base.getYearList().then((res) => {
        this.basedata.yearList = res
      })

      this.basedata.dateRangeList = caseapi.base.getDateRangeList()
      this.basedata.voidStatusList = caseapi.base.getVoidStatusList(
        this.temp.typeid
      )

      caseapi.base.getUserList().then((data) => {
        this.basedata.userList = data
      })
      // console.log(this.basedata)

      return true
    },

    changeDateRange() {
      // 调整日期范围
      const data = caseapi.base.getDateRange(this.dateRange)
      this.temp.starttime = data.starttime
      this.temp.endtime = data.endtime
    },
    doSearch() {
      this.showWindow = false
      this.$emit('doSearch', this.temp)
    }
  }
}
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
