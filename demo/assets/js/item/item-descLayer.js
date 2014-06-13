/**
 * 商品详情描述信息浮层模块
 */
define(function (require, exports, module) {
    var $ = require("base/zepto"),
        doT = require("base/doT"),
        isAndroid23 = $.os.android && parseInt($.os.version) < 4,
        height,
        data,
        pageNode,
        descDialog,
        descTpl;

    /**
     * 渲染商品描述信息浮层
     * @param 要展示的描述信息对象 {*}
     * @private
     */
    function _renderDescLayer(data) {
        // 商品详情浮层模板
        !descTpl && (descTpl = doT.template($("#desc-tpl").html()));
        height = window.innerHeight;
        // 非android或者android4.0以上系统
        if (isAndroid23) {
            data.innerStyle = 'min-height:' + (height - 70) + 'px;';
            data.outerStyle = 'top:0px;';
        } else {
            data.innerStyle = 'height:' + (height - 70) + 'px;overflow-y:scroll;';
            data.outerStyle = "top:" + height + "px;height:" + height + "px;position:fixed;z-index:999;";
        }
        data.android23 = isAndroid23;
        $("#container").append(descTpl(data));
        pageNode = $("#page");
        descDialog = $("#descDialog");
        // 渲染完成后执行打开动画
        _showDescDialog();
    }

    /**
     * 动画显示描述浮层
     * @private
     */
    function _showDescDialog() {
        // android4以下系统不使用动画
        if (isAndroid23) {
            pageNode.addClass("ui-d-n");
            descDialog.css({
                "top": "0px",
                "z-index": 999
            }).removeClass("ui-d-n");
        } else {
            descDialog.removeClass("ui-d-n").animate({
                "-webkit-transform": "translate3d(0px," + (-height) + "px,0px)"
            }, 300, "ease-in", function () {
                pageNode.addClass("ui-d-n");
            });
        }
    }

    /**
     * 关闭浮层
     */
    function closeDescDialog(remove) {
        pageNode.removeClass("ui-d-n");
        // android4以下系统不使用动画
        if (!isAndroid23) {
            descDialog.animate({
                "-webkit-transform": "translate3d(0px,0px,0px)"
            }, 300, "ease-in", function () {
                remove ? (descDialog.remove(), data = null) : descDialog.addClass("ui-d-n");
            });
            return;
        } else {
            remove ? (descDialog.remove(), data = null) : descDialog.addClass("ui-d-n");
        }
    }

    /**
     * 展开商品详情浮层
     */
    function showDesc(desc) {
        if(data) {
            _showDescDialog();
        } else {
            data = {};
            data.itemDesc = desc || "暂无详情描述";
            _renderDescLayer(data);
        }
    }

    /**
     * 对外提供接口
     * @type {{showDesc: Function, closeDescLayer: Function}}
     */
    module.exports = {
        showDesc: showDesc,
        closeDescLayer: closeDescDialog
    }
})