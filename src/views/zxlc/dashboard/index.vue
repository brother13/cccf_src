<template>
  <div class="dashboard-container">
    <div class="website">不明款项匹配辅助系统</div>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {

  }
}
</script>
<style>
.website{
  font-size: 72px;
  width:100%;
  height:100px;
  line-height: 100px;
  padding:40px;
  text-align: center;
  
}
</style>