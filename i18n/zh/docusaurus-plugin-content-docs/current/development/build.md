---
'description': '在Linux系统上从源代码构建ClickHouse的逐步指南'
'sidebar_label': '在Linux上构建'
'sidebar_position': 10
'slug': '/development/build'
'title': '如何在Linux上构建ClickHouse'
'doc_type': 'guide'
---


# 如何在 Linux 上构建 ClickHouse

:::info 您不必自己构建 ClickHouse！
您可以按照 [快速开始](https://clickhouse.com/#quick-start) 的说明安装预构建的 ClickHouse。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE（实验性）
- s390/x（实验性）
- RISC-V 64（实验性）

## 假设 {#assumptions}

以下教程基于 Ubuntu Linux，但它也应该适用于其他任何 Linux 发行版，只需进行适当的更改。
建议的最低 Ubuntu 版本为 24.04 LTS。

本教程假定您已本地检出 ClickHouse 仓库及所有子模块。

## 安装先决条件 {#install-prerequisites}

首先，请查看通用的 [先决条件文档](developer-instruction.md)。

ClickHouse 使用 CMake 和 Ninja 进行构建。

您可以选择性地安装 ccache，以便构建能够重用已编译的目标文件。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## 安装 Clang 编译器 {#install-the-clang-compiler}

要在 Ubuntu/Debian 上安装 Clang，请使用 LLVM 的自动安装脚本，地址可以从 [这里](https://apt.llvm.org/) 获取。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版，请查看是否可以安装 LLVM 的 [预构建包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月，要求使用 Clang 19 或更高版本。
不支持 GCC 或其他编译器。

## 安装 Rust 编译器（可选） {#install-the-rust-compiler-optional}

:::note
Rust 是 ClickHouse 的可选依赖项。
如果未安装 Rust，则某些 ClickHouse 的功能将不会被编译。
:::

首先，请遵循官方 [Rust 文档](https://www.rust-lang.org/tools/install) 中的步骤安装 `rustup`。

与 C++ 依赖项一样，ClickHouse 使用 vendoring 来精确控制安装内容，并避免依赖第三方服务（如 `crates.io` 注册表）。

虽然在发布模式下，任何现代的 rustup 工具链版本应该可以与这些依赖项配合使用，但如果您计划启用 sanitizers，必须使用与 CI 中使用的相同 `std` 完全匹配的版本（我们为此 vendoring 了这些 crates）：

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```
## 构建 ClickHouse {#build-clickhouse}

我们建议在 `ClickHouse` 目录中创建一个单独的目录 `build`，其中包含所有构建工件：

```sh
mkdir build
cd build
```

您可以有多个不同的目录（例如 `build_release`、`build_debug` 等）用于不同的构建类型。

可选：如果您安装了多个编译器版本，可以选择性地指定要使用的确切编译器。

```sh
export CC=clang-19
export CXX=clang++-19
```

出于开发目的，推荐使用调试构建。
与发布构建相比，它们具有较低的编译器优化水平（`-O`），提供更好的调试体验。
此外，类型为 `LOGICAL_ERROR` 的内部异常会立即崩溃，而不是优雅失败。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
如果您希望使用 gdb 等调试器，请在上述命令中添加 `-D DEBUG_O_LEVEL="0"` 来移除所有编译器优化，这可能会影响 gdb 查看/访问变量的能力。
:::

运行 ninja 进行构建：

```sh
ninja clickhouse
```

如果您希望构建所有二进制文件（实用程序和测试），可以不带参数运行 ninja：

```sh
ninja
```

您可以使用参数 `-j` 控制并行构建作业的数量：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake 提供了上述命令的快捷方式：

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```
:::

## 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable}

构建成功完成后，您可以在 `ClickHouse/<build_dir>/programs/` 中找到可执行文件：

ClickHouse 服务器尝试在当前目录中查找配置文件 `config.xml`。
您还可以通过 `-C` 在命令行中指定配置文件。

要使用 `clickhouse-client` 连接到 ClickHouse 服务器，请打开另一个终端，导航到 `ClickHouse/build/programs/` 并运行 `./clickhouse client`。

如果您在 macOS 或 FreeBSD 上收到 `Connection refused` 消息，请尝试指定主机地址 127.0.0.1：

```bash
clickhouse client --host 127.0.0.1
```

## 高级选项 {#advanced-options}

### 最小构建 {#minimal-build}

如果您不需要第三方库提供的功能，您可以进一步加快构建速度：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

如果出现问题，您就要自己解决了……

Rust 需要互联网连接。要禁用 Rust 支持：

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable-1}

您可以用编译后的 ClickHouse 二进制文件替换系统中安装的生产版本 ClickHouse 二进制文件。
要做到这一点，请遵循官方站点上的说明在您的机器上安装 ClickHouse。
接下来，运行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

请注意，`clickhouse-client`、`clickhouse-server` 等是通用共享的 `clickhouse` 二进制文件的符号链接。

您还可以使用系统中安装的 ClickHouse 包的配置文件运行您自定义构建的 ClickHouse 二进制文件：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 在任何 Linux 上构建 {#building-on-any-linux}

在 OpenSUSE Tumbleweed 上安装先决条件：

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

### 在 docker 中构建 {#building-in-docker}

您可以使用以下命令在与 CI 相似的环境中本地运行任何构建：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
其中 BUILD_JOB_NAME 是 CI 报告中显示的作业名称，例如 "Build (arm_release)"、"Build (amd_debug)"

此命令会拉取适当的 Docker 镜像 `clickhouse/binary-builder`，该镜像包含所有所需的依赖项，并在其中运行构建脚本：`./ci/jobs/build_clickhouse.py`

构建输出将放置在 `./ci/tmp/` 中。

它适用于 AMD 和 ARM 架构，并且除了 Docker 之外，不需要其他额外的依赖项。
