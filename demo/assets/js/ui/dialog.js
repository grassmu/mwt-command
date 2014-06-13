/**
 * @param config
 *      text:要显示的文字
 *      leftBtn:左边按钮内容
 *      rightBtn：右边按钮内容
 *      context：上下文
 *      leftFn：左边按钮回调函数
 *      rightFn：右边按钮回调函数
 */
define(function(require, exports, module) {
    var $ = require("base/zepto");
    var html= "<div class='mod_dialog'>"
        + "        <div class='dialog_mask'></div>"
        + "        <div class='mod-confirm' style='position: fixed;'>"
        + "            <div class='mod-confirm__text ui-ta-l'>{#text#}</div>"
        + "            <div class='mod-confirm__btns'>"
        + "                <span tag='left' class='mod-confirm__btn mod-confirm__btn_no'>{#leftBtn#}</span>"
        + "                <span tag='right' class='mod-confirm__btn mod-confirm__btn_yes'>{#rightBtn#}</span>"
        + "            </div>"
        + "        </div>"
        + "    </div>",
        dialogNode,
        option = {
            text:"",
            leftBtn:"取消",
            rightBtn:"确认",
            context:"",
            leftFn:closeDialog,
            rightFn:closeDialog
        };
    function showDialog(config) {
        // 如果对话框还存在
        if(dialogNode) {return;}
        $.extend(option, config);
        if(!option.text){return;}
        dialogNode = $(html.replace(/{#text#}/, option.text).replace(/{#leftBtn#}/, option.leftBtn).replace(/{#rightBtn#}/,option.rightBtn));
        $("#container").append(dialogNode);
        dialogNode.on("click", handleEvent);
        dialogNode.on("touchmove", handleMove);
    }
    function closeDialog() {
        dialogNode.remove();
        dialogNode.off("click", handleEvent);
        dialogNode.off("touchmove", handleMove);
        dialogNode = null;
    }

    function handleMove(e) {
        e.preventDefault();
    }

    function handleEvent(e) {
        var node = e.target, tag = node.getAttribute("tag");
        if(!tag) {return;}
        // 调用指定的回调方法
        option[tag+"Fn"].call((option.context ? option.context : window), node);
        // 关闭dialog
        dialogNode && closeDialog();
    }
    module.exports = {
        closeDialog:closeDialog,
        showDialog:showDialog
    }
});