---
description: '在 macOS 系统上从源代码构建 ClickHouse 的指南'
sidebar_label: '在 macOS 上为 macOS 构建'
sidebar_position: 15
slug: /development/build-osx
title: '在 macOS 上为 macOS 构建'
keywords: ['MacOS', 'Mac', '构建']
doc_type: 'guide'
---



# 如何在 macOS 上为 macOS 构建 ClickHouse

:::info 你不需要自己构建 ClickHouse！
你可以按照[快速开始](https://clickhouse.com/#quick-start)中的说明安装预构建的 ClickHouse。
:::

ClickHouse 可以在 macOS 10.15（Catalina）或更高版本上，为 macOS x86_64（Intel）和 arm64（Apple Silicon）平台进行编译。

作为编译器，仅支持使用通过 Homebrew 安装的 Clang。



## 安装前置条件 {#install-prerequisites}

首先,请参阅通用的[前置条件文档](developer-instruction.md)。

接下来,安装 [Homebrew](https://brew.sh/) 并运行

然后运行:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple 默认使用不区分大小写的文件系统。虽然这通常不会影响编译(尤其是全新构建可以正常工作),但可能会导致 `git mv` 等文件操作出现混淆。
如果要在 macOS 上进行正式开发,请确保将源代码存储在区分大小写的磁盘卷上,例如可参考[这些说明](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)。
:::


## 构建 ClickHouse {#build-clickhouse}

要构建 ClickHouse,必须使用 Homebrew 的 Clang 编译器:


```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# 生成的二进制文件将位于：build/programs/clickhouse
```

:::note
如果在链接阶段遇到 `ld: archive member '/' not a mach-o file in ...` 错误，可能需要通过设置选项 `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar` 来改用 llvm-ar。
:::


## 注意事项 {#caveats}

如果您打算运行 `clickhouse-server`,请务必增加系统的 `maxfiles` 变量。

:::note
您需要使用 sudo。
:::

为此,请创建 `/Library/LaunchDaemons/limit.maxfiles.plist` 文件,内容如下:

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

为文件设置正确的权限:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

验证文件格式是否正确:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

加载文件(或重启系统):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

要检查配置是否生效,请使用 `ulimit -n` 或 `launchctl limit maxfiles` 命令。
