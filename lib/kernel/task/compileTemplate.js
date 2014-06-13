/**
 * 编译静态文件
 */
var mwt = require("./../global/kernel"),
    path = require("path"),
    uglify = require("uglify-js"),
    dot = require("doT"),
    cmd;

exports.buildPage = function(cmdType) {
    var config = mwt.projectConfig.template,
        tplPath = path.join(mwt.projectDir, config.baseDir),
        files = [];
    cmd = cmdType;
    // 读取配置文件信息
    mwt.us.each(config.templates, function (val, key) {
        var path = tplPath + "\\" + key;
        val.forEach(function (f) {
            files.push(path + "\\" + f);
        });
    });

    files.forEach(function(filePath) {
        mwt.fs.readFile(filePath, "utf-8", function(err, data) {
            // 分析页面
            // 搜集include的代码，先把include的代码引入进来
            var incList = data.match(mwt.includeComment),
                dir = path.dirname(filePath);
            analyseInclude(incList, data, dir);
        });
    });
}

/**
 * 分析页面中的include
 * @param incList
 * @param data
 * @param dir
 */
function analyseInclude(incList, data, dir) {
    if(incList && incList.length > 0) {
        var compileMap = {};
        incList.forEach(function(inc) {
            var p = inc.match(/virtual=['"]([^'"]+)['"]/)[1],
                ext = path.extname(p),
                fileName = path.basename(p, ext),
                ap = path.join(dir, p);
            // 针对dot模板的指定后缀，如果遇到是jst的，会将模板编译为js文件，放到指定位置
            if(ext == ".dot" || ext == ".jst") {
                compileDot(ap, fileName);
            }
        })
    }
}

function compileDot(p) {
    // 编译dot模板
    return dot.process({
        path: path.dirname(p),
        destination: path.join(mwt.projectDir, mwt.projectConfig.javascript.baseDir)+"\\views"
    });
}

