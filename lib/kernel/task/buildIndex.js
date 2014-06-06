var mwt = require("../global/kernel"),
    path = require("path"),
    cheerio = require('cheerio'),
    fileMap = {},
    templateConfig;

function buildIndex(dirPath) {
    var tplPath, config = mwt.util.readJson(path.resolve(dirPath + "\\config.json"));
    // 记录下工程相关的信息
    mwt.projectDir = dirPath;
    mwt.projectConfig = config;
    templateConfig = config.template;
    tplPath = path.join(dirPath, templateConfig.baseDir);
    mwt.fs.walk(tplPath, walkResult);
}

function walkResult(files) {
    files.forEach(function(file) {
        disptchFileExt(file);
    })
}

/**
 * 依据文件后缀 分发不同的处理方法
 * @param file
 */
function disptchFileExt(file) {
    var ext = path.extname(file);
    switch(ext) {
        case ".shtml":
        case ".html":
        case ".htm":
        case ".jsp":
            anasyseContent(file);
            break;
    }
}

//<!--\s*#\s*include\s*virtual=['"]([^'"]+)['"]\s*-->
function anasyseContent(file) {
    mwt.fs.readFile(file, "utf-8", function(err, data) {
        var fileName = path.basename(file),
            includeList,
            $ = cheerio.load(data),
            tempData = fileMap[fileName] = {};
        includeList = tempData["includeList"] = data.match(/<!--\s*#\s*include\s*virtual=.*-->/gm);
        tempData["deptPlaceHolder"] = data.match(/<!--\s*dependency\s*placeholder\s*-->/gm);
        tempData["script"] = $("script[src]");

        // 递归调用该方法
        includeList ? includeList.forEach(function(inc) {
            var p = inc.match(/virtual=['"]([^'"]+)['"]/)[1];
            if(path.extname(p) != ".dot") {
                // 递归调用
                anasyseContent(path.join(path.dirname(file), p));
            }

            mwt.templateMap = fileMap;
        }) : mwt.templateMap = fileMap;
    });
}
exports.templateBuild = buildIndex;
