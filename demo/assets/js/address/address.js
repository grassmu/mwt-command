/**
 * @file-type=business
 * @file-group=1
 */
utils.namespace("mobile.o2ocn.address");
(function () {
    var address = mobile.o2ocn.address;



    /**
     * 收货地址页面初始化脚本
     */
    address.init = function () {
        this.formRule = {
            "name": {
                emptyMsg: "请填写收件人姓名", itemName: "收件人姓名", reg: /^[\u0391-\uFFE5a-zA-Z]+$/,
                errMsg: "请填写正确的收件人姓名", dByte: true, required: true, maxLen: 30, minLex: 4
            },
            "address": {
                emptyMsg: "请填写收件人的详细地址", itemName: "详细地址", reg: /.*/,
                errMsg: "请填写正确的地址信息", dByte: true, required: true, maxLen: 254, minLen: 4
            },
            "mobile": {
                emptyMsg: "请填写收件人的联系电话", itemName: "收件人联系电话", reg: /^(1[3584]\d{9})$/,
                errMsg: "请填写正确的联系电话", required: true, minLen: 5
            }
        };
        this.initParam();
        this.bindEvent();
    };

    /**
     * 初始化参数信息
     */
    address.initParam = function () {
        this.isUpdate = parseInt($("#isUpdate").val(), 10);
        this.provId = parseInt($("#provId").val(), 10);
        this.oprTip = parseInt($("#oprTip").val(), 10);
        this.provinceNode = $("#province");
        this.cityNode = $("#city");
        this.regionNode = $("#regionId");

        this.allProvince = [
            {"pname": "北京", "provinceId": 0},
            {"pname": "天津", "provinceId": 1},
            {"pname": "上海", "provinceId": 2},
            {"pname": "重庆", "provinceId": 3},
            {"pname": "河北", "provinceId": 4},
            {"pname": "河南", "provinceId": 5},
            {"pname": "黑龙江", "provinceId": 6},
            {"pname": "吉林", "provinceId": 7},
            {"pname": "辽宁", "provinceId": 8},
            {"pname": "山东", "provinceId": 9},
            {"pname": "内蒙古", "provinceId": 10},
            {"pname": "江苏", "provinceId": 11},
            {"pname": "安徽", "provinceId": 12},
            {"pname": "山西", "provinceId": 13},
            {"pname": "陕西", "provinceId": 14},
            {"pname": "甘肃", "provinceId": 15},
            {"pname": "浙江", "provinceId": 16},
            {"pname": "江西", "provinceId": 17},
            {"pname": "湖北", "provinceId": 18},
            {"pname": "湖南", "provinceId": 19},
            {"pname": "贵州", "provinceId": 20},
            {"pname": "四川", "provinceId": 21},
            {"pname": "云南", "provinceId": 22},
            {"pname": "新疆", "provinceId": 23},
            {"pname": "宁夏", "provinceId": 24},
            {"pname": "青海", "provinceId": 25},
            {"pname": "西藏", "provinceId": 26},
            {"pname": "广西", "provinceId": 27},
            {"pname": "广东", "provinceId": 28},
            {"pname": "福建", "provinceId": 29},
            {"pname": "海南", "provinceId": 30},
            {"pname": "台湾", "provinceId": 31},
            {"pname": "香港", "provinceId": 32},
            {"pname": "澳门", "provinceId": 33}
        ];
        var _this = this;
        $.each(_this.allProvince, function (index, item) {
            if (item.provinceId == _this.provId) {
                _this.provinceNode.append("<option value='" + item.provinceId + "' selected='selected'>" + item.pname + "</option>");
            } else {
                _this.provinceNode.append("<option value='" + item.provinceId + "'>" + item.pname + "</option>");
            }
        });

        //修改或保存失败时
        if (_this.isUpdate > 0 || _this.oprTip == 6) {
            if (_this.provId == "0" || _this.provId == "1" || _this.provId == "2" || _this.provId == "3") {
                _this.cityNode.parent().addClass("qb_none");
            }
        } else {
            _this.cityNode.parent().addClass("qb_none");
            _this.regionNode.parent().addClass("qb_none");
        }
    };

    /**
     * 动态绑定页面事件
     */
    address.bindEvent = function () {
        var _this = this;
        //获取市
        $("#province").on("change", function () {
            var pvid = _this.provinceNode.val(), url = $("#sprovince").attr("data-url"), param = {};
            param = {
                "pvid": pvid,
                "t": new Date().getTime()
            }
            param.pvid = pvid;
            var opt = {
                type: "get",
                url: url,
                data: param,
                dataType: "json"
            };
            utils.ajaxReq(opt, function (data) {
                if (!data.errCode) {
                    _this.setSelArea(_this.cityNode, "选择市", data.data);
                    _this.regionNode.parent().addClass("qb_none");
                    if (pvid == "0" || pvid == "1" || pvid == "2" || pvid == "3") {
                        url = $("#scity").attr("data-url");
                        param.ctid = data.data[0].id;
                        _this.cityNode.val(param.ctid);
                        opt.url = url;
                        opt.data = param;
                        utils.ajaxReq(opt, function (data1) {
                            if (!data1.errCode) {
                                _this.setSelArea(_this.regionNode, "选择区", data1.data);
                                _this.cityNode.parent().addClass("qb_none");
                            }
                        });
                    }
                }
            });
        });
        //获取区
        $("#city").on("change", function () {
            var ctid = _this.cityNode.val(), url = $("#scity").attr("data-url"), param = {};
            param.ctid = ctid;
            var opt = {
                type: "get",
                url: url,
                data: param,
                dataType: "json"
            };
            utils.ajaxReq(opt, function (data) {
                if (!data.errCode) {
                    _this.setSelArea(_this.regionNode, "选择区", data.data);
                }
            });
        });

        //保存收货地址
        $("#save_addr").on("click", function (e) {
            _this.save();
            return false;
        });
    };
    /**
     * 给选择地址下拉框赋值
     * node 节点
     * opt 默认第一个值
     * data 下拉列表中的数据集
     */
    address.setSelArea = function (node, opt, data) {
        node.empty();
        node.append("<option value='-1'>" + opt + "</option> ");
        if (data.length <= 0) {
            node.parent().addClass("qb_none");
            return;
        }
        $.each(data, function (index, item) {
            //console.log('item %d is: %s', index, item);
            // node.append("<option value='" + item.id + "' selected='selected'>" + item.name + "</option>");
            node.append("<option value='" + item.id + "'>" + item.name + "</option>");
        });
        node.parent().removeClass("qb_none");
    };
    /**
     * 保存收货地址
     */
    address.save = function () {
        if (!this.check()) {
            return;
        }
        document.forms[0].submit();
    };
    /**
     * 保存之前验证
     */
    address.check = function (e) {
        var _this = this, result = validate(_this.formRule), validatePass = true, content = "", errNode = $("#region_msg");
        //请选择省、市、区
        if (_this.provinceNode.val() == "-1") {
            content = "请选择省";
            errNode.removeClass("qb_none").html(content);
            validatePass = false;
        } else if (!_this.cityNode.parent().hasClass("qb_none") && _this.cityNode.val() == "-1") {
            content = "请选择市";
            errNode.removeClass("qb_none").html(content);
            validatePass = false;
        } else if (!_this.regionNode.parent().hasClass("qb_none") && _this.regionNode.val() == "-1") {
            content = "请选择区";
            errNode.removeClass("qb_none").html(content);
            validatePass = false;
        }
        return validatePass && result;
    };

    function validate(rule) {
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
                    err.addClass("qb_none");
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
                    $("#" + id + "_msg").addClass("qb_none");
                }
            }
        });
        function showError(content, name) {
            var errNode = $("#" + name + "_msg");
            errNode.removeClass("qb_none").html(content);
            errArr.push(name);
        }

        if (errArr.length > 0) {
            document.getElementById(errArr[0]).focus();
            return false;
        }
        return true;
    }
})();