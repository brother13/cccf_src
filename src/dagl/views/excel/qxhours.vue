<template>
  <div class="app-container">

    <div>
      {{ tips}}
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
      <el-table-column label="区县">
        <template slot-scope="scope">
          {{ scope.row.regionname }}
        </template>
      </el-table-column>
      <el-table-column label="站点" align="center">
        <template slot-scope="scope">
          {{ scope.row.pointname }}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          {{ scope.row.itype }}
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.monitortime }}
        </template>
      </el-table-column>
      <el-table-column label="aqi" align="center">
        <template slot-scope="scope">
          {{ scope.row.aqi }}
        </template>
      </el-table-column>
      <el-table-column label="co" align="center">
        <template slot-scope="scope">
          {{ scope.row.co }}
        </template>
      </el-table-column>
      <el-table-column label="so2" align="center">
        <template slot-scope="scope">
          {{ scope.row.so2 }}
        </template>
      </el-table-column>
      <el-table-column label="no2" align="center">
        <template slot-scope="scope">
          {{ scope.row.no2 }}
        </template>
      </el-table-column>
      <el-table-column label="pm10" align="center">
        <template slot-scope="scope">
          {{ scope.row.pm10 }}
        </template>
      </el-table-column>
      <el-table-column label="pm25" align="center">
        <template slot-scope="scope">
          {{ scope.row.pm25 }}
        </template>
      </el-table-column>
        <el-table-column label="o3" align="center">
          <template slot-scope="scope">
            {{ scope.row.o3 }}
          </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { Qxhours } from '@/dagl/api/common'
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
      tips:'',
      bookType: 'xlsx'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Qxhours().then(response => {
        console.log(response.data)
        this.list = response.data.data.items
        this.tips=response.data.data.tips
        this.listLoading = false
      })

    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ["序号",'区县', '站点名称', '类型','日期', 'aqi', 'co', 'so2', 'no2', 'pm10', 'pm25', 'o3']
        const filterVal = ["id",'regionname', 'pointname', 'itype','monitortime', 'aqi', 'co', 'so2', 'no2', 'pm10', 'pm25', 'o3']
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
