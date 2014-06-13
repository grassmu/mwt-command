/**
 * 商品属性渲染及选择模块
 */
define(function (require, exports, module) {
    var doT = require("base/doT"),
        $ = require("base/zepto"),
    // 存放用于html渲染的数据
        renderData = {},
    // 存放已选择的属性，用于属性关系互斥的判断
        matchProperty = [],
    // sku组合列表数组
        propGroup = [],
    // 已经选择的属性个数
        selectedCount = 0,
    // 可用的库存组合对象
        availData,
    // 库存列表
        skus,
    //  当前库存组合的库存对象
        curStockObj,
    // 没有属性提交时的提示语
        errorMsg,
    // 选择的属性
        buyProperty;

    /**
     * 初始化展示属性列表时调用
     * @param data 必须包含两个字段
     *          data = {availSku:{},sku:{}}
     * @param [editAttr] 编辑模式下的属性项
     * @returns {*}
     */
    function loopAttr(data, editAttr) {
        // reset some parameter
        buyProperty = "";
        selectedCount = 0;
        matchProperty = [];
        curStockObj = null;
        // 没有属性
        if(!data.sku.length) {
            return "";
        }
        renderData.propList = [];
        availData = data.availSku;
        skus = data.sku;
        var errNotify = [], propTpl = doT.template($("#prop-tpl").html());
        // 先对属性做索引，将所有的key放数组中
        for (var key in availData) {
            if (availData.hasOwnProperty(key)) {
                propGroup.push(key);
            }
        }
        skus.forEach(function (sku, index) {
            var obj = {pName: sku.pName, pList: []};
            sku.pList.forEach(function (it) {
                var temp = {};
                temp.key = sku.pName + ":" + it;
                temp.sname = it;
                // 单个属性默认需要选中，多个属性的情况下，如果某个属性库存为0，也需要给灰掉
                temp.className = sku.pList.length === 1 || (editAttr && editAttr.indexOf(temp.key) != -1) ? "current" : _loopAvailProp(temp.key) ? '' : "disabled";
                obj.pList.push(temp);
            });
            renderData.propList.push(obj);
            // 单个属性，要将它选中，并且作为其他属性的匹配
            if (sku.pList.length == 1) {
                matchProperty[index] = sku.pName + ":" + sku.pList[0];
                selectedCount++;
            } else {
                errNotify.push(sku.pName);
            }
        });
        // 编辑模式下
        if(editAttr) {
            var attrs = editAttr.split("|");
            selectedCount = attrs.length;
            matchProperty = attrs;
        }
        _statisticSelected();
        errorMsg = "请选择" + errNotify.join("/");
        data = null;
        // 返回渲染好的html代码
        return propTpl(renderData);
    }

    /**
     * 循环可用属性
     * @param key
     * @returns {boolean}
     * @private
     */
    function _loopAvailProp(key) {
        var prop;
        for (prop in availData) {
            if (availData.hasOwnProperty(prop) && prop.indexOf(key) != -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * 依据用户选择属性，进行匹配
     * @param key
     * @param index
     * @param propName
     * @param pNodeList
     * @returns {*} object 库存对象
     */
    function queryMatch(key, index, propName, pNodeList) {
        var availAttr = [], flag;
        // 统计已选择的数量，不存在的时候记录
        if (!matchProperty[index]) {
            selectedCount++;
        }
        matchProperty[index] = key;
        availAttr[index] = key;
        // 循环属性项
        skus.forEach(function (item, i) {
            var pName = item.pName, pList = item.pList, skuGroup, propArr, node = pNodeList.eq(i), spans = node.find("span");
            if (pName !== propName) {
                $.each(pList, function (seq, prop) {
                    skuGroup = pName + ":" + prop;
                    propArr = [];
                    propArr.push(skuGroup);
                    $.each(matchProperty, function (k, v) {
                        if (v && v.match(/.*(?=:)/)[0] != pName) {
                            propArr.push(v);
                        }
                    });
                    $.each(propGroup, function (tk, tv) {
                        flag = true;
                        flag = propArr.every(function (it) {
                            return tv.indexOf(it) !== -1;
                        });
                        if (flag) {
                            return false;
                        }
                    });
                    flag ? spans.eq(seq).removeClass("disabled") : spans.eq(seq).addClass("disabled");
                });
            }
        });
        _statisticSelected();
        return curStockObj;
    }

    function _statisticSelected() {
        // 没有选完
        if (selectedCount != skus.length) {
            return;
        }
        var rule = matchProperty.join("|");
        buyProperty = rule;
        curStockObj = availData[rule];
    }

    function getErrorMsg() {
        return errorMsg;
    }

    function getRule() {
        return buyProperty;
    }

    module.exports = {
        initAttr:loopAttr,
        queryMatch:queryMatch,
        getErrMsg:getErrorMsg,
        getRule:getRule
    };
})