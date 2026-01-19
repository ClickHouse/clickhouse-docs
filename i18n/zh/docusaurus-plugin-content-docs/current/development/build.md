---
description: '在 Linux 系统上从源代码构建 ClickHouse 的分步指南'
sidebar_label: '在 Linux 上构建'
sidebar_position: 10
slug: /development/build
title: '如何在 Linux 上构建 ClickHouse'
doc_type: 'guide'
---

# 如何在 Linux 上构建 ClickHouse \{#how-to-build-clickhouse-on-linux\}

:::info 无需自行构建 ClickHouse！
你可以按照[快速开始](https://clickhouse.com/#quick-start)中的说明安装预编译的 ClickHouse。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE（实验性）
- s390/x（实验性）
- RISC-V 64（实验性）

## 前提条件 \{#assumptions\}

本教程基于 Ubuntu Linux 编写，但通过适当调整后，也应适用于其他任意 Linux 发行版。
用于开发的 Ubuntu 最低推荐版本为 24.04 LTS。

本教程假设你已在本地检出 ClickHouse 仓库及其所有子模块。

## 安装前置条件 \{#install-prerequisites\}

首先，请参阅通用的[前置条件文档](developer-instruction.md)。

ClickHouse 使用 CMake 和 Ninja 进行构建。

你还可以选择安装 ccache，以便在构建时复用已编译好的目标文件。

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## 安装 Clang 编译器 \{#install-the-clang-compiler\}

要在 Ubuntu/Debian 上安装 Clang，请使用 LLVM 的自动安装脚本，详见[此页面](https://apt.llvm.org/)。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版，请查看是否提供可安装的 LLVM [预编译二进制包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月，需要使用 Clang 19 或更高版本。
不支持 GCC 或其他编译器。

## 安装 Rust 编译器（可选） \{#install-the-rust-compiler-optional\}

:::note
Rust 是 ClickHouse 的可选依赖。
如果未安装 Rust，ClickHouse 的某些功能将不会被编译进二进制文件。
:::

首先，按照官方 [Rust 文档](https://www.rust-lang.org/tools/install)中的步骤安装 `rustup`。

与 C++ 依赖类似，ClickHouse 使用 vendoring 来精确控制安装内容，并避免依赖第三方服务（例如 `crates.io` registry）。

虽然在 release 模式下，任意较新的 Rust toolchain 版本通常都可以与这些依赖一起工作，但如果你计划启用 sanitizers，则必须使用与 CI 中所用版本拥有完全相同 `std` 的 toolchain（我们为此对相关 crates 做了 vendoring）：

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## 构建 ClickHouse \{#build-clickhouse\}

我们建议在 ClickHouse 项目中创建一个单独的 `build` 目录，用于存放所有构建产物：

```sh
mkdir build
cd build
```

你可以为不同的构建类型使用多个目录（例如 `build_release`、`build_debug` 等）。

可选：如果你安装了多个编译器版本，可以指定要使用的具体编译器。

```sh
export CC=clang-21
export CXX=clang++-21
```

出于开发目的，推荐使用调试构建（debug builds）。
与发布构建（release builds）相比，它们使用更低的编译器优化级别（`-O`），从而带来更好的调试体验。
此外，类型为 `LOGICAL_ERROR` 的内部异常会立即导致崩溃，而不会被优雅地捕获和处理。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
如果你希望使用例如 gdb 这样的调试器，请在上述命令中添加 `-D DEBUG_O_LEVEL="0"`，以禁用所有编译器优化，因为这些优化可能会影响 gdb 查看或访问变量的能力。
:::

运行 ninja 进行构建：

```sh
ninja clickhouse
```

如果你想构建所有二进制文件（工具和测试），请直接运行不带任何参数的 ninja：

```sh
ninja
```

你可以使用参数 `-j` 来控制并行构建任务的数量：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake 为这些命令提供了快捷方式：

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```

:::


## 运行 ClickHouse 可执行文件 \{#running-the-clickhouse-executable\}

构建成功后，你可以在 `ClickHouse/<build_dir>/programs/` 中找到可执行文件：

ClickHouse 服务器会尝试在当前目录查找配置文件 `config.xml`。
你也可以在命令行中通过 `-C` 选项指定配置文件。

要使用 `clickhouse-client` 连接到 ClickHouse 服务器，打开另一个终端，进入 `ClickHouse/build/programs/` 并运行 `./clickhouse client`。

如果在 macOS 或 FreeBSD 上收到 `Connection refused` 消息，请尝试指定主机地址 127.0.0.1：

```bash
clickhouse client --host 127.0.0.1
```

## 高级选项 \{#advanced-options\}

### 最小构建 \{#minimal-build\}

如果不需要第三方库提供的功能，可以进一步提升构建速度：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

如果出现问题，则需自行解决……

Rust 需要网络连接。若要禁用 Rust 支持：

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件 \{#running-the-clickhouse-executable-1\}

你可以将系统中安装的生产环境版本 ClickHouse 二进制文件替换为自己编译的 ClickHouse 二进制文件。
为此，请按照官方文档网站上的说明在你的机器上安装 ClickHouse。
然后运行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

请注意，`clickhouse-client`、`clickhouse-server` 等都是指向公共共享的 `clickhouse` 二进制文件的符号链接。

你也可以使用系统上已安装的 ClickHouse 软件包中的配置文件来运行你自定义构建的 ClickHouse 二进制文件。

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 在任何 Linux 上构建 \{#building-on-any-linux\}

在 OpenSUSE Tumbleweed 上安装依赖项：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

在 Fedora Rawhide 上安装先决条件：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### 在 Docker 中构建 \{#building-in-docker\}

你可以使用以下命令，在与 CI 类似的环境中本地运行任何构建：

```bash
python -m ci.praktika run "BUILD_JOB_NAME"
```

其中 BUILD&#95;JOB&#95;NAME 是 CI 报告中显示的作业名称，例如 “Build (arm&#95;release)”、“Build (amd&#95;debug)”。

此命令会拉取包含所有必需依赖项的对应 Docker 镜像 `clickhouse/binary-builder`，
并在该镜像内运行构建脚本：`./ci/jobs/build_clickhouse.py`。

构建产物将生成在 `./ci/tmp/` 中。

该方式同时适用于 AMD 和 ARM 架构，除已安装 `requests` 模块的 Python 和 Docker 外，无需其他额外依赖。
