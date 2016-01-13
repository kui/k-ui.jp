BUNDLE_PATH := vendor/bundler
BUNDLE := bundle
JEKYLL := $(BUNDLE) exec jekyll
DEST ?= public
DEPLOY_DEST := $(HOME)/Sync/Blog
SERVER_PORT := 39278

JEKYLL_OPTS = --destination "$(DEST)" --incremental
SERVER_URL = http://localhost:$(SERVER_PORT)/
BUNDLE_INSTALL = bundle install --path "$(BUNDLE_PATH)"
NPM_INSTALL = npm install
JEKYLL_BUILD = $(JEKYLL) build $(JEKYLL_OPTS)

.PHONY: build slow-build serve clean open-server post cron deploy init

build: init
	( $(NPM_INSTALL)    | sed 's/^/npm    | /' ) & \
	( $(BUNDLE_INSTALL) | sed 's/^/bundle | /' ) && \
	wait
	$(JEKYLL_BUILD)

post: scripts/create-post-skeleton
	scripts/create-post-skeleton

serve: init
	$(JEKYLL) serve --port $(SERVER_PORT) $(JEKYLL_OPTS) & \
	( while ! curl "$(SERVER_URL)" >/dev/null 2>&1; do sleep 0.5; done ) && \
	$(MAKE) open-server && \
	wait

deploy: $(DEST)
	rsync -vaL --delete "$(DEST)" "$(DEPLOY_DEST)"

$(DEST):
	$(MAKE) build

clean: init
	$(JEKYLL) clean $(JEKYLL_OPTS)

cron:
	@scripts/build-cron

open-server:
	python -m webbrowser -t "$(SERVER_URL)"

init: $(BUNDLE_PATH) node_modules

$(BUNDLE_PATH):
	$(BUNDLE_INSTALL)

node_modules:
	$(NPM_INSTALL)
