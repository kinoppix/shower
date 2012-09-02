test:
	NODE_ENV=test mocha --reporter list --compilers coffee:coffee-script --globals NODE_CONFIG
.PHONY: test
