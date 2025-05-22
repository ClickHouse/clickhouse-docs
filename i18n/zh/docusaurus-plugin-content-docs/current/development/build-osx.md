---
'description': '在 macOS 系统上从源代码构建 ClickHouse 的指南'
'sidebar_label': '在 macOS 上构建 macOS'
'sidebar_position': 15
'slug': '/development/build-osx'
'title': '在 macOS 上构建 macOS'
---


# 如何在macOS上构建ClickHouse

:::info 您无需自己构建ClickHouse！
您可以根据[快速入门](https://clickhouse.com/#quick-start)中所述安装预构建的ClickHouse。
:::

ClickHouse可以在macOS x86_64（Intel）和arm64（Apple Silicon）上编译，支持macOS 10.15（Catalina）及更高版本。

在编译器方面，仅支持来自homebrew的Clang。

## 安装先决条件 {#install-prerequisites}

首先，请查看通用的[先决条件文档](developer-instruction.md)。

接下来，安装[Homebrew](https://brew.sh/)并运行

然后运行：

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm bash
```

:::note
Apple默认使用不区分大小写的文件系统。虽然这通常不会影响编译（尤其是使用scratch make），但它可能会使文件操作如`git mv`产生困惑。
对于在macOS上的严重开发，确保源代码存储在一个区分大小写的磁盘卷上，例如请参阅[这些说明](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)。
:::

## 构建ClickHouse {#build-clickhouse}

要构建，必须使用Homebrew的Clang编译器：

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# The resulting binary will be created at: build/programs/clickhouse
```

## 注意事项 {#caveats}

如果您打算运行`clickhouse-server`，请确保增加系统的`maxfiles`变量。

:::note
您需要使用sudo。
:::

为此，请创建`/Library/LaunchDaemons/limit.maxfiles.plist`文件，并包含以下内容：

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

给予该文件正确的权限：

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

要检查是否生效，请使用`ulimit -n`或`launchctl limit maxfiles`命令。
