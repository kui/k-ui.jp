BUNDLE_PATH := vendor/bundler
BUNDLE = bundle
JEKYLL = $(BUNDLE) exec jekyll

.PHONY: build serve clean

build: bundle-installed
	$(JEKYLL) build

serve: bundle-installed
	$(JEKYLL) serve

clean: bundle-installed
	$(JEKYLL) clean

bundle-installed: $(BUNDLE_PATH) node_modules

$(BUNDLE_PATH):
	bundle install --path "$(BUNDLE_PATH)"

node_modules:
	npm install
