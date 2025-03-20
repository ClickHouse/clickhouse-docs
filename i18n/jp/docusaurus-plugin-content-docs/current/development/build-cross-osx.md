---
slug: /development/build-cross-osx
sidebar_position: 20
sidebar_label: LinuxでmacOS向けにビルドする
---


# LinuxでmacOS向けにClickHouseをビルドする方法

これは、Linuxマシンを持ち、OS Xで動作する`clickhouse`バイナリをビルドするために使用する場合のケースです。主なユースケースは、Linuxマシンで実行される継続的インテグレーションチェックです。macOS上でClickHouseを直接ビルドしたい場合は、[ネイティブビルドの手順](../development/build-osx.md)を参照してください。

macOS向けのクロスビルドは、[ビルド手順](../development/build.md)に基づいていますので、まずはそれに従ってください。

次のセクションでは、`x86_64` macOS向けのClickHouseのビルド手順を説明します。ARMアーキテクチャをターゲットにする場合は、すべての`x86_64`の出現を`aarch64`に置き換えればよいです。例えば、手順全体の中で`x86_64-apple-darwin`を`aarch64-apple-darwin`に置き換えてください。

## クロスコンパイルツールセットのインストール {#install-cross-compilation-toolset}

`cctools`をインストールするパスを`${CCTOOLS}`として記憶しておきましょう。

``` bash
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

``` bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```

## ClickHouseのビルド {#build-clickhouse}

``` bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
CC=clang-19 CXX=clang++-19 cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

生成されたバイナリはMach-O実行形式になり、Linux上では実行できません。
