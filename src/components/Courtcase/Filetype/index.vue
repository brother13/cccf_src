<template>
  <div v-bind="$attrs" v-on="$listeners">
    <el-image :src="FileTypeImage" class="filetype-image" /><span><slot /></span>
  </div>
</template>

<script>
const typeList = []
const path = '../assets/images/filetype/'
typeList.push({ ext: ['png', 'jpeg', 'jpg', 'bmp'], type: 'image' })
typeList.push({ ext: ['doc', 'docx'], type: 'word' })
typeList.push({ ext: ['ppt', 'pptx'], type: 'ppt' })
typeList.push({ ext: ['xls', 'xlsx'], type: 'excel' })
typeList.push({ ext: ['rar', 'zip', 'cab', '7z'], type: 'zip' })
typeList.push({ ext: ['mp3', 'wav', 'wma'], type: 'audio' })
typeList.push({ ext: ['mp4', 'rm', 'rmvb', 'wmv', 'avi'], type: 'video' })
typeList.push({ ext: ['js', 'php', 'asp', 'cpp', 'cs'], type: 'code' })

const exts = ['pdf', 'gif', 'wps', 'exe', 'txt', 'zip']
for (var i = 0; i < exts.length; i++) {
  typeList.push({ ext: [exts[i]], type: exts[i] })
}

const unknow = 'unknown'

// 加载所有的
export default {
  name: 'FileType',
  props: {
    filetype: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      typeList: typeList
    }
  },
  computed: {
    FileTypeImage: {
      get() {
        const ext = this.filetype.toLowerCase()
        let file = unknow
        for (var i = 0; i < this.typeList.length; i++) {
          const row = this.typeList[i]
          const exts = row['ext']
          if (exts.indexOf(ext) > -1) {
            file = row['type']
            break
          }
        }

        const filepath = path + 'filetype-' + file + '.png'
        return filepath
      }

    }
  },
  mounted() {},
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.filetype-image {
  width: 20px;
  height: 20px;
}
</style>
