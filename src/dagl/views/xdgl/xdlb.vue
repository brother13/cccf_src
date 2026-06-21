<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="被控制对象、案号"
        style="width: 230px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <span class="filter-item" style="color: #606266">上次控制时间：</span>
      <el-date-picker
        v-model="listQuery.startdate"
        label="上次控制时间"
        type="date"
        placeholder="起始时间"
        class="filter-item"
        style="width: 150px"
        value-format="yyyy-MM-dd"
        @change="handleFilter"
      />
      <el-date-picker
        v-model="listQuery.enddate"
        label="上次控制时间"
        type="date"
        placeholder="结束时间"
        class="filter-item"
        style="width: 150px"
        value-format="yyyy-MM-dd"
        @change="handleFilter"
      />
      <el-select
        v-model="listQuery.deptcode"
        placeholder="请选择部门"
        clearable
        style="width: 0px"
        multiple
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in DeptList"
          :key="item.deptid"
          :label="item.fullname"
          :value="item.deptid"
        >{{ item.deptname }}</el-option>
      </el-select>
      <el-select
        v-model="listQuery.zt"
        placeholder="冻结状态"
        clearable
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="所有" value />
        <el-option label="继续冻结成功" value="继续冻结成功" />
        <el-option label="发起继续冻结" value="发起继续冻结" />
        <el-option label="继续冻结失败" value="继续冻结失败" />
      </el-select>
      <!--
      <el-select v-model="listQuery.cfsf" placeholder="首封状态" clearable style="width: 120px" class="filter-item"
        @change="handleFilter">
        <el-option label="所有" value />
        <el-option label="首封" value="首封" />
        <el-option label="轮候" value="轮候" />
      </el-select> -->

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <span class="filter-item" style="color: #606266;margin-left: 10px"><el-switch
        v-model="listQuery.xkzjeflag"
        active-text="新控制金额"
        inactive-text=""
        @change="handleFilter"
      /></span>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column type="index" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="案号" align="center">
        <template slot-scope="{ row }">
          <el-link type="primary" @click="goToPage(row)">{{ row.ah }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="zt" align="center" />
      <el-table-column label="被控制对象" prop="bzxr" align="center" />
      <el-table-column label="续冻账号" prop="zhanghu" align="center" />
      <el-table-column label="控制金额" prop="je" align="center" />
      <el-table-column label="新控制金额" prop="newje" align="center" />
      <el-table-column label="反馈单位" prop="danwei" align="center" />
      <!-- <el-table-column label="上次控制时间" prop="lastdate" align="center" /> -->
      <el-table-column label="开始日期" prop="startdate" align="center" />
      <el-table-column label="届满日期" prop="enddate" align="center" />
      <el-table-column label="本次控制时间" prop="thisdate" align="center" />
      <el-table-column label="承办人" prop="cbr" align="center" />
      <el-table-column label="失败原因" prop="reason" align="center" />
      <!-- <el-table-column label="提起控制时间" prop="querytime" align="center" /> -->
      <!--      <el-table-column label="状态" class-name="status-col" style="width: 50px">
        <template slot-scope="{ row }">
          <el-tag :type="row.isvoid== '0' ? 'success' : 'danger'">{{
            row.isvoid == '0' ? '正常' : '停用'
          }}</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column min-width="220" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button v-if="row.zt === '继续冻结成功'" type="success" size="mini" icon="el-icon-refresh" @click="handleUpdateLedger(row)">
            {{ isLedgerUpdated(row) ? '已更新' : '更新到台账' }}
          </el-button>
          <el-dropdown split-button type="primary" size="mini" @click="handleUpdate(row)" @command="handleActionCommand($event, row)">
            编辑
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="delete" icon="el-icon-delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <el-dialog
      custom-class="saveAsDialog"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="130px"
        style=" margin-left: 50px; margin-right: 50px"
      >

        <el-form-item label="案号" prop="ah">
          <el-input v-model="temp.ah" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="temp.zt" />
        </el-form-item>
        <el-form-item label="被控制对象">
          <el-input v-model="temp.bzxr" />
        </el-form-item>
        <el-form-item label="账户">
          <el-input v-model="temp.zhanghu" />
        </el-form-item>
        <el-form-item label="控制金额" prop="je">
          <el-input v-model="temp.je" />
        </el-form-item>
        <el-form-item label="新控制金额">
          <el-input v-model="temp.newje" disabled />
        </el-form-item>

        <el-form-item label="反馈单位">
          <el-input v-model="temp.danwei" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="temp.startdate"
            label="开始日期"
            type="date"
            placeholder="开始日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="届满日期">
          <el-date-picker
            v-model="temp.enddate"
            label="届满日期"
            type="date"
            placeholder="届满日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="上次控制时间">
          <el-date-picker
            v-model="temp.lastdate"
            label="上次控制时间"
            type="datetime"
            placeholder="上次控制时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="本次控制时间">
          <el-date-picker
            v-model="temp.thisdate"
            label="本次控制时间"
            type="datetime"
            placeholder="本次控制时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="承办人">
          <el-input v-model="temp.cbr" />
        </el-form-item>
        <el-form-item label="失败原因">
          <el-input v-model="temp.reason" />
        </el-form-item>
        <!--        <el-form-item label="状态">
          <el-switch v-model="temp.isvoid" active-color="#13ce66" inactive-color="#ff4949" :inactive-value="1"
            :active-value="0" />
          <el-tag>{{ temp.isvoid == 0 ? '正常' : '停用' }}</el-tag>
        </el-form-item> -->

        <!--        <el-form-item label="备注">
          <el-input v-model="temp.note" :autosize="{ minRows: 4, maxRows: 6 }" type="textarea"
            placeholder="您可以填定用户备注" />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  DataList,
  LabelList
} from '@/dagl/api/data'

import waves from '@/directive/waves' // waves directive
import {
  parseTime
} from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {
  postdata,
  xdlist,
  cftype,
  getajjbxx,
  dxmsg,
  xdlistupdate,
  xdlisttotz,
  xdlistdel
} from '@/dagl/api/common'
import {
  mapGetters
} from 'vuex'

import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import JSZipUtils from 'jszip-utils'
import {
  saveAs
} from 'file-saver'

// const DeptList = [{ deptid: '', deptcode: '', deptname: '' }]

export default {
  name: 'UserTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      return status === '0' ? 'success' : 'danger'
    },
    joinstr(str) {
      if (typeof str === 'string') {
        str = str.split(',')
      }
      if (Array.isArray(str)) {
        return str.join(' / ')
      }
    }
  },

  data() {
    return {
      tableKey: 0,

      list: null,
      total: 0,
      listLoading: true,
      cfsf: [{
        'id': 1,
        'cfsf': '首封'
      }, {
        'id': 2,
        'cfsf': '轮候'
      }],
      listQuery: {
        page: 1,
        pagesize: 10,
        startdate: '',
        enddate: '',
        xkzjeflag: false,
        // enddate: parseTime(new Date().getTime() + 0*30 * 24 * 60 * 60 * 1000, '{y}-{m}-{d}'),
        keyword: undefined,
        deptcode: [],
        isvoid: '0'
      },
      thumbdata: {
        caseid: '',
        uploadtype: 'profile',
        filetype: 'avatar'
      },
      photodata: {
        caseid: '',
        uploadtype: 'profile',
        filetype: 'photo'
      },
      Cftype: [],

      DeptList: [],
      GroupList: [],
      labelList: [],
      allUserList: [],
      jobLevelList: [], // 领导级别
      jobAuthList: [], // 编制
      jobPostList: [], // 岗位
      genderList: [], // 性别
      zzmmList: [],

      temp: {
        xdlistid: undefined,
        cbr: this.$store.getters.name,
        cfsf: '首封',
        cfsfpro: 'enddate',
        isvoid: 0,
        startdate: '',
        enddate: '',
        ahjc: '',
        ah: ''
      },
      // roomList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑提醒',
        create: '新增提醒'
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      rules: {
        cbr: [{
          required: true,
          message: '办案人名称不能为空',
          trigger: 'change'
        }],
        ah: [{
          required: true,
          message: '案号不能为空',
          trigger: 'change'
        }],
        bzxr: [{
          required: true,
          message: '被申请人不能为空',
          trigger: 'change'
        }],
        enddate: [{
          required: true,
          message: '届满日期不能为空',
          trigger: 'change'
        }]
        // mobile: [
        //   { required: true, message: '手机号码不能为空', trigger: 'change' }
        // ],
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'deptname',
      // 'avatar',
      'device'
    ]),
    isvoid2: {
      get: function() {
        return (
          this.temp.isvoid === 0 ||
            this.temp.isvoid === undefined ||
            this.temp.isvoid === ''
        )
      },
      set: function(newvalue) {
        this.temp.isvoid = newvalue ? '0' : '1'
      }
    }
  },
  created() {
    this.getBaseData()
    if (this.$route.query.zt) {
      this.listQuery.zt = this.$route.query.zt
    }
    this.getList()
    if (this.$route.query.id > 0) {
      xdlist({
        page: 1,
        pagesize: 10000,
        id: this.$route.query.id
      }).then((response) => {
        const rows = response.data.items
        if (rows.length === 1) {
          const row = rows[0]
          row.isvoid = 0
          this.handleUpdate(row)
        } else {
          this.$message({
            message: '数据加载异常',
            type: 'erro'
          })
        }
      })
    }
  },
  methods: {
    /*      handleCfsfChange() {
              if (this.temp.cfsf == "轮候") {
                this.temp.cfsfpro = ""
              } else {
                this.temp.cfsfpro = "enddate"
              }
            }, */
    addDaysToDate(dateString, days) {
      const date = new Date(dateString)
      date.setDate(date.getDate() + days)
      return date
    },
    addMonths(dateString, months) {
      if (dateString == null) return null
      const date = new Date(dateString)
      date.setMonth(date.getMonth() + months)
      date.setDate(date.getDate() - 1)
      return date.toISOString().split('T')[0]
    },
    handleahjcChange() {
      var _year = this.temp.ahjc.substring(0, 4)
      var _xuhao = this.temp.ahjc.substring(4, 20)
      // this.temp.ah = "（" + _year + "）辽0104执" + _xuhao + "号"
      var _tmpah = this.$store.state.user.ahmc.replace('{序号}', _xuhao)
      _tmpah = _tmpah.replace('{年份}', _year)
      this.temp.ah = _tmpah
    },
    handleDateChange() {
      var _this = this
      this.Cftype.forEach((item) => {
        if (item.typename === _this.temp.type) {
          var newdate = _this.addMonths(_this.temp.startdate, item.cfmounth‌)
          if (_this.temp.startdate === null) {
            _this.temp.enddate = null
          } else {
            _this.temp.enddate = parseTime(newdate, '{y}-{m}-{d}')
          }
        }
      })
    },
    getBaseData() {
      cftype().then((response) => {
        this.Cftype = response.data
      })
      this.getDept()
      this.getGroupList()
      // this.getLabelList()
      // this.getRoom()

      // this.getAllUser()
      // this.getBaseClass()
      // this.getJobLevel()
      //       this.getJobPost()
      //       this.getJobAuth()
    },
    getBaseClass() {
      postdata('/class/all', {
        classtype: ['gender', 'jobauth', 'jobpost', 'joblevel', 'zzmm']
      }).then((res) => {
        const data = res.data
        this.jobAuthList = data['jobauth']
        this.jobPostList = data['jobpost']
        this.jobLevelList = data['joblevel']
        this.genderList = data['gender']
        this.zzmmList = data['zzmm']
      })
    },
    // getJobLevel() {
    //   postdata('/user/joblevel').then((res) => {
    //     this.jobLevelList = res.data
    //   })
    // },
    // getJobPost() {
    //   postdata('/user/jobpost').then((res) => {
    //     this.jobPostList = res.data
    //   })
    // },
    // getJobAuth() {
    //   postdata('/user/jobauth').then((res) => {
    //     this.jobAuthList = res.data
    //   })
    // },
    getLabelList() {
      LabelList().then((response) => {
        this.labelList = response.data
      })
    },
    getGroupList() {
      DataList({
        type: 'grouplist'
      }).then((response) => {
        this.GroupList = response.data.items
      })
    },
    getAllUser() {
      xdlist({
        page: 1,
        pagesize: 10000,
        myusername: this.$store.getters.name
      }).then((response) => {
        this.allUserList = response.data.items
      })
    },
    getDept() {
      // DataList({ type: 'deptlist' }).then((response) => {
      //   this.DeptList = response.data
      // })
      postdata('/dept/tree', {}).then((res) => {
        this.DeptList = res.data.list
      })
    },

    // getRoom() {
    //   postdata('/room/list', {}).then((res) => {
    //     const resdata = res.data
    //     this.roomList = resdata.items
    //   })
    // },
    getnewcode() {
      postdata('/user/newcode', {}).then((res) => {
        // console.log(res)
        this.temp.usercode = res.data
        console.log(res.data)
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.myusername = this.$store.getters.name
      xdlist(this.listQuery).then((response) => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    /*    handleModifyStatus(row, status) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            row.status = status
          }, */
    sortChange(data) {
      const {
        prop,
        order
      } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        xdlistid: undefined,
        cbr: this.$store.getters.name,
        cfsf: '首封',
        cfsfpro: 'enddate',
        isvoid: 0,
        startdate: '',
        enddate: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getnewcode()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.xdlistid = 0
          const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
          newtemp.username = this.$store.getters.name
        }
      })
    },
    resetPwd() {
      // 重置密码

      this.$confirm('您是否要重置用户密码？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((resp) => {
        postdata('/user/resetPwd', {
          xdlistid: this.temp.xdlistid
        }).then((res) => {
          this.$message(res.message)
        })
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // this.handleCfsfChange()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleActionCommand(command, row) {
      if (command === 'delete') {
        this.handleDelete(row)
      }
    },
    isLedgerUpdated(row) {
      return String(row.ledgerUpdated) === '1'
    },
    handleUpdateLedger(row) {
      this.$confirm('将按当前行案号和续冻账号更新台账日期；开始日期为空时只更新届满日期，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        xdlisttotz({
          xdlistid: row.xdlistid,
          ah: row.ah,
          zhanghu: row.zhanghu,
          startdate: row.startdate,
          enddate: row.enddate
        }).then((response) => {
          const data = response
          if (data.code === 20000) {
            this.$set(row, 'ledgerUpdated', 1)
            this.$notify({
              title: '操作完成',
              message: data.message,
              type: 'success',
              duration: 2000
            })
          } else {
            this.$message.error(data.message || '更新失败')
          }
        })
      })
    },
    doupdateData() {
      this.$refs['dataForm'].validate((valid) => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
        if (valid) {
          xdlistupdate(newtemp).then((response) => {
            // console.log(data);
            const data = response
            if (data.code === 20000) {
              this.dialogFormVisible = false

              this.$notify({
                title: '操作成功',
                message: data.message,
                type: 'success',
                duration: 2000
              })
              this.$router.push({
                path: '/xdgl/xdlb'
              })
              this.getList()
            }
          })
        }
      })
    },
    updateData() {
      if (this.temp.cbr !== this.$store.getters.name) {
        this.$confirm('此记录前承办人与登录用户不一致, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doupdateData()
        })
      } else {
        this.doupdateData()
      }
    },
    handleMessage(row) {
      // 删除数据
      // 判断是否要删除
      this.$confirm('此操作将该记录进行短信通知, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        dxmsg(row).then((response) => {
          const data = response
          if (data.code === 20000) {
            this.$notify({
              title: '操作完成',
              message: data.message,
              type: 'success',
              duration: 2000
            })
          }
        })
      })
    },
    handleDelete(row) {
      // 删除数据
      // 判断是否要删除
      this.$confirm('此操作将删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        xdlistdel(row.xdlistid).then((response) => {
          const data = response
          if (data.code === 20000) {
            this.$notify({
              title: '操作完成',
              message: data.data.message,
              type: 'success',
              duration: 2000
            })
            this.getList()
          }
        })
      })
    },
    checkworddata(value, name) {
      if (value != null) {
        return value
      } else {
        return name
      }
    },
    checkwordrq(dateData, name) {
      if (dateData == null) return name
      const date = new Date(dateData)
      const y = date.getFullYear()
      let m = date.getMonth() + 1
      m = m < 10 ? '' + m : m
      let d = date.getDate()
      d = d < 10 ? '' + d : d
      const time = y + '年' + m + '月' + d + '日'
      console.log(time)
      return time
    },

    downLoadWord(detailData) {
      var tmp_pro = ''
      if (typeof detailData.ah !== 'undefined') {
        tmp_pro = detailData.ah
      }
      var tmp = {}
      tmp.申请人 = this.checkworddata(detailData.sqzxr, '申请人')
      tmp.案号 = this.checkworddata(detailData.ah, '案号')
      tmp.被执行人 = this.checkworddata(detailData.bzxr, '被执行人')
      tmp.财产情况 = this.checkworddata(detailData.ccqk, '财产情况')
      tmp.开始日期 = this.checkwordrq(detailData.startdate, '开始日期')
      tmp.届满日期 = this.checkwordrq(detailData.enddate, '届满日期')
      tmp.当前日期 = this.checkwordrq(new Date(), '当前日期')

      getajjbxx(detailData.ah).then((response) => {
        const data = response
        if (data.code === 20000) {
          if (data.data != null) {
            tmp.立案案由 = this.checkworddata(data.data.laay, '立案案由')
            tmp.执行依据案号 = this.checkworddata(data.data.zxyjah, '执行依据案号')
            if (detailData.type === '房产' || detailData.type === '车辆' || detailData.type === '银行') {
              this.downLoadWord_one(tmp, './assets/word/' + detailData.type + '协执文书.docx', tmp_pro + '协执文书.docx')
            } else if (detailData.type === '工资卡' || detailData.type === '支付宝' || detailData.type === '银行' ||
                detailData.type === '银行卡') {
              // 银行 工资卡 支付宝这3个汇总为银行的模板
              this.downLoadWord_one(tmp, './assets/word/' + '银行协执文书.docx', tmp_pro + '协执文书.docx')
            } else {
              this.downLoadWord_one(tmp, './assets/word/其他协执文书.docx', tmp_pro + '协执文书.docx')
            }
          } else {
            this.$message.error('案号不匹配，请先修改为完整案号')
          }
        }
      })
    },
    downLoadWord_one(detailData, docxSrc, docxName) {
      // 读取并获得模板文件的二进制内容
      JSZipUtils.getBinaryContent(docxSrc, function(error, content) {
        if (error) {
          console.log(JSON.stringify(error.message))
          return
        }
        const zip = new PizZip(content)
        const doc = new Docxtemplater().loadZip(zip)
        // 设置模板变量的值
        doc.setData(detailData)
        try {
          // 用模板变量的值替换所有模板变量
          doc.render()
        } catch (error) {
          const e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties
          }
          console.log(
            JSON.stringify({
              error: e
            })
          )
          throw error
        }
        // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        // 将目标文件对象保存为目标类型的文件，并命名
        saveAs(out, docxName)
      })
    },

    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    },
    handleSuccess_thumb(res) {
      // 获取当前附件列表
      if (res.code === 20000) {
        const resdata = res.data
        const id = resdata[0].id
        const url = './index.php/dagl/file/getImage/id/' + id
        this.temp.avatar = url
      }
      // this.getUserinfo()
    },
    handleSuccess_photo(res) {
      // 获取当前附件列表
      if (res.code === 20000) {
        const resdata = res.data
        const id = resdata[0].id
        const url = './index.php/dagl/file/getImage/id/' + id
        this.temp.photo = url
      }
      // this.getUserinfo()
    },
    beforeThumbUpload(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$message.error('上传文件并非图片！') // 判断是否是图片
        return false
      }

      // 判断文件大小
      const filesize = file.size
      if (filesize > 1024 * 1024) {
        this.$message.error('大小不能超过1MB') // 判断是否是图片
        return false
      }
      return true
    },
    beforeThumbUpload_photo(file) {
      if (file.type.indexOf('image/') === -1) {
        this.$message.error('上传文件并非图片！') // 判断是否是图片
        return false
      }

      // 判断文件大小
      const filesize = file.size
      if (filesize > 1024 * 1024 * 4) {
        this.$message.error('大小不能超过4MB') // 判断是否是图片
        return false
      }
      return true
    },
    goToPage(row) {
      this.$router.push({ path: '/tz/txcl', query: { ah: row.ah }})
    }
  }

}
</script>
<style>
  .usersign {
    width: 160px;
    height: 120px;
  }

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }

  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }

  .saveAsDialog {
    min-width: 540px;
  }
</style>
