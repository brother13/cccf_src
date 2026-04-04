<template>
  <div class="body">
    <div class="header">
      <img src="../../../../../public/assets/images/jh.png" alt="Logo" class="logo">
      <h1 class="platform-title" v-if="!hasRole('PZ')">执行法官助手</h1>
      <!-- <h1 class="platform-title" v-if="hasRole('PZ')">财务凭证接口</h1> -->
    </div>

    <div class="menu-container">

      <div class="menu-item sys-settings">
        <div class="icon-wrapper">
          <i class="fas fa-bell"></i>
        </div>
        <div class="menu-text" @click="goToPage('new10day')">新到账的10天未发还</div>
        <span class="badge">{{ count.new10day }} </span>
      </div>
      <div class="menu-item size-stats" v-if="hasRole('XZTZ')">
        <div class="icon-wrapper">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="menu-text" @click="goToPage('akyh5day')">延缓5天内到期提醒</div>
        <span class="badge">{{ count.akyh5day }} </span>
      </div>
      
      <div class="menu-item data-import" v-if="hasRole('CCCF')">
        <div class="icon-wrapper">
          <i class="far fa-bell"></i>
        </div>
        <div class="menu-text" @click="goToPage('yzyn')">财产查封1 周内到期</div>
        <span class="badge">{{yzyndata}} </span>
      </div>
      <div class="menu-item number-manage" v-if="hasRole('CCCF')">
        <div class="icon-wrapper">
          <i class="fas fa-bell"></i>
        </div>
        <div class="menu-text" @click="goToPage('yyyn')">财产查封1 月内到期</div>
        <span class="badge">{{yyyndata}} </span>
      </div>
      <div class="menu-item sys-settings" v-if="hasRole('XDFKTX')">
        <div class="icon-wrapper">
          <i class="fas fa-bell"></i>
        </div>
        <div class="menu-text" @click="goToPage('xdlb')">续冻金额提醒</div>
        <span class="badge">{{xdlbcount}} </span>
      </div>



    </div>
    <footer class="footer">
      <div class="copyright">
        <i class="far fa-copyright"></i>
        版权所有 2026 树莓（沈阳）软件科技发展有限公司
      </div>
    </footer>
  </div>
</template>

<script>
import {
  postdata,
  cflist,
  cflist_total,
  xdlblist,
  zxklist,
  xdlist,
} from '@/dagl/api/common'
// import GithubCorner from '@/components/GithubCorner'
// import PanelGroup from './components/PanelGroup'
// import LineChart from './components/LineChart'
// import RaddarChart from './components/RaddarChart'
// import PieChart from './components/PieChart'
// import BarChart from './components/BarChart'
//import CountCard from './components/CountCard'

// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'
import caseapi from '@/courtcase/api'

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
      yzyndata: "-",
      yyyndata: "-",
      xdlbcount: "-",
      zxtzcount: "-",


      count: {
        new10day: 0,
        akyh5day: 0
      }
    }
  },
  computed: {
    // 假设 roles 是当前用户的角色数组
    roles() {
      return this.$store.state.user.roles; // 假设 roles 存储在 Vuex 的 state 中
    }
  },

  created() {
    this.gettotal()
    this.init();
    // console.log(this.$store.state.user)
  },
  activated() {
    // this.gettotal()
  },

  methods: {
    hasRole(role) {
      return this.roles.includes(role);
    },

    init() {
      this.getcount();


    },
    getcount() {
      caseapi.plugins.countCasenum().then((res) => {
        this.count.new10day = res.new10day;
        this.count.akyh5day = res.akyh5day;
      })
    },
    goToPage(type) {
      if (type == 'yzyn') {
        this.$router.push({
          path: '/tz/yzyn'
        })
      } else if (type == 'yyyn') {
        this.$router.push({
          path: '/tz/yyyn'
        })
      } else if (type == 'yyyn2') {
        this.$router.push({
          path: '/tz/yyyn2'
        })
      } else if (type == 'tzsj') {
        this.$router.push({
          path: '/tz/txcl'
        })
      } else if (type == 'tjtz') {
        this.$router.push({
          path: '/ywcl/upload-excel'
        })
      } else if (type == 'xdlb') {
        this.$router.push({
          path: '/xdgl/xdlb'
        })
      } else if (type == 'zxktz') {
        this.$router.push({
          path: '/zxktz/zxkreport'
        })
      } else if (type == 'new10day' || type == 'akyh5day') {
        this.$router.push({
          path: '/zxktz/zxkreport',
          query: { type: type }
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
    },
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
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  color: #495060;
}

.logo {
  width: 130px;
  height: 130px;
  margin-bottom: 15px;
}

.platform-title {
  font-size: 35px;
  margin-top: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.menu-container {
  max-width: 1000px;
  margin: 0 auto;
  // display: grid;
  // grid-template-columns: repeat(2, 1fr);
  //gap: 20px;
  display: flex;
  justify-content: space-between;
  /* 水平分散对齐 */
  align-items: center;
  /* 垂直居中 */
  flex-wrap: wrap;


  padding: 20px;
}

.menu-item {
  width: 49%;
  margin-bottom: 2%;
  //margin: 10px;

  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  transition: transform 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  transform: translateY(-5px);
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.menu-item i {
  font-size: 24px;
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
  font-size: 22px;
  font-weight: 500;
  flex-grow: 1;
  text-align: left;
}

.badge {
  background-color: red;
  color: white;
  padding: 4px 8px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  position: absolute;
  top: 8px;
  right: 8px;
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
  padding: 20px;
  color: #495060;
  margin-top: auto;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  margin: 20px auto 0;
  max-width: 1000px;
  width: 100%;
}

.copyright {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.copyright i {
  font-size: 12px;
}

//@import url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css);
@import "../../../../../public/assets/fontawesome/css/all.min.css";
</style>
