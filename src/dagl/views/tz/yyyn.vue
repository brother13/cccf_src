<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入关键字，姓名,案号"
        style="width: 230px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <span class="filter-item" style="color: #606266">届满日期：</span>
      <el-date-picker
        v-model="listQuery.enddate"
        label="届满日期"
        type="date"
        placeholder="截止日期"
        class="filter-item"
        style="width: 150px"
        value-format="yyyy-MM-dd"
        @change="handleFilter"
      />
      <el-select
        v-if="canFilterByDept"
        v-model="listQuery.deptcode"
        placeholder="请选择部门"
        clearable
        style="width: 220px"
        multiple
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in DeptList" :key="item.deptid" :label="item.fullname" :value="item.deptid">{{
          item.deptname }}</el-option>
      </el-select>
      <el-select
        v-model="listQuery.isvoid"
        placeholder="请选择状态"
        clearable
        style="width: 120px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="所有" value />
        <el-option label="正常" value="0" />
        <el-option label="停用" value="1" />
      </el-select>
      <el-select
        v-model="listQuery.cfsf"
        placeholder="首封状态"
        clearable
        style="width: 120px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="所有" value />
        <el-option label="首封" value="首封" />
        <el-option label="轮候" value="轮候" />
      </el-select>
      <el-button
        v-waves
        class="filter-item ledger-action-button ledger-action-button--query"
        icon="el-icon-search"
        @click="handleFilter"
      >查询结果</el-button>

      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item ledger-action-button ledger-action-button--export"
        icon="el-icon-download"
        @click="handleDownload"
      >
        导出报表
      </el-button>
      <el-button
        class="filter-item ledger-action-button ledger-action-button--create"
        icon="el-icon-plus"
        @click="handleCreate"
      >新增台账</el-button>
    </div>

    <div v-loading="listLoading" class="ledger-card-list">
      <el-empty v-if="!listLoading && (!list || list.length === 0)" description="暂无台账数据" />
      <template v-else>
        <div
          v-for="(caseItem, caseIndex) in list"
          :key="caseItem.case_key || caseIndex"
          class="case-card"
        >
          <div class="case-card__header" @click="toggleCase(caseItem.case_key)">
            <button class="case-card__toggle" type="button" @click.stop="toggleCase(caseItem.case_key)">
              <i :class="isCaseExpanded(caseItem) ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" />
            </button>
            <div class="case-card__main">
              <div class="case-card__title-row">
                <span class="case-card__index">{{ caseIndex + listQuery.pagesize * (listQuery.page - 1) + 1 }}</span>
                <span class="case-card__title">{{ caseItem.ah || '未录入案号' }}</span>
                <el-tag size="mini" type="info">{{ caseItem.item_count }} 条明细</el-tag>
                <el-tag size="mini" :type="caseStatus(caseItem).type">{{ caseStatus(caseItem).text }}</el-tag>
              </div>
              <div class="case-card__meta">
                <span>办案人：{{ caseItem.cbr || '-' }}</span>
                <span>申请人：{{ caseItem.sqzxr || '-' }}</span>
                <span>被执行人：{{ caseItem.bzxr || '-' }}</span>
                <span>最早届满：{{ formatShortDate(caseItem.min_enddate) }}</span>
              </div>
            </div>
          </div>

          <transition name="ledger-expand">
            <div v-show="isCaseExpanded(caseItem)" class="case-card__details">
              <div
                v-for="row in caseItem.children"
                :key="row.cflistid"
                class="property-row"
              >
                <span class="property-row__dot" />
                <div :class="['property-icon', propertyTypeClass(row.type)]">
                  <i :class="propertyIcon(row.type)" />
                </div>
                <div class="property-row__content">
                  <div class="property-row__top">
                    <div class="property-row__name">
                      <span class="property-row__type">{{ row.type || '其他财产' }}</span>
                      <el-tag size="mini" :type="rowStatus(row).type">{{ rowStatus(row).text }}</el-tag>
                      <el-tag v-if="row.cfsf" size="mini" effect="plain">{{ row.cfsf }}</el-tag>
                    </div>
                    <div class="property-row__limit" :class="remainingClass(row)">
                      {{ remainingText(row) }}
                    </div>
                  </div>
                  <div class="property-row__desc">
                    <span v-if="row.ccqk && row.ccqk.length > 80">
                      <span v-if="!expandedRows[row.cflistid]">{{ row.ccqk.substring(0, 80) }}...</span>
                      <span v-else>{{ row.ccqk }}</span>
                      <el-button type="text" size="mini" @click.stop="toggleExpand(row.cflistid)">
                        {{ expandedRows[row.cflistid] ? '收起' : '更多' }}
                      </el-button>
                    </span>
                    <span v-else>{{ row.ccqk || '暂无财产情况' }}</span>
                  </div>
                  <div v-if="row.note" class="property-row__note">
                    <i class="el-icon-chat-line-square" />
                    <span>备注：{{ row.note }}</span>
                  </div>
                  <div class="property-row__meta">
                    <span><i class="el-icon-date" /> {{ formatDateRange(row) }}</span>
                    <span v-if="row.account"><i class="el-icon-bank-card" /> {{ row.account }}</span>
                    <span v-if="row.sjdjje"><i class="el-icon-money" /> 冻结金额：{{ formatMoney(row.sjdjje) }}</span>
                    <span v-if="row.ycbr"><i class="el-icon-user" /> 原承办人：{{ row.ycbr }}</span>
                  </div>
                </div>
                <div class="property-row__actions">
                  <el-dropdown split-button type="primary" size="mini" @click.stop="handleUpdate(row)">
                    <i class="el-icon-edit" />{{ canEdit(row) ? '编辑' : '查看' }}
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item icon="el-icon-edit" @click.native="handleUpdate(row)">{{ canEdit(row) ? '编辑' : '查看' }}</el-dropdown-item>
                      <el-dropdown-item v-if="canEdit(row)" icon="el-icon-delete" @click.native="handleDelete(row)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>

                  <el-dropdown
                    split-button
                    type="warning"
                    size="mini"
                    @click.stop="downLoadWord(row)"
                  >
                    <i class="el-icon-download" />文书
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item icon="el-icon-download" @click.native="downLoadWord(row)">协执文书</el-dropdown-item>
                      <el-dropdown-item
                        v-for="item in templateList"
                        :key="item.file || item.label"
                        :icon="item.icon ? item.icon : 'el-icon-download'"
                        @click.native="handleDownOtherDocx(row, item)"
                      >{{ item.label }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </template>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <el-dialog
      custom-class="saveAsDialog ledger-entry-dialog"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      width="900px"
      top="5vh"
    >
      <div slot="title" class="ledger-dialog-title">
        <div class="ledger-dialog-title__icon">
          <i class="el-icon-document-add" />
        </div>
        <div>
          <div class="ledger-dialog-title__text">{{ textMap[dialogStatus] }}</div>
          <div class="ledger-dialog-title__subtext">按案情、当事人、财产与说明分区登记台账信息</div>
        </div>
      </div>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="top"
        class="ledger-entry-form"
      >
        <section class="ledger-form-section">
          <div class="ledger-form-section__title">
            <span />
            <strong>基础案情信息</strong>
          </div>
          <el-row :gutter="20">
            <el-col :sm="12" :xs="24">
              <el-form-item label="办案人" prop="cbr">
                <el-input v-model="temp.cbr" placeholder="请输入办案人姓名" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="执保案号">
                <el-input v-model="temp.zbah" placeholder="请输入相关执保案号" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="案号录入">
                <el-input v-model="temp.ahjc" placeholder="输入年份和序号自动生成案号" @input="handleahjcChange()">
                  <i slot="prefix" class="el-input__icon el-icon-edit-outline" />
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="案号" prop="ah">
                <el-input v-model="temp.ah" class="ledger-case-number-input" placeholder="请输入或自动生成案号" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="ledger-form-section">
          <div class="ledger-form-section__title">
            <span />
            <strong>相关当事人</strong>
          </div>
          <el-row :gutter="20">
            <el-col :sm="12" :xs="24">
              <el-form-item label="申请人" prop="sqzxr">
                <el-input v-model="temp.sqzxr" placeholder="请输入申请人全称" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="被执行人" prop="bzxr">
                <el-input v-model="temp.bzxr" placeholder="请输入被执行人全称" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="ledger-form-section">
          <div class="ledger-form-section__title">
            <span />
            <strong>时间与财产配置</strong>
          </div>
          <el-row :gutter="20">
            <el-col :sm="12" :xs="24">
              <el-form-item label="财产类型" prop="type">
                <el-select v-model="temp.type" style="width: 100%" placeholder="请选择财产类型" clearable @change="handleDateChange()">
                  <el-option v-for="item in Cftype" :key="item.id" :label="item.typename" :value="item.typename">{{
                    item.typename }}</el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="首封状态" prop="cfsf">
                <el-select v-model="temp.cfsf" style="width: 100%" placeholder="请选择" clearable @change="handleCfsfChange()">
                  <el-option v-for="item in cfsf" :key="item.id" :label="item.cfsf" :value="item.cfsf">{{ item.cfsf }}</el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div v-show="isBankProperty" class="ledger-bank-fields">
            <div class="ledger-bank-fields__tip">
              <i class="el-icon-info" />
              银行账户资产明细
            </div>
            <el-row :gutter="20">
              <el-col :sm="12" :xs="24">
                <el-form-item label="冻结账号">
                  <el-input v-model="temp.account" placeholder="请输入完整账号" />
                </el-form-item>
              </el-col>
              <el-col :sm="12" :xs="24">
                <el-form-item label="冻结金额">
                  <el-input v-model="temp.sjdjje" placeholder="0.00" type="number">
                    <template slot="prepend">¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :xs="24">
                <el-form-item label="扣划金额">
                  <el-input v-model="temp.sjkhje" placeholder="0.00" type="number" @input="handleKhljje()">
                    <template slot="prepend">¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :xs="24">
                <el-form-item label="扣划累计">
                  <el-input v-model="temp.khljje" placeholder="0.00" type="number" disabled>
                    <template slot="prepend">¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-row :gutter="20">
            <el-col :sm="12" :xs="24">
              <el-form-item label="开始日期" prop="startdate">
                <el-date-picker
                  v-model="temp.startdate"
                  type="date"
                  placeholder="开始日期"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                  @change="handleDateChange()"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="届满日期" :prop="temp.cfsfpro">
                <el-date-picker
                  v-model="temp.enddate"
                  type="date"
                  placeholder="届满日期"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :sm="12" :xs="24">
              <el-form-item label="原承办人">
                <el-input v-model="temp.ycbr" placeholder="请输入原承办人" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="控制类型">
                <el-select v-model="temp.leixing" style="width: 100%" placeholder="请选择" clearable>
                  <el-option v-for="item in Leixing" :key="item.id" :label="item.name" :value="item.name">{{ item.name }}</el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="ledger-switch-grid">
            <div class="ledger-switch-card">
              <div>
                <strong>自动续封</strong>
                <p>开启后保留自动续封标记</p>
              </div>
              <div>
                <el-switch v-model="temp.autocf" active-color="#2563eb" :active-value="1" :inactive-value="0" />
                <el-tag size="mini" :type="temp.autocf == 1 ? 'success' : 'info'">{{ temp.autocf == 1 ? '开启' : '关闭' }}</el-tag>
              </div>
            </div>
            <div class="ledger-switch-card">
              <div>
                <strong>当前状态</strong>
                <p>关闭后该台账记录显示为停用</p>
              </div>
              <div>
                <el-switch v-model="temp.isvoid" active-color="#10b981" inactive-color="#ff4949" :inactive-value="1" :active-value="0" />
                <el-tag size="mini" :type="temp.isvoid == 0 ? 'success' : 'danger'">{{ temp.isvoid == 0 ? '正常' : '停用' }}</el-tag>
              </div>
            </div>
          </div>
        </section>

        <section class="ledger-form-section">
          <div class="ledger-form-section__title">
            <span />
            <strong>补充说明</strong>
          </div>
          <el-form-item label="财产情况" prop="status">
            <el-input v-model="temp.ccqk" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" placeholder="请填写财产现状、执行线索等具体信息" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="temp.note" :autosize="{ minRows: 2, maxRows: 5 }" type="textarea" placeholder="请输入备注" />
          </el-form-item>
          <el-form-item v-if="filelistshow" label="回执上传" class="ledger-upload-field">
            <el-upload
              :action="uploadurl"
              list-type="picture-card"
              :on-remove="handleRemove"
              accept="image/*,.pdf,.doc,.docx"
              :on-success="handleFileSuccess"
              :on-error="handleFileError"
              :data="temp"
              :before-upload="handleFileUpload"
              :file-list="fileList"
            >
              <i slot="default" class="el-icon-plus" />
              <div slot="file" slot-scope="{file}">
                <embed v-if="isPdfFile(file)" :src="file.url" width="100%">
                <img v-else class="el-upload-list__item-thumbnail" :src="file.url" :alt="file.filename">
                <span class="el-upload-list__item-actions">
                  <span v-if="isPreFile(file)" class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                    <i class="el-icon-zoom-in" />
                  </span>
                  <span v-if="!disabled " class="el-upload-list__item-delete" @click="handleDownloadimg(file)">
                    <i class="el-icon-download" />
                  </span>
                  <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
                    <i class="el-icon-delete" />
                  </span>
                </span>
              </div>
            </el-upload>
          </el-form-item>
        </section>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="ledger-dialog-cancel" @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus === 'create' || canEdit(temp)" class="ledger-dialog-save" type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">{{ dialogStatus === 'create' ? '确认登记' : '保存修改' }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="imgdialogVisible">
      <embed v-if="prvpdf" :src="dialogImageUrl" width="100%" height="600px">
      <img v-else width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  DataList,
  LabelList
} from '@/dagl/api/data'
import caseapi from '@/courtcase/api'

import waves from '@/directive/waves' // waves directive
import {
  parseTime
} from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {
  postdata,
  cflist,
  cflistGrouped,
  cflistadd,
  cflistdel,
  cflistupdate,
  cftype,
  getajjbxx,
  dxmsg,
  uploadfile,
  getuploadfile,
  deluploadfile
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
      dialogImageUrl: '',
      disabled: false,
      imgdialogVisible: false,
      prvpdf: false,
      editcflistid: '',
      fileList: [],
      filelistshow: false,
      tableKey: 0,
      expandedCases: {},
      expandedRows: {}, // 记录展开状态的财产情况
      uploadurl: '/cccf/index.php/cccf/index/upload',

      list: null,
      alllist: null,
      total: 0,
      listLoading: true,
      cfsf: [{
        'id': 1,
        'cfsf': '首封'
      }, {
        'id': 2,
        'cfsf': '轮候'
      }],
      Leixing: [{
        'name': '点对点',
        'id': 1
      },
      {
        'name': '总对总',
        'id': 2
      }
      ],
      listQuery: {
        page: 1,
        pagesize: 10,
        startdate: '',
        enddate: '',
        // enddate: parseTime(new Date().getTime() + 30 * 24 * 60 * 60 * 1000, '{y}-{m}-{d}'),
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
        cflistid: undefined,
        cbr: this.$store.getters.name,
        cfsf: '首封',
        cfsfpro: 'enddate',
        isvoid: 0,
        autocf: 0,
        leixing: '总对总',
        startdate: '',
        enddate: '',
        ahjc: '',
        ah: ''
      },
      // roomList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '查看台账信息',
        create: '新增台账登记'
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
          message: '被执行人不能为空',
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

      },
      templateList: []// 文书模板列表

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
    },
    canFilterByDept() {
      const roles = this.$store.getters.roles || []
      return this.name === 'Admin' || roles.includes('admin')
    },
    isBankProperty() {
      const type = this.temp.type || ''
      const hiddenTypes = ['房产', '股权', '车辆', '其他']
      if (hiddenTypes.some((item) => type.indexOf(item) !== -1)) {
        return false
      }
      return type.indexOf('银行') !== -1 || type.indexOf('存款') !== -1 || type.indexOf('账户') !== -1 || type.indexOf('支付宝') !== -1
    },
    ...mapGetters([
      'sidebar',
      'name',
      'deptname',
      // 'avatar',
      'device'
    ])
  },
  created() {
    if (this.$route.query.ah !== undefined) { // 写入其他页面传递的案号参数
      this.listQuery.keyword = this.$route.query.ah
    }
    if (process.env.NODE_ENV === 'development') {
      this.uploadurl = '/cccf/index.php/cccf/index/upload'
      console.log(process.env.NODE_ENV)
      console.log(process.env.VUE_APP_BASE_RUL)
    }
    var leixing = this.$route.meta.title
    if (leixing === '1周以内到期') {
      this.listQuery.enddate = parseTime(new Date().getTime() + 7 * 24 * 60 * 60 * 1000, '{y}-{m}-{d}')
    } else if (leixing === '1月以内到期') {
      this.listQuery.enddate = this.addMonths(new Date(), 1, 0)
    } else if (leixing === '2月以内到期') {
      this.listQuery.enddate = this.addMonths(new Date(), 2, 0)
    }

    this.getBaseData()
    this.getList()
  },
  methods: {
    // 切换财产情况展开/收起
    toggleExpand(cflistid) {
      this.$set(this.expandedRows, cflistid, !this.expandedRows[cflistid])
    },
    toggleCase(caseKey) {
      this.$set(this.expandedCases, caseKey, !this.expandedCases[caseKey])
    },
    isCaseExpanded(caseItem) {
      return this.expandedCases[caseItem.case_key] !== false
    },
    initExpandedCases(items) {
      items.forEach((item) => {
        if (typeof this.expandedCases[item.case_key] === 'undefined') {
          this.$set(this.expandedCases, item.case_key, true)
        }
      })
    },
    propertyIcon(type) {
      if (type && type.indexOf('房') !== -1) return 'el-icon-office-building'
      if (type && type.indexOf('车') !== -1) return 'el-icon-truck'
      if (type && (type.indexOf('银行') !== -1 || type.indexOf('卡') !== -1 || type.indexOf('账户') !== -1 || type.indexOf('支付宝') !== -1)) return 'el-icon-bank-card'
      if (type && type.indexOf('股') !== -1) return 'el-icon-suitcase'
      return 'el-icon-box'
    },
    propertyTypeClass(type) {
      if (type && type.indexOf('房') !== -1) return 'property-icon--house'
      if (type && type.indexOf('车') !== -1) return 'property-icon--car'
      if (type && (type.indexOf('银行') !== -1 || type.indexOf('卡') !== -1 || type.indexOf('账户') !== -1 || type.indexOf('支付宝') !== -1)) return 'property-icon--bank'
      if (type && type.indexOf('股') !== -1) return 'property-icon--stock'
      return 'property-icon--other'
    },
    parseDateOnly(value) {
      if (!value) return null
      const date = new Date(String(value).replace(/-/g, '/'))
      if (isNaN(date.getTime())) return null
      date.setHours(0, 0, 0, 0)
      return date
    },
    remainingDays(row) {
      const end = this.parseDateOnly(row.enddate)
      if (!end) return null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return Math.ceil((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    },
    rowStatus(row) {
      if (String(row.isvoid) === '1') {
        return { text: '已停用', type: 'info' }
      }
      const days = this.remainingDays(row)
      if (days !== null && days < 0) {
        return { text: '已到期', type: 'danger' }
      }
      if (days !== null && days <= 30) {
        return { text: '即将到期', type: 'warning' }
      }
      return { text: '冻结中', type: 'success' }
    },
    caseStatus(caseItem) {
      const rows = caseItem.children || []
      const hasDanger = rows.some((row) => this.rowStatus(row).type === 'danger')
      const hasWarning = rows.some((row) => this.rowStatus(row).type === 'warning')
      const hasActive = rows.some((row) => String(row.isvoid) !== '1')
      if (hasDanger) return { text: '存在到期', type: 'danger' }
      if (hasWarning) return { text: '即将到期', type: 'warning' }
      if (!hasActive) return { text: '已停用', type: 'info' }
      return { text: '冻结中', type: 'success' }
    },
    remainingText(row) {
      const days = this.remainingDays(row)
      if (days === null) return '未设置届满日期'
      if (days < 0) return '已到期 ' + Math.abs(days) + ' 天'
      return '剩余 ' + days + ' 天'
    },
    remainingClass(row) {
      const status = this.rowStatus(row)
      return 'property-row__limit--' + status.type
    },
    formatShortDate(value) {
      if (!value) return '-'
      return String(value).substring(0, 10)
    },
    formatDateRange(row) {
      return this.formatShortDate(row.startdate) + ' 至 ' + this.formatShortDate(row.enddate)
    },
    formatMoney(value) {
      const num = parseFloat(value)
      if (isNaN(num)) return value
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    handleKhljje() {
      if (parseFloat(this.temp.sjkhje) >= 0 && parseFloat(this.temp.khljjebck) >= 0) {
        this.temp.khljje = (parseFloat(this.temp.khljjebck) + parseFloat(this.temp.sjkhje)).toFixed(2)
      } else {
        this.temp.khljje = this.temp.khljjebck
      }
    },
    submitUpload() {
      console.log('submit')
      this.$refs.upload.submit()
    },
    handleRemove(file) {
      this.$confirm('数据删除之后将不能恢复，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fileList.pop(file)
        deluploadfile(file).then((response) => {
          this.fileList = response.data
          console.log(response)
        })
      })
      console.log(file)
    },
    handlePictureCardPreview(file) {
      if (this.isPdfFile(file) === true) {
        this.prvpdf = true
      } else {
        this.prvpdf = false
      }
      this.imgdialogVisible = true
      this.dialogImageUrl = file.url
    },
    handleDownloadimg(file) {
      console.log(file)
      const eleLink = document.createElement('a')
      eleLink.download = file.filename
      console.log(file.url)
      eleLink.href = file.url
      document.body.appendChild(eleLink)
      eleLink.click()
      eleLink.remove()
    },
    isPdfFile(file) {
      if (!file.url && !file.name) return false
      const pdfRegex = /\.pdf$/i
      return (
        (file.url && pdfRegex.test(file.url)) ||
        (file.name && pdfRegex.test(file.name))
      )
    },
    isPreFile(file) {
      if (!file.url && !file.name) return false
      const preRegex = /\.(pdf|jpeg|jpg|gif|png|bmp|svg)$/i
      return (
        (file.url && preRegex.test(file.url)) ||
        (file.name && preRegex.test(file.name))
      )
    },

    // 上传成功
    handleFileSuccess(ret, file, fileList) {
      uploadfile(ret).then((response) => {
        this.$message({
          message: '上传成功',
          type: 'success'
        })
        this.getuploadfile()
      })
    },
    // 上传失败
    handleFileError(ret, file, fileList) {
      this.$message({
        message: '上传失败',
        type: 'warning'
      })
    },
    // 文件上传之前
    handleFileUpload(file) {
      // 检查文件名是否已存在
      // console.log(this.fileList);

    },

    getuploadfile() {
      this.filelistshow = false
      this.fileList = null
      getuploadfile(this.temp).then((response) => {
        this.fileList = response.data
        this.filelistshow = true
        // setTimeout(() => {
        //   this.filelistshow = true;
        // }, 5 * 100)

        // console.log("getuploadfileresponse")
        // console.log(response)
      })
    },

    handleCfsfChange() {
      if (this.temp.cfsf === '轮候') {
        this.temp.cfsfpro = ''
      } else {
        this.temp.cfsfpro = 'enddate'
      }
    },
    addDaysToDate(dateString, days) {
      const date = new Date(dateString)
      date.setDate(date.getDate() + days)
      return date
    },
    addMonths(dateString, months, days) {
      if (dateString === null) return null
      const date = new Date(dateString)
      date.setMonth(date.getMonth() + months)
      if (days === undefined) days = 1
      date.setDate(date.getDate() - days)
      return date.toISOString().split('T')[0]
    },
    handleahjcChange() {
      var _year = this.temp.ahjc.substring(0, 4)
      var _xuhao = this.temp.ahjc.substring(4, 20)
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
      if (this.canFilterByDept) {
        this.getDept()
      }
      this.getGroupList()

      const doctype = 'txcl'
      caseapi.tz.getDocTemplateList(doctype).then((res) => {
        this.templateList = res
      })
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
      cflist({
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
      if (!this.canFilterByDept) {
        this.listQuery.deptcode = []
      }
      cflistGrouped(this.listQuery).then((response) => {
        this.list = response.data.items || []
        this.alllist = response.data.allitems || []
        this.total = response.data.total || 0
        this.initExpandedCases(this.list)

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
        cflistid: undefined,
        cbr: this.$store.getters.name,
        cfsf: '首封',
        cfsfpro: 'enddate',
        isvoid: 0,
        autocf: 0,
        leixing: '总对总',
        startdate: '',
        enddate: '',
        sjkhje: 0,
        khljje: 0,
        khljjebck: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.filelistshow = false
      this.dialogFormVisible = true
      this.getnewcode()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.cflistid = 0

          const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据
          newtemp.username = this.$store.getters.name

          cflistadd(newtemp).then((response) => {
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
          })
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
          cflistid: this.temp.cflistid
        }).then((res) => {
          this.$message(res.message)
        })
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // 补全扣划累计备份字段，用于编辑时实时计算扣划累计
      this.temp.khljjebck = (parseFloat(this.temp.khljje || 0) - parseFloat(this.temp.sjkhje || 0)).toFixed(2)
      this.filelistshow = false
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      this.handleCfsfChange()

      this.getuploadfile()

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        const newtemp = Object.assign({}, this.temp) // 复制一个新组件出来，避免修改数据

        if (valid) {
          cflistupdate(newtemp).then((response) => {
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
          })
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
        cflistdel(row.cflistid).then((response) => {
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
      tmp.立案案由 = '《立案案由》'
      tmp.执行依据案号 = '《执行依据案号》'

      getajjbxx(detailData.ah).then((response) => {
        const data = response
        if (data.code === 20000) {
          if (data.data != null) {
            tmp.立案案由 = this.checkworddata(data.data.laay, '立案案由')
            tmp.执行依据案号 = this.checkworddata(data.data.zxyjah, '执行依据案号')
          } else {
            this.$message({
              message: '案号不匹配',
              type: 'warning'
            })
          }

          if (detailData.type === '房产' || detailData.type === '车辆' || detailData.type === '银行') {
            this.downLoadWord_one(tmp, './assets/word/' + detailData.type + '协执文书.docx', tmp_pro + '协执文书.docx')
          } else if (detailData.type === '工资卡' || detailData.type === '支付宝' || detailData.type === '银行' ||
            detailData.type === '银行卡') {
            // 银行 工资卡 支付宝这3个汇总为银行的模板
            this.downLoadWord_one(tmp, './assets/word/' + '银行协执文书.docx', tmp_pro + '协执文书.docx')
          } else {
            this.downLoadWord_one(tmp, './assets/word/其他协执文书.docx', tmp_pro + '协执文书.docx')
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
        const tHeader = ['办案人', '案号', '申请人', '被申请人', '财产类型', '首封状态', '开始日期', '届满日期', '财产情况', '备注', '原承办人', '状态']
        const filterVal = ['cbr', 'ah', 'sqzxr', 'bzxr', 'type', 'cfsf', 'startdate', 'enddate', 'ccqk', 'note',
          'ycbr', 'isvoid'
        ]
        const data = this.formatJson(filterVal, this.alllist)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '导出台账' + parseTime(new Date(), '{y}{m}{d}{h}{i}{s}'),
          autoWidth: false
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === 'isvoid') {
            return String(v[j]) === '0' ? '正常' : '停用'
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

    // 下载指定 文件内容

    async handleDownOtherDocx(detailData, item) {
      const file = item.file
      const fileurl = './assets/word/' + file

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
      tmp.立案案由 = '《立案案由》'
      tmp.执行依据案号 = '《执行依据案号》'
      const data = await getajjbxx(detailData.ah)
      if (data.code === 20000) {
        if (data.data != null) {
          tmp.立案案由 = this.checkworddata(data.data.laay, '立案案由')
          tmp.执行依据案号 = this.checkworddata(data.data.zxyjah, '执行依据案号')
        } else {
          this.$message({
            message: '案号不匹配',
            type: 'warning'
          })
        }
        this.downLoadWord_one(tmp, fileurl, tmp_pro + file)
      }
    },

    canEdit(row) {
      const cbr = row.cbr
      const roles = this.$store.state.user.roles
      const username = this.$store.state.user.name

      const rule = 'CFTZ_EDIT_OTHER'

      if (roles && roles.includes(rule)) {
        return true
      }
      if (cbr === username) {
        return true
      }
      return false
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

.ledger-entry-dialog {
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
}

.ledger-entry-dialog .el-dialog__header {
  padding: 0;
  border-bottom: 1px solid #eef2f7;
}

.ledger-entry-dialog .el-dialog__headerbtn {
  top: 24px;
  right: 24px;
}

.ledger-entry-dialog .el-dialog__body {
  max-height: calc(90vh - 152px);
  padding: 0;
  overflow-y: auto;
  background: #fff;
}

.ledger-entry-dialog .el-dialog__footer {
  padding: 18px 28px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.ledger-dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 30px;
}

.ledger-dialog-title__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #2563eb;
  background: #eff6ff;
  font-size: 22px;
}

.ledger-dialog-title__text {
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.ledger-dialog-title__subtext {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
}

.ledger-entry-form {
  padding: 28px 30px 8px;
}

.ledger-entry-form .el-form-item {
  margin-bottom: 18px;
}

.ledger-entry-form .el-form-item__label {
  padding-bottom: 5px;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.ledger-entry-form .el-input__inner,
.ledger-entry-form .el-textarea__inner {
  border-color: #dbe3ee;
  border-radius: 8px;
  color: #1f2937;
  background: #fff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.ledger-entry-form .el-input__inner:focus,
.ledger-entry-form .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.ledger-entry-form .el-input-group__prepend {
  border-color: #dbe3ee;
  border-radius: 8px 0 0 8px;
  color: #64748b;
  background: #f8fafc;
}

.ledger-case-number-input .el-input__inner {
  font-family: Consolas, Monaco, "Courier New", monospace;
}

.ledger-form-section {
  margin-bottom: 26px;
}

.ledger-form-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.ledger-form-section__title span {
  width: 4px;
  height: 20px;
  border-radius: 99px;
  background: #2563eb;
}

.ledger-form-section__title strong {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

.ledger-bank-fields {
  margin: 2px 0 22px;
  padding: 18px 18px 0;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #eff6ff;
}

.ledger-bank-fields__tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.ledger-switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 6px;
  padding-top: 22px;
  border-top: 1px solid #eef2f7;
}

.ledger-switch-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.ledger-switch-card strong {
  display: block;
  color: #374151;
  font-size: 14px;
  line-height: 1.4;
}

.ledger-switch-card p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.ledger-switch-card .el-tag {
  margin-left: 8px;
}

.ledger-upload-field .el-upload--picture-card,
.ledger-upload-field .el-upload-list__item {
  width: 92px;
  height: 92px;
  line-height: 92px;
  border-radius: 10px;
}

.ledger-dialog-cancel {
  min-width: 92px;
  border-color: #dbe3ee;
  border-radius: 8px;
  color: #64748b;
  background: #fff;
}

.ledger-dialog-save {
  min-width: 116px;
  border-color: #2563eb;
  border-radius: 8px;
  background: #2563eb;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
}

.ledger-dialog-save:hover,
.ledger-dialog-save:focus {
  border-color: #1d4ed8;
  background: #1d4ed8;
}

.ledger-action-button {
  min-width: 132px;
  height: 44px;
  margin-left: 12px;
  padding: 0 24px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
  transition: all 0.2s ease;
}

.ledger-action-button i {
  font-size: 18px;
  font-weight: 700;
}

.ledger-action-button--query,
.ledger-action-button--query:focus {
  color: #1d5fff;
  border-color: #d5e6ff;
  background: #edf6ff;
}

.ledger-action-button--query:hover {
  color: #1553e8;
  border-color: #bcd8ff;
  background: #e4f1ff;
}

.ledger-action-button--export,
.ledger-action-button--export:focus {
  color: #1f2d3d;
  border-color: #dce4f0;
  background: #fff;
}

.ledger-action-button--export:hover {
  color: #1d5fff;
  border-color: #c8d6e8;
  background: #f8fbff;
}

.ledger-action-button--create,
.ledger-action-button--create:focus {
  color: #fff;
  border-color: #2563eb;
  background: #2563eb;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.26);
}

.ledger-action-button--create:hover {
  color: #fff;
  border-color: #1d4ed8;
  background: #1d4ed8;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.32);
}

.ledger-card-list {
  min-height: 220px;
}

.case-card {
  margin-bottom: 14px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.04);
}

.case-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  cursor: pointer;
  background: #fbfcff;
  border-bottom: 1px solid #eef0f5;
  transition: background 0.2s ease;
}

.case-card__header:hover {
  background: #f5f9ff;
}

.case-card__toggle {
  width: 28px;
  height: 28px;
  padding: 0;
  margin-top: 1px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  color: #409eff;
  background: #fff;
  cursor: pointer;
}

.case-card__main {
  flex: 1;
  min-width: 0;
}

.case-card__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.case-card__index {
  min-width: 28px;
  color: #909399;
  font-size: 12px;
  font-weight: 600;
}

.case-card__title {
  color: #303133;
  font-size: 15px;
  font-weight: 700;
}

.case-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
}

.case-card__details {
  position: relative;
  padding: 8px 18px 10px 58px;
}

.case-card__details::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 31px;
  width: 2px;
  background: #e9edf5;
  content: "";
}

.property-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f2f5;
}

.property-row:last-child {
  border-bottom: none;
}

.property-row__dot {
  position: absolute;
  top: 28px;
  left: -31px;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #c0c4cc;
  box-shadow: 0 0 0 2px #e9edf5;
}

.property-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  font-size: 19px;
}

.property-icon--house {
  color: #e6a23c;
  background: #fdf6ec;
}

.property-icon--car {
  color: #409eff;
  background: #ecf5ff;
}

.property-icon--bank {
  color: #67c23a;
  background: #f0f9eb;
}

.property-icon--stock {
  color: #9254de;
  background: #f5f0ff;
}

.property-icon--other {
  color: #909399;
  background: #f4f4f5;
}

.property-row__content {
  flex: 1;
  min-width: 0;
}

.property-row__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.property-row__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.property-row__type {
  color: #303133;
  font-size: 14px;
  font-weight: 700;
}

.property-row__limit {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 600;
}

.property-row__limit--success {
  color: #67c23a;
}

.property-row__limit--warning {
  color: #e6a23c;
}

.property-row__limit--danger {
  color: #f56c6c;
}

.property-row__limit--info {
  color: #909399;
}

.property-row__desc {
  margin-top: 7px;
  color: #303133;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-all;
}

.property-row__note {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: 8px;
  padding: 7px 10px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 6px;
  word-break: break-all;
}

.property-row__note i {
  flex: 0 0 auto;
  margin-top: 2px;
  color: #909399;
}

.property-row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.property-row__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  margin-left: 8px;
}

.ledger-expand-enter-active,
.ledger-expand-leave-active {
  transition: all 0.18s ease;
}

.ledger-expand-enter,
.ledger-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .ledger-entry-dialog {
    width: calc(100% - 24px) !important;
    margin-top: 12px !important;
  }

  .ledger-entry-form,
  .ledger-dialog-title {
    padding-right: 18px;
    padding-left: 18px;
  }

  .ledger-switch-grid {
    grid-template-columns: 1fr;
  }

  .case-card__meta {
    gap: 6px 14px;
  }

  .property-row {
    flex-wrap: wrap;
  }

  .property-row__top {
    display: block;
  }

  .property-row__limit {
    margin-top: 6px;
  }

  .property-row__actions {
    width: 100%;
    margin-left: 50px;
  }
}
</style>
