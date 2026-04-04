<template>
  <div v-bind="$attrs" v-on="$listeners">
    <el-row>
      <el-col :span="2" v-if="value">
        <LinkIcon :src="value"></LinkIcon>
        <!-- <el-image :src="value" class="icon-image"></el-image> -->
      </el-col>
      <el-col :span="22">
        <el-select
          ref="iconSelect"
          v-model="selectVal"
          class="icon-select"
          style="width: 70%"
        >
          <el-option
            v-for="(item, index) in iconList"
            :key="index"
            :label="item.text"
            :value="item.icon"
          >
            <span style="float: left">
              <LinkIcon :src="item.icon"></LinkIcon>
              <!-- <el-image :src="item.icon" class="icon-image"></el-image> -->
            </span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{
              item.icon
            }}</span>
          </el-option>
        </el-select>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LinkIcon from '../LinkIcon';

let iconList = [];
const path = "./assets/images/appicon/";
for (var i = 1; i <= 12; i++) {
  const file = path + "icon" + i + ".png";
  const newicon = { icon: 'icon'+i,file:file };
  iconList.push(newicon);
}
// 加载所有的
export default {
  name: "IconSelect",
  components: { LinkIcon },
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      iconList: iconList,
    };
  },
  computed: {
    selectVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.icon-image {
  width: 20px;
  height: 20px;
}
</style>
