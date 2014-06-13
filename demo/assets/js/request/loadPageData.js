/**
 * 加载页面数据
 *  @param dataUrl 配置的URL
 *         data 需要请求的数据参数
 *         callback function
 *         context 上下文
 */
define(function (require, exports) {
    var $ = require("base/zepto"),
        util = require("util/util"),
        bubble = require("ui/bubble"),
        login = require("login/login"),
        error = require("base/error"),
        sb = bubble.showBubble;

    function loadData(config) {
        var option = {
            dataUrl: "",         // 要请求的URL
            data: "",        // 请求参数
            callback: function () {},      // 回调函数
            context: "",                 // 上下文
            loginUrl: "",                 // 未登录时跳转回调页面key
            bid: ""
        };
        if (!config) {
            return;
        }
        $.extend(option, config);
        option.data.t = +new Date();
        // 判断URL的code参数
        if (util.getQuery("code")) {
            setLogin(option.bid?option.bid:option.data.bid, load);
        } else {
            load();
        }
        function load() {
            sendReq(option.dataUrl, option.data, function (json) {
                var code = json.errCode;
                if (!code) {
                    // 调用回调函数
                    if (option.context) {
                        option.callback.call(option.context, json.data);
                    } else {
                        option.callback(json.data);
                    }
                    // 延时加载ta统计脚本
                    setTimeout(function() {
                        var script = document.createElement("script");
                        script.type = "text/javascript";
                        script.src = 'http://tajs.qq.com/stats?sId=29108809';
                        document.querySelector("head").appendChild(script);
                    }, 500);
                } else if (code == 999) {
                    // 跳转登录
                    login.jumpLogin(option.loginUrl);
                } else if(code == 998) {
                    util.setCookie("cookieFrom", 1, 1, "/", ".weigou.qq.com");
                    // 活动商品
                    login.jumpLogin("http://"+location.host+"/act/wx/item/item-detail.shtml?showwxpaytitle=1");
                } else {
                    error.showErrorPage();
                    showError("请求遇到错误(" + code + ")");
                }
            }, function () {
                showError("网络错误");
                error.showErrorPage();
            });
        }
    }

    function sendReq(url, data, callback, error) {
        util.ajaxReq({
            url: url,
            dataType: "json",
            data: data
        }, callback, error);
    }

    // 显示错误信息
    function showError(desc) {
        sb({
            icon: "warn",
            text: desc
        });
    }

    // 设置登录cookie
    function setLogin(bid, callback) {
        var code = util.getQuery("code");
        if (code) {
            sendReq(window.basePath+"/cn/auth/login.xhtml", {
                wxCode: code,
                wgBid: bid
            }, function (json) {
                // 设置cookie成功
                if (!json.errCode) {
                    util.setCookie("xtoken", json.data.xtoken, 1, "/", ".weigou.qq.com");
                    util.setCookie("bid", bid, 1, "/", ".weigou.qq.com");
                    util.setCookie("wid", json.data.uin, 1, "/", ".weigou.qq.com");
                    callback();
                } else {
                    showError("登录失败(" + json.errCode + ")");
                    error.showErrorPage();
                }
            }, function () {
                showError("登录网络错误");
                error.showErrorPage();
            });
        } else {
            callback();
        }
    }

    exports.getPageData = loadData;
});
