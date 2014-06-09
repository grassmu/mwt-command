var mwt = require("../global/kernel"),
    path = require("path"),
    cheerio = require('cheerio'),
    fileMap = {},
    tplConfig;

function buildIndex() {
    var tplPath, files;
    tplConfig = mwt.projectConfig.template;
    tplPath = path.join(mwt.projectDir, tplConfig.baseDir);
    // 判断配置文件中是否填写了templates配置项，
    // 有配置则按照配置文件方式读取
    if(tplConfig.templates && !mwt.us.isEmpty(tplConfig.templates)) {
        files = [];
        mwt.us.each(tplConfig.templates, function(val, key) {
            var path = tplPath +"\\"+key;
            val.forEach(function(f) {
                files.push(path+"\\"+f);
            });
        });
        walkResult(files);
    } else {
        mwt.fs.walk(tplPath, walkResult);
    }
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
            tempData;
        if(fileMap[fileName]) {
           return;
        }
        tempData = fileMap[fileName] = {}
        includeList = tempData["includeList"] = data.match(/<!--\s*#\s*include\s*virtual=.*-->/gm);
        tempData["deptPlaceHolder"] = data.match(/<!--\s*dependency\s*placeholder\s*-->/gm);
        tempData["script"] = $("script[src]");

        // 某一个文件无任何依赖，但是有被其他文件所引用，则认为该文件需要被编译
        // 某一个文件有引用其他文件，但是它本身没有被依赖，则认为该文件是主文件入口
        // 递归调用该方法
        console.log(fileName)
        includeList ? includeList.forEach(function(inc) {
            var p = inc.match(/virtual=['"]([^'"]+)['"]/)[1];

            if(path.extname(p) != ".dot") {
                // 递归调用
                anasyseContent(path.join(path.dirname(file), p));
            } else {
                // 把dot文件路径写入
                !tempData["dot"] ? tempData["dot"] = [] : tempData["dot"].push(p);
            }
            mwt.templateMap = fileMap;
        }) : mwt.templateMap = fileMap;
    });
}
exports.templateBuild = buildIndex;
