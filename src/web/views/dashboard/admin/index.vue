<template>
  <div class="dashboard-editor-container">
    欢迎来到【执行法官助手】

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

import { postdata } from '@/web/api/common'
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
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    getCount() {
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
