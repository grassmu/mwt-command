define(function (require, exports) {
    var $ = require("base/zepto"),
        dot = require("base/doT"),
        util = require("util/util"),
        url = require("deal/urlConfig"),
        keyMap = require("config/keyConfig"),
        store = require("cache/localStore"),
        report = require("report/report"),
        errorBubbleModule = require("functional/showError"),
        fetch = require("request/loadPageData");
    var params = {},
        pageData,
        reportFn,
        cache = new store(keyMap.dealDetailSaler);
    // 事件处理对象
    var evtHandler = {};
    // 事件处理初始化
    evtHandler.init = function () {
        var _this = this;
        _this.evtConfig = {
            "click": {
                "viewLogistic": _this.getLogistic,
                "showPriceDetail":_this.showPriceDetail
            }
        }
    };
    evtHandler.handleEvent = function (e) {
        var node = e.target, et = node.getAttribute("et"), tag;
        // 向上找一级，找不到就算了
        if (!et) {
            node = node.parentNode;
        }
        et = node.getAttribute("et");
        // 不是对应的事件类型
        if (!et || et.indexOf(e.type) == -1) {
            return;
        }
        tag = et.split(":")[1];
        evtHandler.evtConfig[e.type][tag].call(evtHandler, node);
    };
    // 获取物流信息
    evtHandler.getLogistic = function (node) {
        node = $(node), loading = node.find("div[tag='loading']"), iNode = node.find("i"), expressNode = $("#express-path");;
        // 打开
        if(iNode.hasClass("mod-pay-list__arrow_down")) {
            // 未加载过
            if(!node.attr("loaded")) {
                // 显示正在加载状态
                loading.removeClass("ui-d-n");
                util.ajaxReq({
                    type: "get",
                    url: pageData.logistic.logisUrl,
                    dataType: "jsonp"
                }, function () {});
            } else {
                expressNode.removeClass("ui-d-n");
            }
            iNode[0].className = "mod-pay-list__arrow mod-pay-list__arrow_up";
        } else {
            // 关闭
            iNode[0].className = "mod-pay-list__arrow mod-pay-list__arrow_down";
            expressNode.addClass("ui-d-n");
        }
        window.getlogisJsonCallback = function (json) {
            node.attr("loaded", true),
                loading.addClass("ui-d-n"),
                expressNode.removeClass("ui-d-n");
            var tpl = $("#logistic-tpl").html(), html = [];
            // 能够取到物流数据
            if(json && json.retCode == 0 && json.data.traceInfos.length > 0) {
                var len = json.data.traceInfos.length - 1;
                for(var i=len;i>=0;i--) {
                    var item = json.data.traceInfos[i];
                    html.push(tpl.replace(/{#desc#}/,item.desc).replace(/{#time#}/, item.time));
                }
                expressNode.html(html.join(""));
            } else {
                expressNode.html('<div class="ui-ta-c ui-mt-medium ui-mb-medium">暂无法获取物流信息</div>');
            }
        }
    };
    // 显示总价明细
    evtHandler.showPriceDetail = function(node) {
        node = $(node), iNode = node.find("i"), detailNode = $("#price-detail");
        // 打开
        if(iNode.hasClass("mod-pay-list__arrow_down")) {
            detailNode.removeClass("ui-d-n");
            iNode[0].className = 'mod-pay-list__arrow mod-pay-list__arrow_up';
        } else {
            detailNode.addClass("ui-d-n");
            iNode[0].className = 'mod-pay-list__arrow mod-pay-list__arrow_down';
        }
    };
    // 初始化函数
    function init() {
        // 初始化日志上报
        try {
            reportFn = report.reportInit();
        } catch (e) {}
        if (!initParam()) {
            return;
        }
        evtHandler.init();
        // 记录日志信息
        reportFn.reportDownTime();
        fetchData();
        // 从URL中获取dealCode和bid
        bindEvent();
    }

    /**
     * 初始化请求参数
     * @returns {boolean}
     */
    function initParam() {
        var query = util.getQuery, dc = query("dc"), bid = query("bid");
        // URL中找不到商品ID
        if (!dc) {
            params = cache.getStore();
            if (!params) {
                error.showErrorPage();
                // 上报数据
                reportFn.reportDownTime();
                reportFn.reportError("页面加载失败，参数错误，找不到商品ID");
                reportFn.report();
                errorBubbleModule.showError("参数错误");
                return false;
            } else {
                params = JSON.parse(params);
            }
        } else {
            params.dc = dc;
            params.bid = bid;
            setTimeout(function () {
                cache.setStore(params, true);
            }, 50);
        }
        return true;
    }
    // ajax获取页面渲染数据
    function fetchData() {
        fetch.getPageData({
            dataUrl:url.detail4Saler,
            data:params,
            callback:renderPage,
            loginUrl:url.dealDetailSalerPage
        });
    }
    // 渲染页面
    function renderPage(data) {
        // 把页面数据存下来
        pageData = data;
        var template = dot.template($("#content-tpl").html());
        data.payTypeText = (data.payType == 1 ? "在线支付" : "货到付款");
        data.height = window.innerHeight+45;
        // 渲染页面
        $("#container").html(template(data));
    }
    // 利用事件冒泡绑定事件
    function bindEvent() {
        util.query("#container").addEventListener("click", evtHandler, false);
    }
    exports.dealDetail = init;
});