<template>
  <div>
    <vue-img-cropper ref="cropper"
      :maxSize="1024"
      :height="500"
      :width="500"
      @cutImg="cutImg"
      @oversize="oversize"
    >
      <div class="btn">Select Image</div>
    </vue-img-cropper>

    <img class="result-img" v-if="result" ref="img" :src="result" alt="">
  </div>
</template>

<script>
  import VueImgCropper from '../dist/index'
  export default {
    data() {
      return {
        result: null
      }
    },
    components: {
      VueImgCropper
    },
    created() {

    },
    methods: {
      chooseImg() {
        this.$refs.cropper.getImg()
      },
      cutImg(data) {
        this.result = data
      },
      oversize({ fileSize, maxSize }) {
        alert(`图片体积不能超过${maxSize}，目前体积为${fileSize}`)
      }
    }
  }
</script>

<style lang="less">
  html, body {
    font-size: 12px;
    padding: 0 !important;
    margin: 0 !important;
  }

  .btn {
    display: inline-block;
    margin: 10px;
    padding: 10px;
    text-align: center;
    color: #333;
    border: 1px solid #333;
  }

  .result-img {
    width: 96%;
    margin: 10px 2%;
    border: 1px solid #ccc;
  }
</style>
