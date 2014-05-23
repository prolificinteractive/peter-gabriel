var fs = require('fs');
var path = require('path');
var parser = require('nomnom')();
var commandDir = path.resolve(__dirname, '../commands');
var files = fs.readdirSync(commandDir);

parser.constructors = {};

for (var i = 0, commandPath; i < files.length; i += 1) {
	commandPath = path.resolve(commandDir, files[i]);
	parser.constructors[files[i].replace('.js', '')] = require(commandPath)(parser);
}

parser.help('Automate annoying iOS project tasks.');

module.exports = parser;