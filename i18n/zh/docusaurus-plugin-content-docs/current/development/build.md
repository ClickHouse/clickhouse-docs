---
description: '在 Linux 系统上从源代码构建 ClickHouse 的分步指南'
sidebar_label: '在 Linux 上构建'
sidebar_position: 10
slug: /development/build
title: '如何在 Linux 上从源代码构建 ClickHouse'
doc_type: 'guide'
---



# 如何在 Linux 上构建 ClickHouse

:::info 你不必自己构建 ClickHouse！
你可以按照 [快速开始](https://clickhouse.com/#quick-start) 中的说明安装预构建的 ClickHouse 版本。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE（实验性）
- s390/x（实验性）
- RISC-V 64（实验性）



## 前提条件 {#assumptions}

本教程基于 Ubuntu Linux 编写,但经过适当修改后也适用于其他 Linux 发行版。
开发环境推荐使用的最低 Ubuntu 版本为 24.04 LTS。

本教程假设您已在本地检出 ClickHouse 代码仓库及其所有子模块。


## 安装前置条件 {#install-prerequisites}

首先，请参阅通用[前置条件文档](developer-instruction.md)。

ClickHouse 使用 CMake 和 Ninja 进行构建。

您可以选择安装 ccache，以便构建过程重用已编译的目标文件。

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## 安装 Clang 编译器 {#install-the-clang-compiler}

要在 Ubuntu/Debian 上安装 Clang,请使用 LLVM 提供的自动安装脚本,可从[此处](https://apt.llvm.org/)获取。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版,请检查是否可以安装 LLVM 的[预构建软件包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月,需要 Clang 19 或更高版本。
不支持 GCC 或其他编译器。


## 安装 Rust 编译器(可选) {#install-the-rust-compiler-optional}

:::note
Rust 是 ClickHouse 的可选依赖项。
如果未安装 Rust,ClickHouse 的某些功能将不会被编译。
:::

首先,按照官方 [Rust 文档](https://www.rust-lang.org/tools/install) 中的步骤安装 `rustup`。

与 C++ 依赖项一样,ClickHouse 使用 vendoring 机制来精确控制安装的内容,避免依赖第三方服务(如 `crates.io` 注册表)。

尽管在发布模式下,任何现代 rustup 工具链版本都应该能够与这些依赖项配合使用,但如果您计划启用 sanitizers,则必须使用与 CI 中使用的 `std` 完全相同的版本(我们为其提供了 vendor crates):


```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## 构建 ClickHouse {#build-clickhouse}

我们建议在 `ClickHouse` 目录内创建一个单独的 `build` 目录,用于存放所有构建产物:

```sh
mkdir build
cd build
```

您可以为不同的构建类型创建多个不同的目录(例如 `build_release`、`build_debug` 等)。

可选:如果您安装了多个编译器版本,可以指定要使用的具体编译器。

```sh
export CC=clang-19
export CXX=clang++-19
```

对于开发用途,建议使用调试构建。
与发布构建相比,调试构建的编译器优化级别较低(`-O`),可提供更好的调试体验。
此外,`LOGICAL_ERROR` 类型的内部异常会立即崩溃,而不是优雅地失败。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
如果您希望使用 gdb 等调试器,请在上述命令中添加 `-D DEBUG_O_LEVEL="0"` 以移除所有编译器优化,这些优化可能会干扰 gdb 查看/访问变量的能力。
:::

运行 ninja 进行构建:

```sh
ninja clickhouse
```

如果您想构建所有二进制文件(实用工具和测试),请不带参数运行 ninja:

```sh
ninja
```

您可以使用参数 `-j` 控制并行构建作业的数量:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake 为上述命令提供了快捷方式:

```sh
cmake -S . -B build  # 配置构建,从代码仓库顶层目录运行
cmake --build build  # 编译
```

:::


## 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable}

构建成功完成后,可执行文件位于 `ClickHouse/<build_dir>/programs/` 目录中:

ClickHouse 服务器会尝试在当前目录中查找配置文件 `config.xml`。
您也可以通过命令行参数 `-C` 指定配置文件。

要使用 `clickhouse-client` 连接到 ClickHouse 服务器,请打开另一个终端,切换到 `ClickHouse/build/programs/` 目录并运行 `./clickhouse client`。

如果在 macOS 或 FreeBSD 上收到 `Connection refused` 消息,请尝试指定主机地址 127.0.0.1:

```bash
clickhouse client --host 127.0.0.1
```


## 高级选项 {#advanced-options}

### 最小化构建 {#minimal-build}

如果您不需要第三方库提供的功能,可以进一步加快构建速度:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

如果遇到问题,您需要自行解决...

Rust 需要互联网连接。要禁用 Rust 支持:

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable-1}

您可以用编译的 ClickHouse 二进制文件替换系统中已安装的生产版本。
为此,请按照官方网站的说明在您的机器上安装 ClickHouse。
然后运行:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

请注意,`clickhouse-client`、`clickhouse-server` 等都是指向共享的 `clickhouse` 二进制文件的符号链接。

您也可以使用系统中已安装的 ClickHouse 软件包的配置文件来运行自定义构建的 ClickHouse 二进制文件:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 在任意 Linux 上构建 {#building-on-any-linux}

在 OpenSUSE Tumbleweed 上安装前置依赖:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

在 Fedora Rawhide 上安装前置依赖:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### 在 Docker 中构建 {#building-in-docker}

您可以使用以下命令在类似 CI 的环境中本地运行任何构建:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```

其中 BUILD_JOB_NAME 是 CI 报告中显示的作业名称,例如 "Build (arm_release)"、"Build (amd_debug)"

此命令会拉取包含所有必需依赖项的相应 Docker 镜像 `clickhouse/binary-builder`,
并在其中运行构建脚本:`./ci/jobs/build_clickhouse.py`

构建输出将放置在 `./ci/tmp/` 中。

它适用于 AMD 和 ARM 架构,除 Docker 外不需要其他额外依赖项。
