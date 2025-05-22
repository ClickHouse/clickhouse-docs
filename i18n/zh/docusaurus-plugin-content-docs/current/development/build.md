---
'description': '在Linux系统上从源代码构建ClickHouse的逐步指南'
'sidebar_label': '在Linux上构建'
'sidebar_position': 10
'slug': '/development/build'
'title': '如何在Linux上构建ClickHouse'
---


# 如何在 Linux 上构建 ClickHouse

:::info 你不必自己构建 ClickHouse！
你可以按照 [快速开始](https://clickhouse.com/#quick-start) 中的描述安装预构建的 ClickHouse。
:::

ClickHouse 可以在以下平台上构建：

- x86_64
- AArch64
- PowerPC 64 LE（实验性）
- s390/x（实验性）
- RISC-V 64（实验性）

## 假设 {#assumptions}

以下教程基于 Ubuntu Linux，但它也应该适用于任何其他 Linux 发行版，只需进行适当的更改。
开发推荐的最低 Ubuntu 版本是 24.04 LTS。

该教程假设你已经在本地检出 ClickHouse 存储库及所有子模块。

## 安装先决条件 {#install-prerequisites}

首先，请查看通用的 [先决条件文档](developer-instruction.md)。

ClickHouse 使用 CMake 和 Ninja 进行构建。

你可以选择性地安装 ccache，以便构建重新使用已经编译的目标文件。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## 安装 Clang 编译器 {#install-the-clang-compiler}

要在 Ubuntu/Debian 上安装 Clang，请使用来自 [这里](https://apt.llvm.org/) 的 LLVM 自动安装脚本。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

对于其他 Linux 发行版，检查你是否可以安装 LLVM 的任何 [预构建包](https://releases.llvm.org/download.html)。

截至 2025 年 3 月，要求使用 Clang 19 或更高版本。
不支持 GCC 或其他编译器。

## 安装 Rust 编译器（可选） {#install-the-rust-compiler-optional}

:::note
Rust 是 ClickHouse 的可选依赖项。
如果未安装 Rust，某些 ClickHouse 功能将被省略。
:::

首先，按照官方 [Rust 文档](https://www.rust-lang.org/tools/install) 中的步骤安装 `rustup`。

与 C++ 依赖项一样，ClickHouse 使用供应商控制安装的内容，以避免依赖第三方服务（如 `crates.io` 注册表）。

虽然在发布模式下，任何现代 rustup 工具链版本都应与这些依赖项配合使用，但如果你计划启用消毒器，则必须使用与 CI 中使用的相同 `std` 完全匹配的版本（我们为其供应必要的 crate）：

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

你可以拥有多个不同的目录（例如 `build_release`、`build_debug` 等）用于不同的构建类型。

可选：如果你安装了多个编译器版本，可以选择性地指定使用的确切编译器。

```sh
export CC=clang-19
export CXX=clang++-19
```

出于开发目的，建议使用调试构建。
与发布构建相比，它们具有较低的编译器优化级别（`-O`），提供更好的调试体验。
此外，类型为 `LOGICAL_ERROR` 的内部异常会立即崩溃，而不是优雅失败。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

运行 ninja 来构建：

```sh
ninja clickhouse-server clickhouse-client
```

如果你希望构建所有二进制文件（工具和测试），请运行不带参数的 ninja：

```sh
ninja
```

你可以使用参数 `-j` 控制并行构建作业的数量：

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

在构建成功完成后，你可以在 `ClickHouse/<build_dir>/programs/` 中找到可执行文件：

ClickHouse 服务器尝试在当前目录中查找配置文件 `config.xml`。
你也可以通过 `-C` 在命令行中指定配置文件。

要连接到 ClickHouse 服务器，使用 `clickhouse-client`，打开另一个终端，导航到 `ClickHouse/build/programs/` 并运行 `./clickhouse client`。

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

如遇问题，你需要自行解决 ...

Rust 需要互联网连接。要禁用 Rust 支持：

```sh
cmake -DENABLE_RUST=OFF
```

### 运行 ClickHouse 可执行文件 {#running-the-clickhouse-executable-1}

你可以用编译后的 ClickHouse 二进制文件替换系统中安装的生产版本 ClickHouse 二进制文件。
要做到这一点，请按照官方站点的说明在你的机器上安装 ClickHouse。
接下来，运行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

注意 `clickhouse-client`、`clickhouse-server` 等是指向共同共享的 `clickhouse` 二进制文件的符号链接。

你也可以使用你自定义构建的 ClickHouse 二进制文件与系统上安装的 ClickHouse 包中的配置文件一起运行：

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

你可以使用以下命令在与 CI 类似的环境下本地运行任何构建：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
其中 BUILD_JOB_NAME 是在 CI 报告中显示的作业名称，例如 “Build (arm_release)”、“Build (amd_debug)”

此命令拉取适当的 Docker 镜像 `clickhouse/binary-builder`，该镜像包含所有所需的依赖项，并在其中运行构建脚本：`./ci/jobs/build_clickhouse.py`

构建输出将放置在 `./ci/tmp/` 中。

它适用于 AMD 和 ARM 架构，并且只需要 Docker，而不需要额外的依赖项。
