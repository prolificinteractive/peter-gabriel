var exec = require('child_process').exec;

describe('pgab bump', function () {
	describe('--major -M', function () {
		it('should bump the first portion of the version string and reset lesser versions', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --major --version-only', function (err, result) {
				if (err) throw err;
				result.should.equal("1.0.0-1\n");
				done();
			});
		});
	});

	describe('--minor -m', function () {
		it('should bump the second portion of the version string and reset lesser versions', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --minor --version-only', function (err, result) {
				if (err) throw err;
				result.should.equal("0.2.0-1\n");
				done();
			});
		});
	});

	describe('--patch -p', function () {
		it('should bump the third portion of the version string', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --patch --version-only', function (err, result) {
				if (err) throw err;
				result.should.equal("0.1.1-1\n");
				done();
			});
		});
	});

	describe('--build -b', function () {
		it('should bump the fourth portion of the version string', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --build --version-only', function (err, result) {
				if (err) throw err;
				result.should.equal("0.1.0-2\n");
				done();
			});
		});
	});

	describe('--timestamp -t', function () {
		it('should append the current timestamp as the build meta', function (done) {
			function roundTimestampToNearestMinute (timestamp) {
				return Math.round(timestamp / 60000) * 60000;
			}

			exec('bin/pgab.js bump test/fixtures/example.plist --timestamp --version-only', function (err, result) {
				if (err) throw err;

				var now = roundTimestampToNearestMinute(Date.now());
				var timestamp = roundTimestampToNearestMinute(+result.split(/\n|[.-]/)[3]);

				timestamp.should.equal(now);

				done();
			});
		});
	});
});