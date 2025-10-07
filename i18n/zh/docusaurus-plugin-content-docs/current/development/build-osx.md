---
'description': '在 macOS 系统上从源代码构建 ClickHouse 的指南'
'sidebar_label': '在 macOS 上构建 macOS'
'sidebar_position': 15
'slug': '/development/build-osx'
'title': '在 macOS 上构建 macOS'
'keywords':
- 'MacOS'
- 'Mac'
- 'build'
'doc_type': 'guide'
---


# 如何在 macOS 上构建 ClickHouse

:::info 您无需自己构建 ClickHouse！
您可以按照 [快速入门](https://clickhouse.com/#quick-start) 中的说明安装预构建的 ClickHouse。
:::

ClickHouse 可以在 macOS x86_64（Intel）和 arm64（Apple Silicon）上编译，要求 macOS 10.15（Catalina）或更高版本。

作为编译器，仅支持来自 homebrew 的 Clang。

## 安装先决条件 {#install-prerequisites}

首先，查看通用的 [先决条件文档](developer-instruction.md)。

接下来，安装 [Homebrew](https://brew.sh/) 并运行

然后运行：

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple 默认使用区分大小写的文件系统。虽然这通常不会影响编译（特别是 scratch makes 会正常工作），但可能会使文件操作如 `git mv` 感到困惑。
对于在 macOS 上的严肃开发，请确保源代码存储在支持区分大小写的磁盘卷中，例如，请参阅 [这些说明](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)。
:::

## 构建 ClickHouse {#build-clickhouse}

要构建，请使用 Homebrew 的 Clang 编译器：

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# The resulting binary will be created at: build/programs/clickhouse
```

:::note
如果在链接期间遇到 `ld: archive member '/' not a mach-o file in ...` 错误，您可能需要通过设置标志 `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar` 来使用 llvm-ar。
:::

## 注意事项 {#caveats}

如果您打算运行 `clickhouse-server`，请确保增加系统的 `maxfiles` 变量。

:::note
您需要使用 sudo。
:::

为此，创建 `/Library/LaunchDaemons/limit.maxfiles.plist` 文件，并包含以下内容：

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

赋予文件正确的权限：

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

要检查其是否正常工作，请使用 `ulimit -n` 或 `launchctl limit maxfiles` 命令。
