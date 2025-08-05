---
description: 'Guide for building ClickHouse from source on macOS systems'
sidebar_label: 'Build on macOS for macOS'
sidebar_position: 15
slug: '/development/build-osx'
title: 'Build on macOS for macOS'
---




# How to Build ClickHouse on macOS for macOS

:::info あなたは自分で ClickHouse をビルドする必要はありません！
事前にビルドされた ClickHouse を [クイックスタート](https://clickhouse.com/#quick-start) の手順に従ってインストールできます。
:::

ClickHouse は、macOS 10.15 (Catalina) 以降の macOS x86_64 (Intel) および arm64 (Apple Silicon) でコンパイル可能です。

コンパイラとして、homebrew の Clang のみがサポートされています。

## Install Prerequisites {#install-prerequisites}

まず、一般的な [必要条件のドキュメント](developer-instruction.md) を参照してください。

次に、[Homebrew](https://brew.sh/) をインストールし、次のコマンドを実行します。

その後、以下を実行します:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm bash
```

:::note
Apple はデフォルトでケースを区別しないファイルシステムを使用しています。これは通常、コンパイルには影響しませんが（特にスクラッチメイクが機能します）、`git mv` のようなファイル操作に混乱を招くことがあります。
macOS での真剣な開発のためには、ソースコードをケースを区別するディスクボリュームに保存することを確認してください。たとえば、[これらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)を参照してください。
:::

## Build ClickHouse {#build-clickhouse}

ビルドを行うには、Homebrew の Clang コンパイラを使用する必要があります:

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# 生成されたバイナリは次の場所に作成されます: build/programs/clickhouse
```

## Caveats {#caveats}

`clickhouse-server` を実行する予定がある場合は、システムの `maxfiles` 変数を増やす必要があります。

:::note
sudo を使用する必要があります。
:::

そのために、次の内容の `/Library/LaunchDaemons/limit.maxfiles.plist` ファイルを作成してください:

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

ファイルに適切な権限を与えます:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルが正しいことを検証します:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルを読み込む（または再起動）します:

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作しているか確認するには、`ulimit -n` または `launchctl limit maxfiles` コマンドを使用してください。
