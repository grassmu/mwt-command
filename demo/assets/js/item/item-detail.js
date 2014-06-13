define(function (require, exports) {
    var $ = require("base/zepto"),
        utils = require("util/util"),
        bubble = require("ui/bubble"),
        backbar = require("ui/backbar"),
        doT = require("base/doT"),
        fetch = require("request/loadPageData"),
        keyMap = require("config/keyConfig"),
        url = require("item/urlConfig"),
        store = require("cache/localStore"),
        report = require("report/report"),
        error = require("base/error"),
        descLayerModule = require("item/item-descLayer"),
        favorModule = require("item/item-favor"),
        focus = require("functional/focus"),
        share = require("functional/share"),
        itemAct = require("item/item-act"),
        errorBubbleModule = require("functional/showError"),
        itemLayerModule = require("item/item-layer");
    var itemStatusMap = {
            "1": "商品缺货",
            "2": "商品下架",
            "3": "商品不存在"
        },
        reportFn,
    // 请求参数
        reqParam = {},
    // 保存页面内所需参数
        pageParam = {},
    // json数据
        pageData,
        container = $("#container"),
        cache = new store(keyMap.itemDetail),
        evtHandler = {};

    evtHandler.handleEvent = function (e) {
        var node = $(e.target), et;
        et = node.attr("et");
        if (!et) {
            // 找父元素，找不到即结束
            node = node.parent(), et = node.attr("et");
            if (!et) {
                return;
            }
        }
        e.stopPropagation();
        // 是对应的事件
        if (et.indexOf(e.type) == 0) {
            // 调用事件指定的函数
            evtHandler[et.split(":")[1]](node);
        }
    };

    /**
     * 显示购买属性选择浮层
     * @param node
     */
    evtHandler.showItemLayer = function () {
        itemLayerModule.initItemAttr(reqParam, pageData.itemPics[0], true);
    };
    /**
     * 关闭购买浮层
     */
    evtHandler.closeAttrLayer = function () {
        itemLayerModule.closeItemDialog(false);
    };

    /**
     * 关闭二维码浮层
     */
    evtHandler.closeQrDialog = function () {
        favorModule.closeQrDialog();
    };

    /**
     * 选择商品属性
     */
    evtHandler.choseProperty = function (node) {
        if (window.bubbleStatus) {
            return;
        }
        // 查找匹配
        itemLayerModule.findMatch(node);
    };
    /**
     * 立即购买
     */
    evtHandler.handleBuy = function (node) {
        if (window.bubbleStatus) {
            return;
        }
        // 先判断关注状态，再触发回调
        if (!beforeSubmit(submit)) {
            return;
        }
        function submit() {
            itemLayerModule.handleBuy({
                node: node,
                remove: false,
                itemInfo: pageData,
                curPageName: url.itemDetailPage,
                extendData: {
                    comeFrom: 1,
                    dealScene: 2,
                    locationId: reqParam.locationId,
                    businessScene: reqParam.bs ? reqParam.bs : (reqParam.locationId ? 8 : (reqParam.resourceId ? 2 : 1)) ,
                    resourceId: reqParam.resourceId || ""
                }
            });
        }
    };

    /**
     * 显示详情浮层
     */
    evtHandler.showDescDialog = function () {
        descLayerModule.showDesc(pageData.itemDesc);
    };

    /**
     * 关闭描述浮层
     */
    evtHandler.closeDescDialog = function () {
        descLayerModule.closeDescLayer(false);
    };

    /**
     * 收藏商品
     */
    evtHandler.addFavor = function (node) {
        // 先关注
        if (!beforeSubmit(submit)) {
            return;
        }
        function submit() {
            // 如果在状态配置中，则认为商品已经无法收藏
            if (itemStatusMap[pageData.itemStatus]) {
                errorBubbleModule.showError(itemStatusMap[pageData.itemStatus]);
            } else {
                favorModule.addFavor({
                    itemCode: pageData.itemId,
                    pic: pageData.itemPics[0],
                    businessScene: 1,
                    t: +new Date()
                }, false, function () {
                    node.text("取消收藏").attr("et", "wg_tap:cancelFavor");
                });
            }
        }
    };

    /**
     * 取消收藏商品
     */
    evtHandler.cancelFavor = function (node) {
        favorModule.cancelFavor({itemCode: pageData.itemId, t: +new Date()}, function () {
            node.text("加入收藏夹").attr("et", "wg_tap:addFavor");
        });
    };

    /**
     * 查看搭配事件
     */
    evtHandler.toGuidePage = function () {
        if (window.bubbleStatus) {
            return;
        }
        location.href = url.oldGuide + pageData.bid + "/" + pageData.itemId;
    };

    /**
     * 关联购衣顾问 - 弹出二维码
     */
    evtHandler.showQrCode = function () {
        favorModule.showQrDialog(pageData);
    };

    /**
     * 跳转至我的收藏夹
     */
    evtHandler.toFavoriteList = function () {
        if (window.bubbleStatus) {
            return;
        }
        location.href = url.favorListPage + "&bid=" + pageData.bid;
    }

    /**
     * 购买数量+-按钮事件
     */
    evtHandler.minusPlus = function (node) {
        itemLayerModule.minusPlus(node);
    };

    /**
     * 键盘输入购买数量事件
     */
    evtHandler.handleInput = function (node) {
        var viewPort = $("meta[name='viewport']");
        viewPort.content = 'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, target-densityDpi=device-dpi';
        node[0].focus();
        node.on("input", itemLayerModule.handleInput);
        node.on("blur", handleBlur);
        function handleBlur() {
            viewPort.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            node.off("input", itemLayerModule.handleInput);
            node.off("blur", handleBlur);
        }
    };

    /**
     * 打开微信相册
     */
    evtHandler.openWeixinImg = function () {
        if (window.bubbleStatus) {
            return;
        }
        var list = pageData.itemPics;
        list && WeixinJSBridge.invoke('imagePreview', {
            'current': list[0],
            'urls': list
        });
    };

    /**
     * 页面初始化入口
     */
    function init() {
        // 初始化日志上报
        try {
            reportFn = report.reportInit();
        } catch (e) {}
        if (!initParam()) {
            return;
        }
        pageParam.wh = window.innerHeight + 45;
        loadPage();
    }

    /**
     * 初始化请求参数
     * @returns {boolean}
     */
    function initParam() {
        var query = utils.getQuery, ic = query("ic");
        // URL中找不到商品ID
        if (!ic) {
            reqParam = cache.getStore();
            // 拿不到缓存数据
            if (!reqParam) {
                error.showErrorPage();
                // 上报数据
                reportFn.reportDownTime();
                reportFn.reportError("页面加载失败，参数错误，找不到商品ID");
                reportFn.report();
                errorBubbleModule.showError("参数错误");
                return false;
            } else {
                reqParam = JSON.parse(reqParam);
            }
        } else {
            reqParam.ic = ic;
            reqParam.bid = query("bid");
            reqParam.share = !!query("share");
            reqParam.urlFrom = query("urlFrom");
            reqParam.scanFrom = query("scanFrom");
            reqParam.resourceId = query("resourceId") || "";
            reqParam.locationId = query("locationId") || "";
            reqParam.bs = query("businessScene");
            setTimeout(function () {
                cache.setStore(reqParam, true);
            }, 50);
        }
        return true;
    }

    /**
     * 通用的页面json数据请求，加入登录态判断
     */
    function loadPage() {
        // 记录日志信息
        reportFn.reportDownTime();
        // 下载数据
        fetch.getPageData({
            dataUrl: url.getItemDetail,
            data: reqParam,
            callback: renderPage,
            loginUrl: url.itemDetailPage
        });
        // 记录上一页链接
        utils.setCookie("preLink", document.referrer);
        bindEvent();
    }

    /**
     * 渲染页面
     * @param json
     */
    function renderPage(json) {
        pageData = json;
        if(!itemAct.jumpOut(reqParam, json.isActItem)) {
            return;
        }
        var template;
        try {
            // 重新写正确的bid值
            reqParam.bid = json.bid;
            json.pageHeight = pageParam.wh;
            // 图片容器的宽度，两边margin各8px
            json.width = window.innerWidth - 16;
            // 设计师给的图片尺寸比例是606/484，所以这里按照该比例进行图片裁剪
            json.height = Math.round((json.width * 229) / 304);
            json.itemStatusText = itemStatusMap[json.itemStatus];
            json.share = reqParam.share;
            // 渲染商品
            template = doT.template($("#single-item-tpl").html());
            container.html(template(json));
            // 返回上一页头部条
            backbar.showBackBar(utils.getCookie("preLink"), reqParam.share ? " " : "商品详情");
            // 将商户真实的bid写cookie
            utils.setCookie("bid", json.bid, 0.03125, "/", ".weigou.qq.com");
            json = null;
        } catch (e) {
            reportFn.reportError("商品详情页渲染过程中失败：" + e.message);
        }
        // 打点记录当前时间，获取渲染时间
        reportTime.push(+new Date());
        reportFn.reportRenderTime();
        initShare();
        reportFn.report();
    }

    /**
     * 初始化分享
     */
    function initShare() {
        share.initShare({
            friends: {
                shareImg: pageData.itemPics[0],
                link: window.basePath + "/wx/item/item-detail.shtml?ic=" + pageData.itemId + "&bid=" + pageData.bid,
                desc: pageData.itemDesc,
                title: pageData.itemName
            },
            cycle: {
                shareImg: pageData.itemPics[0],
                link: window.basePath + "/wx/item/item-detail.shtml?ic=" + pageData.itemId + "&bid=" + pageData.bid,
                title: pageData.itemName
            }
        }, function () {
            reqParam.share && $("#share-tips").addClass("ui-d-n");
        });
    }

    /**
     * 绑定事件
     */
    function bindEvent() {
        var selfDefine = $(window);
        selfDefine.on("bubble:show", function () {
            window.bubbleStatus = true;
        });
        selfDefine.on("bubble:close", function () {
            window.bubbleStatus = false;
        });
        container.on("wg_tap change input", evtHandler.handleEvent);
    }

    /**
     * 提交之前的关注判断逻辑
     * @param callback
     * @returns {boolean}
     */
    function beforeSubmit(callback) {
        // 未关注商家
        if (!pageData.focus) {
            focus.focusInit(pageData.bidWxId, function () {
                pageData.focus = true;
                // 继续下单
                callback();
            });
            return false;
        }
        callback();
        return true;
    }

    exports.itemDetailInit = init;
});