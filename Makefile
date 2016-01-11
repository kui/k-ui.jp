BUNDLE_PATH := vendor/bundler
BUNDLE := bundle
JEKYLL := $(BUNDLE) exec jekyll
DEST ?= public
JEKYLL_OPTS = --destination "$(DEST)"

SERVER_PORT := 39278
SERVER_URL  := http://localhost:$(SERVER_PORT)/

.PHONY: build slow-build serve clean open-server post cron

build: bundle-installed
	$(JEKYLL) build $(JEKYLL_OPTS)

slow-build: bundle-installed
	bundle install --path "$(BUNDLE_PATH)"
	npm install
	$(JEKYLL) build $(JEKYLL_OPTS)

post: scripts/create-post-skeleton
	scripts/create-post-skeleton

serve: bundle-installed
	$(JEKYLL) serve --port $(SERVER_PORT) $(JEKYLL_OPTS) & \
	( while ! curl "$(SERVER_URL)" >/dev/null 2>&1; do sleep 1; done ) && \
	python -m webbrowser -t "$(SERVER_URL)" && \
	wait

clean: bundle-installed
	$(JEKYLL) clean $(JEKYLL_OPTS)

cron:
	@scripts/build-cron

open-server:
	python -m webbrowser -t "$(SERVER_URL)"

bundle-installed: $(BUNDLE_PATH) node_modules

$(BUNDLE_PATH):
	bundle install --path "$(BUNDLE_PATH)"

node_modules:
	npm install
