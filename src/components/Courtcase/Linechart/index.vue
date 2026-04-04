<template>
  <div
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      ref="echart"
      class="echart"
    />
  </div>
</template>

<script>
// import webapi from "@/api"

// 加载所有的
export default {
  name: 'Linechart',
  components: {},
  props: {
    id: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: function() {
        return {}
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      objChart: null

    }
  },
  watch: {
    data(val) {
      this.myChart(val)
    }
  },

  mounted() {
    this.init()
  },
  methods: {
    init() {
      // let obj = this.$refs.echart

      // console.log("Linechart", this.id, obj)
      this.myChart(this.data)
    },

    myChart(option) {
      if (!option) {
        return
      }

      var echarts = require('echarts')
      const obj = this.$refs.echart
      // obj.innerHTML = ""; //  先清空！

      this.objChart = echarts.init(obj)
      this.objChart.setOption(option)
      window.addEventListener('resize', function() {
        if (this.objChart) {
          this.objChart.resize()
        }
      })
    },

    reDraw() {
      if (this.objChart) {
        this.objChart.resize()
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.echart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
