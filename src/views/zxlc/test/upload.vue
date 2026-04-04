<template>
  <div class="app-container">

    <el-upload
      class="upload-demo"
      drag
      action="/dev-api/file/upload"
      multiple
      show-file-list
      :on-success="upload_success "
      :on-error="upload_error"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将工资文件（Excel）拖到此处，或<em>点击上传</em></div>

    </el-upload>

  </div>
</template>

<script>

export default {
  name: 'TestUpload',

  data() {
    return {
      filelist: []
    }
  },
  created() {

  },
  methods: {
    upload_success(response, file, fileList) {
      this.$message({
        message: '文件 ' + file.name + ' 上传成功！',
        type: 'success'
      })
    },
    upload_error(err, file, fileList) {
      this.$message.error('出现错误：' + err)
    }
  }
}
</script>
