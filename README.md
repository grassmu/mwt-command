# mwt配置文件指南(config.js)

---
## javascript配置项
> * baseDir       相对于配置文件的目录路径
> * tempDir       编译文件的临时存路径
> * ignoreDir     编译过程中需要忽略的目录列表(数组)
> * priority      打包时需要放在编译文件前面的文件列表
> * clean         编译后是否清理临时目录
> * packageType   打包类型
> * compileName   打包后的文件名
> * dest          打包后保存路径(相对配置文件)

---
## packageType类型列表
> * all   	所有的文件打包到一起，但是priority列表中的文件会被放在前面，不指定则按照读取文件顺序打包(默认)
> * seperate  每个业务文件和基础库文件会被打包成一个个文件
> * single  所有文件单个打包（结果是独立的一个个的文件）

---
## javascript文件头部注释说明

 - @file-main   		声明该CMD模块是主入口文件，打包后的文件会以该文件命名
 - @file-name=xxxx   	可选，声明该主文件打包后的文件命名，默认为该文件名字+时间戳.js
 - @file-group=number   打包程序会查找该变量，将相同number的文件打包在一起，会结合上述的priority参数(eg: @data-group=1)
 - @file-alone  		该文件会被独立打包
 - @file-type=public
 - @file-type=business

###注释示例
	@data-group=1
  	@file-name=address
  	@data-main

----------

 #模板文件配置指南
 	
> - include写法和ssi保持一致，即服务器需要支持ssi配置
> - 模板文件统一使用dot后缀 `<!--#include virtual="dot/addr.dot" -->`
> - include的路径必须使用相对路径，否则在编译的时候找不到文件include进来
> - 不支持跨目录include和编译
 

----------

 #watch命令配置
 - 开启watch，默认会启动nodejs的静态服务器
 - tplToJs 是否编译模板为js的function，并替换
 - tplToJsFile	是否编译模板文件为js文件
 - copyStaticFile	拷贝静态文件到nodejs静态服务器 （true|false）

----------


 #server命令配置
 - port	静态服务器端口
 - liveReload	是否开启动态刷新浏览器