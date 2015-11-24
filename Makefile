## Copyright (c) 2015 - Littlstar

##
# Standalone library namespace
STANDALONE := stardux

##
# node_modules/ patch
NODE_MODULES := node_modules

##
# Browserify bin path
BROWSERIFY := $(NODE_MODULES)/.bin/browserify

##
# Tests tor un
TESTS := $(wildcard test/*.js)

##
# uglifyjs bin path
UGLIFY := $(NODE_MODULES)/.bin/uglifyjs

##
# npm bin path
NPM := $(shell which npm)

build: $(NODE_MODULES)
	mkdir -p $(@)
	$(NPM) run compile
	$(BROWSERIFY) --im -s $(STANDALONE) -t babelify lib/index.js -o $@/$@.js

$(NODE_MODULES):
	$(NPM) install

##
# Create dist build
.PHONY: dist
dist:
	mkdir -p $(@)
	$(NPM) run compile
	$(BROWSERIFY) --im -s $(STANDALONE) -t babelify lib/index.js -o $@/$(STANDALONE).js
	$(UGLIFY) --compress --mangle --output $@/$(STANDALONE).min.js -- $@/$(STANDALONE).js

clean:
	$(RM) -rf lib/
	$(RM) -rf components/
	$(RM) -rf node_modules/
