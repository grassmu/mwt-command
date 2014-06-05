/**
 * @file-type=business
 * @file-group=4
 */
utils.namespace("mobile.o2ocn.cmdyDeal");
(function (g) {
    /**
     * 购物车确认订单页初始化脚本
     */
    g.init = function () {
        this.initPage();
        this.handleFeeChange();
        this.scanCoupon();
        this.scanPromote(true);
        this.bindEvent();
    };
    /**
     * 初始化页面参数
     */
    g.initPage = function () {
        var _this = this, param = window.pageParam;
        param.totalPrice = parseInt(param.totalPrice, 10);
        // 事件配置
        _this.evtConfig = {
            "click": {
                "submitOrder": _this.handleSure,
                "toAddrList": _this.handleToAddr
            },
            "change": {
                "changePay": _this.changePay,
                "sendType": _this.handleFeeChange,
                "couponChange": _this.handleToChooseCoupon,
                "handlePromote":_this.handlePromote
            }
        };
        //应付金额节点
        _this.priceNode = $("#total-price");
        // 包裹对应的运费节点
        _this.pkgShipFeeNode = $("#select_shipFee");
        // 包裹数量
        _this.pkgLen = parseInt(param.pkgLen, 10);

        // 运费相关信息字段
        _this.curMtype = '';
        _this.curShipFee = '';

        // 优惠券相关信息
        // 优惠是否包邮
        _this.isFreeFee = false;
        // 满立减优惠金额
        _this.reduce = 0;
        // 优惠券优惠金额
        _this.couponReduce = 0;
        // 店铺优惠ID
        _this.promoteId = 0;
        // 店铺优惠券ID
        _this.couponId = null;
        // 是否使用店铺优惠券
        _this.useCoupon = true;
        // 最终需要付款的价格
        _this.payPrice = 0;
        // 支付方式，有微支付默认微支付，否则默认财付通
        _this.pc = param.minipay === "true" ? -1 : 0;
        // 建立优惠索引
        _this.promoteIndex = {
            "0": {"op": "-", "num": param.totalPrice},
            "1": {"op": "*", "num": param.totalCount},
            "num": param.totalPrice
        };
        _this.promoteInfo = param.promotion;
        // 当前包裹的优惠信息
        _this.pkgFavorParam = {};
    };
    /**
     * 绑定事件
     */
    g.bindEvent = function () {
        document.body.addEventListener("change", this, false);
        // ios中不能支持冒泡到body，所以只能冒泡到最外层的div元素上
        document.querySelector(".lay_page").addEventListener("click", this, false);
    };
    g.handleEvent = function (e) {
        var type = e.type, node = e.target, tag = node.getAttribute("evtTag");
        if (!tag || !this.evtConfig[type][tag]) {
            return;
        }
        this.evtConfig[type][tag].call(this, node);
    };
    /**
     * @desc 初始化及切换运送方式，node为undefined 表示为初始化状态，node为dom节点表示切换了运送方式
     * @param [node]
     */
    g.handleFeeChange = function (node) {
        var _this = this, node = node || _this.pkgShipFeeNode[0], option = node.options[node.selectedIndex];
        _this.curMtype = option.getAttribute("mtype");
        _this.curShipFee = parseInt(option.value, 10);
        node && _this.countPrice();
    };
    /**
     * @desc 遍历店铺优惠券列表
     */
    g.scanCoupon = function () {
        var param = window.pageParam, _this = this, coupons = param.coupon, tpl, opts, pi = _this.promoteIndex;
        if (coupons.length == 0) {
            return;
        }
        tpl = $("#promote-tpl").html(), opts = '<option packetPrice="0" value="0">不使用优惠券</option>';
        // 循环优惠券
        $.each(coupons, function (seq, cp) {
            opts += '<option ' + (seq == 0 ? "selected" : void(0)) + ' value="' + cp.id + '" packetPrice="' + cp.amount + '">' + (cp.amount / 100).toFixed(2) + '元优惠券</option>';
            if (seq == 0) {
                _this.couponId = cp.id;
                // 记录当前选择的优惠券金额
                _this.couponReduce = -parseInt(cp.amount, 10);
            }
        });
        tpl = tpl.replace(/{#id#}/, "").replace(/{#evtTag#}/, "couponChange").replace(/{#optList#}/, opts);
        // 因为暂时没有分包裹，所以只会存在一个包裹，所以这里直接写0
        $("#coupon-node").html(tpl).removeClass("qb_none");
        // 重新写优惠后的金额
        pi["0"].num = pi.num = param.totalPrice + _this.couponReduce < 1 ? 1 : param.totalPrice + _this.couponReduce;
    };

    /**
     * @desc 切换优惠券
     * @param node 选择优惠券列表节点，统一事件分发得来
     */
    g.handleToChooseCoupon = function (node) {
        var index = node.selectedIndex, _this = this, pi = _this.promoteIndex;
        // 计算优惠券减免的金额
        var couponPrice = node.options[index].getAttribute('packetPrice');
        _this.couponReduce = 0 - couponPrice;
        // 是否选择了使用优惠券
        _this.useCoupon = _this.couponReduce === 0 ? false : true;
        _this.couponId = node.value;
        // 优惠券优先，所以在切换了优惠券金额后，需要重新遍历满立减规则，因为参与计算的价格发生了变动
        pi["0"].num = pi.num = window.pageParam.totalPrice + _this.couponReduce;
        _this.scanPromote(false);
    };

    // 切换支付方式
    g.changePay = function (node) {
        this.pc = node.value;
    };
    /**
     * 计算应付金额
     */
    g.countPrice = function () {
        var _this = this, param = window.pageParam, dis = param.totalPrice + _this.couponReduce, price;
        // 最少0.01元原则，即使用优惠券后，如果价格低于0，则为0.01元，以分为单位
        if (dis < 1) {
            dis = 1;
        }
        // 再计算店铺促销金额
        dis += _this.reduce;
        if (dis < 1) {
            dis = 1;
        }
        // 在加上运费的价格
        price = dis + (_this.isFreeFee ? 0 : _this.curShipFee);
        // 货到付款
        if (param.payType === "1" && price < 500) {
            utils.showBubble("您购买的商品应付总价低于5元，无法使用货到付款功能，请用在线付款下单!");
        }
        // 货到付款订单
        if (param.payType === "1") {
            var divP = _this.divPrice(price);
            // 有零头，货到付款减免零头
            if (divP.free != "0.00") {
                $("#free-div").html(utils.strReplace($("#free-tpl").html(), divP)).removeClass("qb_none");
            } else {
                // 没有零头，隐藏节点
                $("#free-div").addClass("qb_none");
            }
            price = divP.pkgTotal * 100;
        } else {
            $("#free-div").addClass("qb_none");
        }
        // 记录最终付款的价格
        _this.payPrice = price;
        _this.priceNode.html("&yen;" + (price / 100).toFixed(2));
        // 计算满减和优惠券的优惠金额
        if (_this.reduce + _this.couponReduce < 0) {
            $('#dealoff-div').removeClass('qb_none');
            $('#dealoff-price').html("&yen;" + ((_this.reduce * -1 + _this.couponReduce * -1) / 100).toFixed(2));
        } else {
            $('#dealoff-div').addClass('qb_none');
        }

//        for (var i = 0, l = _this.pkgLen; i < l; i++) {
//            var favor = _this.pkgFavorParam[i];
//            // 邮费
//            shipFee = _this.pkgShipFee[i];
//            // 商品价格
//            price = _this.pkgPrice[i];
//            // 包裹应付金额节点
//            pkgPriceNode = $("#free-div-" + i);
//            if (!isEmptyObj(favor)) {
//                // 优惠金额
//                reduce = favor.reduce,
//                    // 是否包邮
//                    isFreeFee = favor.isFreeFee;
//            }
//
//            // 计算优惠券的金额
//            var couponReduce = 0;
//            if ($('#couponId_' + i).length > 0) {
//                var cnode = $('#couponId_' + i).get(0), index = cnode.selectedIndex;
//                var couponPrice = cnode.options[index].getAttribute('packetPrice');
//                couponReduce = 0 - couponPrice;
//            }
//
//            // 优惠后的金额
//            dis = price + (reduce ? reduce * 1 : 0) + couponReduce;
//
//            // 显示优惠信息
//            if (couponReduce < 0) {
//                $('#dealoff-div').toggleClass('qb_none', false);
//                $('#dealoff-price').html("&yen;" + (couponReduce * -1 / 100).toFixed(2));
//            } else {
//                $('#dealoff-div').toggleClass('qb_none', true);
//            }
//
//            // 货到付款的计算优惠方式有点不同
//            if (window.pageParam.payType === "1") {
//                if (dis <= 500) {
//                    utils.showBubble("您购买的商品应付总价低于5元，无法使用货到付款功能，请用在线付款下单!");
//                }
//            }
//            if (dis <= 0) {
//                dis = 1;
//            }
//            pkgTotal = dis + (isFreeFee ? 0 : shipFee * 1);
//            //货到付款订单
//            if (window.pageParam.payType === "1") {
//                var divP = _this.divPrice(pkgTotal);
//                // 包裹小计总和
//                totalPay += divP.pkgTotal * 100;
//                if (divP.free != "0.00") {
//                    pkgPriceNode.html(utils.strReplace($("#free-tpl").html(), divP)).removeClass("qb_none");
//                } else {
//                    pkgPriceNode.html(_this.pkgLen == 1 ? "" : '<div class="qb_tar">包裹小计：<strong class="mod_color_strong">&yen;' + (pkgTotal / 100).toFixed(2) + '</strong></div>').removeClass("qb_none");
//                }
//            } else {
//                totalPay += pkgTotal;
//                pkgPriceNode.html(_this.pkgLen == 1 ? "" : '<div class="qb_tar">包裹小计：<strong class="mod_color_strong">&yen;' + (pkgTotal / 100).toFixed(2) + '</strong></div>').removeClass("qb_none");
//            }
//            _this.pkgPay[i] = pkgTotal;
//        }
//        _this.priceNode.html("&yen;" + (totalPay / 100).toFixed(2));
    };
    /**
     *  价格（分为单位）去掉零头
     */
    g.divPrice = function (price) {
        var t = {
            price: (price / 100).toFixed(2),    //价格
            free: "0.00",      //零头分
            pkgTotal: "0.00"   //整数元
        };
        var s = price.toString(), sf = s.substring(s.length - 2) , sd = s.substring(0, s.length - 2);
        sf && (t.free = (parseInt(sf) / 100).toFixed(2));
        sd && (t.pkgTotal = parseInt(sd).toFixed(2));
        return t;
    };
    /**
     * 提交订单
     */
    g.handleSure = function (node) {
        var _this = this, params = window.pageParam, pt = params.payType, itemInfo = [], ajaxParam = [], node = $(node);
        if (node.hasClass("btn_disabled")) {
            return;
        }
        // 如果有优惠券但没有使用则提示
        if (!_this.useCoupon && _this.couponId && _this.couponId === "0") {
            utils.showConfirm({
                describeText:"您暂未使用任何店铺优惠券",
                sureText:"确认不使用",
                cancelText:"返回使用",
                sureFn:function() {
                    _this.useCoupon = true;
                    _this.handleSure(node);
                }
            });
            return false;
        }
        //货到付款 应付金额不小于5元
        if (pt === "1" && _this.payPrice < 500) {
            utils.showBubble("您购买的商品总价低于5元，无法使用货到付款功能，请用在线付款下单!");
            return;
        }
        // 满立减使用判断
        if(_this.promList && _this.promoteId == 0 && !_this.showed) {
            utils.showBubble("您的订单可以享受满减优惠，赶快选择优惠方案吧！");
            // 标识已经提示过了
            _this.showed = true;
            return false;
        }
        if (pt === "0" && _this.pc < 0) {
            utils.showBubble("请选择在线支付方式");
            return;
        }
        $.each(window.subParam, function(i,item) {
            itemInfo.push(item.ic + "-" + item.attr + "-" + item.bc + "-" + item.priceType+"-0");
        });
        ajaxParam.push(params.payType + "~" + _this.promoteId + "~" + params.suin + "~" + _this.curMtype + "~" + _this.couponId + "~0~" + itemInfo.join("~"));
        // 将按钮禁用，防止不停点击重复发请求
        node.addClass("btn_disabled");
        utils.ajaxReq({
            url: window.basePath + "/cn/cmdy/makeOrder.xhtml?" + window.baseParam,
            dataType: "json",
            type: "POST",
            data: {
                orderStrList: ajaxParam.toString(),
                dealScene:3,
                businessScene:3,
                adid: params.adid,
                payType: pt,
                pc: _this.pc
            }
        }, function (json) {
            if (!json.errCode) {
                utils.payDeal(json, node);
            } else if (json.errCode == 260) {
                node.removeClass("btn_disabled");
                utils.showBubble("登录超时");
            } else if(json.errCode == 4370) {
                utils.showAjaxErr(json, "超出购买限制");
                node.removeClass("btn_disabled");
            } else {
                node.removeClass("btn_disabled");
                utils.showAjaxErr(json, "下单失败，请重试");
            }
        });
    };

    /**
     * @desc 遍历店铺促销优惠信息
     */
    g.scanPromote = function () {
        var _this = this, promotes = _this.promoteInfo, most = [];
        // 将所有优惠都清空
        _this.reduce = 0;
        _this.isFreeFee = false;
        _this.promoteId = 0;
        $.each(promotes, function (index, pro) {
            var p = _this.countPromote(pro);
            if (p.show) {
                // 拷贝属性
                p.freight <= 0 ? pro["freeFee"] = true : "";
                pro.rm = p.payable;
                pro.show = p.show;
                // 付钱最少
                most.push(pro);
                p = null;
            }
        });
        // 没有符合条件的优惠，返回，并计算总价
        if (most.length == 0) {
            // 如果之前有存在过满立减优惠，在切换优惠券之后发现没有了，则把当前满立减优惠去掉
            _this.promList && _this.promList.parent().remove() && (_this.promList = null);
            _this.countPrice();
            return;
        }
        // 根据计算出的优惠金额大小进行排序
        most = most.sort(function (a, b) {
            return a.rm > b.rm;
        });
        var promote, tpl = $("#promote-tpl").html(), opts = "<option value='999999'>请选择店铺促销</option>";
        $.each(most, function (i, m) {
            opts += "<option value='" + m["rm"] + "' " + (m["freeFee"] ? "freeFee='true'" : '') + " promId='" + m.id + "'>" + m.desc + "</option>";
        });
        // 模板替换
        tpl = tpl.replace(/{#id#}/, 'promote-list').replace(/{#evtTag#}/, 'handlePromote').replace(/{#optList#}/, opts);
        $("#promote-node").html(tpl).removeClass("qb_none");
        opts = null;
        _this.promList = $("#promote-list");
        // 计算优惠价格
        _this.countPrice();
//        for (var p in promotes) {
//            var rules = promotes[p], most = [];
//            if (rules.length == 0) {
//                continue;
//            }
//            this.match[p] = {};
//            this.pkgFavorParam[p] = {};
//            // 先判断用户符合的优惠，再找出最优惠的一个
//            for (var i = 0; i < rules.length; i++) {
//                var rule = rules[i], countObj = this.countPromote(rule, p);
//                if (countObj.pay) {
//                    countObj.fee == 0 ? rule["freeFee"] = true : "";
//                    rule["favor"] = countObj.favor;
//                    this.match[p][countObj.pay] = rule;
//                    // 付钱最少
//                    most.push(countObj.pay);
//                }
//            }
//            if (most.length == 0) {
//                continue;
//            }
//            most = most.sort(function (a, b) {
//                return a > b;
//            });
//            var sel = "<div class='mod_select select_block flex_box active'><select class='promote-list' index='" + p + "'><option value='999999'>请选择优惠</option>";
//            for (i = 0; i < most.length; i++) {
//                var promote = this.match[p][most[i]];
//                sel += "<option value='" + promote["favor"] + "' " + (promote["freeFee"] ? "freeFee='true'" : '') + " promId='" + promote.id + "' " + (i == 0 ? 'selected' : '') + ">" + promote.desc + "</option>";
//                if (i == 0) {
//                    this.pkgFavorParam[p]["reduce"] = promote["favor"];
//                    this.pkgFavorParam[p]["isFreeFee"] = promote.freeFee ? true : false;
//                    this.pkgFavorParam[p]["promoteId"] = promote.id;
//                }
//            }
//            this.toggleShipFee(p);
//            $("#promote_" + p).html(sel).removeClass("qb_none");
//        }
//        this.promListNode = $(".promote-list");
//        this.countPrice();
    };

    // 根据优惠判断是否要隐藏运费节点
//    g.toggleShipFee = function (p) {
//        if (this.pkgFavorParam[p].isFreeFee) {
//            this.pkgShipFeeNode.parent().addClass("qb_none");
//        } else {
//            this.pkgShipFeeNode.parent().removeClass("qb_none");
//        }
//    };

    // 切换优惠信息
    g.handlePromote = function (node) {
        var _this = this, value = node.value, opt;
        if (value == "999999") {
            // 重置
            _this.reduce = 0;
            _this.isFreeFee = false;
            _this.promoteId = 0;
            _this.countPrice();
            return;
        }
        opt = node.options[node.selectedIndex];
        _this.reduce = parseInt(value, 10);
        _this.isFreeFee = opt.getAttribute("freeFee") ? true : false;
        _this.promoteId = opt.getAttribute("promId");
        this.countPrice();
    };

    // 计算优惠值
    g.countPromote = function (rule) {
        // 获取规则
        var _this = this,
            cnds = rule.cnd,
            reduce,
            favor = 0,
            freight = parseInt(_this.pkgShipFeeNode.val(), 10),
            pi = _this.promoteIndex;
        $.each(cnds, function (seq, cnd) {
            // 规则存在
            if (cnd !== "0") {
                // 判断当前优惠和用户购买的价格，符合优惠条件
                if (pi[seq].num >= parseInt(cnd, 10)) {
                    // 包邮
                    if (rule.feeCarriage[0] !== "0") {
                        freight = 0 - freight;
                    }
                    reduce = rule.reduce;
                    $.each(reduce, function (index, item) {
                        if (item !== "0" && item !== "0.0") {
                            // 计算减去的金额，例如减30元，原价200元，计算的过程为
                            // -(200 - eval(200 - 30))
                            // -(200 - eval(200*0.9))
                            favor = -(pi.num - eval(pi.num + pi[index].op + item));
                        }
                    });
                }
            }
        });
        // 运费信息，freight；payable：优惠金额
        return {"freight": freight, "payable": favor, "show": (rule.guide ? true : favor == 0 ? false : true)};
    };

    // 跳转全部收货地址列表，把当前URL写缓存
    g.handleToAddr = function () {
        var store = new localStore("confirm");
        // 判断是否支持本地存储，不支持写cookie
        if (store.support()) {
            store.setValue(location.href, false);
        } else if (navigator.cookieEnabled) {
            // 不支持缓存，写cookie
            utils.setCookie("re_url_confirm", location.href);
        }
        location.href = $("#goaddlist").attr("addr");
    };
//    function isEmptyObj(obj) {
//        if (!obj) {
//            return true;
//        }
//        for (var name in obj) {
//            if (obj.hasOwnProperty(name)) {
//                return false;
//            }
//        }
//        return true;
//    }
})(mobile.o2ocn.cmdyDeal);