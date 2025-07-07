---
'description': '在Linux系统上从源代码构建ClickHouse的逐步指南'
'sidebar_label': '在Linux上构建'
'sidebar_position': 10
'slug': '/development/build'
'title': '如何在Linux上构建ClickHouse'
---


# 如何在 Linux 上构建 ClickHouse

:::info 您不必自己构建 ClickHouse！
您可以按照 [快速入门](https://clickhouse.com/#quick-start) 中的说明安装预构建的 ClickHouse。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE (实验性)
- s390/x (实验性)
- RISC-V 64 (实验性)

## 先决条件 {#assumptions}

以下教程基于 Ubuntu Linux，但也应该适用于任何其他 Linux 发行版，只需进行适当修改即可。
推荐用于开发的最小 Ubuntu 版本为 24.04 LTS。

该教程假设您已经在本地检出了 ClickHouse 仓库及其所有子模块。

## 安装先决条件 {#install-prerequisites}

首先，请查看通用的 [先决条件文档](developer-instruction.md)。

ClickHouse 使用 CMake 和 Ninja 进行构建。

您可以选择性地安装 ccache，以便在构建时重用已编译的对象文件。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## 安装 Clang 编译器 {#install-the-clang-compiler}

要在 Ubuntu/Debian 上安装 Clang，请使用来自 [这里](https://apt.llvm.org/) 的 LLVM 自动安装脚本。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版，请检查是否可以安装任何 LLVM 的 [预构建软件包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月，必须使用 Clang 19 或更高版本。
GCC 或其他编译器不受支持。

## 安装 Rust 编译器（可选） {#install-the-rust-compiler-optional}

:::note
Rust 是 ClickHouse 的可选依赖项。
如果未安装 Rust，则某些 ClickHouse 功能将从编译中省略。
:::

首先，请按照官方 [Rust 文档](https://www.rust-lang.org/tools/install) 中的步骤安装 `rustup`。

与 C++ 依赖项一样，ClickHouse 使用 vendoring 来精确控制已安装的内容并避免依赖第三方服务（如 `crates.io` 注册表）。

尽管在发布模式下，任何现代的 rustup 工具链版本都应与这些依赖项一起工作，但如果您计划启用 sanitizer，则必须使用与 CI 中使用的相同 `std` 的版本（对于该版本我们供应 crates）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```
## 构建 ClickHouse {#build-clickhouse}

我们建议在 `ClickHouse` 内创建一个单独的目录 `build`，其中包含所有构建产物：

```sh
mkdir build
cd build
```

您可以为不同的构建类型（例如 `build_release`、`build_debug` 等）设置几个不同的目录。

可选：如果安装了多个编译器版本，您可以选择性地指定要使用的确切编译器。

```sh
export CC=clang-19
export CXX=clang++-19
```

出于开发目的，建议使用调试构建。
与发布构建相比，调试构建具有较低的编译器优化级别（`-O`），提供更好的调试体验。
此外，类型为 `LOGICAL_ERROR` 的内部异常立即崩溃，而不是优雅失败。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

运行 ninja 进行构建：

```sh
ninja clickhouse-server clickhouse-client
```

如果您希望构建所有二进制文件（实用程序和测试），请无需参数运行 ninja：

```sh
ninja
```

您可以使用参数 `-j` 控制并行构建作业的数量：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake 为上述命令提供了快捷方式：

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```
:::

## 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable}

构建成功完成后，您会在 `ClickHouse/<build_dir>/programs/` 中找到可执行文件：

ClickHouse 服务器尝试在当前目录中查找配置文件 `config.xml`。
您可以选择通过 `-C` 在命令行中指定配置文件。

要使用 `clickhouse-client` 连接到 ClickHouse 服务器，请打开另一个终端，导航到 `ClickHouse/build/programs/`，然后运行 `./clickhouse client`。

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

如果出现问题，您将独自承担后果...

Rust 需要互联网连接。要禁用 Rust 支持：

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable-1}

您可以用编译后的 ClickHouse 二进制文件替换系统中安装的生产版本 ClickHouse 二进制文件。
为此，请按照官方网站的说明在您的机器上安装 ClickHouse。
接下来，运行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

请注意，`clickhouse-client`、`clickhouse-server` 和其他文件都是指向常用的 `clickhouse` 二进制文件的符号链接。

您还可以使用系统上安装的 ClickHouse 软件包中的配置文件运行自定义构建的 ClickHouse 二进制文件：

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

您可以使用以下命令在类似 CI 的环境中本地运行任何构建：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
其中 BUILD_JOB_NAME 是 CI 报告中显示的作业名称，例如，“Build (arm_release)”、“Build (amd_debug)”

该命令会拉取所需依赖项的适当 Docker 镜像 `clickhouse/binary-builder`，
并在其中运行构建脚本： `./ci/jobs/build_clickhouse.py`

构建输出将放置在 `./ci/tmp/` 中。

它可以在 AMD 和 ARM 架构上运行，并且不需要除 Docker 之外的其他依赖项。
