/**
 * 导购和扫码购收藏和取消收藏模块
 * 提供两个函数
 *      addFavor
 *      cancelFavor
 */
define(function (require, exports, module) {
    var util = require("util/util"),
        url = require("item/urlConfig"),
        bubble = require("ui/bubble"),
        doT = require("base/doT"),
        $ = require("base/zepto"),
        errorBubbleModule = require("functional/showError"),
        sb = bubble.showBubble,
        qrDialogTpl,
        favorData,
        loopTimes = 0,
        qrDialogNode;

    /**
     * 发请求
     * @param url
     * @param data
     * @param callback
     * @private
     */
    function _sendReq(url, data, callback) {
        util.ajaxReq({
            url: url,
            data: data,
            dataType: "json"
        }, callback, function () {
            errorBubbleModule.showError("网络错误", true);
        })
    }

    /**
     * 添加收藏
     * @param param     请求参数
     * @param node      按钮
     * @param justFavor 是否只收藏，即不绑定店员关系
     * @param [callback]  可选 收藏回调函数
     */
    function addFavor(param, node, justFavor, callback) {
        sb({text:"努力加载中...",autoHide:false});
        _sendReq(url.favorItem, param, function(json) {
            bubble.closeBubble();
            if(!json.errCode) {
                _afterFavor(json.data, justFavor);
                callback && callback();
            } else {
                bubble.closeBubble();
                errorBubbleModule.showError("收藏失败", true);
            }
        });
    }

    /**
     * 取消收藏
     * @param param
     * @param node
     */
    function cancelFavor(param, node, callback) {
        _sendReq(url.cancelFavor, param, function(json) {
            if(!json.errCode) {
                // 修改状态
                sb({icon:"success", text:"已取消收藏"});
                callback && callback();
            } else {
                sb({icon:"warn", text:"取消收藏失败"});
            }
        });
    }

    /**
     * 关闭二维码
     */
    function closeQrDialog() {
        // 停止轮询
        loopTimes = 500;
        // 隐藏dialog
        qrDialogNode.hide();
    }

    /**
     * 收藏之后的逻辑
     * @param json
     * @param justFavor
     * @private
     */
    function _afterFavor(json, justFavor) {
        favorData = json;
        if(justFavor) {
            _showSuccess("收藏成功");
        } else {
            !qrDialogTpl && (qrDialogTpl = doT.template($("#qrCode-tpl").html()));
            // 弹浮层关联二维码
            if (json.needDimCode) {
                var content = qrDialogTpl({
                    qrCode: url.qrCode + "?itemCode=" + json.itemCode + "&sellerUin=" + json.sellerUin + "&guideBuyerUin=" + json.buyerUin,
                    topText: '<i class="icon mod-standard-dialog__header-icon mod-standard-dialog__header-icon_check ui-mr-small"></i><span class="mod-standard-dialog__header-title-text">收藏成功！</span>',
                    top: "温馨提示：您也可向店员出示本页面<br>即享受免费邮寄和优先留货等服务",
                    sub:''
                });
                !qrDialogNode ? (qrDialogNode = _qrDialog(content)) : qrDialogNode.setContent(content);
                _loopAsk(favorData.sellerUin, favorData.buyerUin, favorData.itemCode);
            } else {
                _showSuccess("收藏成功");
            }
        }
    }

    function showQrDialog (json){
        !qrDialogTpl && (qrDialogTpl = doT.template($("#qrCode-tpl").html()));
        var content = qrDialogTpl({
            qrCode: url.qrCode + "?itemCode=" + json.itemId + "&sellerUin=" + json.bid + "&guideBuyerUin=" + json.buyerUin,
            top: "选择一位店员成为您的购衣顾问",
            sub: "给店员扫描，您将获得以下服务：<br><em style='color: green'>[包邮]</em>收藏的商品可享有包邮服务<br><em style='color: green'>[留货]</em>收藏的商品可享留存三天服务<br><em style='color: green'>[专属]</em>将最适合您的衣服推荐给您<br><em style='color: green'>[优惠]</em>将最新优惠第一时间与您同步"
        });
        !qrDialogNode ? (qrDialogNode = _qrDialog(content)) : qrDialogNode.setContent(content);
        _loopAsk(json.bid, json.buyerUin, json.itemId);
    }

    function _loopAsk(sellerUin, buyerUin, itemCode) {
        var param = {
            "guideSellerUin": sellerUin,
            "guideBuyerUin": buyerUin,
            "itemCode": itemCode,
            "t": +new Date()
        };
        loopTimes = 0;
        startAsk();
        // 准备开始轮询
        function startAsk() {
            if (loopTimes >= 500) {
                return;
            }
            loopTimes++;
            var callback = arguments.callee;
            util.ajaxReq({
                url: url.qrScan,
                data: param,
                dataType: "json"
            }, function (json) {
                if (!json.errCode) {
                    if (json.data.scaned) {
                        closeQrDialog();
                    } else {
                        // 间隔2s进行下一次询问
                        setTimeout(function () {
                            callback();
                        }, 2000);
                    }
                }
            });
        }
    }

    /**
     * 二维码对话框对象
     * @param content
     * @returns {{setContent: Function, hide: Function, show: Function}}
     * @private
     */
    function _qrDialog(content) {
        var tpl = $("#favorTips-tpl").html();
        $("#container").append(tpl.replace(/{#content#}/, content));
        var contentNode = $("#dialog-content"), dialogNode = $("#favor-dialog");
        return {
            setContent: function (ct) {
                contentNode.html(ct);
                this.show();
                return this;
            },
            hide: function (callback) {
                // 需要的时候调用回调函数
                callback && callback();
                dialogNode.addClass("ui-d-n");
                return this;
            },
            show: function () {
                dialogNode.removeClass("ui-d-n");
                return this;
            }
        }
    }

    function _showSuccess(desc) {
        setTimeout(function () {
            sb({icon: "success", text: desc});
        }, 400);
    }
    module.exports = {
        addFavor:addFavor,
        cancelFavor:cancelFavor,
        closeQrDialog:closeQrDialog,
        showQrDialog :showQrDialog
    };
});
