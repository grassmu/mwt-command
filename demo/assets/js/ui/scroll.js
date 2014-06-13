/**
 * 轮播模块
 */
define(function(require, exports, module){
    var $ = require("base/zepto");
    function fillPic(node, w, h) {
        var temp;
        imgReady(node.attr("src"), function(width,height) {
            // 计算图片和容器的宽高比
            if(w/h >= width/height) {
                temp = parseInt(height/width * w,10);
                node.css({
                    "width":w+1,
                    "height":temp
                });
            } else {
                temp = parseInt(width/height*h,10);
                node.css({
                    "width":temp+1,
                    "height":h,
                    "margin-left":parseInt((w - temp)/2,10)
                });
            }
        });
    };
    function loopImage(opt, container) {
        this.config = {
            // 初始化要展示的图
            initIndex: 0,
            // 内容容器
            contentWrap: "",
            // 内容表示的节点
            contentTag: "li",
            // 状态表示容器
            statusWrap: "",
            // 状态节点
            statusTag: "i",
            // 状态显示样式
            statusClass: "current",
            // 自动生成状态栏的样式
            autoGenClass:"",
            // 状态栏和轮播同步
            statusNow:false,
            // 上一个按钮
            prev: "",
            // 下一页按钮
            next: "",
            // 按钮被禁用的样式
            btnDisClass: "disabled",
            // 按钮被按下时的样式
            btnTouchClass: "",
            // 动画执行时间  ms
            aniTime: 300,
            // 自动轮播间隔  ms
            autoTime: 5000,
            // 轮播区域宽度是否自适应屏幕宽度
            autoAdapt: false,
            // 是否需要设置轮播元素宽度
            setWidth:false,
            // 页面宽度，定宽情况下传递该参数
            pageWidth:"",
            // 是否自动轮播
            auto: false,
            // 是否循环
            cycle: false,
            // 是否需要自动生成状态栏信息
            autoGen: true,
            // 每个元素之间的间隔
            margin: 0,
            // 是否延时加载图片
            loadImg: false,
            // 延时加载的图片属性
            imgProp:"back_src",
            // 是否需要加载下一个轮播节点的图片
            loadNext:false,
            // 是否需要偏移量
            offset:false,
            // 手指至少需要滑动的距离
            leastDis:50,
            // 内容数组(供callback函数使用)
            cont: [],
            // 状态栏数组(回调使用)
            tabs: [],
            // 初始化完成
            onInit: function () {return true;},
            // 图片加载后的回调函数
            onImgLoad:function() {return true;},
            // 每次动画结束后的回调函数
            onProcess: function () {return true;}
        };
        if (!opt) {
            return;
        }
        $.extend(this.config, opt);
        // 用于保存轮播节点的相关参数，供回调函数使用
        this.config.param = {};
        this.config.param.outContainer = $(container);
        // 判断指定的容器是否存在
        if (this.config.param.outContainer.length == 0) {
            return;
        }
        this.initEl().init();
    }
    $.extend(loopImage.prototype, {
        initEl:function() {
            var config = this.config, param = config.param;
            // 需要设置到外层轮播容器的宽度 sliderContainerWidth
            param.scw = config.pageWidth || $(window).width();
            // 如果需要自适应当前轮播容器的宽度
            if (config.autoAdapt) {
                param.outContainer.width(param.scw);
            }
            // 轮播元素的容器 如ul元素
            param.container = param.outContainer.find(config.contentWrap);
            // 轮播元素列表
            param.contentList = param.container.find(config.contentTag);
            // 上一个按钮
            param.prevNode = config.prev && param.outContainer.find(config.prev);
            // 下一个按钮
            param.nextNode = config.next && param.outContainer.find(config.next);
            // 状态指示容器
            param.statusNode = config.statusWrap && param.outContainer.find(config.statusWrap);
            // 状态指示节点列表
            param.statusList = config.statusWrap && param.statusNode.children();
            // 轮播元素的数量
            param.counts = param.contentList.length;
            // 轮播元素的宽度
            param.eleWidth = param.contentList.width();
            // 判断是否支持3d变换
            var has3d = cssProperty.has3d();
            this.transform = cssProperty.pSupport("transform");    // 是否支持transform
            this.tfpre = has3d ? "translate3d(" : "translate(";
            this.tfsufix = has3d ? ",0px)" : ")";
            return this;
        },
        init: function () {
            var _this = this, config = _this.config, param = config.param;
            // 宽度计算乘积因子
            var tc = config.cycle && param.counts > 1 ? param.counts + 2 : param.counts;
            _this.current = config.initIndex = config.initIndex > param.counts ? param.counts - 1 : config.initIndex < 0 ? 0 : config.initIndex;
            // 初始化后回调
            config.onInit();
            // 设置轮播元素的宽度
            if(config.setWidth) {
                param.contentList.width(param.eleWidth);
            }
            // 状态栏跟着轮播元素滑动的步长
            param.statusStepWidth = config.statusNow && parseInt(param.eleWidth /param.counts, 10);
            // 给状态元素设置宽度
            config.statusNow && param.statusList.width(param.statusStepWidth);
            // 设置轮播容器的宽度(元素宽度+间距)
            param.container.css({
                "width": parseInt((param.eleWidth + config.margin) * tc, 10)+1000,
                // 如果需要自适应屏幕，并且想要在页面中显示图片，则这里计算元素的偏移
                "left": config.offset ? parseInt((param.scw - param.eleWidth) / 2, 10) - config.margin : "0px",
                "-webkit-backface-visibility":"hidden",
                "-webkit-transform":_this.tfpre+(-_this.current*(param.eleWidth*1 + _this.config.margin*1))+"px,0px"+_this.tfsufix
            });
            param.container.parent().css({'-webkit-transform':'translate3d(0,0,0)'});
            // 防止滑动时停顿的感觉
            param.contentList.css({"-webkit-transform":_this.tfpre+"0px,0px"+_this.tfsufix});
            // 状态栏实时切换，设置样式的初始值
            _this.config.statusNow && param.statusList.css({
                "-webkit-transform":_this.tfpre+(_this.current*(param.statusStepWidth))+"px,0px"+_this.tfsufix,
                "-webkit-backface-visibility":"hidden"
            });
            // 初始化显示的图片
            _this.initImages();
            // 如果只有一个，加载图片，返回
//        if(param.counts <= 1 && config.loadImg) {
//            this.loadSingleImg(this.getEle(this.current));
//            // 调用回调函数
//            config.onProcess(0);
//            return;
//        }
            // 滑动方向
            _this.direct = "left";
            // 自动生成状态栏
            config.autoGen ? _this.generateStatus() : "";
            // 需要循环显示，clone前后元素
            config.cycle ? _this.cloneNode() : "";
            // 初始化按钮状态
            _this.updateStatus();
            // 绑定事件
            _this.startEvent();
            if(config.auto) {
                _this.processAuto();
            }
        },
        getEle:function(index) {
            return  this.config.param.contentList.eq(index);
        },
        // 生成状态指示栏
        generateStatus:function() {
            var config = this.config, param = config.param;
            var tList = [];
            for(var i=0;i<param.counts;i++) {
                tList.push("<"+config.statusTag+" class="+config.autoGenClass+"></"+config.statusTag+">");
            }
            param.statusNode.html(tList.join(""));
            param.statusList = param.statusNode.children();
            config.tabs = param.statusList;
            tList = null;
        },
        // 绑定滑动事件
        startEvent:function() {
            var param = this.config.param, container = param.container[0], add = "addEventListener";
            container[add]("touchstart", this, false);
            container[add]("touchmove", this, false);
            container[add]("touchend", this, false);
            container[add]("touchcancel", this, false);
            container[add]("webkitTransitionEnd", this, false);
            param.prevNode && param.prevNode.on("click", $.proxy(this.prev, this));
            param.nextNode && param.nextNode.on("click", $.proxy(this.next, this));
        },
        // 默认事件处理函数，事件分发用
        handleEvent:function(e) {
            switch(e.type) {
                case "touchstart":
                    this.eventStart(e);break;
                case "touchmove":
                    this.eventMove(e);break;
                case "touchend":
                case "touchcancel":
                    this.eventEnd(e);break;
                case "webkitTransitionEnd":
                    this.processEnd();break;

            }
        },
        // 上一页按钮
        prev:function(e) {
            var node = $(e.target);
            if(node.hasClass(this.config.btnDisClass)) {
                return;
            }
            this.direct = "right";
            this.stop();
            node.addClass(this.config.btnTouchClass);
            this.setPrevPage();
            return false;
        },
        // 下一页按钮
        next:function(e) {
            var node = $(e.target);
            if(node.hasClass(this.config.btnDisClass)) {
                return;
            }
            this.direct = "left";
            this.stop();
            node.addClass(this.config.btnTouchClass);
            this.setNextPage();
            return false;
        },
        // 设置上一页编号
        setPrevPage:function() {
            var value = parseInt(this.current, 10), cycle = this.config.cycle, counts = parseInt(this.config.param.counts, 10);
            switch(value) {
                case -1:
                    value = counts - 2;
                    break;
                case counts:
                    value = -1;
                    break;
                case 0:
                    value = cycle ? -1 : 0;
                    break;
                default:
                    value = value - 1;
                    break;
            }
            this.current = value;
            this.processScroll();
        },
        // 设置下一页编号
        setNextPage:function() {
            var value = parseInt(this.current, 10), cycle = this.config.cycle, counts = parseInt(this.config.param.counts, 10);
            switch(value) {
                case counts:
                    value = 1;
                    break;
                case -1:
                    value = counts;
                    break;
                case counts - 1:
                    value = cycle ? counts : counts - 1;
                    break;
                default:
                    value = value + 1;
                    break;
            }
            this.current = value;
            this.processScroll();
        },
        // 手指触摸到
        eventStart:function(e) {
            var config = this.config, param = config.param;
            // 手指放下时的位置
            this.sp = this.getPosition(e);
            // 计算已经移动的偏移值
            var step = this.current == -1 ? param.counts - 1 : this.current == param.counts ? 0 : this.current;
            // 手指触摸时轮播的偏移量
            this.curOffset = -(step * (param.eleWidth + config.margin));
            // 状态栏的偏移
            this.statusOffset = config.statusNow && param.statusStepWidth*step;
            this.stop();
        },
        // 手指滑动
        eventMove:function(e) {
            var _this = this;
            // 如果是从外部滑入的，不理会该手指动作
            if(_this.curOffset == null) {
                return;
            }
            var mp = _this.getPosition(e), x = mp.x - _this.sp.x;
            _this.disx = x;
            // 横向移动值大于Y方向的移动
            if (Math.abs(x) > Math.abs(mp.y - _this.sp.y) && Math.abs(x) > 30) {
                // 阻止默认的事件
                e.preventDefault();
                _this.setOffset(x,0);
            }
        },
        eventEnd:function(e) {
            // 如果是从外部滑入的，不理会该手指动作
            if(this.curOffset == null) {
                return;
            }
            var mp = this.getPosition(e), x = mp.x - this.sp.x;
            if(x > this.config.leastDis) {
                e.preventDefault();
                this.setPrevPage();
                this.direct = "right";
            } else if(x < -this.config.leastDis) {
                e.preventDefault();
                this.setNextPage();
                this.direct = "left";
            } else {
                // 还原到之前的状态
                this.setOffset(0, this.config.aniTime);
                // 重启定时器
                if(this.config.auto) {
                    this.processAuto();
                }
            }
            this.disx = null;
            this.curOffset = null;
            this.statusOffset = null;
            this.sp = null;
        },
        // 停止定时器
        stop:function() {
            this.ptr && clearInterval(this.ptr);
            this.ptr = null;
        },
        setOffset:function(x, time) {
            var config = this.config, param = config.param;
            param.container.css({
                "-webkit-transform": this.tfpre+ (this.curOffset + x) + "px,0px"+this.tfsufix,
                "-webkit-transition":time+"ms"
            });
            config.statusNow && param.statusList.css({
                "-webkit-transform": this.tfpre+ (this.statusOffset + (-x)/param.counts) + "px,0px"+this.tfsufix,
                "-webkit-transition":time+"ms"
            });
        },
        // 执行动画
        processScroll:function() {
            var _this = this, index = _this.current, param = _this.config.param;
            param.container.css({
                "-webkit-transform":_this.tfpre+ (-index*(param.eleWidth*1 + _this.config.margin*1)) +"px,0px"+_this.tfsufix,
                "-webkit-transition":_this.config.aniTime+"ms"
            });
            if(this.config.statusNow) {
                setTimeout(function() {
                    var step = index == -1 ? param.counts-1 : index == param.counts ? 0 : index;
                    param.statusList.css({
                        "-webkit-transform": _this.tfpre + (param.statusStepWidth*step) + "px,0px"+_this.tfsufix,
                        "-webkit-transition":_this.config.aniTime+"ms"
                    });
                },0);
            }
            // 图片加载策略，是否要加载下一张，否则只加载当前元素的图片
            if(_this.config.loadImg) {
                !_this.config.loadNext ? _this.loadSingleImg(param.contentList.eq(index)) : _this.loadNextImage(index);
            }
        },
        // 动画执行完毕
        processEnd:function() {
            var _this = this, config = _this.config, param = config.param;
            _this.updateStatus();
            // 循环轮播到最后一个
            if(_this.current == param.counts) {
                _this.moveElement();
            } else if(_this.current == -1) {
                param.container.css({
                    "-webkit-transform": _this.tfpre + (-(param.eleWidth*1 + config.margin*1) * (param.counts - 1)) + "px,0px"+_this.tfsufix,
                    "-webkit-transition": "0ms"
                });
            }
            if(config.auto) {
                _this.processAuto();
            }
        },
        moveElement:function() {
            var param = this.config.param,
                lastNode = this.getEle(param.counts+1),
                list = param.contentList;
            for (var i = 1,l=list.length-2; i < l; i++) {
                list.eq(i).remove().insertBefore(lastNode);
            }
            list.eq(0).remove().insertBefore(lastNode);
            if(this.transform) {
                var margin = parseInt(param.contentList.css("margin-left"), 10);
                param.container.css({
                    "-webkit-transform": "translate3d("+-margin+"px,0px,0px)",
                    "-webkit-transition": ""
                });
            }
        },
        updateStatus:function() {
            var config = this.config, cycle = config.cycle, index = this.current, param = config.param;
            if (index == param.counts) {
                index = 0;
            } else if (index == -1) {
                index = param.counts - 1;
            }
            // 更新按钮状态
            if(!cycle && index == 0) {
                param.prevNode && param.prevNode.addClass(config.btnDisClass);
            } else {
                param.prevNode && param.prevNode.removeClass(config.btnDisClass);
            }
            // 最后一个
            if(!cycle && index == param.counts - 1) {
                param.nextNode && param.nextNode.addClass(config.btnDisClass);
            } else {
                param.nextNode && param.nextNode.removeClass(config.btnDisClass);
            }
            // 更新状态栏显示
            param.statusList && param.statusList.eq(index).addClass(config.statusClass).siblings().removeClass(config.statusClass);
            // 调用回调函数
            this.config.onProcess(index);
        },
        // 获取手指位置
        getPosition:function(e) {
            var touch = e.changedTouches ? e.changedTouches[0] : e;
            return {
                x: touch.pageX,
                y: touch.pageY
            }
        },
        // 克隆前后两个轮播元素，目的是循环滑动时无缝切换
        cloneNode:function() {
            var config = this.config, param = config.param;
            param.container.append(param.contentList.eq(0).clone());
            var last = param.contentList.eq(param.counts - 1).clone();
            last.css({position: 'relative', left: -((param.eleWidth + config.margin) * (param.counts + 2))});
            param.container.append(last);
            // 更新克隆后的列表
            param.contentList = param.container.children();
        },
        processAuto:function() {
            var _this = this;
            if(_this.ptr) {
                clearInterval(_this.ptr);
                _this.ptr = null;
            }
            _this.ptr = setInterval(function() {
                if(!_this.config.cycle && _this.current == _this.config.param.counts - 1) {
                    _this.stop();
                } else {
                    _this.setNextPage();
                }
            }, _this.config.autoTime);
        },
        // 加载指定轮播节点下的图片
        loadSingleImg:function(node) {
            if(node.attr("l")) {
                return;
            }
            var config = this.config, imgs = node.find("img");
            $.each(imgs, function(index, item) {
                var item = $(item), src = item.attr(config.imgProp);
                // 设置图片元素宽度
                config.setWidth && item.attr("width", config.param.eleWidth);
                if(!src) {return;}
                item.attr("src", src).removeAttr(config.imgProp);
                config.onImgLoad(item);
                node.attr("l", true);
            });
            return this;
        },
        // 加载初始化需要显示的图片
        initImages:function() {
            var config = this.config, param = config.param, p = param.scw;
            // 自适应宽度，并且需要有偏移
            if(config.autoAdapt && config.loadImg && config.offset) {
                var offset = p - (parseInt((p - param.eleWidth)/2, 10) + param.eleWidth), showNum = Math.ceil(offset / (param.eleWidth+config.margin*2)) + config.initIndex + 1;
                for(var i=0;i<showNum;i++) {
                    var n = this.getEle(i);
                    this.loadSingleImg(n);
                }
            } else if(config.loadImg) {
                // 加载当前图片
                this.loadSingleImg(this.getEle(this.current));
                // 有循环
                if(config.cycle) {
                    // 加载最后一张
                    this.loadSingleImg(this.getEle(param.counts - 1));
                    // 如果非首张图显示，则加载当前图片的前一张和后一张
                    if(this.current != 0) {
                        this.loadSingleImg(param.contentList.eq(this.current - 1));
                    }
                }
                if(config.loadNext) {
                    this.loadNextImage(this.current);
                }
            }
        },
        // 加载下一张图片
        loadNextImage:function(index) {
            var config = this.config, param = config.param, next;
            if (index == -1) {
                next = param.counts - 2;
            } else if(index == param.counts) {
                next = 1;
            } else {
                next = this.direct == "right" ? index - 1 : index + 1;
            }
            var nextNode = param.contentList.eq(next);
            this.loadSingleImg(nextNode);
        },
        /**
         * 销毁事件，即不能再继续轮播
         * @param thorough  是否彻底销毁
         */
        destroy:function(thorough) {
            var param = this.config.param, container = param.container[0];
            thorough ? (this.current = 0, this.config.param = null, loopImage.nodeList = null) : void(0);
            container.removeEventListener("touchstart", this, false);
            container.removeEventListener("touchmove", this, false);
            container.removeEventListener("touchend", this, false);
            container.removeEventListener("toushcancel", this, false);
            container.removeEventListener("webkitTransitionEnd", this, false);
            param.prevNode && param.prevNode.off("click", $.proxy(this.prev, this));
            param.nextNode && param.nextNode.off("click", $.proxy(this.next, this));
        },
        // 指定要显示的序号
        setCurrent:function(index) {
            index = index < 0 ? 0 : index >= this.config.param.counts ? this.config.param.counts - 1 : index;
            this.current = index;
            this.processScroll();
        },
        // 更新轮播参数
        updateParam:function(obj) {
            for(var p in obj) {
                this.config.param[p] = obj[p];
            }
        },
        // 获取参数信息
        getParam:function() {
            return this.config.param;
        }
    });
    var cssProperty = (function() {
        var css3 = {}, docElement = document.documentElement, mod = 'modernizr';
        return {
            injectStyle:function(rule,callback){
                var style,ret,div = document.createElement('div'),
                    body = document.body, fakeBody = body || document.createElement('body');
                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
                div.id = mod;
                (body ? div : fakeBody).innerHTML += style;
                fakeBody.appendChild(div);
                if(!body){
                    fakeBody.style.background = "";
                    docElement.appendChild(fakeBody);
                }
                ret = callback(div,rule);
                !body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);
                return !!ret;
            },
            pSupport:function(pName) {
                var style = docElement.style,
                    css3s = 'Webkit Moz O ms'.split(' '),
                    cstr = pName.charAt(0).toUpperCase() + pName.substr(1),  //首字母转换成大写
                    rstr = (cstr + ' ' + css3s.join(cstr + ' ') + cstr).split(' '),//属性都加上前缀
                    result = null;
                for(var i=0,len=rstr.length;i<len;i++){
                    if(rstr[i] in style){
                        result = rstr[i];
                        break;
                    }
                }
                return result;
            },
            has3d:function() {
                var ret = !!this.pSupport('perspective');
                if(ret && 'webkitPerspective' in docElement.style ) {
                    this.injectStyle('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
                        ret = node.offsetLeft === 9 && node.offsetHeight === 3;
                    });
                }
                return ret;
            }
        };
    })();
    var imgReady = (function () {
        var list = [], intervalId = null,
        // 用来执行队列
            tick = function () {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },
        // 停止所有定时器队列
            stop = function () {
                clearInterval(intervalId);
                intervalId = null;
            };
        return function (url, ready, load, error) {
            var check, width, height, newWidth, newHeight,
                img = new Image();
            img.src = url;
            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready(img.width, img.height);
                load && load(img.width, img.height);
                return;
            };
            // 检测图片大小的改变
            width = img.width;
            height = img.height;
            check = function () {
                newWidth = img.width;
                newHeight = img.height;
                // 如果图片已经在其他地方加载可使用面积检测
                if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
                    ready(newWidth, newHeight);
                    check.end = true;
                };
            };
            check();
            // 加载错误后的事件
            img.onerror = function () {
                error && error();
                check.end = true;
                img = img.onload = img.onerror = null;
            };
            // 完全加载完毕的事件
            img.onload = function () {
                load && load(img.width, img.height);
                !check.end && check();
                img = img.onload = img.onerror = null;
            };
            // 加入队列中定期执行
            if (!check.end) {
                list.push(check);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })();

    module.exports = {
        fillPic : fillPic,
        loopImage : loopImage
    };
});