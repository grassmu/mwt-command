/**
 * tips提示模块
 * @params direct:箭头展示方向
 *         text:展示文字内容
 */
define(function() {
    var html = '<div class="mod-message-tip" style="{{=it.style}}"><div class="mod-message-tip__cont ui-fz-small">{{=it.text}}</div><span class="mod-message-tip__arrow mod-message-tip__arrow_{{=it.direct}}"></span></div>',
        option = {
        direct:"left",
        text:""
        },
        style = {
            "left":"left: 25px;top: 5px;",
            "bottom":"left: 20px;bottom: 70px;"
        };
    function showTips(config) {

    }
});