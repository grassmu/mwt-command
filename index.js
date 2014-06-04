var wmt = require("./lib/kernel/global/kernel"),
    commandList = ["init", "registe", "update", "compile", "use"],
    argv = process.argv,
    version = "0.0.1",
    firstOrder = argv[2];

exports.run = function() {
    // 解析命令行内容
    if(!firstOrder || firstOrder === '-h' ||  firstOrder === '--help'){
        showHelp();
    } else if(firstOrder == "-v" || firstOrder == "-V" || firstOrder == "version"){
        showVersion();
    } else {
        var program = require("commander");
        commandList.forEach(function(c) {
            var module = require("./lib/command/mwt-"+c);
            module.registeCommand(
                program.command(c).description(module.desc).usage(module.usage)
            );
        });
        program.parse(argv);
    }
}

function showHelp() {
    var content = [
        '',
        '  Usage: mwt <command>',
        '',
        '  Commands:',
        ''
    ];
    commandList.forEach(function(c) {
        var module = require("./lib/command/mwt-"+c);
        content.push('    ' + c +" " + (module.desc || ''));
    });

    content = content.concat([
        '',
        '  Options:',
        '',
        '    -h, --help     output help information',
        '    -v, --version  output the version number',
        ''
    ]);
    console.log(content.join('\n'));
}

function showVersion() {
    wmt.show.showResult("mwt version "+version);
}