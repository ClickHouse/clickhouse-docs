---
slug: /development/build-osx
sidebar_position: 15
sidebar_label: 在 macOS 上构建 ClickHouse
---


# 如何在 macOS 上为 macOS 构建 ClickHouse

:::info 你不需要自己构建 ClickHouse!
你可以按照 [快速开始](https://clickhouse.com/#quick-start) 的描述安装预构建的 ClickHouse。
:::

ClickHouse 可以在 macOS x86_64 (Intel) 和 arm64 (Apple Silicon) 上编译，要求 macOS 10.15 (Catalina) 或更高版本。

作为编译器，仅支持来自 Homebrew 的 Clang。

## 安装先决条件 {#install-prerequisites}

首先安装 [Homebrew](https://brew.sh/)。

接下来，运行：

``` bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm
```

:::note
Apple 默认使用不区分大小写的文件系统。虽然这通常对编译没有影响（特别是抓取构建会正常工作），但会导致像 `git mv` 这样的文件操作出现混淆。
在 macOS 上进行严重开发时，请确保源代码存储在区分大小写的磁盘卷上，例如，查看 [这些说明](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)。
:::

## 构建 ClickHouse {#build-clickhouse}

要进行构建，必须使用 Homebrew 的 Clang 编译器：

``` bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# 生成的二进制文件将创建在：build/programs/clickhouse
```

## 注意事项 {#caveats}

如果你打算运行 `clickhouse-server`，请确保增加系统的 `maxfiles` 变量。

:::note
你需要使用 sudo。
:::

为此，创建 `/Library/LaunchDaemons/limit.maxfiles.plist` 文件，内容如下：

``` xml
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

为文件设置正确的权限：

``` bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

验证文件是否正确：

``` bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

加载该文件（或重启）：

``` bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

要检查它是否工作，使用 `ulimit -n` 或 `launchctl limit maxfiles` 命令。
