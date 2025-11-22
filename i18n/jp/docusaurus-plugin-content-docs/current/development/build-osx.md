---
description: 'macOSシステムでClickHouseをソースからビルドするためのガイド'
sidebar_label: 'macOS上でのmacOS向けビルド'
sidebar_position: 15
slug: /development/build-osx
title: 'macOS上でのmacOS向けビルド'
keywords: ['MacOS', 'Mac', 'ビルド']
doc_type: 'guide'
---



# macOS 向けに macOS 上で ClickHouse をビルドする方法

:::info ClickHouse を自分でビルドする必要はありません！
[Quick Start](https://clickhouse.com/#quick-start) に記載されている手順に従って、あらかじめビルド済みの ClickHouse をインストールできます。
:::

ClickHouse は、macOS 10.15（Catalina）以降の macOS 上で、x86_64（Intel）および arm64（Apple Silicon）向けにコンパイルできます。

コンパイラとしては、Homebrew 版の Clang のみがサポートされています。



## 前提条件のインストール {#install-prerequisites}

まず、一般的な[前提条件のドキュメント](developer-instruction.md)を参照してください。

次に、[Homebrew](https://brew.sh/)をインストールして実行します

その後、以下を実行します:

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Appleはデフォルトで大文字小文字を区別しないファイルシステムを使用しています。これは通常コンパイルには影響しません(特にスクラッチビルドは動作します)が、`git mv`のようなファイル操作で問題が発生する可能性があります。
macOSで本格的な開発を行う場合は、ソースコードを大文字小文字を区別するディスクボリュームに保存するようにしてください。例えば、[こちらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)を参照してください。
:::


## ClickHouseのビルド {#build-clickhouse}

ビルドには、HomebrewのClangコンパイラを使用する必要があります:


```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build
# 生成されたバイナリは次の場所に作成されます: build/programs/clickhouse
```

:::note
リンク時に `ld: archive member '/' not a mach-o file in ...` というエラーが発生する場合は、
フラグ `-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar` を設定して llvm-ar を使用してください。
:::


## 注意事項 {#caveats}

`clickhouse-server`を実行する予定がある場合は、システムの`maxfiles`変数を増やしてください。

:::note
sudoを使用する必要があります。
:::

そのためには、以下の内容で`/Library/LaunchDaemons/limit.maxfiles.plist`ファイルを作成します:

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

ファイルに適切な権限を設定します:

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルが正しいことを検証します:

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルを読み込みます(または再起動します):

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作を確認するには、`ulimit -n`または`launchctl limit maxfiles`コマンドを使用します。
