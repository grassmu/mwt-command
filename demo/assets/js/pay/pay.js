define(function(require, exports) {
    var bubble = require("ui/bubble"),
        cache = require("cache/localStore");
    function handlePay(opt) {
        if(opt.stockEmpty) {
            bubble.showBubble({
                icon:"warn",
                text:"商品库存不足"
            });
            return;
        }
        // 财付通支付
        if(opt.pc == 0) {
            location.href = opt.tenpayUrl;
        } else {
            // 区分来源，minghe系统来源是5，跳转至特定的支付回调
            var from = opt.comeFrom*1 == 5 ? 5 : 1;
            // 将URL写缓存，用于微信支付取消后返回
            var st = new cache("payCancelBack");
            st.setStore(encodeURIComponent(opt.callbackUrl));
            // 微购物app支付渠道
            if(window.wgOrder_src) {
                location.href = "weigou://pay?dealId="+opt.dealCode;
            } else {
                // 如果是微信支付，跳转统一支付页
                location.href = opt.payUrl+"&dc="+opt.dealCode+"&isRecvAddrFrom="+from+"#wechat_redirect";
            }
        }
    }
    exports.handlePay = handlePay;
});