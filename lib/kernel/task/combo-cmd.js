var fs = require("fs"),
    path = require("path"),
    moduleType = require("./getFileInfo"),
    fileUtil = require("./../global/fileUtil"),
    config = require("./config"),
    concat = require("./concat"),
    ast = require('cmd-util').ast,
    child_process = require("child_process"),
    parseTemplate = require("./parseTemplate"),
// 保存文件相关配置信息
    fileData = {},
// 计数器
    count = 0,
// 要编译的文件列表
    compileFileList = [];

/**
 * 遍历basePath下的子目录，递归
 * @param baseDir
 */
function scanDir(baseDir) {
    var dirList = fs.readdirSync(baseDir);
    dirList.forEach(function (dir) {
        // 判断是否在忽略列表里
        if (forEachIgnore(dir)) {
            return;
        }
        var pathName = baseDir + "/" + dir,
            state = fs.statSync(pathName);  // 读取文件状态
        // 递归调用
        if (state.isDirectory()) {
            scanDir(pathName);
        } else {
            compileFileList.push(pathName);
        }
    });
}

/**
 * 预编译文件内容
 */
function preCompile() {
    var readCount = 0;

    compileFileList.forEach(function (filePath) {
        fs.readFile(filePath, "utf-8", function (err, data) {
            readCount++;
            var code,
                dirName = path.dirname(filePath),
                extName = path.extname(filePath),
                fileName = path.basename(filePath, extName),
                dept,
                newData,
                moduleName;
            // utf-8 编码格式的文件可能会有 BOM 头，需要去掉
            if (data.charCodeAt(0) === 0xFEFF) {
                data = data.slice(1);
            }
            console.log("translate cmd module " + fileName);
            // 解析CMD模块内容
            code = ast.parseFirst(data);
            dept = code && code.dependencies;
            // 获取文件夹名字，用于模块命名
            dirName = dirName.substr(config.baseDir.length + 1, dirName.length);
            moduleName = dirName + "/" + fileName;
            // 调用ast模块，修改模块化代码中的
            newData = ast.modify(data, {id: moduleName});
            // 用该方法返回修改后的内容，参数为uglify参数
            newData = newData.print_to_string({
                beautify: true,
                comments: false
            });
            // 保存文件相关信息，依赖的信息
            fileData[moduleName] = {
                dependency: dept || [], // 依赖项
                isMain: moduleType(data).isMain,  // 是否是主入口
                isPublic:moduleType(data).isPublic,
                ext: extName,            // 文件类型
                data: newData
            };
            // 分析依赖完毕
            if (readCount == compileFileList.length) {
                // 删除打包目录
                fileUtil.delSync(config.compileDir);
                analyseRequire();
//                config.copy.forEach(function (dir) {
//                    fileUtil.cpdir(config.baseDir + "/" + dir, config.compileDir + "/" + dir);
//                });
//                var csp = child_process.spawn("node", ["compress.js"]);
//                csp.stdout.setEncoding("utf-8");
//                csp.stdout.on("data", function(data) {
//                    console.log(data);
//                });
                parseTemplate();
            }
        });
    });
}

/**
 * 分析模块依赖，防止重复打包
 * @param content
 */
function analyseRequire() {
    var temp, mainFile = [];
    for (var file in fileData) {
        temp = fileData[file];
        // 是主文件，分析主文件的依赖文件，按照递归的方式分析它所依赖文件的依赖关系，形成map表
        if (temp.isMain) {
            mainFile.push(file);
            console.log("analysing main module " + file);
            analyseSubRequire(file, function (list) {
                temp.dependency = list;
                // 调用文件合并函数，纯内存操作，不再读取文件
                concat(list, fileData, file);
            });
        }
    }
}

/**
 * 分析主文件依赖的依赖
 * @param mainKey
 * @param callback  回调函数
 */
function analyseSubRequire(mainKey, callback) {
    var tempData = fileData[mainKey], deptList = [], tempObject = {};
    if (!tempData.dependency.length) {
        return callback(tempData.data);
    }
    loopDept(tempData.dependency);
    function loopDept(list) {
        if (!list.length) {
            return;
        }
        // 循环依赖列表
        list.forEach(function (moduleName) {
            if (!tempObject[moduleName]) {
                tempObject[moduleName] = 1;
                deptList.push(moduleName);
                loopDept(fileData[moduleName].dependency);
            }
        });
    }

    tempObject = null;
    callback(deptList)
}

/**
 * 写文件
 * @param saveDir
 * @param data
 */
function writeFile(saveDir, data) {
    fileUtil.writeFile(config.tempDir + "/" + saveDir, data, function () {
        console.log("writing file " + path.basename(saveDir));
        count++;
        // 判断是否是最后一个了
        if (count == compileFileList.length) {
            analyseRequire();
            config.copy.forEach(function (dir) {
                fileUtil.cpdir(config.baseDir + "/" + dir, config.compileDir + "/" + dir);
            });
        }
    });
}

/**
 * 循环忽略列表
 * @param dirName
 * @returns {boolean}
 */
function forEachIgnore(dirName) {
    return config.ignoreDir.some(function (dir) {
        return dir === dirName;
    })
}

//scanDir(config.baseDir);
//preCompile();