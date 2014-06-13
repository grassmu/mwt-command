/**
 * @desc 微信页面关注模块
 * @params
 *          desc : dialog的文字描述
 *          wxId ：要关注的微信账户
 *          callback : 关注后的回调函数
 */
define(function(require, exports) {
    function focusInit(wxId, callback) {
        WeixinJSBridge.invoke("addContact", {"webtype":"1", "username":wxId}, function (res) {
            if(res.err_msg=="add_contact:ok" || res.err_msg=="add_contact:added"){
                callback(true);
            }
        });
    }
    exports.focusInit = focusInit;
})