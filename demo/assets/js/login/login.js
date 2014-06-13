/**
 * @desc 统一登录模块，处理在微信内未登录的逻辑
 */
define(function(require,exports) {
    function jumpLogin(url) {
        location.href = 'http://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7e7e7713d0147fc5&redirect_uri='+url+'&response_type=code&scope=snsapi_base&state=#wechat_redirect'
    }
    exports.jumpLogin = jumpLogin;
});
