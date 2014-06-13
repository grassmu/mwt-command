/**
 * 活动辅助模块
 */
define(function(require, exports) {
    var util = require("util/util");
    exports.jumpOut = function(urlParam, actItem) {
        //从活动页跳转过来，从收藏夹过来，从一维码扫码进来都不做跳转
        if(urlParam.urlFrom == "act" || urlParam.scanFrom == "favor" || urlParam.scanFrom == "barcode") {
            return true;
        }
        // 活动期间添加
        if(actItem) {
            util.setCookie("cookieFrom", 1, 1, "/", ".weigou.qq.com");
            location.href = "http://"+location.host+"/act/wx/item/item-detail.shtml?ic="+urlParam.ic+"&bid="+urlParam.bid;
            return false;
        }
        return true;
    }
})