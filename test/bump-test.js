var exec = require('child_process').exec;

describe('pgab bump', function () {
	describe('--major -M', function () {
		it('should bump the first portion of the version string and reset lesser versions', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --major --long', function (err, result) {
				if (err) throw err;
				result.should.equal("1.0.0-1\n");
				done();
			});
		});
	});

	describe('--minor -m', function () {
		it('should bump the second portion of the version string and reset lesser versions', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --minor --long', function (err, result) {
				if (err) throw err;
				result.should.equal("0.2.0-1\n");
				done();
			});
		});
	});

	describe('--patch -p', function () {
		it('should bump the third portion of the version string', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --patch --long', function (err, result) {
				if (err) throw err;
				result.should.equal("0.1.3-1\n");
				done();
			});
		});
	});

	describe('--build -b', function () {
		it('should bump the fourth portion of the version string', function (done) {
			exec('bin/pgab.js bump test/fixtures/example.plist --build --long', function (err, result) {
				if (err) throw err;
				result.should.equal("0.1.2-2\n");
				done();
			});
		});
	});

	describe('--timestamp -t', function () {
		it('should append the curren timestamp as the build meta', function (done) {
			function roundTimestampToNearestMinute (timestamp) {
				return Math.round(timestamp / 60000) * 60000;
			}

			exec('bin/pgab.js bump test/fixtures/example.plist --timestamp --long', function (err, result) {
				if (err) throw err;

				var now = roundTimestampToNearestMinute(Date.now());
				var timestamp = roundTimestampToNearestMinute(+result.split(/\n|[.-]/)[3]);

				timestamp.should.equal(now);

				done();
			});
		});
	});
});