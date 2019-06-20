# vue-img-cropper
> 基于Vue2.0的移动端图片裁剪组件

## Demo
[![Edit Vue Template](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vue-template-s5f1o?fontsize=14)

## Install
```bash
npm install vue-img-cropper -S
```

## Example
```html
<vue-img-cropper
  ref="cropper"
  :height="800"
  :width="800"
  @cutImg="handleCutImg"
>
  <div class="cut-btn">Confirm</div>
</vue-img-cropper>

<img v-if="base64Data"
  ref="img"
  :src="base64Data">
```

```js
import VueImgCropper from "vue-img-cropper"
Vue.component(VueImgCropper.name, VueImgCropper)

export default {
  data() {
    ...
    base64Data: null,
    ...
  }
  methods: {
    ...
    handleCutImg(data) {
      this.base64Data = data

      // or do other things such as upload
      const formData = new FormData()
      const binary = atob(data.split(',')[1])
      const fileType = data.split(';')[0].split(':')[1]
      const array = []
      for (let i = 0; i < binary.length; i += 1) {
        array.push(binary.charCodeAt(i))
      }
      formData.append('file', new Blob([new Uint8Array(array)], { type: fileType }))
      ...
    },
    ...
  }
}
```

点击 `<div class="cut-btn">图片裁剪</div>` 会打开相册／相机；也可以调用组件的 `getImg` 方法来打开相册／相机
```js
this.$refs.cropper.getImg()
```

## Attribute
| 参数| 说明 | 类型 | 默认值 |
| --- | --- | --- |  --- |
| height | 可选，裁剪后图片的高度（单位px） | `Number` | 500 |
| width | 可选，裁剪后图片的宽度（单位px） | `Number` | 500 |
| maxSize | 可选，图片最大尺寸(单位：b) | `Number` | Number.MAX_VALUE |
| maxScale | 可选，图片最大的放大倍数 | `Number` | 4 |
| compressionRatio | 可选，图片压缩比例，范围为：0～1 | `Number` | 0.92 |
| footerHeight | 可选，裁剪页面底部栏的高度（单位px） | `Number` | window.innerWidth * 0.1375 |
| confirmBtnText | 可选，底部栏确认按钮文案 | `String` | '选取' |
| cancelBtnText | 可选，底部栏取消按钮文案 | `String` | '取消' |

## Event
| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| cutImg | 确认裁剪时触发 | base64格式的图片数据 |
| oversize | 图片体积超过`maxSize`时触发 | Object: { fileSize, maxSize } ；(fileSize、maxSize为 `Number` 类型的数据，单位：b) |
| showLoading | 加载时触发 | -- |
| hideLoading | 加载完成后触发 | -- |
| showError | showError | -- |

## Slot
| 名称 | 说明 |
| --- | --- |
| （默认） | 触发打开相机/相册的按钮 |

## 更新日志
### v1.4.0
* 增加属性：`confirmBtnText`、`confirmBtnText`
* 优化文档，增加 Demo 链接

### v1.3.0
* 删除 `exif-js` 依赖
* 增加属性：`maxSize`
* 增加事件：`oversize`
