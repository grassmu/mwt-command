/**
 * 简易模块化工具，用于上线打包后脱离seajs执行，定义define use require三个函数供外部调用
 */
(function (g) {
    'use strict'
    if (g.define) {
        return;
    }
    var moduleContainer = {};
    var isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) == "[object " + type + "]";
        }
    }
    var isFunction = isType("Function"),
        isObject = isType("Object");

    /**
     * 定义模块
     * @param name  模块名            可选
     * @param depts 依赖数组          可选
     * @param fn    模块函数内容      必填
     */
    function define(name, depts, fn) {
        // 当前模块名已经存在
        if (moduleContainer[name]) {
            return;
        }
        // 如果没有传递依赖列表，则认为它是函数或者对象。支持如下两种方法定义
        /**
         *  define(function() {})
         *  define({xxx:xxxx})
         */
        if (isFunction(depts) || isObject(depts)) {
            fn = depts;
        }
        // 保存当前模块，以name命名
        moduleContainer[name] = {
            factory: fn,
            exports: '',
            initial: false
        };
    }

    /**
     * 获取依赖
     * @param name
     * @returns {*|Object|{}}
     */
    function require(name) {
        var module = moduleContainer[name];
        if (!module) {
            throw new Error("模块不存在，请检查代码");
        }
        if (!module.initial) {
            moduleExcute(name);
        }
        return module.ret;
    }

    /**
     * 模块执行
     */
    function moduleExcute(mobuleName, init) {
        var module = moduleContainer[mobuleName],
            factory,
            exports;
        if (!module) {
            throw new Error("指定模块不存在，无法执行");
        }
        factory = module.factory;
        exports = {};
        // 执行指定模块
        // 检查对应的模块是否是function，否则认为是object对象
        if (isFunction(factory)) {
            var ret = factory(require, exports, module);
            // 使用return的方式提供接口
            // 使用了exports提供接口
            // 使用module.exports提供接口
            module.ret = ret || module.exports || exports;
        } else {
            // 直接赋值即可
            module.ret = factory;
        }
        module.initial = true;
        if (init) {
            return module.ret;
        }
    }

    /**
     * 指定初始化执行入口
     * @param moduleName
     * @param callback
     */
    function use(moduleName, callback) {
        callback(moduleExcute(moduleName, true));
    }

    g.define = define;
    g.MM = {use: use};
})(window);