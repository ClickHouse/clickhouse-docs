---
description: '在 macOS 系统上从源代码构建 ClickHouse 的指南'
sidebar_label: '在 macOS 上为 macOS 构建'
sidebar_position: 15
slug: /development/build-osx
title: '在 macOS 上为 macOS 构建'
keywords: ['MacOS', 'Mac', '构建']
doc_type: 'guide'
---



# 如何在 macOS 上为 macOS 构建 ClickHouse {#how-to-build-clickhouse-on-macos-for-macos}

:::info 你不需要自己构建 ClickHouse！
你可以按照 [Quick Start](https://clickhouse.com/#quick-start) 中的说明安装预编译的 ClickHouse。
:::

ClickHouse 可以在 macOS 10.15（Catalina）或更高版本上编译，支持 x86_64（Intel）和 arm64（Apple Silicon）架构。

作为编译器，仅支持使用通过 Homebrew 安装的 Clang。



## 安装前提条件 {#install-prerequisites}

首先，请参阅通用的[前提条件文档](developer-instruction.md)。

接下来，安装 [Homebrew](https://brew.sh/) 并运行：

然后运行：

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple 默认使用不区分大小写的文件系统。虽然这通常不会影响编译（尤其是从头开始的 make 构建通常没问题），但可能会让像 `git mv` 这样的文件操作产生混淆。
在 macOS 上进行正式开发时，请确保源代码存放在区分大小写的磁盘卷上，例如参见[这些说明](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)。
:::


## 构建 ClickHouse {#build-clickhouse}

构建时必须使用 Homebrew 的 Clang 编译器：



```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# 生成的二进制文件将位于:build/programs/clickhouse {#the-resulting-binary-will-be-created-at-buildprogramsclickhouse}
```

:::note
如果在链接阶段遇到 `ld: archive member '/' not a mach-o file in ...` 错误，可能需要将标志 `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar` 设置为使用 llvm-ar。
:::


## 注意事项 {#caveats}

如果您打算运行 `clickhouse-server`，请确保增大系统的 `maxfiles` 参数值。

:::note
您需要使用 sudo 权限。
:::

为此，请创建 `/Library/LaunchDaemons/limit.maxfiles.plist` 文件，并写入以下内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>524288</string>
      <string>524288</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

为该文件设置正确的权限：

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

验证文件是否正确：

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

加载文件（或重启）：

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

要检查其是否生效，请使用 `ulimit -n` 或 `launchctl limit maxfiles` 命令。
