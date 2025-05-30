---
'description': '在 macOS 系统上从源代码构建 ClickHouse 的指南'
'sidebar_label': '在 macOS 上构建 macOS'
'sidebar_position': 15
'slug': '/development/build-osx'
'title': '在 macOS 上构建 macOS'
---


# 如何在 macOS 上构建 ClickHouse

:::info 您不需要自己构建 ClickHouse！
您可以按照[快速开始](https://clickhouse.com/#quick-start)中描述的方法安装预构建的 ClickHouse。
:::

ClickHouse 可以在 macOS x86_64 (Intel) 和 arm64 (Apple Silicon) 上使用 macOS 10.15 (Catalina) 或更高版本进行编译。

作为编译器，仅支持来自 Homebrew 的 Clang。

## 安装先决条件 {#install-prerequisites}

首先，请参阅通用的 [先决条件文档](developer-instruction.md)。

接下来，安装 [Homebrew](https://brew.sh/) 并运行：

然后运行：

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm bash
```

:::note
Apple 默认使用大小写不敏感的文件系统。虽然这通常不会影响编译（尤其是 scratch makes 将正常工作），但它可能会混淆文件操作，如 `git mv`。
对于在 macOS 上进行严重开发，确保源代码存储在大小写敏感的磁盘卷上，例如，请参见 [这些说明](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)。
:::

## 构建 ClickHouse {#build-clickhouse}

要构建，必须使用 Homebrew 的 Clang 编译器：

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# The resulting binary will be created at: build/programs/clickhouse
```

:::note
如果在链接过程中遇到 `ld: archive member '/' not a mach-o file in ...` 错误，您可能需要通过设置标志 `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar` 来使用 llvm-ar。
:::

## 注意事项 {#caveats}

如果您打算运行 `clickhouse-server`，请确保增加系统的 `maxfiles` 变量。

:::note
您需要使用 sudo。
:::

要做到这一点，创建 `/Library/LaunchDaemons/limit.maxfiles.plist` 文件，内容如下：

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

给文件正确的权限：

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

要检查是否工作，请使用 `ulimit -n` 或 `launchctl limit maxfiles` 命令。
