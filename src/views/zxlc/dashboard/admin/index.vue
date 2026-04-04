<template>
  <div class="dashboard-editor-container">
    <!-- <panel-group @handleSetLineChartData="handleSetLineChartData" /> -->

    <!-- <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>-->
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card
          cardname="银行存款"
          :num="count.bank.num"
          :money="count.bank.money"
          icon="money"
          link="/zxlc-bank/List-Bank"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card
          cardname="网络银行"
          :num="count.netbank.num"
          :money="count.netbank.money"
          icon="alipay"
          link="/zxlc-bank/List-netbank"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card
          cardname="不动产"
          :num="count.house.num"
          :money="count.house.money"
          icon="house"
          :moneyunit="count.house.moneyunit"
          link="/zxlc-other/list-house"
        />
      </el-col>

      <!-- <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card cardname="证券" num="50" money="12"></count-card>
      </el-col>-->
    </el-row>
    <br>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card
          cardname="车辆"
          :num="count.car.num"
          :money="count.car.money"
          icon="car"
          :showmoney="count.car.showmoney"
          link="/zxlc-other/list-car"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card
          cardname="工商信息"
          :num="count.company.num"
          :money="count.company.money"
          icon="company"
          :showmoney="count.company.showmoney"
          link="/zxlc-other/list-company"
        />
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <count-card
          cardname="证券"
          :num="count.stock.num"
          :money="count.stock.money"
          :showmoney="count.stock.showmoney"
          icon="stock"
          link="/zxlc-other/list-stock"
        />
      </el-col>
    </el-row>
    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>-->

    <!-- <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row>-->
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

import { postdata } from '@/api/common'
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
          num: 0,
          money: 0
        },
        netbank: {
          num: 0,
          money: 0
        },
        house: {
          num: 0,
          money: 0,
          moneyunit: '平方'
        },
        stock: {
          num: 0,
          money: 0,
          showmoney: false
        },
        company: {
          num: 0,
          money: 0,
          showmoney: false
        },
        car: {
          num: 0,
          money: 0,
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
      postdata('/zxlc/count').then((response) => {
        const data = response.data
        if (data.bank) {
          this.count.bank.num = data.bank.num
          this.count.bank.money = data.bank.money
        }
        if (data.netbank) {
          this.count.netbank.num = data.netbank.num
          this.count.netbank.money = data.netbank.money
        }
        if (data.house) {
          this.count.house.num = data.house.num
          this.count.house.money = data.house.money
        }
        if (data.car) {
          this.count.car.num = data.car.num
        }
        if (data.stock) {
          this.count.stock.num = data.stock.num
        }
        if (data.company) {
          this.count.company.num = data.company.num
        }
      })
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
