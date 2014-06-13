/**
 * 表单校验模块
 */
define(function(require, exports) {
    var $ = require("base/zepto");
    function valiateForm(rule) {
        var errArr = [];
        $.each(rule, function (id, item) {
            var node = $("#" + id),
                value = node.val() + "";
            value = value.replace(/^\s*|\s*$/g, "");
            if (node.attr("disabled")) {
                return;
            }
            var valLen = value.length;
            if (item.dByte) {
                valLen = (value.replace(/[\u0391-\uFFE5]/g, "__")).length;
            }
            if (item.required) {
                if (value == "") {
                    showError(item.emptyMsg || "您输入的" + item.itemName + "不能为空", id);
                } else if (value != "" && !item.reg.test(value)) {
                    showError(item.errMsg, id);
                } else if (item.maxLen && valLen > item.maxLen) {
                    showError(item.errMsg || "您输入的" + item.itemName + "超过" + item.maxLen + "个字符", id);
                } else if (item.minLen && valLen < item.minLen) {
                    showError(item.errMsg || "您输入的" + item.itemName + "不足" + item.minLen + "个字符", id);
                } else if ((item.minVal && value < item.minVal) || (item.maxVal && value > item.maxVal)) {
                    showError("请输入" + item.minVal + "-" + item.maxVal + "的数字", id);
                } else {
                    var err = $("#" + id + "_msg");
                    err.addClass("ui-d-n");
                    item.callback && eval(item.callback + "(value, err)");
                }
            } else {
                if (value != "" && !item.reg.test(value)) {
                    showError(item.errMsg, id);
                } else if (item.maxLen && valLen > item.maxLen) {
                    showError(item.errMsg || "您输入的" + item.itemName + "超过" + item.maxLen + "个字符", id);
                } else if (item.minLen && valLen < item.minLen) {
                    showError(item.errMsg || "您输入的" + item.itemName + "不足" + item.minLen + "个字符", id);
                } else {
                    $("#" + id + "_msg").addClass("ui-d-n");
                }
            }
        });
        function showError(content, name) {
            var errNode = $("#" + name + "_msg");
            errNode.removeClass("ui-d-n").html(content);
            errArr.push(name);
        }

        if (errArr.length > 0) {
            return false;
        }
        return true;
    }
    exports.validateForm = valiateForm;
})