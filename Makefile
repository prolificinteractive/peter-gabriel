test:
	@./node_modules/.bin/mocha --require should --reporter spec

.PHONY: all test