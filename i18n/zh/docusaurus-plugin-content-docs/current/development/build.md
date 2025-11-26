---
description: '在 Linux 系统上从源代码构建 ClickHouse 的分步指南'
sidebar_label: '在 Linux 上构建'
sidebar_position: 10
slug: /development/build
title: '如何在 Linux 上构建 ClickHouse'
doc_type: 'guide'
---



# 如何在 Linux 上构建 ClickHouse

:::info 无需自行构建 ClickHouse！
可以按照 [快速开始](https://clickhouse.com/#quick-start) 中的说明安装预编译的 ClickHouse。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE（实验性）
- s390/x（实验性）
- RISC-V 64（实验性）



## 前提条件 {#assumptions}

本教程以 Ubuntu Linux 为基础进行讲解，但通过适当调整，也应适用于其他任何 Linux 发行版。
用于开发的最低推荐 Ubuntu 版本为 24.04 LTS。

本教程假定你已经在本地检出（或克隆）了 ClickHouse 仓库及其所有子模块。



## 安装前提条件

首先，请参阅通用的[前提条件文档](developer-instruction.md)。

ClickHouse 使用 CMake 和 Ninja 进行构建。

你还可以选择安装 ccache，以便在构建时复用已编译的目标文件。

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## 安装 Clang 编译器

要在 Ubuntu/Debian 上安装 Clang，请使用 [LLVM 提供的自动安装脚本](https://apt.llvm.org/)。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版，请检查是否可以安装 LLVM 的任一[预构建包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月，需要 Clang 19 或更高版本。
不支持 GCC 或其他编译器。


## 安装 Rust 编译器（可选） {#install-the-rust-compiler-optional}

:::note
Rust 是 ClickHouse 的一个可选依赖。
如果未安装 Rust，ClickHouse 的某些功能将不会被编译。
:::

首先，按照官方 [Rust 文档](https://www.rust-lang.org/tools/install) 中的步骤安装 `rustup`。

与 C++ 依赖类似，ClickHouse 使用 vendoring 来精确控制安装内容，并避免依赖第三方服务（例如 `crates.io` 注册表）。

虽然在发布模式下，任何较新的 rustup 工具链版本通常都可以与这些依赖配合使用，但如果你计划启用 sanitizers，则必须使用与 CI 中所用工具链在 `std` 版本上完全一致的 rustup 工具链版本（我们为该版本预先 vendoring 了相关 crates）：



```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## 构建 ClickHouse

我们建议在 `ClickHouse` 内创建一个单独的 `build` 目录，用于存放所有构建产物：

```sh
mkdir build
cd build
```

你可以为不同的构建类型使用多个不同的目录（例如 `build_release`、`build_debug` 等）。

可选：如果你安装了多个编译器版本，可以选择性地指定要使用的具体编译器。

```sh
export CC=clang-19
export CXX=clang++-19
```

在开发阶段，建议使用调试构建。
与发布构建相比，它们使用较低级别的编译器优化（`-O`），从而带来更好的调试体验。
此外，类型为 `LOGICAL_ERROR` 的内部异常会立即导致崩溃，而不会被优雅地处理。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
如果你希望使用 gdb 等调试器，请在上述命令中添加 `-D DEBUG_O_LEVEL="0"`，以禁用所有编译器优化，因为这些优化可能会影响 gdb 查看或访问变量的能力。
:::

运行 ninja 进行构建：

```sh
ninja clickhouse
```

如果你想构建所有二进制文件（工具和测试），请直接运行不带任何参数的 ninja：

```sh
ninja
```

可以通过参数 `-j` 控制并行构建作业的数量：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake 为执行上述命令提供了快捷方式：

```sh
cmake -S . -B build  # 配置构建，从代码仓库顶层目录运行
cmake --build build  # 编译
```

:::


## 运行 ClickHouse 可执行文件

在构建成功完成后，可以在 `ClickHouse/<build_dir>/programs/` 中找到可执行文件：

ClickHouse 服务器会尝试在当前目录中查找配置文件 `config.xml`。
也可以在命令行中通过 `-C` 指定配置文件。

要使用 `clickhouse-client` 连接到 ClickHouse 服务器，打开另一个终端，进入 `ClickHouse/build/programs/`，然后运行 `./clickhouse client`。

如果在 macOS 或 FreeBSD 上收到 `Connection refused` 提示，请尝试将主机地址指定为 127.0.0.1：

```bash
clickhouse client --host 127.0.0.1
```


## 高级选项

### 最小构建

如果不需要使用第三方库提供的功能，可以进一步加快构建速度：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

如果出现问题，就只能靠你自己了……

Rust 需要网络连接。要禁用 Rust 支持：

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件

你可以将系统中安装的生产版本 ClickHouse 二进制文件替换为自己编译的 ClickHouse 二进制文件。
为此，请按照官方网站上的说明在本机安装 ClickHouse。
然后运行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

请注意，`clickhouse-client`、`clickhouse-server` 等是指向通用共享的 `clickhouse` 二进制文件的符号链接。

也可以使用系统中已安装的 ClickHouse 软件包中的配置文件来运行自定义构建的 ClickHouse 二进制文件：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 在任何 Linux 系统上构建

在 OpenSUSE Tumbleweed 上安装先决条件：

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

### 在 Docker 中构建

你可以使用以下命令，在本地的、与 CI 类似的环境中运行任意构建：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```

其中 BUILD&#95;JOB&#95;NAME 是 CI 报告中显示的作业名称，例如 “Build (arm&#95;release)”、“Build (amd&#95;debug)”。

此命令会拉取包含所有所需依赖项的相应 Docker 镜像 `clickhouse/binary-builder`，
并在其中运行构建脚本：`./ci/jobs/build_clickhouse.py`。

构建产物将输出到 `./ci/tmp/` 目录中。

它同时适用于 AMD 和 ARM 架构，除了 Docker 之外不需要任何其他依赖。
