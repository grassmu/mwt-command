/**
 * showBubble模块，通用的模拟微信浮层提示使用
 */
define(function (require, exports, module) {
    var $ = require("base/zepto");
    var showHtml,
        html = "<div class=\"mod-spinner\">"
            + "        <div class=\"mod-overlay\"></div>"
            + "        <div class=\"mod-spinner__inner\">{#icon#}<p class=\"mod-spinner__text\" id='bubble-text'>{#text#}</p></div>"
            + "    </div>",
        iconConfig = {
            "loading": '<p class="mod-spinner__spinner"></p>',
            "warn": '<p class="mod-spinner__info-icon"></p>',
            "success": '<p class="mod-spinner__success-icon"></p>'
        };

    function showBubble(config) {
        if (showHtml) {
            return;
        }
        // 不传递的情况下，使用loading的状态
        var option = {
            icon: "loading",
            text: "正在加载...",
            autoHide: true,
            showTime: 1000
        }, iconHtml, top;
        $.extend(option, config);
        iconHtml = iconConfig[option.icon];
        // 找不到对应的icon
        if (!iconHtml) {
            return;
        }
        top = document.body.scrollTop;
        // 替换html结构，转换成zepto对象
        showHtml = $(html.replace(/{#icon#}/, iconHtml).replace(/{#text#}/, option.text));
        $(document.body).append(showHtml);
        showHtml.css({
            position: "absolute",
            top: (top == 0 ? 90 : top + 50) + "px"
        });
        $(window).trigger("bubble:show");
        if (option.autoHide) {
            setTimeout(function () {
                closeBubble();
            }, option.showTime);
        }
    }

    function changeText(desc) {
        showHtml.find("#bubble-text").html(desc);
    }

    function closeBubble() {
        if (!showHtml) {
            return;
        }
        showHtml.animate({
            opacity: 0
        }, 100, "ease-in-out", function () {
            showHtml && showHtml.remove();
            showHtml = null;
            $(window).trigger("bubble:close");
        });
    };
    module.exports = {
        showBubble: showBubble,
        closeBubble: closeBubble,
        changeText: changeText
    };
});