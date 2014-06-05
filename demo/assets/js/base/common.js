/**
 * @file-type=public
 * @file-group=0
 */
function localStore(key) {
    this.key = key;
}
$.extend(localStore.prototype, {
    setValue:function(value, isJson) {
        localStorage.setItem(this.key, isJson ? JSON.stringify(value) : value);
    },
    getValue:function() {
        return localStorage.getItem(this.key);
    },
    remove:function() {
        localStorage.removeItem(this.key);
    },
    // 检测是否支持本地缓存，safari的隐私模式不支持缓存
    support:function() {
        try {
            window.localStorage.setItem("test", true);
            window.localStorage.removeItem("test");
            return true;
        } catch(e) {
            return false;
        }
    }
});

/**
 * 常用工具函数
 * @param {Object} str
 */
var utils = {
    getQuery:function(name,url){
        //参数：变量名，url为空则表从当前页面的url中取
        var u  = arguments[1] || window.location.search.replace("&amp;", "&"),
            reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"),
            r = u.substr(u.indexOf("\?")+1).match(reg);
        return r!=null?r[2]:"";
    },
    namespace:function(str) {
        var arr=str.split(',');
        for(var i=0,len=arr.length;i<len;i++){
            // 将命名空间切成N部分, 比如mini、common等
            var arrJ=arr[i].split("."),parent={};
            for(var j = 0,jLen=arrJ.length; j < jLen; j++){
                var name = arrJ[j],child=parent[name];
                j===0?eval('(typeof '+name+')==="undefined"?('+name+'={}):"";parent='+name):(parent=parent[name]=(typeof child)==='undefined'?{}:child);
            };
        }
    },
    urlReplace:function(name, param) {
        var r = param.url || location.search.substring(1),
            reg = new RegExp("(^|&)("+name+"=)([^&]*)"),
            content = !param.content ? "" : param.content;
        return r.replace(reg, function(a,b,c,d){return !content ? "" : b+c+content});
    },
    showBubble:function(content, time) {
        if(!content) {return;}
        time = time || 1500;
        var node = $("#bubble");
        node.css("opacity",1);
        if(!node.hasClass("qb_none")) {
            node.html(content);
        }
        node.html(content).removeClass("qb_none");
        setTimeout(function() {
            node.animate({
                opacity:0
            },500, "ease", function() {
                $(this).addClass("qb_none").removeAttr("style");
            });
        },time);
    },
    /**
     * 显示提示框
     */
    showConfirm :(function() {
        var constants = {
            sureNode:$("#notice-sure"),
            cancelNode:$("#notice-cancel"),
            contentNode:$("#notice-content"),
            dialogNode:$("#message-notice")
        };
        return function(opt) {
            var config = {
                describeText:"",
                sureText:"确定",
                cancelText:"取消",
                showNum:2,
                sureFn:function() {return true},
                cancelFn:function() {return true}
            };
            $.extend(config,opt);
            // 正在显示，直接返回，不做处理
            if(!constants.dialogNode.hasClass("qb_none")) {
                return;
            }
            constants.dialogNode.removeClass("qb_none");
            // 给按钮绑定事件
            constants.sureNode.on("click",handleSure);
            constants.cancelNode.on("click",handleCancel);
            // 只显示一个按钮，则隐藏取消按钮
            if(config.showNum == 1) {
                constants.cancelNode.addClass("qb_none");
            }
            // 两个按钮要显示的文字
            constants.sureNode.html(config.sureText);
            constants.cancelNode.html(config.cancelText);
            constants.contentNode.html(config.describeText);

            function handleSure() {
                config.sureFn.call(this,arguments);
                restoreDefault();
            }
            function handleCancel() {
                config.cancelFn.call(this,arguments);
                restoreDefault();
            }
            function restoreDefault() {
                constants.contentNode.empty();
                constants.sureNode.html("确定").off("click",handleSure);
                constants.cancelNode.html("取消").off("click",handleCancel);
                constants.dialogNode.addClass("qb_none");
            }
        }
    })(),
    ajaxReq:function(opt, suc, error) {
        var option = {
            type:"GET",
            url:"",
            data:"",
            dataType:"html",
            timeout:5000
        };
        $.extend(option,opt);
        if(!error) {
            error = function() {}
        }
        $.ajax({
            type:option.type,
            url:option.url,
            data:option.data,
            dataType:option.dataType,
            success:function(data) {
                if(option.dataType == "json") {
                    data.errCode = parseInt(data.errCode, 10);
                }
                suc(data);
            },
            error:error
        });
    },
    showAjaxErr:function(json, msg) {
        utils.showBubble(json.msgType ? json.errMsg : msg);
    },
    strReplace:function(template, json) {
        var s = template;
        for(var d in json) {
            var reg = new RegExp("{#"+d+"#}","g");
            s = s.replace(reg, json[d]);
        }
        return s;
    },
    cssProperty:(function() {
        var css3 = {}, docElement = document.documentElement, mod = 'modernizr';
        return {
            injectStyle:function(rule,callback){
                var style,ret,div = document.createElement('div'),
                    body = document.body, fakeBody = body || document.createElement('body');
                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
                div.id = mod;
                (body ? div : fakeBody).innerHTML += style;
                fakeBody.appendChild(div);
                if(!body){
                    fakeBody.style.background = "";
                    docElement.appendChild(fakeBody);
                }
                ret = callback(div,rule);
                !body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);
                return !!ret;
            },
            pSupport:function(pName) {
                var style = docElement.style,
                    css3s = 'Webkit Moz O ms'.split(' '),
                    cstr = pName.charAt(0).toUpperCase() + pName.substr(1),  //首字母转换成大写
                    rstr = (cstr + ' ' + css3s.join(cstr + ' ') + cstr).split(' '),//属性都加上前缀
                    result = null;
                for(var i=0,len=rstr.length;i<len;i++){
                    if(rstr[i] in style){
                        result = rstr[i];
                        break;
                    }
                }
                return result;
            },
            has3d:function() {
                var ret = !!this.pSupport('perspective');
                if(ret && 'webkitPerspective' in docElement.style ) {
                    this.injectStyle('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
                        ret = node.offsetLeft === 9 && node.offsetHeight === 3;
                    });
                }
                return ret;
            }
        };
    })(),
    getCookie:function(name) {
        //读取COOKIE
        var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"), val = document.cookie.match(reg);
        return val ? (val[2] ? unescape(val[2]) : "") : null;
    },
    delCookie:function(name, path, domain, secure) {
        //删除cookie
        var value = this.getCookie(name);
        if(value != null) {
            var exp = new Date();
            exp.setMinutes(exp.getMinutes() - 1000);
            path = path || "/";
            document.cookie = name + '=;expires=' + exp.toGMTString() + ( path ? ';path=' + path : '') + ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
        }
    },
    setCookie:function(name, value, expires, path, domain, secure) {
        //写入COOKIES
        var exp = new Date(), expires = arguments[2] || null, path = arguments[3] || "/", domain = arguments[4] || null, secure = arguments[5] || false;
        expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : "";
        document.cookie = name + '=' + escape(value) + ( expires ? ';expires=' + exp.toGMTString() : '') + ( path ? ';path=' + path : '') + ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
    },
    validate:function(rule) {
        var errArr = [];
        $.each(rule, function (id, item) {
            var node = item.node || $("#" + id), value = item.value || node.val().toString();
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
    },
    payDeal:function(json) {
        var data = json.data;
        // 在线支付
        if (!data.payType) {
            // 财付通
            if(!data.payChannel) {
                location.href = data.tenpayUrl;
            } else {
	            // 将URL写缓存，用于微信支付取消后返回
                var st = new localStore("payCancelBack");
                st.setValue(encodeURIComponent(location.href));
                location.href = window.basePath+"/cn/deal/pay.xhtml?showwxpaytitle=1&dc="+data.dealCode+"#wechat_redirect";
            }
        } else {
            location.href = window.basePath + "/cn/deal/codSuc.xhtml?dc=" + data.dealCode + "&suin=" + data.sellerUin + "&" + window.baseParam;
        }
    }
};

function getCmdyCount() {
    var cartNode = $(".icon_number_bubble");
    if(cartNode.length == 0) {return;}
    utils.ajaxReq({
        url:window.basePath+"/cn/cmdy/count.xhtml",
        dataType:"json",
        data:{
            t:+new Date()
        }
    }, function(json) {
        if(!json.errCode && json.data > 0) {
            json.data = json.data >= 100 ? "N" : json.data;
            cartNode.html(json.data).removeClass("qb_none");
        } else {
            cartNode.addClass("qb_none");
        }
    });
};
// 公共一些页面处理逻辑
$(document).ready(function() {
    // 返回按钮
    $(".go_back").on("click", function() {
        history.go(-1);
    });
    var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
    // 监听事件
    window.addEventListener(orientationEvent, function () {
        window.location.reload();
    }, false);
    // 查询购物车商品数量
    getCmdyCount();
    // 屏幕滚动
    var curOffset = 0, fixHead = $("#lay_head_fixed"), wh = window.innerHeight, ph = document.documentElement.scrollHeight - 45;
    // 屏幕高度和
    if(wh + 45 >= ph) {
        return;
    }
    if($.os.android) {
        $("#lay_head").addClass("qb_none");
        fixHead.removeClass("qb_none");
        return;
    }
    $(window).on("scroll", handleBanner);
    function handleBanner() {
        var p = window.pageYOffset;
        // 把元素改成fixed定位
        if(p > 45 && p - curOffset > 0) {
            fixHead.addClass("animate hidden_css3").removeClass("qb_none");
        } else if(p - curOffset < 0) {
            if(p <= 0) {
                fixHead.addClass("qb_none");
            } else {
                fixHead.removeClass("hidden_css3").addClass("animate");
            }
        }
        curOffset = p;
    }
});

var business = {
    focus:function(text, callback) {
        utils.showConfirm({
            describeText:text,
            sureFn:function() {
                WeixinJSBridge.invoke("addContact", {"webtype":"1", "username":window.wxInfo.wxId}, function (res) {
                    if(res.err_msg=="add_contact:ok" || res.err_msg=="add_contact:added"){
                        // 扭转状态
                        window.wxInfo.isFocus = "true";
                        var img = new Image();
                        img.src = window.basePath+"/cn/focus/updateRelate.xhtml";
                        callback();
                    }
                });
            }
        });
    }
};