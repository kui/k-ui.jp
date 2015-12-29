BUNDLE_PATH := vendor/bundler
BUNDLE := bundle
JEKYLL := $(BUNDLE) exec jekyll

SERVER_PORT := 39278
SERVER_URL  := http://localhost:$(SERVER_PORT)/

.PHONY: build serve clean

build: bundle-installed
	$(JEKYLL) build

serve: bundle-installed
	$(JEKYLL) serve --port $(SERVER_PORT) --verbose & \
	( while ! curl "$(SERVER_URL)" >/dev/null 2>&1; do sleep 1; done ) && \
	python -m webbrowser -t "$(SERVER_URL)" && \
	wait

clean: bundle-installed
	$(JEKYLL) clean

bundle-installed: $(BUNDLE_PATH) node_modules

$(BUNDLE_PATH):
	bundle install --path "$(BUNDLE_PATH)"

node_modules:
	npm install
