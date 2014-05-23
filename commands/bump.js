var fs = require('fs');
var path = require('path');
var LONG_PATTERN = /(\<key\>CFBundleVersion\<\/key\>[^\<]+\<string\>)([0-9.-]+)(\<\/string\>)/;
var SHORT_PATTERN = /(\<key\>CFBundleShortVersionString\<\/key\>[^\<]+\<string\>)([0-9.-]+)(\<\/string\>)/;

function bumpCommand (parser) {
	var command = parser.command('bump');

	command
		.help('Outputs a plist with updated version entries.')

		.options({
			'path': {
				position: 1,
				help: 'Path to the plist file.',
				list: false,
				required: true
			},
			'major': {
				abbr: 'M',
				flag: true,
				help: 'Bump the major version. Resets lesser versions.'
			},
			'minor': {
				abbr: 'm',
				flag: true,
				help: 'Bump the minor version. Resets lesser versions.'
			},
			'patch': {
				abbr: 'p',
				flag: true,
				help: 'Bump the patch version.'
			},
			'build': {
				abbr: 'b',
				flag: true,
				help: 'Bump the build number.'
			},
			'timestamp': {
				abbr: 't',
				flag: true,
				help: 'Tags the build with the current timestamp. Mutually exclusive with --build.'
			},
			'replace': {
				abbr: 'r',
				flag: true,
				help: 'Replaces the contents of the .plist file instead of writing to stdout.'
			},
			'short': {
				abbr: 's',
				flag: true,
				help: 'Returns just the short version string.'
			},
			'long': {
				abbr: 'l',
				flag: true,
				help: 'Returns just the long version string.'
			}
		})

		.callback(function (options) {
			var file = path.resolve(process.cwd(), options.path);
			var plist = fs.readFileSync(file, 'utf8');

			if (options.short) {
				var newVersion = getShortVersion(bumpParsedVersion(parseVersion(plist), options));
				console.log(newVersion);
			} else if (options.long) {
				var newVersion = getLongVersion(bumpParsedVersion(parseVersion(plist), options));
				console.log(newVersion);
			} else if (options.replace) {
				fs.writeFileSync(file, replaceVersion(plist, options));
			} else {
				console.log(replaceVersion(plist, options));
			}
		});
};

function replaceVersion (plist, options) {
	var parts = parseVersion(plist);
	var newVersionParts = bumpParsedVersion(parts, options);
	var longVersion = getLongVersion(parts);
	var shortVersion = getShortVersion(parts);

	return plist
		.replace(SHORT_PATTERN, '$1' + shortVersion + '$3')
		.replace(LONG_PATTERN, '$1' + longVersion + '$3');
}

function getShortVersion (parts) {
	return parts.slice(0, 2).join('.');
} 

function getLongVersion (parts) {
	return parts.slice(0,3).join('.') + '-' + parts[3];
}

function bumpParsedVersion (parts, options) {
	if (options.major) {
		parts[0] = +parts[0] + 1;
		parts[1] = 0;
		parts[2] = 0;
	}

	if (options.minor) {
		parts[1] = +parts[1] + 1;
		parts[2] = 0;
	}

	if (options.patch) {
		parts[2] = (+parts[2] || 0) + 1;
	}

	if (options.build) {
		parts[3] = (+parts[3] || 0) + 1;
	} else if (options.timestamp) {
		parts[3] = Date.now();
	}

	return parts;
}

function parseVersion (plist) {
	var match = plist.match(LONG_PATTERN);
	if (!match) throw new Error('could not find CFBundleVersion plist entry');
	return match[2].split(/[.-]/);
}

bumpCommand.parseVersion = parseVersion;
bumpCommand.replaceVersion = replaceVersion;
bumpCommand.bumpParsedVersion = bumpParsedVersion;
bumpCommand.getLongVersion = getLongVersion;
bumpCommand.getShortVersion = getShortVersion;

module.exports = bumpCommand;