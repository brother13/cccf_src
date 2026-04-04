<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" clearable placeholder="请输入查询关键字" style="width: 280px" class="filter-item"
        @keyup.enter.native="handleFilter">
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <!--      <el-select v-model="listQuery.cfsf" placeholder="首封状态" clearable style="width: 120px" class="filter-item"
        @change="handleFilter">
        <el-option label="所有" value />
        <el-option label="首封" value="首封" />
        <el-option label="轮候" value="轮候" />
      </el-select> -->

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <!-- <el-button class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-edit"
        @click="handleCreate">新增</el-button> -->
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>-->
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%"
      @sort-change="sortChange">
      <el-table-column type="index" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="案号"  prop="ah" align="center" />
      <el-table-column label="进账票号"  prop="djcode" align="center" type="width:40px" />
      <el-table-column label="到账日期"  prop="dzdate" align="center" />
      <el-table-column label="超期天数"  prop="cqts" align="center" />
      <el-table-column label="收款金额"  prop="sje" align="center" />
      <el-table-column label="退款金额"  prop="tje" align="center" />
      <el-table-column label="余额"  prop="ye" align="center" />
      <el-table-column label="承办人"  prop="cbr" align="center" />
    </el-table>
    <div style="margin-top: 8px; ">当前记录数 <el-tag>{{totalcount.cnum}}</el-tag> 笔，共计收款 <el-tag>{{totalcount.sje}}
      </el-tag> 元，退款 <el-tag type="danger">{{totalcount.tje}}</el-tag>
      元，余额 <el-tag>{{totalcount.ye}}</el-tag> 元</div>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />
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
  import md5 from 'js-md5'
  import {
    postdata,
    zxklist,
    cftype,
    getajjbxx,
    dxmsg
  } from '@/dagl/api/common'
  import {
    mapGetters
  } from 'vuex'

  import docxtemplater from "docxtemplater";
  import PizZip from "pizzip";
  import JSZipUtils from "jszip-utils";
  import {
    saveAs
  } from "file-saver";

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
        totalcount: {
          "cnum": "-",
          "sje": "-",
          "tje": "-",
          "ye": "-"
        },
        total: 0,
        listLoading: true,
        cfsf: [{
          "id": 1,
          "cfsf": "首封",
        }, {
          "id": 2,
          "cfsf": "轮候",
        }, ],
        listQuery: {
          page: 1,
          pagesize: 10,
          startdate: '',
          enddate: '',
          //enddate: parseTime(new Date().getTime() + 0*30 * 24 * 60 * 60 * 1000, '{y}-{m}-{d}'),
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
          zxklistid: undefined,
          cbr: this.$store.getters.name,
          cfsf: "首封",
          cfsfpro: "enddate",
          isvoid: 0,
          startdate: '',
          enddate: '',
          ahjc: '',
          ah: "",
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
          }],
          // mobile: [
          //   { required: true, message: '手机号码不能为空', trigger: 'change' }
          // ],
        }
      }
    },
    computed: {
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
      if(this.$route.query.ah!=undefined){//写入其他页面传递的案号参数
        this.listQuery.keyword=this.$route.query.ah
      }
      this.getBaseData()
      this.getList()
    },
    computed: {
      ...mapGetters([
        'sidebar',
        'name',
        'deptname',
        // 'avatar',
        'device'
      ])
    },
    methods: {
      handleCfsfChange() {
        if (this.temp.cfsf == "轮候") {
          this.temp.cfsfpro = ""
        } else {
          this.temp.cfsfpro = "enddate"
        }
      },
      addDaysToDate(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date;
      },
      addMonths(dateString, months) {
        if (dateString == null) return null;
        const date = new Date(dateString);
        date.setMonth(date.getMonth() + months);
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
      },
      handleahjcChange() {
        var _year = this.temp.ahjc.substring(0, 4)
        var _xuhao = this.temp.ahjc.substring(4, 20)
        //this.temp.ah = "（" + _year + "）辽0104执" + _xuhao + "号"
        var _tmpah=this.$store.state.user.ahmc.replace("{序号}",_xuhao)
        _tmpah=_tmpah.replace("{年份}",_year)
        this.temp.ah =_tmpah

      },
      handleDateChange() {
        var _this = this
        this.Cftype.forEach((item) => {
          if (item.typename == _this.temp.type) {
            var newdate = _this.addMonths(_this.temp.startdate, item.cfmounth‌)
            if (_this.temp.startdate == null) {
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
        //this.getLabelList()
        // this.getRoom()

        //this.getAllUser()
        //this.getBaseClass()
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
        zxklist({
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
        zxklist(this.listQuery).then((response) => {
          this.list = response.data.items
          this.total = response.data.total
          this.totalcount = response.data.totalcount

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
          zxklistid: undefined,
          cbr: this.$store.getters.name,
          cfsf: '首封',
          cfsfpro: "enddate",
          isvoid: 0,
          startdate: '',
          enddate: '',
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
            this.temp.zxklistid = 0



            const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
            newtemp.username = this.$store.getters.name

            /*            zxklistadd(newtemp).then((response) => {
                          const data = response
                          if (data.code === 20000) {
                            this.dialogFormVisible = false

                            this.$notify({
                              title: '操作成功',
                              message: data.message,
                              type: 'success',
                              duration: 2000
                            })
                            this.getList()
                          }
                        }) */
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
            zxklistid: this.temp.zxklistid
          }).then((res) => {
            this.$message(res.message)
          })
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj

        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.handleCfsfChange()


        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据


          if (valid) {
            /*            zxklistupdate(newtemp).then((response) => {
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
                            this.getList()
                          }
                        }) */
          }
        })
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
          /*          zxklistdel(row.zxklistid).then((response) => {
                      const data = response
                      if (data.code === 20000) {
                        this.$notify({
                          title: '操作完成',
                          message: data.message,
                          type: 'success',
                          duration: 2000
                        })
                        this.getList()
                      }
                    }) */
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
        let date = new Date(dateData);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? "" + m : m;
        let d = date.getDate();
        d = d < 10 ? "" + d : d;
        const time = y + "年" + m + "月" + d + "日";
        console.log(time)
        return time;
      },

      downLoadWord(detailData) {
        var tmp_pro = ""
        if (typeof detailData.ah != 'undefined') {
          tmp_pro = detailData.ah
        }
        var tmp = {}
        tmp.申请人 = this.checkworddata(detailData.sqzxr, "申请人")
        tmp.案号 = this.checkworddata(detailData.ah, "案号")
        tmp.被执行人 = this.checkworddata(detailData.bzxr, "被执行人")
        tmp.财产情况 = this.checkworddata(detailData.ccqk, "财产情况")
        tmp.开始日期 = this.checkwordrq(detailData.startdate, "开始日期")
        tmp.届满日期 = this.checkwordrq(detailData.enddate, "届满日期")
        tmp.当前日期 = this.checkwordrq(new Date(), "当前日期")

        getajjbxx(detailData.ah).then((response) => {
          const data = response
          if (data.code === 20000) {
            if (data.data != null) {
              tmp.立案案由 = this.checkworddata(data.data.laay, "立案案由")
              tmp.执行依据案号 = this.checkworddata(data.data.zxyjah, "执行依据案号")
              if (detailData.type === '房产' || detailData.type === '车辆' || detailData.type === '银行') {
                this.downLoadWord_one(tmp, "./assets/word/" + detailData.type + "协执文书.docx", tmp_pro + "协执文书.docx")
              } else if (detailData.type === '工资卡' || detailData.type === '支付宝' || detailData.type === '银行' ||
                detailData.type === '银行卡') {
                // 银行 工资卡 支付宝这3个汇总为银行的模板
                this.downLoadWord_one(tmp, "./assets/word/" + "银行协执文书.docx", tmp_pro + "协执文书.docx")
              } else {
                this.downLoadWord_one(tmp, "./assets/word/其他协执文书.docx", tmp_pro + "协执文书.docx")
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
            console.log(JSON.stringify(error.message));
            return;
          }
          let zip = new PizZip(content);
          let doc = new docxtemplater().loadZip(zip);
          // 设置模板变量的值
          doc.setData(detailData);
          try {
            // 用模板变量的值替换所有模板变量
            doc.render();
          } catch (error) {
            let e = {
              message: error.message,
              name: error.name,
              stack: error.stack,
              properties: error.properties,
            };
            console.log(
              JSON.stringify({
                error: e,
              })
            );
            throw error;
          }
          // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
          let out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          // 将目标文件对象保存为目标类型的文件，并命名
          saveAs(out, docxName);
        });

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
        return sort === `+${key}` ?
          'ascending' :
          sort === `-${key}` ?
          'descending' :
          ''
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

      test(column, prop, order){
        console.log(column)
        console.log(prop)
        console.log(order)
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
