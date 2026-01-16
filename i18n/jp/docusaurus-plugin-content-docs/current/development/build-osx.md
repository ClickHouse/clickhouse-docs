---
description: 'macOS システム上で ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'macOS 上での macOS 向けビルド'
sidebar_position: 15
slug: /development/build-osx
title: 'macOS 上での macOS 向けビルド'
keywords: ['macOS', 'Mac', 'ビルド']
doc_type: 'guide'
---

# macOS 向けに macOS 上で ClickHouse をビルドする方法 \\{#how-to-build-clickhouse-on-macos-for-macos\\}

:::info ClickHouse を自分でビルドする必要はありません！
[Quick Start](https://clickhouse.com/#quick-start) に記載されている手順に従って、事前にビルド済みの ClickHouse をインストールできます。
:::

ClickHouse は、macOS 10.15 (Catalina) 以降の macOS 上で、x86_64 (Intel) および arm64 (Apple Silicon) 向けにコンパイルできます。

コンパイラとしては、Homebrew の Clang のみがサポートされています。

## 前提条件をインストールする \\{#install-prerequisites\\}

まず、共通の[前提条件ドキュメント](developer-instruction.md)を参照してください。

次に、[Homebrew](https://brew.sh/) をインストールし、次を実行します:

その後、次を実行します:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Apple はデフォルトで大文字・小文字を区別しないファイルシステムを使用します。通常はコンパイルには影響しません（特に scratch での make は問題なく動作します）が、`git mv` のようなファイル操作で問題が発生することがあります。
macOS 上で本格的な開発を行う場合は、ソースコードを大文字・小文字を区別するディスクボリュームに保存していることを確認してください。たとえば、[こちらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830) を参照してください。
:::

## ClickHouse をビルドする \\{#build-clickhouse\\}

ビルドには、Homebrew 版の Clang コンパイラを使用する必要があります。

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# The resulting binary will be created at: build/programs/clickhouse
```

:::note
リンク時に `ld: archive member '/' not a mach-o file in ...` エラーが発生する場合は、
フラグ `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar` を指定して llvm-ar を使用する必要がある場合があります。
:::

## 注意点 \\{#caveats\\}

`clickhouse-server` を実行する場合は、システムの `maxfiles` 変数の値を増やしておいてください。

:::note
`sudo` を使用する必要があります。
:::

そのためには、次の内容で `/Library/LaunchDaemons/limit.maxfiles.plist` ファイルを作成します。

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

ファイルに適切な権限を設定します：

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルが正しいことを検証します：

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルを読み込む（または再起動する）：

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作しているかどうか確認するには、`ulimit -n` または `launchctl limit maxfiles` コマンドを実行します。
