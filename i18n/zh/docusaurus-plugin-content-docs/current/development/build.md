---
slug: /development/build
sidebar_position: 10
sidebar_label: 在 Linux 上构建
keywords: ['ClickHouse', '构建', 'Linux']
description: '了解如何在 Linux 系统上构建 ClickHouse，满足开发人员的需求。'
---


# 如何在 Linux 上构建 ClickHouse

:::info 你不必自己构建 ClickHouse！
你可以按照 [快速开始](https://clickhouse.com/#quick-start) 的说明安装预构建的 ClickHouse。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE (实验性)
- s390/x (实验性)
- RISC-V 64 (实验性)

## 假设 {#assumptions}

以下教程基于 Ubuntu Linux，但在其他 Linux 发行版上也应该适用，只需进行适当的更改。
建议用于开发的最低 Ubuntu 版本为 24.04 LTS。

本教程假定你在本地已检查出 ClickHouse 仓库及所有子模块。

## 安装前提条件 {#install-prerequisites}

ClickHouse 使用 CMake 和 Ninja 进行构建。

你可以选择性安装 ccache，以便让构建重用已经编译的目标文件。

``` bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## 安装 Clang 编译器 {#install-the-clang-compiler}

要在 Ubuntu/Debian 上安装 Clang，请使用 LLVM 的自动安装脚本 [从这里](https://apt.llvm.org/)。

``` bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版，请检查是否可以安装 LLVM 的任何 [预构建包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月，要求使用 Clang 19 或更高版本。
不支持 GCC 或其他编译器。

## 安装 Rust 编译器（可选） {#install-the-rust-compiler-optional}

:::note
Rust 是 ClickHouse 的一个可选依赖项。
如果未安装 Rust，ClickHouse 的某些功能将在编译时被省略。
:::

首先，按照官方 [Rust 文档](https://www.rust-lang.org/tools/install) 中的步骤安装 `rustup`。

与 C++ 依赖项一样，ClickHouse 使用 vendoring 来精确控制安装的内容，并避免依赖第三方服务（如 `crates.io` 注册表）。

虽然在发布模式下，任何现代 Rust 的 rustup 工具链版本都应该可以与这些依赖项一起使用，但如果你计划启用 sanitizers，必须使用与 CI 中使用的确切相同 `std` 的版本（我们为此 vendoring 了库）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## 构建 ClickHouse {#build-clickhouse}

我们建议在 `ClickHouse` 内部创建一个单独的目录 `build` 来存放所有构建产物：

```sh
mkdir build
cd build
```

你可以有多个不同的目录（例如 `build_release`、`build_debug` 等）用于不同的构建类型。

可选：如果你安装了多个编译器版本，可以可选地指定要使用的确切编译器。

```sh
export CC=clang-19
export CXX=clang++-19
```

出于开发目的，建议使用调试构建。
与发布构建相比，它们具有较低的编译器优化级别（`-O`），提供更好的调试体验。
此外，`LOGICAL_ERROR` 类型的内部异常会立即崩溃而不是优雅地失败。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

运行 ninja 进行构建：

```sh
ninja clickhouse-server clickhouse-client
```

如果希望构建所有二进制文件（实用工具和测试），可以不带参数运行 ninja：

```sh
ninja
```

你可以使用参数 `-j` 控制并行构建的作业数量：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake 提供了上述命令的快捷方式：

```sh
cmake -S . -B build  # 配置构建，从仓库顶层目录运行
cmake --build build  # 编译
```
:::

## 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable}

构建成功完成后，你可以在 `ClickHouse/<build_dir>/programs/` 中找到可执行文件：

ClickHouse 服务器会尝试在当前目录中查找配置文件 `config.xml`。
你也可以通过 `-C` 在命令行上指定配置文件。

要使用 `clickhouse-client` 连接到 ClickHouse 服务器，请打开另一个终端，导航到 `ClickHouse/build/programs/` 并运行 `./clickhouse client`。

如果在 macOS 或 FreeBSD 上收到 `Connection refused` 消息，请尝试指定主机地址 127.0.0.1：

```bash
clickhouse client --host 127.0.0.1
```

## 高级选项 {#advanced-options}

### 最小构建 {#minimal-build}

如果你不需要第三方库提供的功能，可以进一步加快构建速度：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

如果遇到问题，后果自负 ...

Rust 需要互联网连接。要禁用 Rust 支持：

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable-1}

你可以用编译后的 ClickHouse 二进制文件替换系统中已安装的生产版本 ClickHouse 二进制文件。
为此，请遵循官方网站的说明在你的机器上安装 ClickHouse。
接下来，运行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

请注意，`clickhouse-client`、`clickhouse-server` 和其他命令是指向常用的 `clickhouse` 二进制文件的符号链接。

你还可以使用系统中已安装的 ClickHouse 软件包中的配置文件来运行自定义构建的 ClickHouse 二进制文件：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
````

### 在任意 Linux 上构建 {#building-on-any-linux}

在 OpenSUSE Tumbleweed 上安装前提条件：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

在 Fedora Rawhide 上安装前提条件：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### 在 Docker 中构建 {#building-in-docker}

我们在 CI 中使用 `clickhouse/binary-builder` 的 Docker 镜像进行构建。
它包含构建二进制文件和包所需的一切。
有一个脚本 `docker/packager/packager` 来简化镜像使用：

```bash

# 定义输出结果的目录
output_dir="build_results"

# 最简单的构建
./docker/packager/packager --package-type=binary --output-dir "$output_dir"

# 构建 debian 包
./docker/packager/packager --package-type=deb --output-dir "$output_dir"

# 默认情况下，debian 包使用薄 LTO，因此我们可以覆盖以加快构建
CMAKE_FLAGS='-DENABLE_THINLTO=' ./docker/packager/packager --package-type=deb --output-dir "./$(git rev-parse --show-cdup)/build_results"
