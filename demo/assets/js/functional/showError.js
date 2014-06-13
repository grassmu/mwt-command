/**
 * 提示错误模块
 *  @params desc 要提示的错误文字
 *          delay 是否需要延时
 */
define(function (require, exports) {
    var bubble = require("ui/bubble"),
        sb = bubble.showBubble;
    function showError(desc, delay) {
        delay ? setTimeout(function() {
            show(desc);
        }, 400) : show(desc);
    }
    function show(desc) {
        sb({
            icon: "warn",
            text: desc || "网络错误"
        });
    }
    exports.showError = showError;
})