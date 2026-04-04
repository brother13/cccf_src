<template>
  <div v-if="editMode">
    <el-date-picker
      v-bind="$attrs"
      :value="value"
      value-format="yyyy-MM-dd"
      v-on="inputListeners"
    />
  </div>
  <div v-else>
    <span>{{ value }}</span><i v-if="canEdit" class="el-icon-edit" @click="changeToEdit" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

const AUTH_CANEDIT = 'EDITBILLDATE'
export default {
  name: 'Operdate',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number],
      default: null,
      desc: '数值'
    }
  },
  data: () => {
    return {
      editMode: false, // 是否处于编辑状态
      canEdit: false // 是否允许编辑
    }
  },
  computed: {
    ...mapGetters(['roles']),

    inputListeners: function() {
      var vm = this
      try{
        this.editMode = false;
      }catch(e){
        console.log("set editMode false error",e)
      }
      

      // `Object.assign` 将所有的对象合并为一个新对象
      return Object.assign(
        {},
        // 我们从父级添加所有的监听器
        this.$listeners,
        // // 然后我们添加自定义监听器，
        // // 或覆写一些监听器的行为
        {
          // 这里确保组件配合 `v-model` 的工作
          input: function(event) {
            vm.$emit('input', event)
          }
        }
      )
    }
  },
  watch: {},
  created() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      this.canEdit = this.roles.includes(AUTH_CANEDIT)
    },
    changeToEdit() {
      if (this.canEdit) {
        this.editMode = true
      }
    }
  }
}
</script>
