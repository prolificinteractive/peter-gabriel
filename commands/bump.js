var fs = require('fs');
var path = require('path');
var SHORT_PATTERN = /(\<key\>CFBundleShortVersionString\<\/key\>[^\<]+\<string\>)([0-9.-]+)(\<\/string\>)/;
var BUNDLE_PATTERN = /(\<key\>CFBundleVersion\<\/key\>[^\<]+\<string\>)([0-9]+)(\<\/string\>)/;

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
			'version-only': {
				abbr: 'v',
				flag: true,
				help: 'Returns just the version string.'
			}
		})

		.callback(function (options) {
			var file = path.resolve(process.cwd(), options.path);
			var plist = fs.readFileSync(file, 'utf8');

			if (options['version-only']) {
				var newVersion = toVersionString(bumpParsedVersion(parseVersion(plist), options));
				console.log(newVersion);
			} else if (options.replace) {
				fs.writeFileSync(file, replaceVersion(plist, options));
			} else {
				console.log(replaceVersion(plist, options));
			}
		});
};

function parseVersion (plist) {
	var match = plist.match(SHORT_PATTERN);
	if (!match) throw new Error('could not find CFBundleVersion plist entry');
	return match[2].split(/[.-]/);
}

function replaceVersion (plist, options) {
	var parts = parseVersion(plist);
	var newVersionParts = bumpParsedVersion(parts, options);
	var shortVersion = toVersionString(parts);

	return plist
		.replace(SHORT_PATTERN, '$1' + shortVersion + '$3')
		.replace(BUNDLE_PATTERN, '$1' + newVersionParts[3] + '$3');
}

function toVersionString (parts) {
	return parts.slice(0,3).join('.') + '-' + parts[3];
}

function bumpParsedVersion (parts, options) {
	//Default to 0's
	for (var i = 0; i <= 3; i += 1) {
		parts[i] = parseInt(parts[i] || 0);
	}

	if (options.major) {
		parts[0] += 1;
		parts[1] = 0;
		parts[2] = 0;
	}

	if (options.minor) {
		parts[1] += 1;
		parts[2] = 0;
	}

	if (options.patch) {
		parts[2] += 1;
	}

	if (options.build) {
		parts[3] += 1;
	} else if (options.timestamp) {
		parts[3] = Date.now();
	}

	return parts;
}

bumpCommand.parseVersion = parseVersion;
bumpCommand.replaceVersion = replaceVersion;
bumpCommand.bumpParsedVersion = bumpParsedVersion;
bumpCommand.toVersionString = toVersionString;

module.exports = bumpCommand;