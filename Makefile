BUNDLE_PATH := vendor/bundler
BUNDLE := bundle
JEKYLL := $(BUNDLE) exec jekyll
DEST ?= public
DEPLOY_DEST := $(HOME)/Sync/Blog
SERVER_PORT := 39278
SRC_DIR := src
JS_DEST_DIR := $(SRC_DIR)/js
JS_SRC_DIR := $(SRC_DIR)/_js

JEKYLL_OPTS = --destination "$(DEST)" --incremental
SERVER_URL = http://localhost:$(SERVER_PORT)/
BUNDLE_INSTALL = bundle install --path "$(BUNDLE_PATH)"
NPM_INSTALL = npm install
JEKYLL_BUILD = $(JEKYLL) build $(JEKYLL_OPTS)
JS_SRC = $(wildcard $(JS_SRC_DIR)/*.js)
JS_LIB = $(wildcard $(JS_SRC_DIR)/lib/*.js)
JS_DEST = $(patsubst $(JS_SRC_DIR)/%.js,$(JS_DEST_DIR)/%.js,$(JS_SRC))
WEBPACK = $(shell npm bin)/webpack

.PHONY: build post serve deploy clean cron open-server

build: init js
	( $(NPM_INSTALL)    | sed 's/^/npm    | /' ) & \
	( $(BUNDLE_INSTALL) | sed 's/^/bundle | /' ) && \
	wait
	$(JEKYLL_BUILD)

post: scripts/create-post-skeleton
	scripts/create-post-skeleton

serve: init js
	$(JEKYLL) serve --port $(SERVER_PORT) $(JEKYLL_OPTS) & \
	( while ! curl "$(SERVER_URL)" >/dev/null 2>&1; do sleep 0.5; done ) && \
	$(MAKE) open-server && \
	wait

deploy: $(DEST)
	rsync -vaL --delete "$(DEST)" "$(DEPLOY_DEST)"

$(DEST): build

clean: init clean-js
	$(JEKYLL) clean $(JEKYLL_OPTS)

cron:
	@scripts/build-cron

open-server:
	python -m webbrowser -t "$(SERVER_URL)"

##########################################################################
# JS targets
.PHONY: js clean-js

js: init $(JS_DEST)

clean-js:
	rm -fr "$(JS_DEST_DIR)"

$(JS_DEST_DIR):
	mkdir -p "$(JS_DEST_DIR)"

$(JS_DEST_DIR)/%.js: $(JS_SRC_DIR)/%.js $(JS_DEST_DIR) $(JS_LIB)
	$(WEBPACK) "$<" "$@"

##########################################################################
# private targets
.PHONY: init cd

init: cd $(BUNDLE_PATH) node_modules

cd:
	@cd $(CURDIR)

$(BUNDLE_PATH): Gemfile
	rm -fr "$(BUNDLE_PATH)"
	$(BUNDLE_INSTALL)

node_modules: package.json
	rm -fr node_modules
	$(NPM_INSTALL)
