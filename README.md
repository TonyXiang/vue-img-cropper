# vue-img-cropper ---基于Vue的移动端图片裁剪组件

### 作者
 - name: xianglei
 - phone: 15067180409
 - email: 1046132177@qq.com

## 依赖
```shell
npm install exif-js -S
```

## 安装
```shell
npm install vue-img-cropper -S
```

## 使用举例
```js
import VueImgCropper from "./vue-img-cropper"
```
```html
<vue-img-cropper
    ref="cropper"
    :height="800"
    :width="800"
    :maxScale="3"
    :compressionRatio="0.8"
    @cutImg="showCutImg"
    @showLoading="showLoading"
    @hideLoaing="hideLoading"
    @showError="showError"
>
    <div class="cut-btn">图片裁剪</div>
</vue-img-cropper>
```

```js
// 也可以调用组件的 getImg 方法来打开相册／相机
this.$refs.cropper.getImg()
```

## 参数
 - height：（Number） 裁剪后图片的高度（单位px） 默认值：500
 - width：（Number） 裁剪后图片的宽度（单位px） 默认值：500
 - maxScale： （Number） 图片发最大的放大倍数    默认值：4
 - compressionRatio：（Number）图片压缩比例（0～1） 默认值：0.92
 - footerHeight：（Number）底部按钮的高度（单位px）

## 事件
 - cutImg：回调参数-base64格式的图片数据 ；确认裁剪时触发
 - showLoading：加载时触发
 - hideLoading：加载完成后触发
 - showError：回调参数-String格式的异常信息；发生异常时触发

## 方法
 - getImg：打开相册／相机

## slot
 触发图片选择事件的按钮
