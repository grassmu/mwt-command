/**
 * 统一错误页模块
 */
define(function(require, exports) {
    var html= "<div class='mod-page-info' style='height:{#height#}px;'><div class='lay-page lay-page_info mod-page-info__box'><i class='icon-big-info mod-page-info__icon'></i><div class='mod-page-info__text'>页面加载失败</div></div></div>";
    function showError() {
        document.getElementById("container").innerHTML = html.replace(/{#height#}/, window.innerHeight+45);
        setTimeout(function() {
            WeixinJSBridge.invoke('showToolbar',function(res) {});
        }, 2000);
    }
    exports.showErrorPage = showError;
});