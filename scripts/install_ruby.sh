#!/bin/bash
set -eu
# set -x

DEST=$1

main() {
    run rm -fr "$DEST"

    run git clone \
        --depth 1 \
        https://github.com/sstephenson/rbenv.git \
        "$DEST"
    run git clone \
        --depth 1 \
        https://github.com/sstephenson/ruby-build.git \
        "$DEST/plugins/ruby-build"

    if has apt-get; then
        run sudo apt-get install autoconf bison build-essential libssl-dev \
            libyaml-dev libreadline6 libreadline6-dev zlib1g zlib1g-dev graphviz
    elif has yum; then
        run sudo yum install gcc-c++ glibc-headers openssl-devel readline \
            libyaml-devel readline-devel zlib zlib-devel graphviz
    elif has brew; then
        run brew install openssl libyaml pkg-config autoconf graphviz
    elif has port; then
        run port install openssl libyaml graphviz
    else
        abort "Not supported package manager"
    fi

    run $DEST/bin/rbenv install
}

has() {
    type "$1" &>/dev/null
}

run() {
    echo_green $ "$@"
    "$@"
}
abort() {
    err "Abort: $@"
    exit 1
}
err() { echo_red "$@" >&2; }
echo_green() { echo $'\e[32m'"${@}"$'\e[0m'; }
echo_red() {   echo $'\e[31m'"${@}"$'\e[0m'; }

main
