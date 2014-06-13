define(function (require, exports) {
    var $ = require("base/zepto"),
        promote = require("functional/promote-chose"),
        backbar = require("ui/backbar"),
        pay = require("pay/pay"),
        util = require("util/util"),
        bubble = require("ui/bubble"),
        dot = require("base/doT"),
        url = require("deal/urlConfig"),
        fetch = require("request/loadPageData"),
        keyMap = require("config/keyConfig"),
        store = require("cache/localStore"),
        report = require("report/report"),
        errorBubbleModule = require("functional/showError"),
        error = require("base/error");
    var sb = bubble.showBubble,
        params = {},        // 页面参数对象
        pageData,           // 页面所需json数据
        evtHandler = {},    // 事件处理对象
        container = $("#container"),
        reportFn,
        promoteTpl = dot.template($("#promote-tpl").html()),
        promoteObj = {      // 促销优惠相关对象
            reduce: 0,
            couponAmount: 0
        };
    // 事件处理
    evtHandler.handleEvent = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var node = $(e.target), et = node.attr("et");
        if (!et) {
            // 找父元素，找不到即结束
            node = node.parent(), et = node.attr("et");
            if (!et) {
                return;
            }
        }
        // 是对应的事件
        if (et.indexOf(e.type) == 0) {
            // 调用事件指定的函数
            evtHandler[et.split(":")[1]](node);
        }
    };
    // 跳转收货地址
    evtHandler.toAddr = function () {
        // 跳转
        location.href = url[pageData.hrefKey] + "&bid=" + pageData.sellerUin + "&cf=confirmOrder&addrId=" + (pageData.hasAddr ? pageData.buyer.addrId : "-1");
    };
    // 跳转支付
    evtHandler.toPay = function () {
        // 没有收货地址
        if (!pageData.hasAddr) {
            sb({
                icon: "warn",
                text: "请确认地址"
            });
            return;
        }
        sb({autoHide: false});
        util.ajaxReq({
            url: url.dealMakeOrder,
            dataType: "json",
            type: "post",
            data: {
                mt: params.mt,
                pt: params.pt,
                fm: params.comeFrom != 0 ? 1 : 0,
                pageid: params.pageid || "",
                adid: pageData.buyer.addrId,
                promId: promoteObj.promId || 0,
                couponId: promoteObj.couponId || 0,
                pc: params.pc,
                stockShopId: params.shopId || "",
                comeFrom: params.comeFrom || 1,
                ic: pageData.item[0].itemCode,
                bc: pageData.bc,
                attr: encodeURIComponent(pageData.attr),
                suin: pageData.sellerUin,
                shopId: sessionStorage.getItem("shopId") || "",    //业绩复算
                useVipPrice: pageData.hasVipPrice ? "1" : "0",
                resourceId: params.resourceId || "",
                locationId: params.locationId || "",
                dealScene: params.dealScene,
                businessScene: params.businessScene,
                t: new Date().getTime()
            }
        }, function (json) {
            var code = json.errCode;
            // 关闭加载效果
            bubble.closeBubble();
            if (!code) {
                // 调用支付
                pay.handlePay({
                    payUrl: url.payPage,
                    stockEmpty: false,
                    pc: params.pc,
                    dealCode: json.data.dealCode,
                    tenpayUrl: json.data.tenpayUrl,
                    comeFrom: params.comeFrom,
                    callbackUrl: url.confirmOrderPage
                });
            } else if (code == 4370) {
                errorBubbleModule.showError("超出购买数量", true);
            } else {
                errorBubbleModule.showError("下单失败", true);
            }
        }, function () {
            bubble.closeBubble();
            errorBubbleModule.showError("网络错误", true);
        });
    };
    // 快递
    evtHandler.deliveryChange = function (node) {
        var node = node[0], opt = node.options[node.selectedIndex];
        // 设置支付类型
        params.mt = opt.getAttribute("mtype");
        params.pt = opt.getAttribute("ptype");
        // 记录运费
        promoteObj.shipFee = parseInt(opt.value, 10);
        promoteObj.isFreeFee = !promoteObj.shipFee;
        countPrice();
    };

    // 优惠券选择
    evtHandler.handleCoupon = function (node) {
        var value = node.val() * 1, opt, amount = 0;
        // 没有选择优惠券
        if (value == -1) {
            promoteObj.couponId = 0;
            promoteObj.couponAmount = 0;
        } else {
            opt = node[0].options[node[0].selectedIndex];
            amount = opt.getAttribute("amount") * 1;
            promoteObj.couponId = value;
            promoteObj.couponAmount = -amount;
        }
        var price = (pageData.hasVipPrice ? pageData.vipPrice : pageData.totalPrice) - amount,
            proObj = callPromote(false, [], price < 1 ? 1 : price),
            nextNode = node.parent().next();
        // 有优惠列表html内容，更新列表
        if(proObj.promoteHtml) {
            // 没有满减节点
            if(nextNode.length == 0) {
                node.parents("ul").append(proObj.promoteHtml);
                setPromoteInfo(proObj.promId, proObj.reduce, proObj.isFreeFee);
            } else {
                nextNode.html(proObj.promoteHtml.replace(/\n\r/g,"").match(/<select.*\/select>/)[0]);
                opt = $("#"+(promoteObj.lastId || promoteObj.promId));
                // 之前选中的那个不再存在
                if(opt.length == 0) {
                    setPromoteInfo(proObj.promId, proObj.reduce, proObj.isFreeFee);
                } else {
                    // 选中之前选中的
                    opt[0].selected = true;
                    setPromoteInfo(promoteObj.lastId == "noneP" ? 0 : opt.val(), promoteObj.lastId == "noneP" ? 0 : opt.attr("amount") * 1, opt.attr("free") == "true" ? true : false);
                }
            }
        } else {
            nextNode.remove();
            setPromoteInfo(0, 0, false);
        }
        // 更新优惠券列表
        countPrice();
    };
    // 满立减选择
    evtHandler.handlePromote = function (node) {
        var value = parseInt(node.val(), 10),
            amount,
            opt;
        if (value == -1) {
            setPromoteInfo(0, 0, false);
            promoteObj.lastId = "noneP";
        } else {
            promoteObj.lastId = value;
            opt = node[0].options[node[0].selectedIndex];
            setPromoteInfo(value, parseInt(opt.getAttribute("amount"), 10), opt.getAttribute("free") == "true" ? true : false);
        }
        countPrice();
    };

    function init() {
        // 初始化日志上报
        try {
            reportFn = report.reportInit();
        } catch (e) {
        }

        // 记录上一页链接
        util.setCookie("preLink", document.referrer);

        var paramStore = new store(keyMap.confirmOrder), query = util.getQuery, ps = paramStore.getStore();
        // 缓存中拿不到，从URL中取
        if (!ps) {
            ps = {
                bc: query("bc"),
                attr: decodeURIComponent(query("attr")),
                ic: query("ic"),
                bid: query("bid"),
                adid: query("adid"),
                comeFrom: query("comeFrom") || 0,
                hcod: query("hcod"),
                shopId: query("shopId")
            };
            // 异步写缓存
            setTimeout(function () {
                paramStore.setStore(ps, true);
            }, 50);
        } else {
            ps = JSON.parse(ps);
        }
        // 检查最基本的参数商品ID
        if (!ps || !ps.ic) {
            errorBubbleModule.showError("参数错误", false);
            error.showErrorPage();
            // 上报数据
            reportFn.reportDownTime();
            reportFn.reportError("页面加载失败，参数错误，订单确认页参数错误，找不到商品ID");
            reportFn.report();
            return;
        }
        params = ps;
        // 开始加载数据
        fetchData();
    }

    // 加载数据
    function fetchData() {
        fetch.getPageData({
            dataUrl: url.confirmOrder,
            data: params,
            callback: renderPage,
            loginUrl: url.confirmOrderPage
        });
    }

    // 渲染页面
    function renderPage(json) {
        pageData = json;
        var template = dot.template($("#content-tpl").html());
        json.height = window.innerHeight + 45;
        // app内下单，判断app提供的是否支持微信支付的
        json.btnText = json.wxpay || window.app_wxpay ? "微信支付" : "提交订单";

        container.html(template(json));

        // 返回上一页头部条
        backbar.showBackBar(util.getCookie("preLink"), "确认交易");

        // 打点记录当前时间，获取渲染时间
        reportTime.push(+new Date());
        // 设置参数信息
        setReqParam();
        // 获取优惠列表
        pageData.hasAddr && getPromote();
        // 事件绑定，冒泡
        bindEvent();
        // 上报数据
        reportFn.reportRenderTime();
        reportFn.report();
    }
    // 设置支付请求参数
    function setReqParam() {
        // 设置收货地址跳转链接
        pageData.hrefKey = pageData.hasAddr ? "addrListPage" : "addrEditPage";
        // 设置提交订单的参数
        params.pc = pageData.wxpay ? 1 : 0;  // 支付类型 1：微信支付；0：财付通
        if(pageData.hasAddr) {
            var firstShip = pageData.shipList[0];
            params.mt = firstShip.mtype;
            params.pt = firstShip.ptype;
            // 记录当前运费
            promoteObj.shipFee = firstShip.fee;
            // 是否免运费
            promoteObj.isFreeFee = params.comeFrom != 0 || !firstShip.fee;
        }
    }
    // 事件绑定
    function bindEvent() {
        container.on("wg_tap change", evtHandler.handleEvent);
    }

    function callPromote(status, couponList, price) {
        return promote.init({
            couponList: couponList || (status ? pageData.conpon : []),
            promoteList: pageData.promotion.rules,
            template: promoteTpl,
            buyCount: pageData.bc,
            price: price || (pageData.hasVipPrice ? pageData.vipPrice : pageData.totalPrice)
        });
    }

    // 获取优惠信息
    function getPromote() {
        var proObj, html = [], tpl = dot.template($("#showPromote-tpl").html());
        // comeFrom != 0 的全部包邮
        params.comeFrom != 0 && html.push(tpl({desc: "微购物下单免运费"}));
        // 是活动商品，并且不能是会员，才可以参加满减活动
        (!pageData.activeItem || pageData.hasVipPrice) && (pageData.promotion.rules = []);
        proObj = callPromote(true);
        // 有优惠信息
        if (!$.isEmptyObject(proObj)) {
            // 渲染优惠列表
            if (proObj.couponHtml) {
                html.push(proObj.couponHtml);
                promoteObj.couponId = proObj.couponId;
                promoteObj.couponAmount = proObj.couponAmount;
            }
            if (proObj.promoteHtml) {
                html.push(proObj.promoteHtml);
                setPromoteInfo(proObj.promId, proObj.reduce, proObj.isFreeFee);
            }
            proObj = null;
        }
        html.length > 0 && $("#promote").append('<ul>' + html.join("") + '</ul>').removeClass("ui-d-n");
        countPrice();
    }

    function setPromoteInfo(promId, reduce, freeFee) {
        promoteObj.promId = parseInt(promId, 10);
        promoteObj.reduce = reduce;
        promoteObj.isFreeFee = freeFee;
    }

    // 计算价格
    function countPrice() {
        var currentPrice = pageData.hasVipPrice ? pageData.vipPrice : pageData.totalPrice;
        // 没有收货地址
        if (!pageData.hasAddr) {
            $("#total-price").html("&yen;" + (currentPrice / 100).toFixed(2));
            return;
        }
        var dis = currentPrice + (promoteObj.couponId ? promoteObj.couponAmount : 0), price, freeCondition = promoteObj.isFreeFee || promoteObj.shipFee == 0 || params.comeFrom != 0;
        // 最少0.01元原则，即使用优惠券后，如果价格低于0，则为0.01元，以分为单位
        dis < 1 && (dis = 1);
        // 再计算店铺促销金额，仍然满足0.01元的原则
        dis += (promoteObj.promId ? promoteObj.reduce : 0);
        dis < 1 && (dis = 1);
        // 再加上运费的价格
        price = dis + (freeCondition ? 0 : promoteObj.shipFee);
        // 显示总价
        $("#total-price").html("&yen;"+(price/100).toFixed(2));
        // 设置运费节点
        $("#fee-node").html(freeCondition ? "(免运费)" : "(含运费)");
        // 包邮，隐藏运费列表
        if(freeCondition) {
            $("#shipFee-list").addClass("ui-d-n");
        } else {
            $("#shipFee-list").removeClass("ui-d-n");
        }
    }
    exports.confirmOrder = init;
});