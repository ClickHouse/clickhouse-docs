---
slug: '/development/build-osx'
sidebar_position: 15
sidebar_label: 'macOS 用に macOS でビルドする方法'
keywords: ['ClickHouse', 'macOS', 'ビルド', '開発']
description: 'macOS 用の ClickHouse をビルドするための手順を説明します。'
---


# macOS 用に macOS で ClickHouse をビルドする方法

:::info 自分で ClickHouse をビルドする必要はありません!
[クイックスタート](https://clickhouse.com/#quick-start) に従って、プリビルドの ClickHouse をインストールできます。
:::

ClickHouse は、macOS 10.15 (Catalina) 以降の macOS x86_64 (Intel) および arm64 (Apple Silicon) でコンパイルできます。

コンパイラとしては、Homebrew の Clang のみがサポートされています。

## 前提条件のインストール {#install-prerequisites}

まず、[Homebrew](https://brew.sh/) をインストールします。

次に、次のコマンドを実行します:

``` bash
brew update
brew install ccache cmake ninja libtool gettext llvm binutils grep findutils nasm
```

:::note
Apple はデフォルトで大文字と小文字を区別しないファイルシステムを使用しています。これは通常はコンパイルに影響を与えませんが（特に scratch make は動作します）、`git mv` のようなファイル操作を混乱させることがあります。
macOS での本格的な開発のためには、ソースコードが大文字と小文字を区別するディスクボリュームに保存されていることを確認してください。たとえば、[これらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830) を参照してください。
:::

## ClickHouse のビルド {#build-clickhouse}

ビルドを行うには、Homebrew の Clang コンパイラを使用する必要があります:

``` bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# 結果のバイナリは次の場所に作成されます: build/programs/clickhouse
```

## 注意点 {#caveats}

`clickhouse-server` を実行するつもりの場合は、システムの `maxfiles` 変数を増やす必要があります。

:::note
sudo を使用する必要があります。
:::

そのためには、`/Library/LaunchDaemons/limit.maxfiles.plist` ファイルを次の内容で作成します:

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

ファイルに適切な権限を付与します:

``` bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルが正しいことを確認します:

``` bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルを読み込む（または再起動します）:

``` bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作しているかどうかを確認するには、`ulimit -n` または `launchctl limit maxfiles` コマンドを使用します。
