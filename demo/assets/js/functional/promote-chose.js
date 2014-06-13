/**
 * 优惠信息选择组件
 *      return {
 *          init:优惠初始化方法
 *          reCountPromote:重新计算满减
 *      }
 */
define(function (require, exports, module) {
    var $ = require("base/zepto");
    var option = {
        // 满立减优惠
        promoteList: "",
        // 优惠券列表
        couponList: "",
        // 展示模板
        template: "",
        // 购买数量，用于判断是否满足优惠条件
        buyCount: "",
        // 付款价格，用于判断是否满足优惠条件
        price: ""
    }, promote;

    // 初始化函数，配置信息
    function promoteInit(config) {
        $.extend(option, config);
        promote = {};
        initCoupon();
        scanPromote();
        return promote;
    }

    // 扫描优惠券列表
    function initCoupon() {
        var coupon = option.couponList, first, temp;
        if (coupon.length == 0) {
            return;
        }
        // 按照金额进行排序 降序排序
        coupon.sort(function (a, b) {
            if (a.amount < b.amount) return 1;
            if (a.amount > b.amount) return -1;
            return 0;
        });

        coupon.map(function (cp) {
            cp.formatDesc = "使用微信" + (cp.amount / 100).toFixed(2) + "元优惠券";
            cp.free = false;
        });

        promote.couponHtml = option.template({
            list: coupon,
            tag: "handleCoupon",
            typeText: "不使用微信优惠券",
            noneId: "noneCp"
        });

        first = coupon[0];
        promote.couponId = first.id;
        promote.couponAmount = -first.amount;
        // 重新计算价格
        temp = option.price - first.amount;
        option.price = temp < 1 ? 1 : temp;
        return promote;
    }

    // 扫描满立减优惠列表
    function scanPromote() {
        var proList = option.promoteList, countResult = [], first;
        // 没有满减条件
        if (proList.length == 0) {
            return '';
        }
        proList.forEach(function (pro) {
            var result = comparePromote(pro);
            // 将当前优惠金额添加到对象中
            pro.amount = result.reduce;
            pro.freeFee = result.freeFee;
            // 如果优惠金额是大于0的 或者是 扫码购、店员app多品和单品下单
            (pro.amount || pro.guide) && countResult.push(pro);
            result = null;
        });
        // 没有符合当前价格的满减优惠
        if (countResult.length == 0) {
            return promote;
        }
        // 依据减的金额进行排序
        countResult.sort(function (a, b) {
            if (a.amount < b.amount) return -1;
            if (a.amount > b.amount) return 1;
            return 0;
        });

        // 遍历优惠，生成优惠文案
        countResult.map(function (cr) {
            cr.formatDesc = "微购物商品" + cr.desc.replace(/\s就/, '');
            cr.free = cr.freeFee;
            cr.id = cr.ruleId;
        });

        promote.promoteHtml = option.template({
            list: countResult,
            tag: "handlePromote",
            typeText: "不参加微购物促销活动",
            noneId: "noneP"
        });

        first = countResult[0];
        promote.promId = first.id;
        promote.reduce = first.amount;
        promote.isFreeFee = first.free;

        return promote;
    }

    // 比较满减优惠金额
    function comparePromote(rule) {
        var condition, countRule, reduce = 0, freeFee = false;
        // 购买件数
        if (rule.cndCmdyNum && option.buyCount >= rule.cndCmdyNum) {
            condition = rule.disCount || rule.deRate;
            countRule = rule.disCount ? "*" : "-";
        } else if (rule.cndSumFee && option.price >= rule.cndSumFee) {
            // 购买金额
            condition = rule.deRate || rule.disCount;
            countRule = rule.deRate ? "-" : "*";
        }
        if (condition) {
            // 包邮
            if (rule.feeCarriageTag) {
                freeFee = true;
            }
            reduce = -(option.price - eval(option.price + countRule + condition));
        }
        return {
            freeFee: freeFee,
            reduce: reduce
        };
    }

    module.exports = {
        init: promoteInit
    };
});