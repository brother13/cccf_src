<template>
  <div v-bind="$attrs" v-on="$listeners">
    <el-image :src="selectVal" class="icon-image" /><span><slot /></span>
  </div>
</template>

<script>
const iconList = []
const path = './assets/images/appicon/'
// for (var i = 1; i <= 12; i++) {
//   const file = path + "cate" + i + ".png";
//   const newicon = { icon: file, text: "icon"+i };
//   iconList.push(newicon);
// }
// 加载所有的
export default {
  name: 'IconSelect',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      iconList: iconList
    }
  },
  computed: {
    selectVal: {
      get() {
        return path + this.src + '.png'
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.icon-image {
  width: 20px;
  height: 20px;
}
</style>
