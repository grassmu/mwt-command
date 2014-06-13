/**
 * @desc 微信分享模块，自定义分享
 */
define(function(require,exports) {
    var shareData, callback;
    !("WeixinJSBridge" in window) ? document.addEventListener("WeixinJSBridgeReady", weixinReady, false) : weixinReady();
    function weixinReady() {
        // 发送给朋友
        WeixinJSBridge.on("menu:share:appmessage", shareFriends);
        // 发送到朋友圈分享
        WeixinJSBridge.on("menu:share:timeline", shareFriendCycle);
    }
    function initShare(data, cb) {
        shareData = data;
        callback = cb;
    }
    function shareFriends() {
        var data = shareData.friends;
        WeixinJSBridge.invoke("sendAppMessage", {
            img_url: data.shareImg,
            img_width: "640",
            img_height: "640",
            link: data.link,
            desc: data.desc,
            title: data.title
        }, function() {callback && callback()})
    }
    function shareFriendCycle() {
        var data = shareData.cycle;
        callback && callback()
        WeixinJSBridge.invoke("shareTimeline", {
            img_url: data.shareImg,
            img_width: "640",
            img_height: "640",
            link: data.link,
            desc:" ",
            title: data.title
        }, function () {})
    }
    exports.initShare = initShare;
})
