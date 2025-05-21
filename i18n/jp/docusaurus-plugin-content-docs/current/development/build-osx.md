---
description: 'macOS システムで ClickHouse をソースからビルドするためのガイド'
sidebar_label: 'macOS 用にビルドする'
sidebar_position: 15
slug: /development/build-osx
title: 'macOS 用にビルドする'
---


# macOS 用に ClickHouse をビルドする方法

:::info ClickHouse を自分でビルドする必要はありません！
[クイックスタート](https://clickhouse.com/#quick-start) で説明されているように、事前ビルドされた ClickHouse をインストールできます。
:::

ClickHouse は、macOS 10.15 (Catalina) 以降の macOS x86_64 (Intel) および arm64 (Apple Silicon) でコンパイルできます。

コンパイラとしては、homebrew の Clang のみがサポートされています。

## 前提条件をインストールする {#install-prerequisites}

まず、一般的な [前提条件のドキュメント](developer-instruction.md) を参照してください。

次に、[Homebrew](https://brew.sh/) をインストールし、次のコマンドを実行します。

次に、以下のコマンドを実行します：

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm bash
```

:::note
Apple はデフォルトで大文字と小文字を区別しないファイルシステムを使用しています。通常、これがコンパイルに影響を与えることはありません（特に scratch makes は機能します）が、`git mv` のようなファイル操作を混乱させる可能性があります。
macOS での重大な開発のためには、ソースコードが大文字と小文字を区別するディスクボリュームに保存されていることを確認してください。例えば、[これらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830) を参照してください。
:::

## ClickHouse をビルドする {#build-clickhouse}

ビルドするには、Homebrew の Clang コンパイラを使用する必要があります：

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# 結果のバイナリは次の場所に作成されます: build/programs/clickhouse
```

## 注意事項 {#caveats}

`clickhouse-server` を実行する予定がある場合は、システムの `maxfiles` 変数を増やす必要があります。

:::note
sudo を使用する必要があります。
:::

そのためには、`/Library/LaunchDaemons/limit.maxfiles.plist` ファイルを次の内容で作成します：

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

ファイルが正しいことを確認します：

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルを読み込む（または再起動）します：

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作しているかどうかを確認するには、`ulimit -n` または `launchctl limit maxfiles` コマンドを使用します。
