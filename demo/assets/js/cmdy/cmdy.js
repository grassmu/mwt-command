/**
 * @file-type=business
 * @file-group=3
 */
utils.namespace("mobile.o2ocn.cmdy");
(function () {
    var cmdy = mobile.o2ocn.cmdy;
    /**
     * 购物车页面初始化脚本
     */
    cmdy.init = function () {
        this.initParam();
        this.initCmdyList();
        this.bindEvent();
    };
    /**
     * 初始化参数信息
     */
    cmdy.initParam = function () {
        //可选商品数
        this.itemLen = parseInt($("#items-len").val(), 10);
        //不可选商品数（缺货）
        this.proLen = parseInt($("#problem-Len").val(), 10);
        //商品信息
        this.itemCache = window.itemArray;
        //已选商品
        this.selectItems = {number: 0, items: {}};
        //支付方式
        this.payType = 0;
        //不支持货到付款的可选商品数
        this.unSupCodLen = 0;
        // 选中的不支持货到付款的数量
        this.chosedUnCodLen = 0;
        //结算节点
        this.confirmNodes = $(".confirm_order");
        //支付方式选择节点
        this.selectDivNode = $("#pay-type");
        // 货到付款按钮节点
        this.arrivePayNode = $("#pay-arrive");
        // 不支持货到付款的列表
        this.unSupCodList = {};
        // 所有节点列表
        this.choseNode = [];
    };
    /**
     * 初始化购物车商品
     */
    cmdy.initCmdyList = function () {
        var _this = this;
        _this.itemList = $("#item-sec .item");
        if (_this.itemLen != 0) {
            //全选按钮
            _this.selectAll = $("#choose-all");
            // 初始化不支持货到付款的可选商品数，建立索引
            _this.itemList.each(function () {
                var curItem = $(this), data = curItem.find(".cmdy-data"), supportCod = data.attr("supportCod"),iNode = curItem.find("i").eq(0);
                // 记录所有的商品
                _this.selectItems.number++;
                _this.selectItems.items[iNode.attr("index")] = iNode;
                // 所有的复选框节点
                _this.choseNode.push(iNode);
                if (supportCod == "false") {
                    // 不支持货到付款的商品
                    _this.unSupCodList[iNode.attr("index")] = iNode;
                    _this.unSupCodLen++;
                    _this.chosedUnCodLen++;
                }
                // 绑定事件处理
                iNode.on("click", function() {
                    var node = $(this), checked, index = node.attr("index");
                    if (node.hasClass("icon_checkbox_disabled")) {
                        utils.showBubble("您选择的商品不支持货到付款，建议您选择在线支付");
                        return;
                    }
                    checked = node.hasClass("icon_checkbox_checked");
                    if(checked) {
                        node.removeClass("icon_checkbox_checked");
                        delete _this.selectItems.items[index];
                        _this.selectItems.number--;
                    } else {
                        node.addClass("icon_checkbox_checked");
                        _this.selectItems.items[index] = node;
                        _this.selectItems.number++;
                    }
                    (_this.selectItems.number < _this.itemLen) ? _this.selectAll.removeClass("icon_checkbox_checked") : _this.selectAll.addClass("icon_checkbox_checked");
                    _this.callUnCod(checked,index);
                    _this.changeSel();
                });
            });
            // 所有可选商品都不支持货到付款，按钮灰掉
            if (_this.unSupCodLen != 0) {
                _this.arrivePayNode.addClass("btn_disabled");
            }
        }
    };
    cmdy.callUnCod = function(checked,index) {
        // 如果是不支持货到付款的商品，则这里设置按钮
        if(this.unSupCodList[index]) {
            if(!checked) {
                this.chosedUnCodLen++;
            } else {
                this.chosedUnCodLen--;
            }
        }
        if(this.chosedUnCodLen == 0) {
            this.arrivePayNode.removeClass("btn_disabled");
        } else {
            this.arrivePayNode.addClass("btn_disabled");
        }
    };
    /**
     * 动态绑定页面事件
     */
    cmdy.bindEvent = function () {
        var _this = this;
        //存在可选商品
        if (_this.itemLen != 0) {
            //全选事件,用鼠标点击或在其获得焦点时按空格，会先反转其状态再触发其click事件
            _this.selectAll.on("click", $.proxy(this.checkboxAll, this));
            //去结算
            $(".confirm_order").on("click", $.proxy(this.confirmOrder, this));
            //支付方式选择
            window.onlyonline === "false" && _this.selectDivNode.on("touchstart",$.proxy(this.handlePayType, this));
            //可选商品事件
            _this.itemEvent();
        }
        //存在不可选商品
        if (_this.proLen != 0) {
            $(".problem_item").each(function () {
                var currentItem = $(this);
                // 删除商品
                currentItem.find(".icon_delete").on("click", function () {
                    utils.showConfirm({
                        describeText: "确定要删除该商品吗？",
                        sureFn: function () {
                            _this.del(currentItem, false);
                        }
                    });
                });
            })
        }
    };
    /**
     * 全选按钮点击
     * @param e
     */
    cmdy.checkboxAll = function (e) {
        var _this = this, node = $(e.target);
        //先清空，避免先选上部分商品，然后点全选按钮时number加错情况
        _this.selectItems = {
            number: 0,
            items: {}
        };
        // 取消全选
        if (node.hasClass("icon_checkbox_checked")) {
            $.each(_this.choseNode, function (e, n) {
                $(n).removeClass("icon_checkbox_checked");
            });
            _this.arrivePayNode.removeClass("btn_disabled");
            _this.chosedUnCodLen = 0;
        } else {
            $.each(_this.choseNode, function (e, n) {
                n = $(n);
                if(!n.hasClass("icon_checkbox_disabled")) {
                    n.addClass("icon_checkbox_checked");
                    _this.selectItems.number++;
                    _this.selectItems.items[$(n).attr("index")] = n;
                }
            });
            _this.unSupCodLen > 0 && _this.payType == 0 ? _this.arrivePayNode.addClass("btn_disabled") : void(0);
            _this.chosedUnCodLen = _this.unSupCodLen;
        }
        _this.selectAll.toggleClass("icon_checkbox_checked");
        //调整结算按钮
        _this.changeSel();
    };
    /**
     * 支付方式选择
     * @param e
     */
    cmdy.handlePayType = function (e) {
        var _this = this, node = $(e.target), suc = true;
        if(node.hasClass("active")) {return;}
        if(node.hasClass("btn_disabled")) {
            utils.showBubble("您选择的部分商品不支持货到付款，请选择在线支付");
            return;
        }
        node.addClass("active").siblings().removeClass("active");
        _this.payType = node.attr('pt');
        //在线支付
        if (_this.payType == "0") {
            $.each(_this.choseNode, function(i, icon) {
                icon = $(icon);
                // 没有选中的
                if(!icon.hasClass("icon_checkbox_checked")) {
                    icon.hasClass("icon_checkbox_disabled") ? icon.removeClass("icon_checkbox_disabled") : "";
                    icon.addClass("icon_checkbox_checked");
                    _this.selectItems.number++;
                    _this.selectItems.items[i] = icon;
                }
            });
            _this.changeSel();
            // 全选按钮
            _this.selectAll.addClass("icon_checkbox_checked");
            _this.unSupCodLen != 0 ? _this.arrivePayNode.addClass("btn_disabled") : void(0);
            _this.chosedUnCodLen = _this.unSupCodLen;
            return false;
        }
        // 选择了货到付款
        $.each(_this.unSupCodList, function(i, icon) {
            icon = $(icon);
            // 禁用选择
            icon.addClass("icon_checkbox_disabled");
            if(icon.hasClass("icon_checkbox_checked")) {
                icon.removeClass("icon_checkbox_checked");
                delete _this.selectItems.items[icon.attr("index")];
                _this.selectItems.number--;
                suc = false;
            }
        });
        _this.changeSel();
        if (!suc) {
            _this.selectAll.removeClass("icon_checkbox_checked");
            utils.showBubble("已经为您取消了不支持货到付款的商品");
        }
    };
    // 更新存储列表
    cmdy.updateList = function() {
        this.choseNode = $("i[name='cart_checkbox']");
    };
    /**
     * 可选商品的各个事件处理
     */
    cmdy.itemEvent = function () {
        var _this = this;
        _this.itemList.each(function (index) {
            var currentItem = $(this),
            // 商品信息
                data = currentItem.find(".cmdy-data"),
            //商品itemCode
                ic = data.attr("ic"),
            // 购买限制
                limit = parseInt(data.attr("limit"), 10),
            // 库存数
                storeNum = parseInt(data.attr("storeNum"), 10),
            // 当前已经放入购物车中的数量
                currentNum = parseInt(data.attr("num"), 10);
            // 计算最大库存数量
//            storeNum = storeNum > 99 ? 99 : storeNum;
            // 初始化上一次输入的值
            // 库存数量小于当前放入购物车中的商品数量
            if (storeNum > 0 && currentNum > storeNum) {
                _this.modifyNum(currentItem, storeNum);
                utils.showBubble("您填写的购买数量已超过上限");
            }
            // 如果用户输入的不是数字类型，则浏览器会先进行转换，再触发该事件
            currentItem.find(".count").on("input", function () {
                var node = this;
                if (!node.value) {
                    return;
                }
                if (isNaN(node.value) || node.value.indexOf(".") != -1) {
                    utils.showBubble("请输入正确的数量");
                    //记录当前输入的商品数量
                    var s = setTimeout(function () {
                        $(node).val(currentItem.attr("last-count"));
                    }, 500);
                    return;
                }
                // 添加延时处理
                var st = setTimeout(function () {
                    // 取整数
                    var count = parseInt(node.value, 10);
                    var lastInputCount = currentItem.attr("last-count");
                    if (limit > 0 && count >= limit) {
                        count = limit;
                        utils.showBubble("最多购买" + limit + "件");
                        _this.modifyNum(currentItem, limit);
                    } else if (count >= storeNum) {
                        count = storeNum;
                        utils.showBubble("最多购买" + storeNum + "件");
                        _this.modifyNum(currentItem, storeNum);
                    } else if (count < 1) {
                        count = 1;
                        utils.showBubble("至少购买1件");
                        _this.modifyNum(currentItem, 1);
                    } else if (count != lastInputCount) {
                        // 如果这次输入的值和上一次输入的值不相同，则同步数据
                        _this.modifyNum(currentItem, count);
                    }
                }, 500);
                this.onkeydown = function () {
                    if (st) {
                        clearTimeout(st);
                        st = null;
                    }
                    if (s) {
                        clearTimeout(s);
                        s = null;
                    }
                };
            });
            // 删除商品
            currentItem.find(".icon_delete").on("click", function () {
                utils.showConfirm({
                    describeText: "确定要删除该商品吗？",
                    sureFn: function () {
                        _this.del(currentItem, true);
                    }
                });
            });
            //链接到商详
            currentItem.find(".item_detail").on("click", function () {
                window.location = window.basePath + "/cn/item/detail.xhtml?ic=" + ic + "&" + window.baseParam;
            });
        });
    };
    cmdy.changeSel = function () {
        var _this = this;
        if (_this.selectItems.number == 0) {
            _this.confirmNodes.removeClass("btn_strong");
        } else {
            _this.confirmNodes.addClass("btn_strong");
        }
        _this.setTotalPrice();
    };
    /**
     * 修改商品购买数量
     * @param node 当前商品节点
     * @param num 数量
     */
    cmdy.modifyNum = function (node, num) {
        var _this = this,dataNode = node.find(".cmdy-data");
        utils.ajaxReq({
            type: "POST",
            url: window.basePath + "/cn/cmdy/modifyNum.xhtml?" + window.baseParam,
            data: {
                ic: dataNode.attr("ic"),
                attr: dataNode.attr("sa"),
                bc: num,
                t: new Date().getTime()
            },
            dataType: "json"
        }, function (json) {
            if (!json.errCode) {
                node.find(".count").val(num);
                //记录当前输入的商品数量
                node.attr("last-count", num);
                node.find(".single-total").html("&yen;"+((num*(node.attr("price")))/100).toFixed(2));
                _this.itemCache[node.attr("id")].bc = num;
                _this.setTotalPrice();
            } else if(json.errCode == 5122 && json.retCode == 105) {
                location.reload();
            } else {
                utils.showAjaxErr(json, "修改数量失败,请稍候再试");
                node.find(".count").val(node.attr("last-count"));
            }
        }, function () {
            utils.showBubble("修改数量失败,请稍候再试");
            node.find(".count").val(node.attr("last-count"));
        });
    };
    /**
     * 删除商品
     * @param node
     * @param type==true 可选商品、type==false 不可选商品
     */
    cmdy.del = function (node, type) {
        var _this = this,
            dataNode = node.find(".cmdy-data"),
            ic = dataNode.attr("ic"),
            sa = dataNode.attr("sa"),
            num = node.find(".count").val(),
            supCod = dataNode.attr("supportCod");
        var param = {
            itemList: ic + "-" + sa + "-" + num,
            t: new Date().getTime()
        };
        utils.ajaxReq({
            type: "POST",
            url: window.basePath + "/cn/cmdy/remove.xhtml?" + window.baseParam,
            data: param,
            dataType: "json"
        }, function (data) {
            if (!data.errCode) {
                getCmdyCount();
                type ? _this.itemLen-- : _this.proLen--;
                node.animate({
                    "opacity": 0
                }, 300, "ease-out", function () {
                    $(this).remove();
                    _this.updateList();
                });
                if (_this.itemLen == 0 && _this.proLen == 0) {
                    _this.emptyCartIfNone();
                    return;
                } else if (_this.itemLen == 0 && type) { //刚删完
                    _this.emptyCartIfNone("item-sec");
                    return;
                } else if (_this.proLen == 0 && !type) {//刚删完
                    $("#un-sec").hide();
                    return;
                }
                //删除已选泽商品
                if (type && node.find("i[name=cart_checkbox]").hasClass("icon_checkbox_checked")) {
                    delete _this.selectItems.items[node.attr("id")];
                    _this.selectItems.number--;
                }
                if (type) {
                    //删除不支持货到付款商品
                    if (supCod == "false") {
                        _this.unSupCodLen--;
                    }
                    // 删除后剩下的商品都不支持货到付款
                    if (_this.unSupCodLen == _this.itemLen) {
                        _this.selectDivNode.html('<p>付款方式：在线支付</p>');
                    }
                    //需要延时处理
                    setTimeout(function () {
                        _this.changeSel();//删除可选商品数量变化
                    }, 550);
                    // 删除商品存储的信息
                    delete _this.itemCache[node.attr("id")];
                }
            } else {
                utils.showAjaxErr(data, "操作失败,请稍候再试");
            }
        });
    };
    /**
     * 设置总价
     */
    cmdy.setTotalPrice = function () {
        var totalPrice = 0, _this = this;
        _this.selectItems.number > 0 && ($.each(_this.selectItems.items, function(i,icon) {
            totalPrice += parseFloat(icon.attr("price")) * (_this.itemCache[icon.attr("index")].bc); //整数计算，分
        }));
        $("#total").text((totalPrice / 100).toFixed(2));//换成小数，元
    };

    /**
     * 空购物车
     */
    cmdy.emptyCartIfNone = function (str) {
        str = str ? str : "content";
        getCmdyCount();
        $("#"+str).html("<div class='qb_gap qb_tac qb_pt10' style='padding:70px 0 5px;margin-bottom: 0px;'><img src='http://3glogo.gtimg.com/o2ov1/image/icon_cart_empty.png' width='81' class='qb_mb10'>" +
            "<p class='qb_fs_xl mod_color_comment'>你的购物车空空如也哦</p></div>" +
            " <div class='qb_tac qb_gap'><a href='" + window.basePath + "/cn/index.xhtml?" + window.baseParam + "' class='mod_btn'>去逛逛</a></div>");
    };
    /**
     * 结算
     */
    cmdy.confirmOrder = function () {
        var _this = this, itemStr = [], node = $(".confirm_order");
        if(!node.hasClass("btn_strong")) {utils.showBubble("请选择商品");return;}
        if(window.wxInfo && window.wxInfo.isFocus != "true") {
            business.focus("购买商品，需要关注该商户，是否立即关注?", $.proxy(cmdy.confirmOrder, this));
            return;
        }
        for (var index in _this.selectItems.items) {
            itemStr.push(_this.itemCache[index].ic + "-" + _this.itemCache[index].attr + "-" + _this.itemCache[index].bc);
        }
        $("#payType").val(_this.payType);
        $("#trandom").val(new Date().getTime() / 1000);
        $("#itemList").val(itemStr.join("~"));
        document.cartForm.submit();
    };
})();