/**
 * 信息采集上报模块
 */
define(function (require, exports) {
    var $ = require("base/zepto");
    var data = {
            "screen": "",
            "system": "",
            "version": "",
            cssLoadTime:"",
            "renderTime": "",
            "timeCost": "",
            deviceRatio: "",
            "netType": "",
            "errMsg": "",
            "wxVersion": "",
            "machine": "",
            "webkit": ""
        },
        reportCalled = false;
    // 上报信息
    function reportInit() {
        !("WeixinJSBridge" in window) ? document.addEventListener("WeixinJSBridgeReady", weixinReady, false) : weixinReady();
        // 支持performance接口
        var per = window.performance || window.webkitPerformance;
        if (per) {
            var time = per.timing, t0, temp,
                keyMap = ["navigationStart", "unloadEventStart", "unloadEventEnd", "redirectStart", "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart", "connectEnd", "requestStart", "responseStart", "responseEnd", "domLoading", "domInteractive", "domContentLoadedEventStart", "domContentLoadedEventEnd", "domComplete", "loadEventStart", "loadEventEnd"];
            t0 = time[keyMap[0]];
            data["navigationStart"] = t0;
            for (var i = 1, l = keyMap.length; i < l; i++) {
                temp = time[keyMap[i]]; // 记录各时间点
                temp = (temp ? (temp - t0) : 0);
                temp > 0 && (data[keyMap[i]] = temp);
            }
        }
        return {
            reportRenderTime: function () {
                var arr = reportTime;
                // 记录从代码开始执行到主体页面渲染完成的时间
                data.renderTime = arr[3] - arr[2];
            },
            reportDownTime: function () {
                var arr = reportTime;
                // 记录从开始渲染到脚本开始执行的时间，包含脚本下载时间
                data.timeCost = arr[2] - arr[1];
                // 记录css加载时间
                data.cssLoadTime = arr[1] - arr[0];
            },
            reportError: function (msg) {
                data.errMsg = msg;
            },
            report: function () {
                reportCalled = true;
                var webkitArr = window.ua.match(/applewebKit\/([0-9\.]*)/i),
                    machineArr = window.ua.match(/;([^;]*)(?=\sbuild)/i),
                    width = window.screen.width,
                    height = window.screen.height,
                    result;
                // 系统版本
                data.version = $.os.version;
                // 系统类型
                result = (sysArr && sysArr[0]) || "unknown";
                if(result == "iPhone" || result == "iPad" || result == "iPod") {
                    data.system = "ios";
                } else {
                    data.system =result;
                }
                // 屏幕像素比
                data.deviceRatio = window.devicePixelRatio;
                // 屏幕分辨率  ios设备返回的分辨率是viewport的值，计算实际值需要乘以像素比
                data.screen = $.os.ios ? width*data.deviceRatio+"-"+height*data.deviceRatio : width+"-"+height;
                // 获取微信版本
                data.wxVersion = (wxArr && wxArr[1]) || null;
                // webkit内核版本
                data.webkit = (webkitArr && webkitArr[1]) || null;
                // 获取手机型号
                data.machine = data.system == "Android" ? (machineArr && machineArr[1] || "未知机型") : result;
                // 如果在上报的时候还未获取到网络，则延时上报
                if(!data.netType) {
                    weixinReady();
                } else {
                    upload();
                }
            }
        }
    }

    function upload() {
        data.errMsg = "o2ov1";
        var img = new Image();
        img.src = window.basePath+"/cn/my/logMyInfo.xhtml?logData="+JSON.stringify(data)+"&t="+(+new Date());
    }

    function weixinReady() {
        WeixinJSBridge && WeixinJSBridge.invoke && WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
            data.netType = e.err_msg;
            reportCalled && upload();
        });
    }

    exports.reportInit = reportInit;
})