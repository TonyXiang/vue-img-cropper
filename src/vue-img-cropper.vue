<template>
  <div class="vue-img-cropper">
    <canvas ref="canvas" class="page-canvas" :height="height" :width="width"></canvas>
    <form ref="fileForm" hidden>
      <input ref="fileInput" type="file" accept="image/*" hidden="hidden" @change="changeFun">
    </form>
    <div @click="getImg">
      <slot></slot>
    </div>

    <div v-show="show" class="img-page" :style="{height: nativeWindowHeight + 'px', width: windowWidth + 'px'}">
      <div class="page-body" :style="{height: windowHeight + 'px'}">

        <img ref="img" class="main-img" :width="startWidth" :height="startHeight" :style="{
 top: imgTop + 'px',
 left: imgLeft + 'px',
 transition: 'transform ' + duration + 's ' + timingFunction,
 transform: 'translateX(' + dx + 'px) translateY(' + dy + 'px) translateZ(0) scale(' + scale + ')',

 }">

        <div class="img-mask top" @touchmove="maskToucmove" :style="{height: maskHeight + 'px'}"></div>
        <div class="img-mask bottom" @touchmove="maskToucmove" :style="{height: maskHeight + 'px'}"></div>
        <div class="img-mask left" @touchmove="maskToucmove" :style="{width: maskWidth + 'px'}"></div>
        <div class="img-mask right" @touchmove="maskToucmove" :style="{width: maskWidth + 'px'}"></div>

        <div ref="box" class="cut-box" @wheel="mouseWheel" @touchstart="touchstart" @touchmove="touchmove"
             @touchend="touchend"
             :style="{
           height: boxHeight + 'px',
           width: boxWidth + 'px',
           top: boxTop + 'px',
           left: boxLeft + 'px',
           }"
        ></div>
      </div>
      <div class="page-footer" :style="{height: footerHeight + 'px', 'line-height':footerHeight + 'px',}">
        <div class="page-footer-btn" @click="hidePage">取消</div>
        <div class="page-footer-btn" @click="cutImg">选取</div>
      </div>

    </div>
  </div>

</template>
<script type="text/javascript">
    import EXIF from 'exif-js';

    export default{
        name: 'vue-img-cropper',
        props: {
            width: {
                type: Number,
                default: 500
            },
            height: {
                type: Number,
                default: 500
            },
            maxScale: {
                type: Number,
                default: 4
            },
            footerHeight: {
                type: Number,
                default: window.innerWidth / 6.4 * .88
            },
            compressionRatio: {
                type: Number,
                default: .92
            },
        },
        data(){
            return {

                show: false,

                //是否有touch事件
                touch: false,

                //touchmove时的时间
                touchmoveTime: 0,

                //裁剪后图片的高宽比 高度/宽度
                ratio: 1,

                nativeWindowHeight: window.innerHeight,

                windowHeight: window.innerHeight - this.$props.footerHeight,
                windowWidth: window.innerWidth,

                //单个手指滑动时的触摸点坐标
                singlePoint: null,

                //单个手指滑动速度
                speedX: 0,
                speedY: 0,

                //图片缩放系数
                scale: 1,

                //多个手指滑动时，两个手指的距离
                d: 0,

                //图片的translateX， translateY
                dx: 0,
                dy: 0,

                //裁剪框宽高、边距
                boxWidth: 0,
                boxHeight: 0,
                boxTop: 0,
                boxLeft: 0,

                //原始图片的宽高
                naturalWidth: 0,
                naturalHeight: 0,

                //图片显示宽高、边距、格式
                startWidth: 0,
                startHeight: 0,
                imgTop: 0,
                imgLeft: 0,
                fileType: '',

                //图片缩放范围
                minScale: 1,

                //遮罩的宽高
                maskWidth: 0,
                maskHeight: 0,

                info: '',

                //动画参数
                duration: 0,
                timingFunction: 'ease-in-out',

                //缓动时间
                easingTime: 2000,
                ouOfRangeEasing: 300,

                //剩余时间
                remainingTime: 0,

            }
        },
        methods: {
            getImg() {
                this.$refs.fileInput.click()
            },
            showLoading(){
                console.log('showLoading...')
                this.$emit('showLoading');
            },
            hideLoading(){
                console.log('hideLoading...')
                this.$emit('hideLoading');
            },
            changeFun(e){
                let self = this;
                let input = e.target;
                let file = input.files[0];

                self.fileType = file.type;
//                let fileSize = file.size;

                if (!/image\/\w+/.test(file.type)) {
                    this.$emit('showError', '文件必须为图片！')
                    return false;
                }

                this.showLoading();

                if (typeof FileReader === 'undefined') {
                    this.hideLoading();
                    this.$emit('showError', '抱歉，你的浏览器不支持 FileReader')
                    return;
                }

                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    let imgData = this.result;

                    /**获取图片信息*/
                    EXIF.getData(file, function () {
                        EXIF.getAllTags(this);
                        //获取图片的拍摄角度
                        let orientation = EXIF.getTag(this, 'Orientation');
//                        alert(orientation);

                        let firstImg = new Image();

                        firstImg.onload = function () {
                            let degree = 0,
                                drawWidth,
                                drawHeight,
                                width,
                                height;

                            drawWidth = this.naturalWidth;
                            drawHeight = this.naturalHeight;

                            let canvas = document.createElement('canvas');
                            canvas.width = width = drawWidth;
                            canvas.height = height = drawHeight;
                            let context = canvas.getContext('2d');
                            //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
                            switch (orientation) {
                                //iphone横屏拍摄，此时home键在左侧
                                case 3:
                                    degree = 180;
                                    drawWidth = -width;
                                    drawHeight = -height;
                                    break;
                                //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
                                case 6:
                                    canvas.width = height;
                                    canvas.height = width;
                                    degree = 90;
                                    drawWidth = width;
                                    drawHeight = -height;
                                    break;
                                //iphone竖屏拍摄，此时home键在上方
                                case 8:
                                    canvas.width = height;
                                    canvas.height = width;
                                    degree = 270;
                                    drawWidth = -width;
                                    drawHeight = height;
                                    break;
                            }

                            context.rotate(degree * Math.PI / 180);
                            context.drawImage(this, 0, 0, drawWidth, drawHeight);

                            let image = new Image();
                            image.onload = function () {

                                //图片原始宽高
                                let naturalWidth = this.naturalWidth;
                                let naturalHeight = this.naturalHeight;
                                self.naturalWidth = this.naturalWidth;
                                self.naturalHeight = this.naturalHeight;

                                let img = self.$refs.img;

                                if (self.windowHeight / self.windowWidth >= self.height / self.width) {
                                    self.startWidth = self.windowWidth;
                                    self.startHeight = naturalHeight / naturalWidth * self.windowWidth;
                                    self.imgTop = (self.windowHeight - self.startHeight) / 2;
                                    self.imgLeft = 0;

                                    self.boxWidth = self.startWidth;
                                    self.boxHeight = self.boxWidth * self.ratio;
                                    self.boxTop = (self.windowHeight - self.boxHeight) / 2;
                                    self.boxLeft = 0;

                                    self.maskHeight = (self.windowHeight - self.boxHeight) / 2;
                                    self.maskWidth = 0;
                                } else {

                                    self.startHeight = self.windowHeight;
                                    self.startWidth = naturalWidth / naturalHeight * self.windowHeight;
                                    self.imgLeft = (self.windowWidth - self.startWidth) / 2;
                                    self.imgTop = 0;

                                    self.boxHeight = self.startHeight;
                                    self.boxWidth = self.boxHeight / self.ratio;
                                    self.boxLeft = (self.windowWidth - self.boxWidth) / 2;
                                    self.boxTop = 0;

                                }

                                img.setAttribute('src', image.src);

                                self.scale = 1;
                                self.dx = 0;
                                self.dy = 0;
                                self.hideLoading();
                                self.show = true;
                            }
                            image.src = canvas.toDataURL(self.fileType);
                        }
                        firstImg.src = imgData;

                    });
                };
            },
            hidePage: function () {
                this.$parent.showImgPage = false;
                this.show = false;
                this.cleanInput();
            },
            touchstart: function (e) {
                this.touch = true;
            },
            mouseWheel: function (e) {
                let d = 0.1;
                if (e.deltaY > 0) {
                    if (this.scale < this.minScale) {
                        d = d / 3;
                    }
                    this.scale = this.scale - d;
                } else {
                    if (this.scale > this.maxScale) {
                        d = d / 3;
                    }
                    this.scale = this.scale + d;
                }
                setTimeout(() => {
                    this.resetImg();
                }, 0)
            },
            touchmove: function (e) {
                this.touch = true;
                e.preventDefault();

                if (e.targetTouches.length >= 2 || e.touches.length >= 2) {
                    let p1 = '';
                    let p2 = '';

                    let position1 = [];
                    let position2 = [];

                    if (e.targetTouches.length >= 2) {
                        p1 = e.targetTouches[0];
                        position1 = [p1.pageX, p1.pageY];

                        p2 = e.targetTouches[1];
                        position2 = [p2.pageX, p2.pageY];
                    } else {
                        p1 = e.touches[0];
                        position1 = [p1.pageX, p1.pageY];

                        p2 = e.touches[1];
                        position2 = [p2.pageX, p2.pageY];
                    }

                    //根据 a*a + b*b = c*c 计算出两个触摸点的距离（勾股定理）
                    var d1 = Math.sqrt((position1[0] - position2[0]) * (position1[0] - position2[0]) + (position1[1] - position2[1]) * (position1[1] - position2[1]));

                    if (this.d === 0) { //当两个触摸点的距离为0时
                        this.d = d1;
                        return;
                    }

                    let d = (d1 - this.d) / this.d;
                    if ((this.scale > this.maxScale && d > 0) || (this.scale < .8 && d < 0)) {
                        d = d / 3;
                    }

                    this.scale = this.scale + d;
                    this.d = d1;

                } else if (e.targetTouches.length === 1) {
                    let p = e.targetTouches[0],
                        nowPoint = {
                            x: p.pageX,
                            y: p.pageY
                        };
                    let time = Date.now();
                    if (!this.singlePoint) {
                        this.singlePoint = nowPoint;
                        this.speedX = 0;
                        this.speedY = 0;
                        this.touchmoveTime = time;
                        return;
                    }

                    let dx = this.dx + nowPoint.x - this.singlePoint.x;
                    let dy = this.dy + nowPoint.y - this.singlePoint.y;

                    let dTime = time - this.touchmoveTime;

                    this.speedX = (nowPoint.x - this.singlePoint.x) / dTime;
                    this.speedY = (nowPoint.y - this.singlePoint.y) / dTime;


                    let range = this.getRange();

                    if (dx > range.maxDx || dx < range.minDx) {
                        this.dx += (nowPoint.x - this.singlePoint.x) / 3;
                    } else {
                        this.dx += nowPoint.x - this.singlePoint.x;
                    }

                    if (dy > range.maxDy || dy < range.minDy) {
                        this.dy += (nowPoint.y - this.singlePoint.y) / 3;
                    } else {
                        this.dy += nowPoint.y - this.singlePoint.y;
                    }

                    this.touchmoveTime = Date.now();
                    this.singlePoint = nowPoint;
                }
            },
            touchend: function () {
                this.touch = false;

                this.d = 0;
                this.singlePoint = null;
                this.inertiaMoving();
            },
            inertiaMoving: function () {

                let time = Date.now();
                let allStopTime = this.easingTime;
                let range = this.getRange();

                if ((this.dx < range.minDx || this.dx > range.maxDx) || (this.dy < range.minDy || this.dy > range.maxDy)) {
                    this.speedX = 0;
                    this.speedY = 0;
                    this.resetImg();
                } else if (time - this.touchmoveTime > 40 || (Math.abs(this.speedX) < .2 && Math.abs(this.speedY) < .2)) {
                    this.speedX = 0;
                    this.speedY = 0;
                    this.resetImg();
                } else {
                    let ax = -this.speedX / this.easingTime;
                    let ay = -this.speedY / this.easingTime;
                    let startX = this.dx;
                    let startY = this.dy;

                    let raf = window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback) {
                            window.setTimeout(callback, 1000 / 60);
                        };

                    let endTimeX = 0;
                    let endTimeY = 0;
                    let startx2 = 0;
                    let starty2 = 0;
                    let ax2 = 0;
                    let ay2 = 0;
                    let vx2 = 0;
                    let vy2 = 0;

                    let step = () => {
                        let nowTime = Date.now();
                        let dTime = nowTime - time;

                        if (this.touch) {
                            return;
                        }

                        if (dTime <= allStopTime) {
                            let moveX = this.speedX * dTime + 0.5 * ax * dTime * dTime;
                            let moveY = this.speedY * dTime + 0.5 * ay * dTime * dTime;

                            let dx = startX + moveX / 2;
                            let dy = startY + moveY / 2;

                            if (endTimeX !== 0) {
                                if (dTime <= endTimeX) {
                                    let t = dTime - endTimeX + this.ouOfRangeEasing;
                                    this.dx = startx2 + (vx2 * t + ax2 * t * t);
                                } else {
                                    this.dx = startx2;
                                }
                            } else if (endTimeX === 0) {
                                let letfXTime = this.easingTime - dTime;

                                if (dx > range.maxDx || dx < range.minDx) {
                                    startx2 = dx > range.maxDx ? range.maxDx : range.minDx;
                                    vx2 = -ax * letfXTime / 2;
                                    ax2 = -vx2 / (this.ouOfRangeEasing);

                                    endTimeX = dTime + this.ouOfRangeEasing;
                                    allStopTime = endTimeX > allStopTime ? endTimeX : allStopTime;
                                }
                                this.dx = dx;
                            }

                            if (endTimeY !== 0) {
                                if (dTime <= endTimeY) {
                                    let t = dTime - endTimeY + this.ouOfRangeEasing;
                                    this.dy = starty2 + (vy2 * t + ay2 * t * t);
                                } else {
                                    this.dy = starty2;
                                }
                            } else if (endTimeY === 0) {
                                let letfYTime = this.easingTime - dTime;

                                if (dy > range.maxDy || dy < range.minDy) {
                                    starty2 = dy > range.maxDy ? range.maxDy : range.minDy;
                                    vy2 = -ay * letfYTime / 2;
                                    ay2 = -vy2 / (this.ouOfRangeEasing);

                                    endTimeY = dTime + this.ouOfRangeEasing;
                                    allStopTime = endTimeY > allStopTime ? endTimeY : allStopTime;
                                }
                                this.dy = dy;
                            }
                            raf(step);
                        }
                    }
                    step();
                }
            },
            resetImg: function () {

                let range = this.getRange();

                let ax = 0;
                let ay = 0;

                let startX = this.dx;
                let startY = this.dy;
                let startScale = this.scale;

                let startSpeedX = 0;
                let startSpeedY = 0;
                let startSpeedScale = 0;

                let moveAllX = 0;
                let moveAllY = 0;
                let changedScale = 0;

                if (this.dx < range.minDx) {
                    moveAllX = range.minDx - this.dx;
                } else if (this.dx > range.maxDx) {
                    moveAllX = range.maxDx - this.dx;
                }

                if (this.dy < range.minDy) {
                    moveAllY = range.minDy - this.dy;
                } else if (this.dy > range.maxDy) {
                    moveAllY = range.maxDy - this.dy;
                }

                if (this.scale < this.minScale) {
                    changedScale = this.minScale - this.scale;
                } else if (this.scale > this.maxScale) {
                    changedScale = this.maxScale - this.scale;
                }

                if (moveAllX === 0 && moveAllY === 0 && changedScale === 0) {
                    return;
                }

                ax = -2 * moveAllX / (this.ouOfRangeEasing * this.ouOfRangeEasing);
                startSpeedX = -ax * this.ouOfRangeEasing;

                ay = -2 * moveAllY / (this.ouOfRangeEasing * this.ouOfRangeEasing);
                startSpeedY = -ay * this.ouOfRangeEasing;

                startSpeedScale = changedScale / this.ouOfRangeEasing;

                let raf = window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                        window.setTimeout(callback, 1000 / 60);
                    };

                let time = Date.now();

                let step = () => {
                    let nowTime = Date.now();
                    let dTime = nowTime - time;

                    if (this.touch) {
                        return;
                    }

                    if (dTime <= this.ouOfRangeEasing) {

                        let moveX = startSpeedX * dTime + 0.5 * ax * dTime * dTime;
                        let moveY = startSpeedY * dTime + 0.5 * ay * dTime * dTime;
                        let moveScale = startSpeedScale * dTime;

                        this.dx = startX + moveX;
                        this.dy = startY + moveY;
                        this.scale = startScale + moveScale;
                        raf(step);
                    } else {
                        this.dx = startX + moveAllX;
                        this.dy = startY + moveAllY;
                        this.scale = startScale + changedScale;
                    }
                }
                step();

            },
            getRange: function () {
                let minScale = this.scale;
                let maxScale = this.scale;

                if (minScale < this.minScale) {
                    minScale = this.minScale;
                }
                if (maxScale > this.maxScale) {
                    maxScale = this.maxScale;
                }

                let minDx = -(this.startWidth * minScale - this.boxWidth) / 2;
                let minDy = -(this.startHeight * minScale - this.boxHeight) / 2;
                let maxDx = (this.startWidth * minScale - this.boxWidth) / 2;
                let maxDy = (this.startHeight * minScale - this.boxHeight) / 2;

                if (minDx > maxDx) {
                    minDx = 0;
                    maxDx = 0;
                }

                if (minDy > maxDy) {
                    minDy = 0;
                    maxDy = 0;
                }

                return {
                    minDx: minDx,
                    minDy: minDy,
                    maxDx: maxDx,
                    maxDy: maxDy,
                }
            },
            cutImg: function () {
                let canvas = this.$refs.canvas;
                let ctx = canvas.getContext('2d');
                let img = this.$refs.img;

                let range = this.getRange();

                let nowWidth = this.startWidth * this.scale;
                let nowHeight = this.startHeight * this.scale;

                let imgX = (-this.dx - range.minDx) / nowWidth * this.naturalWidth;
                let imgY = (-this.dy - range.minDy) / nowHeight * this.naturalHeight;

                let dWidth = this.boxWidth / nowWidth * this.naturalWidth;
                let dHeight = this.boxHeight / nowHeight * this.naturalHeight;

                if (range.maxDx == 0 && range.maxDy == 0 && range.minDx == 0 && range.minDy == 0 && this.startHeight < this.boxHeight) {

                    let scale = this.boxHeight / (this.startHeight * this.scale);
                    imgX = (-this.dx + this.boxWidth * scale - this.boxWidth) / 2 / (this.boxWidth * scale) * this.naturalWidth;
                    imgY = 0;
                    dWidth = dWidth * this.startHeight / this.boxHeight;
                    dHeight = dHeight * this.startHeight / this.boxHeight;
                }

                ctx.drawImage(img, imgX, imgY, dWidth, dHeight, 0, 0, this.width, this.height);
                ctx.save();

//                var $Blob = this.getBlobBydataURI(canvas.toDataURL(this.fileType, this.compressionRatio));
//                var formData = new FormData();
//                formData.append("file", $Blob, "file_" + Date.parse(new Date()) + "." + this.fileType);

                let data = canvas.toDataURL(this.fileType, this.compressionRatio)
                console.log(data)
                this.$emit('cutImg', data)


                this.cleanInput();
                this.show = false;

            },
            maskToucmove: function (e) {
                e.preventDefault();
            },
            cleanInput: function () {
                let fileForm = this.$refs.fileForm;
                fileForm.reset();
            },
            getBlobBydataURI: function (base64Data, type) {
                var binary = atob(base64Data.split(',')[1]);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {type: type});
            },

        },
        created(){
            if (this.height === 0 || this.width === 0) {
                this.ratio = 1;
            } else {
                this.ratio = this.height / this.width;
            }
        },
    }
</script>
<style lang="less">
  .vue-img-cropper {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    .page-canvas {
      display: none;
    }
    .img-page {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background: #000000;
      overflow: hidden;
      z-index: 999;
      .page-body {
        position: relative;
        .cut-box {
          position: absolute;
          border: 1px solid #fff;
          box-sizing: border-box;
        }
        .img-mask {
          position: absolute;
          background: rgba(0, 0, 0, 0.3);
          &.top {
            top: 0;
            left: 0;
            width: 100%;
          }
          &.bottom {
            bottom: 0;
            left: 0;
            width: 100%;
          }
          &.left {
            top: 0;
            left: 0;
            height: 100%;
          }
          &.right {
            top: 0;
            right: 0;
            height: 100%;
          }
        }
      }
      .page-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #333333;
        display: -webkit-flex;
        display: flex;
        justify-content: space-around;
        .page-footer-btn {
          position: relative;
          text-align: left;
          font-size: 16px;
          padding: 0 30px;
          color: #fff;
          &:last-child {
            text-align: right;
          }
        }
      }
    }
    .main-img {
      position: absolute;
    }
  }
</style>
