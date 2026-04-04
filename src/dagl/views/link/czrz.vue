<template>
  <div class="app-container">

    <div>
      <el-date-picker
        v-model="listQuery.startdate"
        type="date"
        placeholder="起始日期"
        value-format="yyyy-MM-dd"
        @change="fetchData"
      />
      <el-date-picker
        v-model="listQuery.enddate"
        type="date"
        placeholder="截止日期"
        value-format="yyyy-MM-dd"
        @change="fetchData"
      />
      <el-select
        v-model="listQuery.regionid"
        placeholder="请选择区域"
        clearable
        class="filter-item"
        @change="fetchData"
      >
        <el-option
          v-for="item in DeptList"
          :key="item.deptid"
          :label="item.fullname"
          :value="item.regionid"
        >{{ item.deptname }}</el-option>
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="fetchData"
      >查询</el-button>
      <BookTypeOption v-model="bookType" />
      <el-button :loading="downloadLoading" style="margin:0 0 20px 20px;" type="primary" icon="el-icon-document" @click="handleDownload">
        导出Excel
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading..." border fit highlight-current-row>
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="修改日期" align="center">
        <template slot-scope="scope">
          {{ scope.row.inserttime }}
        </template>
      </el-table-column>
      <el-table-column label="数据日期" align="center">
        <template slot-scope="scope">
          {{ scope.row.monitortime }}
        </template>
      </el-table-column>
      <el-table-column label="区县">
        <template slot-scope="scope">
          {{ scope.row.regionname }}
        </template>
      </el-table-column>
      <el-table-column label="AQI" align="center">
        <template slot-scope="scope">
          {{ scope.row.aqi }}
        </template>
      </el-table-column>
      <el-table-column label="SO2" align="center">
        <template slot-scope="scope">
          {{ scope.row.so2 }}
        </template>
      </el-table-column>
      <el-table-column label="NO2" align="center">
        <template slot-scope="scope">
          {{ scope.row.no2 }}
        </template>
      </el-table-column>
      <el-table-column label="PM10" align="center">
        <template slot-scope="scope">
          {{ scope.row.pm10 }}
        </template>
      </el-table-column>
      <el-table-column label="CO" align="center">
        <template slot-scope="scope">
          {{ scope.row.co }}
        </template>
      </el-table-column>
      <el-table-column label="O3-8h" align="center">
          <template slot-scope="scope">
            {{ scope.row.o3 }}
          </template>
      </el-table-column>
      <el-table-column label="PM2.5" align="center">
        <template slot-scope="scope">
          {{ scope.row.pm25 }}
        </template>
      </el-table-column>




    </el-table>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { Dayschange } from '@/dagl/api/common'
import { postdata } from '@/dagl/api/common'
// options components
import FilenameOption from './components/FilenameOption'
import AutoWidthOption from './components/AutoWidthOption'
import BookTypeOption from './components/BookTypeOption'

export default {
  name: 'ExportExcel',
  components: { FilenameOption, AutoWidthOption, BookTypeOption },
  data() {
    return {
      list: null,
      listLoading: true,
      downloadLoading: false,
      filename: '',
      autoWidth: true,
      bookType: 'xlsx',
      DeptList:  [
            {
                "regionid": 1,
                "deptname": "执行局",
                "fullname": "执行局",
                "id": 2,
                "regionname": "执行局",
                "hasChildren": true
            },
            {
                "regionid": 4,
                "deptname": "　┝　民一庭",
                "fullname": "执行局 > 民一庭",
                "id": 14,
                "regionname": "民一庭"
            },
            {
                "regionid": 3,
                "deptname": "　┝　本人",
                "fullname": "执行局 > 本人",
                "id": 13,
                "regionname": "本人"
            }
        ],
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: undefined,
        regionid: 4,
        startdate:parseTime(new Date().getTime()- 3*24 * 60 * 60 * 1000, '{y}-{m}-{d}'),
        enddate:parseTime(new Date().getTime(), '{y}-{m}-{d}'),
        isvoid: '0'
      },
    }
  },
  created() {
/*    postdata('/dept/tree', {}).then((res) => {
      this.DeptList = res.data.list
    }), */

    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Dayschange(this.listQuery).then(response => {
        console.log(response.data)
        this.list = response.data.data.items
        this.listLoading = false
      })
      this.listLoading = false

    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [ '日期','区县',   'SO2', 'NO2', 'PM10',  'CO', 'O3-8h','PM2.5','AQI']
        const filterVal = [ 'monitortime','regionname','so2', 'no2', 'pm10', 'co', 'o3', 'pm25',  'aqi']
        const list = this.list
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: this.autoWidth,
          bookType: this.bookType
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
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 30px;
}
</style>
