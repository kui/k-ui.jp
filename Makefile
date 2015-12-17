RBENVW := ./scripts/rbenvw.sh
BUNDLE_DIR := .bundle
BUNDLE := $(RBENVW) bundle
BUNDLE_EXEC := $(BUNDLE) exec
JEKYLL := $(BUNDLE_EXEC) jekyll

.PHONY: build serve clean

build: $(BUNDLE_DIR)
	$(JEKYLL) build

serve: $(BUNDLE_DIR)
	$(JEKYLL) serve

clean:
	$(JEKYLL) clean

$(BUNDLE_DIR):
	$(BUNDLE) install --path "$@"
