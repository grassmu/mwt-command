define(function (require, exports) {
    var $ = require("base/zepto"),
        pay = require("pay/pay"),
        dialog = require("ui/dialog"),
        util = require("util/util"),
        bubble = require("ui/bubble"),
        dot = require("base/doT"),
        url = require("deal/urlConfig"),
        fetch = require("request/loadPageData"),
        keyMap = require("config/keyConfig"),
        store = require("cache/localStore"),
        report = require("report/report"),
        error = require("base/error");
    var params = {}, pageData, reportFn, sb = bubble.showBubble, statusNode, container = $("#container");
    // 事件处理对象
    var evtHandler = {};
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
        evtHandler[tag](node);
    };
    // 获取物流信息
    evtHandler.getLogistic = function (node) {
        node = $(node);
        var loading = node.find("div[tag='loading']"), iNode = node.find("i"), expressNode = $("#express-path");;
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
    // 取消订单
    evtHandler.cancelOrder = function () {
        var _this = this;
        dialog.showDialog({
            text: "确定要取消订单吗？",
            context: _this,
            rightFn: function () {
                util.ajaxReq({
                    url: url.cancelOrder,
                    dataType: "json",
                    data: {
                        dc: pageData.dealCode,
                        suin: pageData.sellerUin,
                        pt: pageData.payType == 2 ? 1 : 0
                    }
                }, function (json) {
                    var code = json.errCode;
                    sb({
                        icon: !code ? "success" : "warn",
                        text: "取消订单" + (!code ? "成功" : "失败")
                    });
                    if (!code) {
                        statusNode.html("已关闭");
                        // 隐藏整个操作区域
                        $("#operate").remove();
                    }
                }, function () {
                    showError();
                });
            }
        })
    };
    // 申请退款
    evtHandler.drawbackMoney = function () {
        var _this = this;
        dialog.showDialog({
            text: "提交退款申请后我们将尽快审核订单，若符合退款条件我们会把退款金额打回至您的支付账户，如有疑问请您通过微信与我们联系。谢谢！",
            leftBtn: "确认退款",
            rightBtn: "取消",
            context: _this,
            leftFn: function () {
                util.ajaxReq({
                    url: url.drawback,
                    data: {dc: pageData.dealCode},
                    type: "POST",
                    dataType: "json"
                }, function (json) {
                    var code = json.errCode;
                    sb({
                        icon: !code ? "success" : "warn",
                        text: "申请退款" + (!code ? "成功" : "失败")
                    });
                    // 扭转状态
                    !code && (statusNode.html("退款中"), $("#operate").html('<div class="ui-ta-c mod-pay-form__button-link">退款中...</div>'));
                }, function () {
                    showError();
                });
            }
        });
    };

    /**
     * 申请退货
     */
    evtHandler.drawbackGoods = function() {
        location.href = url.refundApplyPage+"&dc="+params.dc+"&bid="+params.bid;
    };

    // 跳转到财付通
    evtHandler.toTenpay = function () {
        pay.handlePay({
            pc: 0,
            stockEmpty: pageData.stockEmpty,
            tenpayUrl: pageData.tenpayUrl
        });
    };
    // 微信支付
    evtHandler.wxPay = function () {
        pay.handlePay({
            payUrl:url.payPage,
            pc: 1,
            comeFrom:1,
            stockEmpty: pageData.stockEmpty,
            dealCode:pageData.dealCode,
            callbackUrl:url.dealDetailPage+"&dc="+pageData.dealCode+"&bid="+params.bid
        });
    };
    // 显示总价明细
    evtHandler.showPriceDetail = function(node) {
        var node = $(node), iNode = node.find("i"), detailNode = $("#price-detail");
        // 打开
        if(iNode.hasClass("mod-pay-list__arrow_down")) {
            detailNode.removeClass("ui-d-n");
            iNode[0].className = 'mod-pay-list__arrow mod-pay-list__arrow_up';
        } else {
            detailNode.addClass("ui-d-n");
            iNode[0].className = 'mod-pay-list__arrow mod-pay-list__arrow_down';
        }
    };

    /**
     * 取消退货申请
     */
    evtHandler.cancelRefundGoods = function() {
        util.ajaxReq({
            url:url.cancelRefund,
            type:"POST",
            data:{
                lid:pageData.refundId,
                dc:pageData.dealCode
            }
        }, function(json) {
            var code = json.errCode;
            sb({
                icon: !code ? "success" : "warn",
                text: "取消退货" + (!code ? "成功" : "失败")
            });
            // 扭转状态
            !code && (statusNode.html("已发货"), $("#operate").html('<div et="wg_tap:drawbackGoods" class="ui-ta-c mod-pay-form__button-link">申请退货</div>'));
        }, function() {
            showError("网络错误");
        });
    };

    /**
     * 填写运单号码
     */
    evtHandler.toWriteNum = function() {
        location.href = url.logisticFillPage+"&bid="+params.bid+"&dc="+params.dc+"&rid="+pageData.refundId;
    };


    // 显示ajax错误
    function showError(desc) {
        sb({
            icon: "warn",
            text: desc || "网络错误"
        });
    }
    // 初始化函数
    function init() {
        // 初始化日志上报
        try {
            reportFn = report.reportInit();
        } catch(e) {}
        var cache = new store(keyMap.dealDetail);
        params.dc = util.getQuery("dc");
        params.bid = util.getQuery("bid");
        // 找不到dealCode，则从缓存里拿数据
        if(!params.dc) {
            params = cache.getStore();
            try {
                params = JSON.parse(params);
            }catch(e) {
                showError("参数错误");
                error.showErrorPage();
                // 上报数据
                reportFn.reportDownTime();
                reportFn.reportError("页面加载失败，参数错误，订单详情页参数错误，找不到订单ID");
                reportFn.report();
                return;
            }
        } else {
            // 将参数写缓存，否则登录跳转回来后丢失参数
            setTimeout(function() {
                cache.setStore(params, true);
            }, 50);
        }
        if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
            weixinReady();
        } else {
            document.addEventListener("WeixinJSBridgeReady", weixinReady, false)
        }
        fetchData();
        bindEvent();
    }

    function weixinReady() {
        WeixinJSBridge.invoke("hideOptionMenu");
    }

    // ajax获取页面渲染数据
    function fetchData() {
        fetch.getPageData({
            dataUrl:url.dealDetail,
            data:params,
            callback:renderPage,
            loginUrl:url.dealDetailPage
        });
    }
    // 渲染页面
    function renderPage(data) {
        // 把页面数据存下来
        pageData = data;
        var template = dot.template($("#content-tpl").html());
        data.payTypeText = (data.payType == 1 ? "在线支付" : "货到付款");
        data.shipFeeText = data.logistic.shipFee ? "&yen;" + (data.logistic.shipFee/100).toFixed(2) + "元" : "免运费";
        data.path = window.basePath;
        data.height = window.innerHeight+45;
        data.debug = "";
        // 渲染页面
        container.html(template(data));
        // 打点记录当前时间，获取渲染时间
        reportTime.push(+new Date());
        // 用于各种按钮切换后的状态扭转
        statusNode = $("#deal-status");
        // 上报数据
        reportFn.reportRenderTime();
        reportFn.report();
    }
    // 利用事件冒泡绑定事件
    function bindEvent() {
        container.on("wg_tap", evtHandler.handleEvent);
    }
    exports.dealDetail = init;
});