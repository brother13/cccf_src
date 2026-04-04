<template>
  <div class="card-panel" @click="jumptoLink">
    <div class="card-panel-icon-wrapper icon-people">
      <svg-icon :icon-class="icon" class-name="card-panel-icon" />
    </div>
    <div class="card-panel-description">
      <div class="card-panel-text">{{ cardname }}</div>
      <template><count-to :start-val="0" :end-val="num" :duration="duration" class="card-panel-num" />{{ numunit }}</template><br>
      <template v-if="showmoney"><count-to :start-val="0" :end-val="money" :duration="duration" class="card-panel-num" />{{ moneyunit }}</template>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
// import router from '@/router'
export default {
  components: {
    CountTo
  },
  props: {
    link: {
      type: String,
      default: '/dashboard'
    },
    code: {
      type: String,
      default: ''
    },

    icon: {
      type: String,
      default: 'peoples'
    },
    cardname: {
      type: String,
      default: '标签'
    },
    num: {
      type: Number,
      default: 0
    },
    dsr: {
      type: Number,
      default: 0
    },
    money: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 3000
    },
    showmoney: {
      type: Boolean,
      default: true
    },
    numunit: {
      type: String,
      default: '个'
    },
    moneyunit: {
      type: String,
      default: '元'
    }
  },
  methods: {

    jumptoLink() {
      // alert(link)
      // router.push({ path: link })

      this.$emit('clicklink', this.code)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      text-align: right;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
        text-align: right;
      }

      .card-panel-num {
        font-size: 16px;
        text-align: right;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
