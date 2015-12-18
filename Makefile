export RBENV_ROOT := .rbenv
export PATH := $(RBENV_ROOT)/bin:$(PATH)

RBENV := rbenv
RBENV_EXEC := $(RBENV) exec
RUBY := $(RBENV_EXEC) ruby
JEKYLL := $(RBENV_EXEC) jekyll
BUNDLE := $(RBENV_EXEC) bundle

.PHONY: build serve clean

build: bundle-install
	$(JEKYLL) build

serve: bundle-install
	$(JEKYLL) serve

clean: bundle-install
	$(JEKYLL) clean

###

.PHONY: bundle-install bundler ruby

bundle-install: bundler
	@$(BUNDLE) check &>/dev/null || \
	$(BUNDLE) install

bundler: ruby
	@$(RUBY) -r bundler -e '' &>/dev/null || \
	$(RBENV_EXEC) gem install bundler

ruby:
	@$(RUBY) -v &>/dev/null || \
	./scripts/install_ruby.sh $(RBENV_ROOT)
