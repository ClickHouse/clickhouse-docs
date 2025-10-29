---
'description': '指导如何从Linux为macOS系统进行跨编译ClickHouse'
'sidebar_label': 'Linux上构建macOS'
'sidebar_position': 20
'slug': '/development/build-cross-osx'
'title': 'Linux上构建macOS'
'doc_type': 'guide'
---


# Linux上でmacOS向けにClickHouseをビルドする方法

これは、Linuxマシンを持っていて、OS Xで実行される `clickhouse` バイナリをビルドするために使用するケースです。
主なユースケースは、Linuxマシンで実行される継続的インテグレーションチェックです。
macOS上で直接ClickHouseをビルドしたい場合は、[ネイティブビルドの手順](../development/build-osx.md)に進んでください。

macOS向けのクロスビルドは、[ビルド手順](../development/build.md)に基づいていますので、まずそれらに従ってください。

以下のセクションでは、`x86_64` macOS向けにClickHouseをビルドする手順を説明します。
ARMアーキテクチャをターゲットにしている場合は、手順内のすべての`x86_64`の出現箇所を`aarch64`に置き換えてください。
例えば、手順全体で`x86_64-apple-darwin`を`aarch64-apple-darwin`に置き換えます。

## クロスコンパイルツールセットのインストール {#install-cross-compilation-toolset}

`cctools`をインストールしたパスを`${CCTOOLS}`として記憶しておきましょう。

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

また、作業ツリーにmacOS X SDKをダウンロードする必要があります。

```bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```

## ClickHouseをビルドする {#build-clickhouse}

```bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
CC=clang-19 CXX=clang++-19 cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

生成されたバイナリはMach-O実行形式を持ち、Linux上では実行できません。
