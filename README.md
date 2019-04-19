# vue-img-cropper 基于Vue的移动端图片裁剪组件

### 作者
 - name: xianglei
 - phone: 15067180409
 - email: 1046132177@qq.com

## 安装
```bash
npm install vue-img-cropper -S
```

## 使用举例
```html
<vue-img-cropper
  ref="cropper"
  :height="800"
  :width="800"
  @cutImg="showCutImg"
>
  <div class="cut-btn">图片裁剪</div>
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
      this.base64Data = data // 把数据赋值到 img 元素的 src 属性

      // 也可以在这里做一些图片上传等其他处理...
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
### v1.3.0
* 删除 `exif-js` 依赖
* 增加属性：`maxSize`
* 增加事件：`oversize`
