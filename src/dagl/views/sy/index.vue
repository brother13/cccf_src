<template>
  <div class="body">
    <div class="header">
      <img src="../../../../public/assets/images/jh.png" alt="Logo" class="logo">
      <h1 class="platform-title">财产查封到期提醒系统</h1>
    </div>

    <div class="menu-container">
      <div class="menu-item data-import">
        <div class="icon-wrapper">
          <i class="fas fa-file-import" />
        </div>
        <div class="menu-text" @click="goToPage('sjdr')">数据导入</div>
      </div>
      <div class="menu-item number-manage">
        <div class="icon-wrapper">
          <i class="fas fa-sort-numeric-down" />
        </div>
        <div class="menu-text" @click="goToPage('ghgl')">归号管理</div>

      </div>
      <div class="menu-item size-stats">
        <div class="icon-wrapper">
          <i class="fas fa-chart-bar" />
        </div>
        <div class="menu-text" @click="goToPage('cmtj')">尺码统计</div>

      </div>
      <div class="menu-item size-library">
        <div class="icon-wrapper">
          <i class="fas fa-ruler" />
        </div>
        <div class="menu-text" @click="goToPage('cmk')">尺码库</div>

      </div>
      <div class="menu-item user-manage">
        <div class="icon-wrapper">
          <i class="fas fa-users" />
        </div>
        <div class="menu-text" @click="goToPage('rygl')">人员管理</div>

      </div>
      <div class="menu-item sys-settings">
        <div class="icon-wrapper">
          <i class="fas fa-cogs" />
        </div>
        <div class="menu-text" @click="goToPage('xtsz')">系统设置</div>

      </div>
    </div>
    <footer class="footer">
      <div class="copyright">
        <i class="far fa-copyright" />
        版权所有 2024 沈阳宁大服装有限责任公司
      </div>
    </footer>

  </div>

</template>

<script>
// import GithubCorner from '@/components/GithubCorner'
// import PanelGroup from './components/PanelGroup'
// import LineChart from './components/LineChart'
// import RaddarChart from './components/RaddarChart'
// import PieChart from './components/PieChart'
// import BarChart from './components/BarChart'
import CountCard from './components/CountCard'

// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    // GithubCorner,
    // PanelGroup,
    // LineChart,
    // RaddarChart,
    // PieChart,
    // BarChart,
    CountCard
    // TransactionTable,
    // TodoList,
    // BoxCard
  },
  data() {
    return {
      // lineChartData: lineChartData.newVisitis,
      count: {
        bank: {
          num: 1000,
          money: 300120
        },
        netbank: {
          num: 40,
          money: 4100
        },
        house: {
          num: 121,
          money: 12333,
          moneyunit: '平方'
        },
        stock: {
          num: 12,
          money: 200,
          showmoney: false
        },
        company: {
          num: 100,
          money: 1000,
          showmoney: false
        },
        car: {
          num: 222,
          money: 1213,
          showmoney: false
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      setInterval(this.getCount, 60000)
    })
  },
  activated() {
    this.getCount()
  },
  created() {
    this.getCount()
  },
  methods: {
    goToPage(type) {
      if (type == 'sjdr') {
        this.$router.push({ path: '/ywcl/upload-excel' })
      } else if (type == 'ghgl') {
        this.$router.push({ path: '/ywcl/xzjl' })
      } else if (type == 'cmtj') {
        this.$router.push({ path: '' })
      } else if (type == 'cmk') {
        this.$router.push({ path: '/cmbz/cmk' })
      } else if (type == 'rygl') {
        this.$router.push({ path: '/setting/user-table' })
      } else if (type == 'xtsz') {
        this.$router.push({ path: 'logs/userlog' })
      }
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    getCount() {}
  }
}
</script>

<style lang="scss" scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    //background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
    min-height: 100vh;
    padding: 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px;
    color: white;
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
    color: #333;
  }

  .menu-container {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
  }

  .menu-item {
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
    color: rgba(#606266, 0.8);
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
  @import url(../../../../../public/assets/all.min.css);
</style>
