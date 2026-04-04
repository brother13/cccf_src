<template>
  <div class="app-container">
    <el-date-picker
      v-model="listQuery.startdate"
      type="date"
      placeholder="日期"
      value-format="yyyy-MM-dd"
      @change="fetchData"
    />
    <el-button
      :loading="downloadLoading"
      style="margin-bottom:20px"
      type="primary"
      icon="el-icon-document"
      @click="handleDownload"
    >导出excel</el-button>
    <div class="mytips">{{ tips }}

    </div>
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="时间" width="95">
        <template slot-scope="scope">
          {{ scope.row._hour }}
        </template>
      </el-table-column>
      <el-table-column label="桃源西路" align="center">
        <el-table-column label="AQI">
          <template slot-scope="scope">
            {{ scope.row.aqi }}
          </template>
        </el-table-column>
        <el-table-column label="SO2">
          <template slot-scope="scope">
            {{ scope.row.so2 }}
          </template>
        </el-table-column>
        <el-table-column label="NO2">
          <template slot-scope="scope">
            {{ scope.row.no2 }}
          </template>
        </el-table-column>
        <el-table-column label="CO">
          <template slot-scope="scope">
            {{ scope.row.co }}
          </template>
        </el-table-column>
        <el-table-column label="O3">
          <template slot-scope="scope">
            {{ scope.row.o3 }}
          </template>
        </el-table-column>
        <el-table-column label="PM2.5">
          <template slot-scope="scope">
            {{ scope.row.pm25 }}
          </template>
        </el-table-column>
        <el-table-column label="PM10">
          <template slot-scope="scope">
            {{ scope.row.pm10 }}
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" label="  " width="20">
        <template slot-scope="scope" />
      </el-table-column>
      <el-table-column label="林庄" align="center">
        <el-table-column label="AQI">
          <template slot-scope="scope">
            {{ scope.row.aqi_1 }}
          </template>
        </el-table-column>
        <el-table-column label="SO2">
          <template slot-scope="scope">
            {{ scope.row.so2_1 }}
          </template>
        </el-table-column>
        <el-table-column label="NO2">
          <template slot-scope="scope">
            {{ scope.row.no2_1 }}
          </template>
        </el-table-column>
        <el-table-column label="CO">
          <template slot-scope="scope">
            {{ scope.row.co_1 }}
          </template>
        </el-table-column>
        <el-table-column label="O3">
          <template slot-scope="scope">
            {{ scope.row.o3_1 }}
          </template>
        </el-table-column>
        <el-table-column label="PM2.5">
          <template slot-scope="scope">
            {{ scope.row.pm25_1 }}
          </template>
        </el-table-column>
        <el-table-column label="PM10">
          <template slot-scope="scope">
            {{ scope.row.pm10_1 }}
          </template>
        </el-table-column>
      </el-table-column>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import {
  HourAqiList
} from '@/dagl/api/common'

import {
  parseTime
} from '@/utils'

export default {
  name: 'MergeHeader',
  data() {
    return {
      list: [{
        'aqi': '1',
        'so2': '2',
        'no2': '3',
        'co': '4',
        'o3': '5',
        'pm25': '6',
        'pm10': '7',
        'aqi_1': '8',
        'so2_1': '9',
        'no2_1': '10',
        'co_1': '11',
        'o3_1': '12',
        'pm25_1': '13',
        'pm10_1': '14'
      }],
      listLoading: true,
      downloadLoading: false,
      tips: ' ',
      listQuery: {
        startdate: parseTime(new Date().getTime(), '{y}-{m}-{d}')
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      HourAqiList(this.listQuery).then(response => {
        console.log(response.data)
        this.list = response.data
        this.listLoading = false
        if (response.data.length >= 25) {
          this.tips = response.data[24]['tips']
        }
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const multiHeader = [
          ['时间', '桃源西路', '', '', '', '', '', '', '', '林庄', '', '', '', '', '', '']
        ]
        const header = ['_hour', 'AQI', 'SO2', 'NO2', 'CO', 'O3', 'PM2.5', 'PM10', '', 'AQI', 'SO2', 'NO2', 'CO',
          'O3', 'PM2.5', 'PM10'
        ]
        const filterVal = ['_hour', 'aqi', 'so2', 'no2', 'co', 'o3', 'pm25', 'pm10', '', 'aqi_1', 'so2_1',
          'no2_1', 'co_1', 'o3_1', 'pm25_1', 'pm10_1'
        ]
        const list = this.list
        const data = this.formatJson(filterVal, list)
        const merges = ['A1:A2', 'B1:H1', 'I1:I27', 'J1:P1']
        excel.export_json_to_excel({
          multiHeader,
          header,
          merges,
          data
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
<style>
.mytips {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0px;
  margin-top: -10px;
}
</style>
