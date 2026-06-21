<template>
  <div class="body">
    <div class="header">
      <img src="../../../../../public/assets/images/jh.png" alt="Logo" class="logo">
      <h1 v-if="!hasRole('PZ')" class="platform-title">执行法官助手</h1>
      <!-- <h1 class="platform-title" v-if="hasRole('PZ')">财务凭证接口</h1> -->
    </div>

    <div v-if="showUpdateNotice" class="notice-group">
      <button class="notice-close" type="button" aria-label="关闭公告" @click="closeUpdateNotice">
        <i class="el-icon-close" />
      </button>
      <div class="notice-header">
        <div class="notice-title">{{ updateNotice.title }}</div>
        <div v-if="updateNotice.date" class="notice-date">{{ updateNotice.date }}</div>
      </div>
      <ul class="notice-list">
        <li v-for="(item, index) in updateNotice.items" :key="index">{{ item }}</li>
      </ul>
    </div>

    <div class="menu-container">
      <!-- 执行插孔类别 -->
      <div class="remind-group">
        <div class="group-title">查封到期提醒</div>
        <div class="menu-items-wrapper">
          <div v-if="hasRole('CCCF')" class="menu-item data-import">
            <div class="icon-wrapper">
              <i class="far fa-bell" />
            </div>
            <div class="menu-text" @click="goToPage('yzyn')">财产查封1 周内到期</div>
            <span v-if="yzyndata !== 0" class="badge">{{ yzyndata }}</span>
          </div>
          <div v-if="hasRole('CCCF')" class="menu-item number-manage">
            <div class="icon-wrapper">
              <i class="fas fa-bell" />
            </div>
            <div class="menu-text" @click="goToPage('yyyn')">财产查封1 月内到期</div>
            <span v-if="yyyndata !== 0" class="badge">{{ yyyndata }}</span>
          </div>
          <div v-if="false" class="menu-item sys-settings">
            <div class="icon-wrapper">
              <i class="fas fa-bell" />
            </div>
            <div class="menu-text" @click="goToPage('xdlb')">续冻金额提醒</div>
            <span v-if="xdlbcount !== 0" class="badge">{{ xdlbcount }}</span>
          </div>
        </div>
      </div>

      <div class="remind-group">
        <div class="group-title">自动化执行提醒</div>
        <div class="menu-items-wrapper">
          <router-link
            tag="div"
            class="menu-item data-import"
            :to="{ path: '/xdgl/xdlb', query: { zt: '继续冻结成功' } }"
          >
            <div class="icon-wrapper">
              <i class="fas fa-robot" />
            </div>
            <div class="menu-text">继续冻结成功</div>
            <span v-if="count.continueFreezeSuccess !== 0" class="badge">{{ count.continueFreezeSuccess }}</span>
          </router-link>
          <router-link
            tag="div"
            class="menu-item number-manage"
            :to="{ path: '/xdgl/xdlb', query: { zt: '继续冻结失败' } }"
          >
            <div class="icon-wrapper">
              <i class="fas fa-robot" />
            </div>
            <div class="menu-text">继续冻结失败</div>
            <span v-if="count.continueFreezeFail !== 0" class="badge">{{ count.continueFreezeFail }}</span>
          </router-link>
        </div>
      </div>

      <!-- 工具组 -->
      <!-- <div class="remind-group">
        <div class="group-title">实用工具</div>
        <div class="menu-items-wrapper">
          <div class="menu-item data-import">
            <div class="icon-wrapper">
              <i class="fas fa-calculator" />
            </div>
            <div class="menu-text" @click="goToPage('lixijs')">利息计算器</div>
          </div>
        </div>
      </div> -->

      <!-- 执行款台账组 -->
      <div class="remind-group">
        <div class="group-title">案款相关提醒</div>
        <div class="menu-items-wrapper">
          <div v-if="hasRole('XZTZ')" class="menu-item number-manage">
            <div class="icon-wrapper">
              <i class="fas fa-undo" />
            </div>
            <div class="menu-text" @click="goToPage('thqdlist')">发还失败退回清单</div>
            <span v-if="count.thqd !== 0" class="badge">{{ count.thqd }}</span>
          </div>
          <div v-if="hasRole('XZTZ')" class="menu-item data-import">
            <div class="icon-wrapper">
              <i class="fas fa-receipt" />
            </div>
            <div class="menu-text" @click="goToPage('dkplist')">到账待开收据</div>
            <span v-if="count.dkp !== 0" class="badge">{{ count.dkp }}</span>
          </div>
          <div class="menu-item sys-settings">
            <div class="icon-wrapper">
              <i class="fas fa-bell" />
            </div>
            <div class="menu-text" @click="goToPage('new10day')">新到账的10天未发还</div>
            <span v-if="count.new10day !== 0" class="badge">{{ count.new10day }}</span>
          </div>
          <div v-if="hasRole('XZTZ')" class="menu-item size-stats">
            <div class="icon-wrapper">
              <i class="fas fa-file-alt" />
            </div>
            <div class="menu-text" @click="goToPage('akyh5day')">延缓5天内到期提醒</div>
            <span v-if="count.akyh5day !== 0" class="badge">{{ count.akyh5day }}</span>
          </div>

        </div>
      </div>

    </div>
    <footer class="footer">
      <div class="copyright">
        <i class="far fa-copyright" />
        版权所有 2026 树莓（沈阳）软件科技发展有限公司
      </div>
    </footer>
  </div>
</template>

<script>
import {
  cflist_total,
  updateNotice,
  zxklist,
  xdlist,
  xdztcount
} from '@/dagl/api/common'
import { thqdList } from '@/dagl/api/thqd'
import { dkpList } from '@/dagl/api/dkp'
// import GithubCorner from '@/components/GithubCorner'
// import PanelGroup from './components/PanelGroup'
// import LineChart from './components/LineChart'
// import RaddarChart from './components/RaddarChart'
// import PieChart from './components/PieChart'
// import BarChart from './components/BarChart'
// import CountCard from './components/CountCard'

// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'
import caseapi from '@/courtcase/api'
import { isUpdateNoticeVisible, normalizeUpdateNotice } from '@/dagl/utils/updateNotice'

export default {
  name: 'DashboardAdmin',
  // components: {
  //   // GithubCorner,
  //   // PanelGroup,
  //   // LineChart,
  //   // RaddarChart,
  //   // PieChart,
  //   // BarChart,
  //   //CountCard
  //   // TransactionTable,
  //   // TodoList,
  //   // BoxCard
  // },
  data() {
    return {
      listQuery: {},
      yzyndata: '-',
      yyyndata: '-',
      xdlbcount: '-',
      zxtzcount: '-',

      count: {
        new10day: 0,
        akyh5day: 0,
        thqd: 0,
        dkp: 0,
        continueFreezeSuccess: 0,
        continueFreezeFail: 0
      },
      updateNotice: normalizeUpdateNotice({}),
      noticeClosed: false
    }
  },
  computed: {
    // 假设 roles 是当前用户的角色数组
    roles() {
      return this.$store.state.user.roles // 假设 roles 存储在 Vuex 的 state 中
    },
    showUpdateNotice() {
      return isUpdateNoticeVisible(this.updateNotice, this.noticeClosed)
    }
  },

  created() {
    this.gettotal()
    this.init()
    this.getUpdateNotice()
    // console.log(this.$store.state.user)
  },
  activated() {
    // this.gettotal()
  },

  methods: {
    hasRole(role) {
      return this.roles.includes(role)
    },

    init() {
      this.getcount()
    },
    closeUpdateNotice() {
      this.noticeClosed = true
    },
    getUpdateNotice() {
      updateNotice().then((res) => {
        this.updateNotice = normalizeUpdateNotice(res.data)
      }).catch(() => {
        this.updateNotice = normalizeUpdateNotice({})
      })
    },
    getcount() {
      caseapi.plugins.countCasenum().then((res) => {
        this.count.new10day = res.new10day
        this.count.akyh5day = res.akyh5day
      })
      this.getThqdCount()
      this.getDkpCount()
      this.getXdZtCount()
    },
    getThqdCount() {
      thqdList({ page: 1, pagesize: 1 }).then((res) => {
        const data = res.data || {}
        this.count.thqd = data.total || 0
      }).catch(() => {
        this.count.thqd = 0
      })
    },
    getDkpCount() {
      dkpList({ page: 1, pagesize: 1 }).then((res) => {
        const data = res.data || {}
        this.count.dkp = data.total || 0
      }).catch(() => {
        this.count.dkp = 0
      })
    },
    getXdZtCount() {
      xdztcount({
        myusername: this.$store.getters.name
      }).then((res) => {
        const data = res.data || {}
        this.count.continueFreezeSuccess = data.continueFreezeSuccess || 0
        this.count.continueFreezeFail = data.continueFreezeFail || 0
      }).catch(() => {
        this.count.continueFreezeSuccess = 0
        this.count.continueFreezeFail = 0
      })
    },
    goToPage(type) {
      if (type === 'yzyn') {
        this.$router.push({
          path: '/tz/yzyn'
        })
      } else if (type === 'yyyn') {
        this.$router.push({
          path: '/tz/yyyn'
        })
      } else if (type === 'yyyn2') {
        this.$router.push({
          path: '/tz/yyyn2'
        })
      } else if (type === 'tzsj') {
        this.$router.push({
          path: '/tz/txcl'
        })
      } else if (type === 'tjtz') {
        this.$router.push({
          path: '/ywcl/upload-excel'
        })
      } else if (type === 'xdlb') {
        this.$router.push({
          path: '/xdgl/xdlb'
        })
      } else if (type === 'zxktz') {
        this.$router.push({
          path: '/zxktz/zxkreport'
        })
      } else if (type === 'new10day' || type === 'akyh5day') {
        this.$router.push({
          path: '/zxktz/zxkreport',
          query: { type: type }
        })
      } else if (type === 'thqdlist') {
        this.$router.push({
          path: '/zxktz/thqdlist'
        })
      } else if (type === 'dkplist') {
        this.$router.push({
          path: '/zxktz/dkplist'
        })
      } else if (type === 'lixijs') {
        this.$router.push({
          path: '/lixijs/calculator'
        })
      }
    },
    gettotal() {
      cflist_total({
        myusername: this.$store.getters.name
      }).then((response) => {
        this.yzyndata = response.data.yzyncount
        this.yyyndata = response.data.yyyncount
        this.yyyn2count = response.data.yyyn2count

        setTimeout(() => {
          this.yzyndata = response.data.yzyncount
          this.yyyndata = response.data.yyyncount
          this.yyyn2count = response.data.yyyn2count
        }, 0.5 * 100)
      })
      xdlist({
        page: 1,
        pagesize: 10000,
        xkzjeflag: true,
        isvoid: 0,
        myusername: this.$store.getters.name
      }).then((response) => {
        this.xdlbcount = response.data.total
        setTimeout(() => {
          this.xdlbcount = response.data.total
        }, 0.5 * 100)
      })
      zxklist({
        page: 1,
        pagesize: 10000,
        isvoid: 0,
        myusername: this.$store.getters.name
      }).then((response) => {
        this.zxtzcount = response.data.total
        setTimeout(() => {
          this.zxtzcount = response.data.total
        }, 0.5 * 100)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
  min-height: 100vh;
  padding: 15px;
}

.body {
  position: relative;
}

.header {
  text-align: center;
  margin-bottom: 8px;
  padding: 4px 10px 6px;
  color: #495060;
}

.logo {
  width: 54px;
  height: 54px;
  margin-bottom: 2px;
}

.platform-title {
  font-size: 22px;
  margin-top: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.menu-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px;
  min-height: calc(100vh - 250px);
}

.remind-group {
  width: 100%;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px;
}

.notice-group {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 260px;
  max-height: 180px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 10px 30px 10px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.notice-close {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #909399;
  cursor: pointer;
  line-height: 20px;
}

.notice-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #303133;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.notice-title {
  color: #303133;
  font-size: 14px;
  font-weight: bold;
}

.notice-date {
  color: #606266;
  font-size: 12px;
  white-space: nowrap;
}

.notice-list {
  padding-left: 18px;
  color: #303133;
  line-height: 1.55;
  font-size: 13px;
}

.group-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 4px solid #333;
}

.menu-items-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.menu-item {
  width: 49%;
  margin-bottom: 2%;
  //margin: 10px;

  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 15px;
  transition: transform 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  flex: 1 1 calc(50% - 10px);
  max-width: calc(50% - 10px);
}

.menu-item:hover {
  transform: translateY(-5px);
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
}

.menu-item i {
  font-size: 20px;
  color: #333;
}

.menu-item.data-import {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.menu-item.number-manage {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.menu-item.size-stats {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.menu-item.size-library {
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
}

.menu-item.user-manage {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.menu-item.sys-settings {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.menu-text {
  color: #333;
  font-size: 18px;
  font-weight: 500;
  flex-grow: 1;
  text-align: left;
}

.badge {
  background-color: red;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 18px;
  text-align: center;
}

.top-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.top-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  cursor: pointer;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-text {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.footer {
  text-align: center;
  padding: 10px;
  color: #495060;
  margin-top: auto;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  margin: 15px auto 0;
  max-width: 1000px;
  width: 100%;
}

.copyright {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.copyright i {
  font-size: 12px;
}

// 响应式适配
@media screen and (max-width: 768px) {
  .notice-group {
    top: 8px;
    left: 8px;
    width: calc(100vw - 16px);
    max-height: 120px;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  .platform-title {
    font-size: 22px;
  }

  .header {
    margin-bottom: 15px;
    padding: 8px;
  }

  .menu-container {
    min-height: calc(100vh - 200px);
    padding: 8px;
  }

  .menu-item {
    width: 100%;
    max-width: 100%;
    flex: 1 1 100%;
  }

  .menu-text {
    font-size: 16px;
  }

  .group-title {
    font-size: 16px;
  }

  .footer {
    padding: 8px;
    margin: 10px auto 0;
  }
}

@media screen and (max-width: 480px) {
  .logo {
    width: 50px;
    height: 50px;
  }

  .platform-title {
    font-size: 18px;
  }

  .menu-item {
    padding: 12px;
  }

  .icon-wrapper {
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }

  .menu-item i {
    font-size: 18px;
  }

  .menu-text {
    font-size: 14px;
  }

  .badge {
    font-size: 10px;
    padding: 3px 6px;
  }
}

//@import url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css);
@import "../../../../../public/assets/fontawesome/css/all.min.css";
</style>
