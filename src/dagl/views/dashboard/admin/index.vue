<template>
  <div class="body">
    <div class="dashboard-content">
      <section v-if="showUpdateNotice" class="notice-group">
        <header class="notice-header">
          <h2 class="notice-title">{{ updateNotice.title }}</h2>
          <time v-if="updateNotice.date" class="notice-date">{{ updateNotice.date }}</time>
        </header>
        <ul class="notice-list">
          <li v-for="(item, index) in updateNotice.items" :key="index">{{ item }}</li>
        </ul>
      </section>

      <main
        class="menu-container"
        :class="{ 'menu-container--without-fund': !canShowExecutionFundReminders }"
      >
        <section v-if="canShowExecutionFundReminders" class="remind-group fund-reminders">
          <header class="group-header">
            <span class="group-bar" />
            <h2 class="group-title">案款相关提醒</h2>
            <span class="group-count">{{ executionFundReminderItemCount }} 项</span>
          </header>
          <div class="menu-items-wrapper">
            <button
              v-if="canShowUnreturnedReport"
              class="menu-item"
              type="button"
              @click="goToPage('new5day')"
            >
              <span class="icon-wrapper icon-warn">
                <i class="fas fa-wallet" />
              </span>
              <span class="menu-copy">
                <span class="menu-title-row">
                  <span class="menu-text">新到账的5天未发还</span>
                  <span v-if="count.new5day !== 0" class="badge">{{ count.new5day }}</span>
                </span>
              </span>
              <i class="menu-chevron el-icon-arrow-right" />
            </button>
            <button
              v-if="canShowUnreturnedReport"
              class="menu-item"
              type="button"
              @click="goToPage('new10day')"
            >
              <span class="icon-wrapper icon-danger">
                <i class="fas fa-wallet" />
              </span>
              <span class="menu-copy">
                <span class="menu-title-row">
                  <span class="menu-text">新到账的10天未发还</span>
                  <span v-if="count.new10day !== 0" class="badge">{{ count.new10day }}</span>
                </span>
              </span>
              <i class="menu-chevron el-icon-arrow-right" />
            </button>
            <button
              v-if="canShowRefundReturnList"
              class="menu-item"
              type="button"
              @click="goToPage('thqdlist')"
            >
              <span class="icon-wrapper icon-neutral">
                <i class="fas fa-undo" />
              </span>
              <span class="menu-copy">
                <span class="menu-title-row">
                  <span class="menu-text">发还失败退回清单</span>
                  <span v-if="count.thqd !== 0" class="badge">{{ count.thqd }}</span>
                </span>
              </span>
              <i class="menu-chevron el-icon-arrow-right" />
            </button>
            <button
              v-if="canShowReceiptPendingList"
              class="menu-item"
              type="button"
              @click="goToPage('dkplist')"
            >
              <span class="icon-wrapper icon-neutral">
                <i class="fas fa-receipt" />
              </span>
              <span class="menu-copy">
                <span class="menu-title-row">
                  <span class="menu-text">到账待开收据</span>
                  <span v-if="count.dkp !== 0" class="badge">{{ count.dkp }}</span>
                </span>
              </span>
              <i class="menu-chevron el-icon-arrow-right" />
            </button>
            <button
              v-if="canShowUnreturnedReport"
              class="menu-item"
              type="button"
              @click="goToPage('akyh5day')"
            >
              <span class="icon-wrapper icon-accent">
                <i class="fas fa-hourglass-half" />
              </span>
              <span class="menu-copy">
                <span class="menu-title-row">
                  <span class="menu-text">延缓5天内到期提醒</span>
                  <span v-if="count.akyh5day !== 0" class="badge">{{ count.akyh5day }}</span>
                </span>
              </span>
              <i class="menu-chevron el-icon-arrow-right" />
            </button>
          </div>
        </section>

        <aside class="side-reminders">
          <section class="remind-group">
            <header class="group-header">
              <span class="group-bar" />
              <h2 class="group-title">查封到期提醒</h2>
            </header>
            <div class="menu-items-wrapper stats-list">
              <button
                v-if="hasRole('CCCF')"
                class="menu-item"
                type="button"
                @click="goToPage('yzyn')"
              >
                <span class="icon-wrapper icon-warn">
                  <i class="fas fa-lock" />
                </span>
                <span class="menu-copy">
                  <span class="menu-title-row">
                    <span class="menu-text">财产查封1周内到期</span>
                    <span v-if="yzyndata !== 0" class="count-badge count-badge--warn">{{ yzyndata }}</span>
                  </span>
                </span>
                <i class="menu-chevron el-icon-arrow-right" />
              </button>
              <button
                v-if="hasRole('CCCF')"
                class="menu-item"
                type="button"
                @click="goToPage('yyyn')"
              >
                <span class="icon-wrapper icon-warn">
                  <i class="fas fa-lock" />
                </span>
                <span class="menu-copy">
                  <span class="menu-title-row">
                    <span class="menu-text">财产查封1月内到期</span>
                    <span v-if="yyyndata !== 0" class="count-badge count-badge--warn">{{ yyyndata }}</span>
                  </span>
                </span>
                <i class="menu-chevron el-icon-arrow-right" />
              </button>
            </div>
          </section>

          <section class="remind-group">
            <header class="group-header">
              <span class="group-bar" />
              <h2 class="group-title">自动化执行提醒</h2>
            </header>
            <div class="menu-items-wrapper stats-list">
              <router-link
                tag="button"
                type="button"
                class="menu-item"
                :to="{ path: '/xdgl/xdlb', query: { zt: '继续冻结成功' } }"
              >
                <span class="icon-wrapper icon-ok">
                  <i class="fas fa-robot" />
                </span>
                <span class="menu-copy">
                  <span class="menu-text">继续冻结成功</span>
                </span>
                <span class="stat-value stat-value--ok">{{ count.continueFreezeSuccess }}</span>
                <i class="menu-chevron el-icon-arrow-right" />
              </router-link>
              <router-link
                tag="button"
                type="button"
                class="menu-item"
                :to="{ path: '/xdgl/xdlb', query: { zt: '继续冻结失败' } }"
              >
                <span class="icon-wrapper icon-danger">
                  <i class="fas fa-robot" />
                </span>
                <span class="menu-copy">
                  <span class="menu-text">继续冻结失败</span>
                </span>
                <span class="stat-value stat-value--danger">{{ count.continueFreezeFail }}</span>
                <i class="menu-chevron el-icon-arrow-right" />
              </router-link>
            </div>
          </section>
        </aside>
      </main>
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
        new5day: 0,
        new10day: 0,
        akyh5day: 0,
        thqd: 0,
        dkp: 0,
        continueFreezeSuccess: 0,
        continueFreezeFail: 0
      },
      updateNotice: normalizeUpdateNotice({})
    }
  },
  computed: {
    // 假设 roles 是当前用户的角色数组
    roles() {
      return this.$store.state.user.roles // 假设 roles 存储在 Vuex 的 state 中
    },
    showUpdateNotice() {
      return isUpdateNoticeVisible(this.updateNotice, false)
    },
    canShowUnreturnedReport() {
      return this.hasRole('ZXTZ_UNRETURNED_REPORT')
    },
    canShowSummaryReport() {
      return this.hasRole('ZXTZ_SUMMARY_REPORT')
    },
    canShowRefundReturnList() {
      return this.hasRole('ZXTZ_REFUND_RETURN_LIST')
    },
    canShowReceiptPendingList() {
      return this.hasRole('ZXTZ_RECEIPT_PENDING_LIST')
    },
    canShowExecutionFundReminders() {
      return this.canShowUnreturnedReport ||
        this.canShowRefundReturnList ||
        this.canShowReceiptPendingList
    },
    executionFundReminderItemCount() {
      let count = 0
      if (this.canShowUnreturnedReport) {
        count += 3
      }
      if (this.canShowRefundReturnList) {
        count += 1
      }
      if (this.canShowReceiptPendingList) {
        count += 1
      }
      return count
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
    getUpdateNotice() {
      updateNotice().then((res) => {
        this.updateNotice = normalizeUpdateNotice(res.data)
      }).catch(() => {
        this.updateNotice = normalizeUpdateNotice({})
      })
    },
    getcount() {
      if (this.canShowUnreturnedReport) {
        caseapi.plugins.countCasenum().then((res) => {
          this.count.new5day = res.new5day || 0
          this.count.new10day = res.new10day
          this.count.akyh5day = res.akyh5day
        })
      }
      if (this.canShowRefundReturnList) {
        this.getThqdCount()
      }
      if (this.canShowReceiptPendingList) {
        this.getDkpCount()
      }
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
      } else if (type === 'new5day' || type === 'new10day' || type === 'akyh5day') {
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
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  height: calc(100dvh - 84px);
  overflow: hidden;
  background: #f5f7fa;
  color: #1f2937;
}

.dashboard-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  padding: 24px clamp(16px, 2vw, 36px) 32px;
}

.menu-container {
  display: grid;
  grid-template-columns: minmax(320px, 0.85fr) minmax(0, 2.15fr);
  gap: clamp(16px, 1.4vw, 24px);
  flex: 1;
  width: 100%;
  min-height: 0;
}

.fund-reminders {
  display: flex;
  grid-column: 2;
  grid-row: 1;
  flex-direction: column;
  min-height: 0;
}

.menu-container--without-fund {
  grid-template-columns: minmax(0, 1fr);
}

.menu-container--without-fund .side-reminders {
  display: grid;
  grid-column: 1;
  grid-row: auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.side-reminders {
  display: flex;
  grid-column: 1;
  grid-row: 1;
  flex-direction: column;
  gap: clamp(16px, 1.4vw, 24px);
  min-width: 0;
  min-height: 0;
}

.side-reminders .remind-group {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.remind-group {
  width: 100%;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.notice-group {
  width: 100%;
  margin-bottom: 12px;
  padding: 9px 14px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.notice-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.notice-title {
  margin: 0;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.notice-date {
  color: #9ca3af;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.notice-list {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
}

.notice-list li {
  position: relative;
  padding-left: 11px;
}

.notice-list li::before {
  position: absolute;
  top: 0;
  left: 0;
  color: #16a34a;
  content: "•";
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 17px clamp(20px, 1.5vw, 28px);
  border-bottom: 1px solid #f3f4f6;
}

.group-bar {
  width: 3px;
  height: 14px;
  flex: 0 0 3px;
  background: #16a34a;
  border-radius: 2px;
}

.group-title {
  margin: 0;
  color: #1f2937;
  font-size: clamp(15px, 0.9vw, 17px);
  font-weight: 600;
  line-height: 1.2;
}

.group-count {
  margin-left: auto;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 10px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.fund-reminders .menu-items-wrapper {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  min-height: 0;
}

.fund-reminders .menu-item {
  min-height: 0;
}

.stats-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.stats-list .menu-item {
  flex: 1;
  min-height: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  min-height: 84px;
  padding: 18px clamp(20px, 1.5vw, 28px);
  border: 0;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item:focus {
  outline: none;
}

.menu-item:focus-visible {
  position: relative;
  z-index: 1;
  box-shadow: inset 0 0 0 2px rgba(22, 163, 74, 0.42);
}

.menu-item:active {
  background: #f3f4f6;
}

.fund-reminders .menu-item {
  border-right: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.fund-reminders .menu-item:nth-child(2n) {
  border-right: 0;
}

.fund-reminders .menu-item:nth-last-child(-n+2) {
  border-bottom: 0;
}

.stats-list .menu-item {
  border-bottom: 1px solid #f3f4f6;
}

.stats-list .menu-item:last-child {
  border-bottom: 0;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 9px;
}

.icon-wrapper i {
  font-size: 19px;
}

.icon-neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.icon-warn {
  background: #fef3c7;
  color: #b45309;
}

.icon-danger {
  background: #fee2e2;
  color: #dc2626;
}

.icon-ok {
  background: #d1fae5;
  color: #047857;
}

.icon-accent {
  background: #ede9fe;
  color: #7c3aed;
}

.menu-copy {
  display: block;
  flex: 1;
  min-width: 0;
}

.menu-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.menu-text {
  color: #1f2937;
  font-size: clamp(14px, 0.82vw, 16px);
  font-weight: 500;
  line-height: 1.4;
}

.badge,
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.badge {
  background: #ef4444;
}

.count-badge--warn {
  background: #d97706;
}

.menu-chevron {
  flex-shrink: 0;
  color: #d1d5db;
  font-size: 14px;
  transition: color 0.2s ease, transform 0.2s ease;
}

.menu-item:hover .menu-chevron {
  color: #16a34a;
  transform: translateX(2px);
}

.stat-value {
  min-width: 42px;
  flex-shrink: 0;
  font-size: clamp(27px, 1.65vw, 32px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
  text-align: right;
}

.stat-value--ok {
  color: #047857;
}

.stat-value--danger {
  color: #dc2626;
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
  flex: 0 0 auto;
  text-align: center;
  padding: 10px;
  color: #495060;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  margin: 0 auto;
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
@media screen and (max-width: 960px) {
  .body {
    display: block;
    height: auto;
    min-height: calc(100vh - 84px);
    min-height: calc(100dvh - 84px);
    overflow: visible;
  }

  .dashboard-content {
    display: block;
    padding: 16px;
  }

  .menu-container {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .menu-container--without-fund .side-reminders {
    display: flex;
  }

  .side-reminders,
  .fund-reminders {
    grid-column: 1;
    grid-row: auto;
  }

  .side-reminders {
    order: 1;
  }

  .fund-reminders {
    height: auto;
    order: 2;
  }

  .side-reminders .remind-group {
    min-height: auto;
  }

  .fund-reminders .menu-items-wrapper {
    flex: none;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: auto;
  }

  .fund-reminders .menu-item {
    border-right: 0;
    min-height: 84px;
  }

  .fund-reminders .menu-item:nth-last-child(2) {
    border-bottom: 1px solid #f3f4f6;
  }

  .stats-list {
    display: block;
  }

  .stats-list .menu-item {
    min-height: 84px;
  }

  .footer {
    padding: 8px;
    margin: 10px auto 0;
  }
}

@media screen and (max-width: 480px) {
  .dashboard-content {
    padding: 10px;
  }

  .menu-item {
    padding: 13px 14px;
  }

  .group-header {
    padding-right: 14px;
    padding-left: 14px;
  }

  .notice-group {
    padding: 9px 12px 10px;
  }

  .stat-value {
    font-size: 23px;
  }
}

//@import url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css);
@import "../../../../../public/assets/fontawesome/css/all.min.css";
</style>
