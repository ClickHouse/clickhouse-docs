---
'description': '在Linux上为macOS系统交叉编译ClickHouse的指南'
'sidebar_label': '在Linux上为macOS构建'
'sidebar_position': 20
'slug': '/development/build-cross-osx'
'title': '在Linux上为macOS构建'
---


# 如何在 Linux 上为 macOS 构建 ClickHouse

这是针对您拥有一台 Linux 机器并希望使用它构建可在 OS X 上运行的 `clickhouse` 二进制文件的情况。
主要用例是运行在 Linux 机器上的持续集成检查。
如果您希望直接在 macOS 上构建 ClickHouse，请遵循 [本地构建说明](../development/build-osx.md)。

为 macOS 进行的交叉构建基于 [构建说明](../development/build.md)，请先遵循这些说明。

以下部分提供了为 `x86_64` macOS 构建 ClickHouse 的逐步指导。
如果您针对 ARM 架构，只需将所有 `x86_64` 的出现位置替换为 `aarch64`。
例如，将整个步骤中的 `x86_64-apple-darwin` 替换为 `aarch64-apple-darwin`。

## 安装交叉编译工具集 {#install-cross-compilation-toolset}

让我们记住安装 `cctools` 的路径为 `${CCTOOLS}`。

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

另外，我们还需要将 macOS X SDK 下载到工作树中。

```bash
cd ClickHouse/cmake/toolchain/darwin-x86_64
curl -L 'https://github.com/phracker/MacOSX-SDKs/releases/download/11.3/MacOSX11.0.sdk.tar.xz' | tar xJ --strip-components=1
```

## 构建 ClickHouse {#build-clickhouse}

```bash
cd ClickHouse
mkdir build-darwin
cd build-darwin
CC=clang-19 CXX=clang++-19 cmake -DCMAKE_AR:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ar -DCMAKE_INSTALL_NAME_TOOL=${CCTOOLS}/bin/x86_64-apple-darwin-install_name_tool -DCMAKE_RANLIB:FILEPATH=${CCTOOLS}/bin/x86_64-apple-darwin-ranlib -DLINKER_NAME=${CCTOOLS}/bin/x86_64-apple-darwin-ld -DCMAKE_TOOLCHAIN_FILE=cmake/darwin/toolchain-x86_64.cmake ..
ninja
```

生成的二进制文件将具有 Mach-O 可执行格式，无法在 Linux 上运行。
