<template>
  <div class="app-container" v-loading="listLoading">
    <div>日期:

      <el-date-picker v-model="listQuery.startdate" type="date" placeholder="日报日期" value-format="yyyy-MM-dd"
        @change="getList" />
      <el-button  type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>

    </div>

    <DIV>
      <div style="margin:20px 20px 5px 20px">
        {{list.monitortime}} {{list.pointname}}AQI为{{list.aqi}}，空气质量为{{list.aqilevelstate}}，
        {{list.primpollute}}；{{list.dayup}}
      </div>
      <div style="margin:0 0 5px 20px">
        今年空气质量优良天数累计{{list.okdays}}天，比去年同期相比{{list.okdaystips}}天，优良天数率为{{list.okpercentage}}%；
      </div>
      <div style="margin:0 0 5px 20px">
        空气质量排名在全市重点控制区排名第{{list.okpm}}位{{list.pmbl}}，在全市排名第{{list.okpm2}}位{{list.pmbl2}}；
      </div>
      <div style="margin:0 0 5px 20px">
        PM2.5平均浓度{{list.avgpm25}}μg/m3，同比{{list.avgpm25up}}μg/m3。
      </div>
    </DIV>


  </div>
</template>

<script>
  import {
    DayAqicount
  } from '@/dagl/api/common'
  import {
    postdata
  } from '@/dagl/api/common'
  export default {
    name: '日报数据',
    data() {
      return {
        tmp: {
          "regionname": "长寿区",
          "pointname": "长寿区",
          "monitortime": "暂无数据",
          "aqi": "-",
          "co": "-",
          "so2": "-",
          "no2": "-",
          "pm10": "-",
          "pm25": "-",
          "o3": "-",
          "inserttime": "-",
          "aqilevelstate": "-",
          "primpollute": "-",
          "okdays": '-',
          "okpercentage": "-",
          "dayup": "-",
          "okdaystips": "-",
          "avgpm25": "-",
          "avgpm25up": "-",
          "okpm": '-',
          "okpm2": '-',
          "pmbl": "-",
          "pmbl2": "-"
        },
        list: {},
        listQuery: {
          page: 1,
          pagesize: 10,
          startdate: '',
          endtime: ''

        }

      }
    },
    created() {
      this.listQuery.page = 1
      this.getList()
    },
    methods: {
      fetchData() {
        this.listLoading = true
        DayAqicount().then(response => {
          console.log(response.data)
          this.list = response.data.data
          this.listLoading = false
        })

      },
      getList() {
        try {
          this.listLoading = true
          postdata('/data/dayaqicount', this.listQuery).then((response) => {
            if (response.data.data != null) {
              this.list = response.data.data
            } else {
              this.list = this.tmp
            }

            this.listLoading = false
          })
        } catch (e) {
          this.list = this.tmp
          this.listLoading = false

        }
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
    }
  }
</script>
