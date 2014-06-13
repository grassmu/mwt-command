/**
 * 商品详情浮层模块，处理请求接口，弹出，关闭等动作
 * 对外提供三个接口
 *       initItemAttr 初始化商品属性，包括接口请求和执行渲染
 *       closeItemDialog    关闭浮层
 *       setStatus  设置页面状态，是否有跳走
 */
define(function (require, exports, module) {
    var $ = require("base/zepto"),
        doT = require("base/doT"),
        util = require("util/util"),
        bubble = require("ui/bubble"),
        url = require("item/urlConfig"),
        store = require("cache/localStore"),
        keyMap = require("config/keyConfig"),
        errorBubbleModule = require("functional/showError"),
        propModule = require("item/item-prop"),
        sb = bubble.showBubble,
        cb = bubble.closeBubble,
        attrCache,
        curItemCode,
        attrCacheArr = {},
    // 浮层弹出时滚动条的位置
        pos,
    // 购买数量
        buyNum = 1,
    // 商品浮层节点
        dialogNode,
    // 属性选择节点
        pNodeList,
    // 购买限制
        buyLimit,
    // 当前库存数
        curStock,
    // 是否是android2.3系统
        isAndroid23 = $.os.android && parseInt($.os.version, 10) < 4,
        isIos6 = $.os.ios && parseInt($.os.version, 10) < 7,
    // 浮层上要展示的图
        firstPic,
    // 页面节点
        pageNode,
    // 库存组合对应的价格
        stockPrice,
    // 购买数量文本框节点
        buyNumNode,
    // 商品浮层模板
        itemTpl,
    // 容器
        container,
    //　展示剩余库存节点
        stockLeftNode;

    /**
     * 获取商品属性
     * @param param     请求接口参数或者浮层中的商品数据
     * @param pic       浮层上要展示的第一张图片
     * @param [needLoad]  可选 是否需要发请求获取商品数据，如果为false，则param需要将浮层上要展示的内容传递过来
     * @param [editData]  可选 编辑模式，购物车商品信息（包含所选属性等）
     */
    function getItemAttr(param, pic, needLoad, editData) {
        curItemCode = param.ic;
        attrCache = attrCacheArr[curItemCode];
        firstPic = pic;
        if (attrCache) {
            editData ? _renderItemLayer(editData) : _showItemDialog();
            return;
        }
        // 如果需要加载新数据
        if (needLoad) {
            sb({text: "努力加载中...", autoHide: false});
            util.ajaxReq({
                url: url.itemAttr,
                dataType: "json",
                data: param
            }, function (json) {
                cb();
                if (!json.errCode) {
                    attrCache = json.data;
                    _renderItemLayer(editData);
                    attrCacheArr[curItemCode] = attrCache;
                } else {
                    errorBubbleModule.showError("获取商品属性失败", true);
                }
            }, function () {
                cb();
                errorBubbleModule.showError("网络错误", true);
            });
        } else {
            attrCache = param;
            _renderItemLayer(editData);
        }
    }

    /**
     * 渲染商品属性浮层
     * @param cartData  编辑模式下传递的数据
     * @private
     */
    function _renderItemLayer(cartData) {
        pos = window.pageYOffset;
        document.body.scrollTop = 0;
        // 商品详情浮层模板
        !itemTpl && (itemTpl = doT.template($("#item-tpl").html()));
        var height = window.innerHeight;

        // 调用库存组合初始化接口
        attrCache.propHtml = propModule.initAttr(attrCache, cartData && cartData.itemAttr);

        // 非android或者android4.0以上系统
        // 编辑状态的时候，高度会发生变化
        if (isAndroid23) {
            attrCache.innerStyle = 'min-height:' + (height - (cartData ? 209 : 160)) + 'px;';
            attrCache.outerStyle = 'top:0px;';
        } else {
            attrCache.innerStyle = 'height:' + (height - (cartData ? 209 : 160)) + 'px;overflow-y:scroll;';
            attrCache.outerStyle = "top:" + height + "px;height:" + height + "px;position:absolute;z-index:999;";
        }
        // 取第一张图做展示
        attrCache.imgSrc = firstPic;
        // android2.3系统不展示圆角
        attrCache.android23 = isAndroid23;
        // 设置购买数量，编辑模式下，需要使用编辑时候的购买数量
        attrCache.buyNum = cartData ? cartData.buyNum : 1;
        // 是否是编辑模式
        attrCache.edit = !!cartData;
        // 编辑模式下的库存数
        attrCache.stock = cartData ? attrCache.availSku[cartData.itemAttr].stockCount : attrCache.totalStock;
        // 重新赋值数量
        buyNum = attrCache.buyNum;
        !container && (container = $("#container"));
        container.append(itemTpl(attrCache));
        _defineParam();
        // 渲染完成后执行打开动画
        _showItemDialog();
//        pageNode.css("height",height-60+'px');
        // 编辑购物车时
        if (cartData) {
            // 获取库存属性对应的库存对象，获取其价格
            var stockObj = attrCache.availSku[cartData.itemAttr];
            _showPrice(stockObj);
        }
        // 删除不再使用的属性
        delete attrCache.android23;
        delete attrCache.buyNum;
        delete attrCache.edit;
        delete attrCache.stock;
    }

    /**
     * 给参数赋值
     * @private
     */
    function _defineParam() {
        // 获取属性项节点列表
        pNodeList = $(".mod_property");
        dialogNode = $("#dialog");
        pageNode = $("#page");
        buyNumNode = $("#buyNum");
        stockLeftNode = $("#stock-num");
        // 设置库存相关参数值，第一次设置
        buyLimit = attrCache.buyLimit * 1;
        curStock = !attrCache.totalStock ? 0 : attrCache.totalStock * 1;
        stockPrice = attrCache.itemPrice * 100;
    }

    /**
     * 展示商品浮层
     * @private
     */
    function _showItemDialog() {
        var height = window.innerHeight;
        // android4以下系统不使用动画
        if (isAndroid23) {
            pageNode.addClass("ui-d-n");
            dialogNode.css({
                "top": "0px",
                "z-index": 999
            }).removeClass("ui-d-n");
        } else {
            dialogNode.removeClass("ui-d-n").animate({
                "-webkit-transform": "translate3d(0px," + (-height) + "px,0px)"
            }, 300, "ease-in", function () {
                container.css("height", height-100+"px");
                dialogNode.css("position","fixed");
            });
        }
    }

    /**
     * 关闭浮层
     */
    function closeItemDialog(remove) {
        // 部分机器上浮层上的输入框
        document.body.focus();
        container.css("height","100%");
        pageNode.css("height","");
        // android4以下系统不使用动画
        if (!isAndroid23) {
            dialogNode.animate({
                "-webkit-transform": "translate3d(0px,0px,0px)"
            }, 300, "ease-in", function () {
                document.body.scrollTop = pos;
                remove ? (dialogNode.remove(), attrCache = null) : dialogNode.addClass("ui-d-n");
            });
        } else {
            pageNode.removeClass("ui-d-n");
            remove ? (dialogNode.remove(), attrCache = null) : dialogNode.addClass("ui-d-n");
        }
    }

    /**
     * 展示商品价格
     * @param stockObj
     * @private
     */
    function _showPrice(stockObj) {
        var price = stockObj.stockPrice;
        // 有VIP价格
        if (stockObj.hasVipPrice) {
            $("#afterPrice").html("&yen;" + _getFormatPrice(stockObj.vipPrice));
            $("#beforePrice").html("&yen;" + _getFormatPrice(price));
        } else {
            $("#afterPrice").html("&yen;" + _getFormatPrice(price));
        }
        // 用于购物车价格计算
        stockPrice = price;
        curStock = stockObj.stockCount;
    }

    function _getFormatPrice(price) {
        return (price / 100).toFixed(2);
    }


    /**
     * 找到用户选择的属性所匹配的项
     * @param node
     */
    function findMatch(node) {
        if (node.hasClass("current") || node.hasClass("disabled")) {
            return;
        }
        node.addClass("current").siblings().removeClass("current");
        var parent = node.parent(), left,
            propName = parent.attr("skuName"),
            key = node.attr("data-value");
        // 选择的是颜色属性，展示对应的图片
        if (propName == "颜色" && attrCache.colorImage[key]) {
            $("#property-img").attr("src", attrCache.colorImage[key]);
        }
        // 属性模块提供的查询接口
        var stockObj = propModule.queryMatch(key, parent.attr("index"), propName, pNodeList);
        // sku组合库存存在，设置该库存对应的价格和剩余库存数
        if (stockObj) {
            left = stockObj.stockCount;
            buyNum = 1;
            buyNumNode.val(1);
            stockLeftNode.html(left);
            _showPrice(stockObj);
        }
    }

    /**
     * 购买数量增减按钮事件处理
     * @param node
     */
    function handleMinusPlus(node) {
        // bubble显示期间
        if (window.bubbleStatus) {
            return;
        }
        var tag = node.attr("tag"), val = parseInt(buyNumNode.val(), 10),
            minVal = buyLimit ? Math.min(curStock, buyLimit) : curStock;
        if (!val) {
            buyNumNode.val(1);
            buyNum = 1;
            return;
        } else if (isNaN(val)) {
            buyNumNode.val(1);
            buyNum = 1;
            return;
        } else if (val == 1 && tag == "sub") {
            errorBubbleModule.showError("至少购买一件", false);
            return;
        } else if (tag == "add") {
            // 超出最大购买数量
            if (val >= minVal) {
                errorBubbleModule.showError("超出购买数量", false);
                return;
            }
        }
        val = tag == "sub" ? val - 1 : val * 1 + 1;
        buyNum = val;
        buyNumNode.val(val);
    }

    /**
     * 购买数量输入框校验
     */
    function handleInput() {
        var val = buyNumNode.val(), msg, bn,
            minVal = buyLimit ? Math.min(curStock, buyLimit) : curStock;
        if (val && isNaN(val)) {
            bn = 1;
            msg = "只能输入数字";
        } else if (val && val <= 0) {
            bn = 1;
            msg = "至少购买一件";
        } else if (/\d+\.\d*/.test(val)) {
            bn = parseInt(val, 10);
            msg = "只能输入整数";
        } else if (val > minVal) {
            bn = minVal;
            msg = "超出购买数量";
        } else {
            bn = val;
        }
        buyNumNode.val(bn);
        buyNum = bn;
        if (msg) {
            errorBubbleModule.showError(msg, false);
        }
    }

    /**
     * 提交之前的基本校验
     * @param node
     * @returns {boolean}
     * @private
     */
    function beforeBuy(node) {
        if (window.bubbleStatus || node.hasClass("btn_disabled")) {
            return false;
        }
        if (!buyNum) {
            errorBubbleModule.showError("至少购买一件", false);
            return false;
        }
        // 校验属性是否已选择
        if (curStock > 0 && attrCache.sku.length > 0 && !propModule.getRule()) {
            errorBubbleModule.showError(propModule.getErrMsg(), false);
            return false;
        }
        return true;
    }

    /**
     * 处理立即购买和确定加入购物车逻辑，依据tag调用不同的方法
     * @param config 购买的配置项，包含以下参数
     *      node  必选  dom节点
     *      tag   必选  标记 cart|item 标识为购物车还是一口价
     *      itemInfo  必选  要加入或者购买的商品相关的对象
     *      [sence]         订单场景对象，可选
     *      [comeFrom]      订单来源，可选
     *      [callback]      请求回调
     */
    function handleBuy(config) {
        var params = {
            node: "",
            remove: true,
            itemInfo: "",
            extendData: {},
            curPageName: ""
        };
        $.extend(params, config);
        // 校验信息选择是否完整
        if (!beforeBuy(params.node)) {
            return;
        }
        // 关闭浮层
        closeItemDialog(params.remove);
        sb({text: "努力加载中...", autoHide: false});

        var _coCache = new store(keyMap.confirmOrder), data = {
            "attr": propModule.getRule(),
            "bc": buyNum,
            "ic": params.itemInfo.itemId,
            "bid": params.itemInfo.bid,
            "hcod": 1
        };
        // 将外来的参数写入param
        for (var p in params.extendData) {
            if (params.extendData.hasOwnProperty(p)) {
                data[p] = params.extendData[p];
            }
        }
        // 参数写缓存
        _coCache.setStore(data, true);
        // 提供页头返回链接
        util.setCookie("prePage", params.curPageName + "&bid=" + params.itemInfo.bid + "&ic=" + params.itemInfo.itemId);
        params = null;
        location.href = url.confirmOrderPage;
    }

    /**
     * 在立即购买的时候，获取用户所选择的商品属性，购买件数，库存价格等信息
     */
    function getItemInfo() {
        return {
            bc: buyNum,
            attr: propModule.getRule(),
            stockPrice: stockPrice,
            itemInfo: attrCache
        }
    }

    module.exports = {
        initItemAttr: getItemAttr,
        closeItemDialog: closeItemDialog,
        findMatch: findMatch,
        minusPlus: handleMinusPlus,
        handleInput: handleInput,
        handleBuy: handleBuy,
        getItemInfo: getItemInfo,
        submitCheck: beforeBuy
    }
})