<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <div class="courtcase-countinfo">
      当前记录数
      <el-tag> {{ countinfo.num }} </el-tag>
      笔，共计
      <el-tag>{{
        formatNumber(countinfo.je)
      }}</el-tag>
      元
    </div>
  </div>
</template>

<script>
/**
 * 显示列表的金额统计
 */
import caseapi from '@/courtcase/api'

export default {
  name: 'CaseListCount',
  components: { },

  props: {
    typeid: {
      type: Number,
      default: 101
    },
    count: {
      type: Object,
      default: function() {
        return {
          num: 0,
          je: 0,
          ye: 0
        }
      }

    }
  },
  data() {
    return {
      countinfo: {
        num: 0,
        je: 0,
        ye: 0
      }

    }
  },
  computed: {},
  watch: {
    count(newval) {
      this.countinfo = newval
    }
  },

  mounted() {
    this.countinfo = this.count
  },
  methods: {

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    }

  }
}
</script>

<style >
.courtcase-countinfo{
  margin-left:10pt;
  margin-top:10px;
}

</style>
