/**
 * backbar头部返回条模块
 * @params title 返回条标题
 */
define(function(require, exports, module) {
    var $ = require("base/zepto");

    var html = '<div class="lay_toptab mod_tab relative"><a href="{#preLink#}"><div class="tab_item tab_item_left"><i class="qb_icon icon_goback"></i></div></a><div class="tab_item tab_item_title">{#title#}</div></div>';
    function showBackBar(preLink, title) {
        if( !preLink || !title){
            return;
        }
        $(html.replace("{#preLink#}", preLink).replace("{#title#}", title)).insertBefore($(".lay_page_wrap"))
    }

    module.exports = {
        showBackBar:showBackBar
    }
});