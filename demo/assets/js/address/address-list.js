/**
 * @file-type=business
 * @file-group=2
 */
utils.namespace("mobile.o2ocn.addrList");
utils.namespace("mobile.o2ocn.addrchoose");
(function () {
    var addrList = mobile.o2ocn.addrList, addrChoose = mobile.o2ocn.addrchoose;
    addrList.init = function () {
        this.initParam();
        this.bindEvent();
    };
    /**
     * 页面初始化
     */
    addrList.initParam = function () {
        if (window.addrLen == 0) {
            $("#no-address").removeClass("qb_none");
        }
        var node = $("#tips");
        switch (window.oTip) {
            case 1:
                node.addClass("mod_tip_pass").removeClass("qb_none").html("修改成功");
                break;
            case 2:
                node.addClass("mod_tip_warn").removeClass("qb_none").html("修改失败，请稍后重试！");
                break;
            case 3:
                node.addClass("mod_tip_pass").removeClass("qb_none").html("删除成功");
                break;
            case 4:
                node.addClass("mod_tip_warn").removeClass("qb_none").html("删除失败，请稍后重试！");
                break;
            case 5:
                node.addClass("mod_tip_pass").removeClass("qb_none").html("成功添加收货地址");
                break;
            case 6:
                node.addClass("mod_tip_warn").removeClass("qb_none").html("添加收货地址失败，请稍后重试！");
                break;
            case 7:
                node.addClass("mod_tip_pass").removeClass("qb_none").html("收货地址导入成功");
                break;
            case 8:
                node.addClass("mod_tip_pass").removeClass("qb_none").html("部分收货地址导入成功");
                break;
            case 9:
                node.addClass("mod_tip_warn").removeClass("qb_none").html("收货地址导入失败");
                break;
            default :
                break;
        }
        if (!node.hasClass("qb_none")) {
            node.animate({
                opacity: 0
            }, 3000, "ease-out", function () {
                node.addClass("qb_none");
            });
        }
    };
    /**
     * 绑定事件
     */
    addrList.bindEvent = function () {
        $("#forward").on("click", function () {
            var store = new localStore("order"),
                url = window.basePath + "/cn/my/index.xhtml?" + window.baseParam, temp;
            if (store.support()) {
                // 移除缓存
                temp = store.getValue();
                url = temp ? temp : url;
                store.remove();
            } else if (navigator.cookieEnabled) {
                temp = utils.getCookie("o2o_re_url");
                url = temp ? temp : url;
                utils.delCookie("o2o_re_url");
            }
            location.href = url;
        });
        $("#add").on("click", function () {
            if (addrLen >= 10) {
                utils.showBubble("最多可保存10条收货地址，请先删除不需要的地址");
                return false;
            }
        })
        $(".delete").on("click", function () {
            var link = $(this);
            utils.showConfirm({
                describeText: "确定删除收货地址吗？",
                sureFn: function () {
                    location.href = link.attr("href");
                }
            })
            return false;
        })
    };

    /**
     * 地址选择页入口
     */
    addrChoose.init = function () {
        this.initPage();
        this.bindEvent();
    };

    addrChoose.initPage = function () {
        this.last = $(".list_address li").eq(0);

        // 此页面从导入页面跳转过来的时候需要设置回调页面地址
        if (window.callback != '') {
            $('.qb_icon').removeClass('icon_nike');
            var store = new localStore("confirm");
            // 判断是否支持本地存储，不支持写cookie
            if (store.support()) {
                store.setValue(window.callback, false);
            } else if (navigator.cookieEnabled) {
                // 不支持缓存，写cookie
                utils.setCookie("re_url_confirm", window.callback);
            }
        }
    };

    addrChoose.bindEvent = function () {
        var _this = this;
        var st = new localStore("confirm");
        var store = new localStore("order");
        // 点击新增按钮
        $("#toAdd").on("click", function () {
            if (len >= 10) {
                utils.showConfirm({
                    describeText: "您最多可以保存10条收货地址，请删除不需要地址后再添加",
                    sureFn: function () {
                        if (store.support()) {
                            // 支持缓存，则写本地缓存
                            store.setValue(location.href, false);
                        } else if (navigator.cookieEnabled) {
                            // 不支持缓存，写cookie
                            utils.setCookie("o2o_re_url", location.href);
                        }
                        location.href = window.basePath + "/cn/recvaddr/list.xhtml?" + window.baseParam;
                        return false;
                    }
                });
                return false;
            }
            return true;
        });
        // 切换地址
        $(".list_address li").on("click", function () {
            var node = $(this), adid = node.attr("adid"), la = _this.last.attr("adid"), url;
            if (adid != la) {
                _this.last.find("i").remove();
                node.find(".mod_color_weak").after('<i class="qb_icon icon_nike"></i>');
            }
            _this.last = node;
            if (st.support()) {
                url = st.getValue();
                // st.remove(); 避免点击浏览器返回按钮后找不到回调页面   保留该值 不删除   下次写入的时候将会覆盖
            } else if (navigator.cookieEnabled) {
                url = utils.getCookie("re_url_confirm");
                utils.delCookie("re_url_confirm");
            } else {
                url = document.referrer;
            }
            if (url.indexOf("adid") != -1) {
                url = url.replace(/adid=\d+/, "adid=" + adid);
            } else {
                url = url + (url.indexOf("&") != 0 ? "&adid=" + adid : "?adid=" + adid);
            }
            location.href = url;
        });
    };
})();