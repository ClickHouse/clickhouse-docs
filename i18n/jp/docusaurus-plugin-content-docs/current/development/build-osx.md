---
'description': 'macOSシステム上でClickHouseをソースからビルドするためのガイド'
'sidebar_label': 'macOS上でmacOS向けにビルドする'
'sidebar_position': 15
'slug': '/development/build-osx'
'title': 'macOS上でmacOS向けにビルドする'
'keywords':
- 'MacOS'
- 'Mac'
- 'build'
'doc_type': 'guide'
---


# macOS上でClickHouseをビルドする方法

:::info 自分でClickHouseをビルドする必要はありません！
[クイックスタート](https://clickhouse.com/#quick-start)で説明されているように、事前にビルドされたClickHouseをインストールできます。
:::

ClickHouseは、macOS 10.15（Catalina）以降のmacOS x86_64（Intel）およびarm64（Apple Silicon）上でコンパイルできます。

コンパイラとしては、HomebrewからのClangのみがサポートされています。

## 前提条件をインストールする {#install-prerequisites}

まず、一般的な[前提条件のドキュメント](developer-instruction.md)を参照してください。

次に、[Homebrew](https://brew.sh/)をインストールし、次のコマンドを実行します。

その後、次のコマンドを実行します：

```bash
brew update
brew install ccache cmake ninja libtool gettext llvm lld binutils grep findutils nasm bash rust rustup
```

:::note
Appleはデフォルトで大文字と小文字を区別しないファイルシステムを使用しています。通常、これはコンパイルに影響を与えません（特にscratch makesは機能します）が、`git mv`のようなファイル操作に混乱を招くことがあります。
macOSで本格的な開発を行う場合は、ソースコードが大文字と小文字を区別するディスクボリュームに保存されていることを確認してください。たとえば、[これらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)を参照してください。
:::

## ClickHouseをビルドする {#build-clickhouse}

ビルドするには、HomebrewのClangコンパイラを使用する必要があります：

```bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -S . -B build
cmake --build build

# The resulting binary will be created at: build/programs/clickhouse
```

:::note
リンク中に`ld: archive member '/' not a mach-o file in ...`エラーが発生する場合は、フラグ`-DCMAKE_AR=/opt/homebrew/opt/llvm/bin/llvm-ar`を設定してllvm-arを使用する必要があるかもしれません。
:::

## 注意事項 {#caveats}

`clickhouse-server`を実行する予定がある場合は、システムの`maxfiles`変数を増加させる必要があります。

:::note
sudoを使用する必要があります。
:::

そのためには、次の内容を持つ`/Library/LaunchDaemons/limit.maxfiles.plist`ファイルを作成します。

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

ファイルに適切な権限を与えます：

```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルが正しいかどうかを検証します：

```bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルをロードする（または再起動します）：

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作しているか確認するには、`ulimit -n`または`launchctl limit maxfiles`コマンドを使用します。
