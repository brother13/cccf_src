<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'
// const wk1 = require('@/dagl/api/wk')

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
      // currentRole: 'editorDashboard'

    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    // const wk=new common()
    // const ret=wk.common.util.md5('0000000000000000000000000000000000000')

    // console.log($.api1('086601d7aa2946f78c5b369a714e53b4'))

  }
}
</script>
