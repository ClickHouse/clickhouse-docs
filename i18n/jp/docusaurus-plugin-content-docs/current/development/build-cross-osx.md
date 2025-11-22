---
description: 'Linux 環境から macOS システム向けに ClickHouse をクロスコンパイルするためのガイド'
sidebar_label: 'Linux で macOS 向けにビルド'
sidebar_position: 20
slug: /development/build-cross-osx
title: 'Linux で macOS 向けにビルド'
doc_type: 'guide'
---



# macOS 向けに Linux 上で ClickHouse をビルドする方法

このドキュメントは、Linux マシンを使用して、OS X 上で動作する `clickhouse` バイナリをビルドしたい場合を対象としています。
主なユースケースは、Linux マシン上で実行される継続的インテグレーション（CI）チェックです。
ClickHouse を直接 macOS 上でビルドしたい場合は、[ネイティブビルド手順](../development/build-osx.md)に従ってください。

macOS 向けのクロスビルドは [ビルド手順](../development/build.md) に基づいているため、まずそちらに従ってください。

以下のセクションでは、`x86_64` macOS 向けに ClickHouse をビルドする手順を説明します。
ARM アーキテクチャをターゲットとする場合は、`x86_64` をすべて `aarch64` に置き換えてください。
たとえば、手順全体を通して `x86_64-apple-darwin` を `aarch64-apple-darwin` に置き換えます。



## クロスコンパイルツールセットのインストール {#install-cross-compilation-toolset}

`cctools`のインストールパスを`${CCTOOLS}`として記憶しておきましょう

```bash
mkdir ~/cctools
export CCTOOLS=$(cd ~/cctools && pwd)
cd ${CCTOOLS}

git clone https://github.com/tpoechtrager/apple-libtapi.git
cd apple-libtapi
git checkout 15dfc2a8c9a2a89d06ff227560a69f5265b692f9
INSTALLPREFIX=${CCTOOLS} ./build.sh
./install.sh
cd ..

git clone https://github.com/tpoechtrager/cctools-port.git
cd cctools-port/cctools
git checkout 2a3e1c2a6ff54a30f898b70cfb9ba1692a55fad7
./configure --prefix=$(readlink -f ${CCTOOLS}) --with-libtapi=$(readlink -f ${CCTOOLS}) --target=x86_64-apple-darwin
make install
```

また、macOS X SDKを作業ツリーにダウンロードする必要があります。

```bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```


## ClickHouseのビルド {#build-clickhouse}

```bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
CC=clang-19 CXX=clang++-19 cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

生成されるバイナリはMach-O実行可能形式であり、Linux上では実行できません。
