var fs = require("fs"),
    path = require("path"),
    getFileInfo = require("./getFileInfo"),
    wmt = require("./../global/kernel"),
    fileUtil = require("./../global/fileUtil"),
    concat = require("./concat"),
    compress = require("./compress"),
    parseTemplate = require("./parseTemplate"),
    // 配置文件相关信息
    config,
    // 保存文件相关配置信息
    fileData = {},
    // 要编译的文件列表
    compileFileList = [];

/**
 * 遍历basePath下的子目录，递归
 * @param baseDir
 */
function scanDir(p) {
    var baseDir = path.join(p, config.javascript.baseDir);
    wmt.fs.walk(baseDir, walkCallback, {
        filter: function (el) {
            // TODO 这里要加过滤条件，匹配配置文件中的ignoreDir项
            // 例如.svn这种文件会被忽略掉
            return el.indexOf(".") != 0;
        }
    });

    // 文件遍历回调
    function walkCallback(files) {
        compileFileList = files;
        // 开始编译文件
        preCompile();
    }
}

/**
 * 预编译文件内容
 */
function preCompile() {
    var readCount = 0;
    compileFileList.forEach(function (filePath) {
        fs.readFile(filePath, "utf-8", function (err, data) {
            if(err) {
                wmt.show.showError("reading "+filePath+" error");
                return;
            }
            readCount++;
            var dirName = path.dirname(filePath),
                fileName = path.basename(filePath),
                fileInfo;
            // utf-8 编码格式的文件可能会有 BOM 头，需要去掉
            if (data.charCodeAt(0) === 0xFEFF) {
                data = data.slice(1);
            }
            fileInfo = getFileInfo(data);
            // 保存文件相关信息，依赖的信息
            fileData[fileName] = {
                isMain: fileInfo.isMain,  // 是否是主入口
                isPublic: fileInfo.isPublic,
                isBusiness: fileInfo.isBusiness,
                fileGroupNum: fileInfo.groupNum,
                isAlone: fileInfo.alone,
                compileName: fileInfo.compileName,
                dirName: dirName,
                data: data
            };
            wmt.compileFileData = fileData;
            // 解析文件完毕
            if (readCount == compileFileList.length) {
                // 删除打包目录
                fileUtil.del(path.join(wmt.projectDir, config.javascript.desc || "./publish"));
                analysePackageType();
            }
        });
    });

}


/**
 * 分析打包方式
 */
function analysePackageType() {
    var pt = config.javascript.packageType || "all",
        ps = config.javascript.publicSeq || [];    // 需要放在打包文件前面的文件列表
    switch(pt) {
        case "all":
            wmt.compileList = generateAllConcatList(ps);
            concat.concatAll(callCompress);
            break;
        case "seperate":
            wmt.compileList = generateSeperateConcatList(ps);
            concat.concatSeperate(callCompress);
            break;
        case "single":
            wmt.compileList = generateSingleList(ps);
            concat.concatSingle(callCompress);
        default:
            break;
    }
}

/**
 * 生成all模式下打包顺序
 */
function generateAllConcatList(ps) {
    // 过滤掉优先列表里的数据
    var filterData = wmt.us.omit(fileData, ps),
        keys = wmt.us.keys(filterData);
    return ps.concat(keys);
}

/**
 * 生成public&business分开打包模式下的合并列表
 */
function generateSeperateConcatList(ps) {
    var fileInfo, allList = [], busList = [];
    for(var fileName in fileData) {
        fileInfo = fileData[fileName];
        // alone的优先级最高
        if(fileInfo.isAlone) {
            allList.push([fileName]);
        } else if(fileInfo.isPublic) {
            ps.push(fileName);
        } else if(fileInfo.isBusiness) {
            busList.push(fileName);
        }
    }
    // 剔除重复的文件
    ps = wmt.us.uniq(ps);
    // 依据指定的打包顺序进行排序
    busList.forEach(function(bl) {
        allList.push(ps.concat([bl]));
    });
    return allList;
}

/**
 * TODO 单个文件打包
 * @param ps
 */
function generateSingleList(ps) {
    var fileInfo, fileGroup = {}, groupIndex, allList = [];
    for(var fileName in fileData) {
        fileInfo = fileData[fileName];
        groupIndex = fileInfo.fileGroupNum;
        if(fileInfo.isAlone) {
            allList.push([fileName]);
        } else if(groupIndex != null) {
            if(!fileGroup[groupIndex]) {
                fileGroup[groupIndex] = [fileName];
            } else {
                fileGroup[groupIndex].push(fileName);
            }
        }
    }
    for(var g in fileGroup) {
        allList.push(fileGroup[g]);
    }
    return allList;
}

function callCompress() {
    compress.doCompress();
}

/**
 * 编译模板文件
 * @param p
 */
function compileTemplate(p) {
    console.log(p);
	console.log(p)
}






function prepareEnv(p, justJs) {
    config = wmt.util.readJson(path.resolve(p + "\\config.json"));
    // 记录下工程相关的信息
    wmt.projectDir = p;
    wmt.projectConfig = config;
    justJs ? scanDir(p) : compileTemplate(p);
}

exports.run = prepareEnv;