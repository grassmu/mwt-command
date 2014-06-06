define(function (require, exports, module) {

    var $ = require("base/zepto");

    return{
        /**
         * 获取微信版本
         */
        getWxVersion: function () {
            var ua = navigator.userAgent;
            if (/MicroMessenger/.test(ua)) {
                return parseInt(ua.match(/MicroMessenger\/(.*)/i)[1], 10);
            } else {
                return 5;
            }
        },
        query: function (s) {
            var ret = document.querySelectorAll(s);
            return ret.length > 1 ? ret : ret[0];
        },
        getQuery: function (name, url) {
            //参数：变量名，url为空则表从当前页面的url中取
            var u = arguments[1] || window.location.search.replace("&amp;", "&"),
                reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
                r = u.substr(u.indexOf("\?") + 1).match(reg);
            return r != null ? r[2] : "";
        },
        ajaxReq: function (opt, suc, error) {
            var option = {
                type: "GET",
                url: "",
                data: "",
                dataType: "json",
                timeout: 5000
            };
            $.extend(option, opt);
            if (!error) {
                error = function () {
                }
            }
            $.ajax({
                type: option.type,
                url: option.url,
                data: option.data,
                dataType: option.dataType,
                success: function (data) {
                    if (option.dataType == "json") {
                        data.errCode = parseInt(data.errCode, 10);
                    }
                    suc(data);
                },
                error: error
            });
        },
        getCookie: function (name) {
            //读取COOKIE
            var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"), val = document.cookie.match(reg);
            return val ? (val[2] ? unescape(val[2]) : "") : null;
        },
        delCookie: function (name, path, domain, secure) {
            //删除cookie
            var value = this.getCookie(name);
            if (value != null) {
                var exp = new Date();
                exp.setMinutes(exp.getMinutes() - 1000);
                path = path || "/";
                document.cookie = name + '=;expires=' + exp.toGMTString() + ( path ? ';path=' + path : '') + ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
            }
        },
        setCookie: function (name, value, expires, path, domain, secure) {
            //写入COOKIES
            var exp = new Date(), expires = arguments[2] || null, path = arguments[3] || "/", domain = arguments[4] || null, secure = arguments[5] || false;
            expires ? exp.setTime(exp.getTime() + expires * 24 * 3600 * 1000) : "";
            document.cookie = name + '=' + escape(value) + ( expires ? ';expires=' + exp.toGMTString() : '') + ( path ? ';path=' + path : '') + ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
        }
    };
});