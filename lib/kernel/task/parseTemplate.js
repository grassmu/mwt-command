var fileUtil = require("../global/fileUtil"),
    path = require("path"),
    uglify = require("uglify-js"),
    config = require("./config"),
    baseDir = config.templateBase,
    templates = config.templates,
    dot = require("doT");

function parseTemplate() {
    for (var dirName in templates) {
        templates[dirName].mainFiles.forEach(function (file) {
            // 读取该目录下的主文件
            (function (name, file) {
                fileUtil.readFile(path.resolve(baseDir + "/" + name + "/" + file), "utf-8", function (err, data) {
                    analysePage(name, data, file);
                });
            })(dirName, file);
        });
    }
}

/**
 * 分析文件include信息k
 * @param name  读取的目录名字
 * @param data  读取的文件数据
 * @param file  待读取的文件名字
 */
function analysePage(name, data, file) {
    var templateList = data.match(/\{include.*\}/gm);
    templateList.forEach(function (tpl) {
        var type = tpl.match(/type="(.*?)"/)[1],
            src = tpl.match(/src="(.*?)"/)[1];
        switch (type) {
            case "html":
            case "shtml":
                data = includeHtml(path.join(baseDir + "/" + name, src), data, tpl, type);
                break;
            case "dot":
                data = compileDot(name, src, data, tpl);
                break;
            case "script":
                includeScript();
                break;
            case "css":
                includeCss();
                break;
            case "depts":
                data = replaceDepts(tpl, src, data);
                break;
            default:
                console.log("can not find matched type")
        }
    });
    fileUtil.writeFile(config.templateDir + "/" + name + "/" + file, data, "utf-8", function () {
    })
}

/**
 * 解析文件include
 * @param filePath  被include的文件路径
 * @param data      要解析的文件内容
 * @param tpl       要被替换的模板
 * @param surfix    后缀名
 */
function includeHtml(filePath, data, tpl, surfix) {
    var includeData = fileUtil.readFileSync(filePath + "." + surfix, "utf-8");
    data = data.replace(tpl, includeData)
    return data;
}

/**
 * 编译dot模板文件，执行include动作
 * @param name
 * @param src
 * @param pageData
 * @param tpl
 * @returns {XML|string}
 */
function compileDot(name, src, pageData, tpl) {
    var config = templates[name];
    // 编译dot模板
    var dirTemplate = dot.process({
        path: baseDir + "/" + name + (config.tpls ? "/" + config.tplDir : "/tpl")
    });
    // 使用了模板
    if (dirTemplate[src]) {
        var result = uglify.minify(dirTemplate[src].toString(), {
            fromString: true
        });
        pageData = pageData.replace(tpl, "<script type='template' id='" + src + "-tpl'>\n" +
            wrapCode(result.code.replace(/anonymous/, "").replace(/\n/gm, "")) + "\n</script>");
        return pageData;
    }
}

function wrapCode(code) {
    var closure = ['(function() {return ']
    closure.push(code);
    closure.push('})()');
    return closure.join("");
}

function includeScript() {

}

function includeCss() {

}

/**
 * 替换依赖map文件
 * @param tpl   被替换的模板行
 * @param src   源路径
 * @param data  页面数据
 */
function replaceDepts(tpl, src, data) {
    var arr = ["<script type='template' id='" + path.basename(src) + "-dept-tpl'>\n"];
    var fileData = fileUtil.readFileSync(config.compileDir + "/" + src + "_require_map.json", "utf-8");
    arr.push(fileData);
    arr.push("\n</script>");
    data = data.replace(tpl, arr.join(""));
    return data;
}

//parseTemplate();

module.exports = parseTemplate;