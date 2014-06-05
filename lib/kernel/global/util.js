var _ = {},
    show = require("./show"),
    fs = require("fs"),
    util = require("util"),
    http = require("http"),
    crypto = require("crypto"),
    parse = require('url').parse;

/**
 * 根据文件内容生成文件名
 * @param data
 * @param len
 * @returns {string}
 */
_.md5 = function (data, len) {
    var md5sum = crypto.createHash('md5'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    return md5sum.digest('hex').substring(0, len || 8);
};

/**
 * 远程下载文件
 * @param url
 * @param callback
 */
_.download = function (url, callback) {
    getRemoteFile(url, function(err, data) {
        callback(err, data);
    })
}

/**
 * 字符串true转换为boolean型true
 * @param str
 * @returns {boolean}
 */
_.getBoolean = function(str) {
    if(!str) {
        return false;
    }
    return str === "true" ? true : false;
}

/**
 * 读取json文件
 * @param path
 * @returns {*}
 */
_.readJson = function(path) {
    var data = fs.readFileSync(path, "utf-8");
    if(!data) {
        return false;
    } else {
        return JSON.parse(data);
    }
}

/**
 * 校验目录是否存在
 * @param dirPath
 * @returns {*}
 */
_.validateDir = function(dirPath) {
    return fs.existsSync(dirPath);
}

function getRemoteFile(url, callback) {
    var info = parse(url),
        path = info.pathname + (info.search || ''),
        options = {
            host: info.hostname,
            port: info.port || 80,
            path: path,
            method: 'GET'
        };
    var req = null, request_timeout = null;
    request_timeout = setTimeout(function () {
        request_timeout = null;
        req.abort();
        callback(new Error('Request timeout'));
    }, 20000);

    req = http.request(options, function (res) {
        clearTimeout(request_timeout);
        // 数据
        var chunks = [], length = 0, response_timeout = null;
        response_timeout = setTimeout(function () {
            response_timeout = null;
            req.abort();
            callback(new Error('Response timeout'));
        }, 20000);
        res.on('data',function (chunk) {
            length += chunk.length;
            chunks.push(chunk);
        }).on('end',function () {
                if (response_timeout) {
                    clearTimeout(response_timeout);
                    callback(null, chunks.join(""));
                }
            }).on('error',function (err) {
                clearTimeout(response_timeout);
                callback(err, res);
            }).on('aborted', function () {
                if (response_timeout) {
                    callback(new Error('Response aborted'), res);
                }
            });
    }).on('error', function (err) {
            if (request_timeout) {
                clearTimeout(request_timeout);
                callback(err);
            }
        });
    req.end();
};

module.exports = _;