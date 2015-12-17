#!/bin/bash
set -eu
# set -x

BASE_DIR="$(cd "$(dirname "$(dirname "$0")")"; pwd)"
RBENV_DIR="$BASE_DIR/.rbenv"
RUBY_VERSION_FILE="$BASE_DIR/.ruby-version"

export PATH="$RBENV_DIR/bin:$PATH"

cd "$BASE_DIR"

main() {
    if ! has rbenv; then
        install_rbenv
    fi

    eval "$(rbenv init -)"

    if ! has_ruby_version; then
        rbenv install
    fi

    if ! has bundle; then
        gem install bundle
        rbenv rehash
    fi

    "$@"
}

has() {
    type "$1" >>/dev/null
}

has_ruby_version() {
    rbenv versions --bare | grep -q "^$(cat "$RUBY_VERSION_FILE")$"
}

install_rbenv() {
    git clone https://github.com/sstephenson/rbenv.git "$RBENV_DIR"
    git clone https://github.com/sstephenson/ruby-build.git \
        "$RBENV_DIR/plugins/ruby-build"

    if has apt-get; then
        sudo apt-get install autoconf bison build-essential libssl-dev \
             libyaml-dev libreadline6 libreadline6-dev zlib1g zlib1g-dev
    elif has yum; then
        sudo yum install gcc-c++ glibc-headers openssl-devel readline \
             libyaml-devel readline-devel zlib zlib-devel
    elif has brew; then
        brew install openssl libyaml pkg-config autoconf
    elif has port; then
        port install openssl libyaml
    else
        abort "Not supported package manager"
    fi
}

echo_green() {
    echo $'\e[32m'"${@}"$'\e[0m'
}
echo_red() {
    echo $'\e[31m'"${@}"$'\e[0m'
}
abort() {
    err "Abort: $@"
    exit 1
}
err() {
    echo_red "$@" >&2
}

main "$@"
