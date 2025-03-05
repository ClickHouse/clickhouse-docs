---
slug: /development/build-osx
sidebar_position: 15
sidebar_label: macOS上でのClickHouseのビルド
---


# macOS上でClickHouseをビルドする方法

:::info ClickHouseを自分でビルドする必要はありません!
事前にビルドされたClickHouseは、[クイックスタート](https://clickhouse.com/#quick-start)に従ってインストールできます。
:::

ClickHouseは、macOS 10.15 (Catalina) 以上のmacOS x86_64 (Intel)およびarm64 (Apple Silicon)上でコンパイルできます。

コンパイラとしては、homebrewからのClangのみがサポートされています。

AppleのXCode `apple-clang`でのビルドは推奨されておらず、任意の方法で壊れる可能性があります。

## 前提条件のインストール {#install-prerequisites}

まず、[Homebrew](https://brew.sh/)をインストールしてください。

次に、以下を実行します:

``` bash
brew update
brew install ccache cmake ninja libtool gettext llvm gcc binutils grep findutils nasm
```

Apple XCode Clang（推奨されない）を使用する場合は、最新の[XCode](https://apps.apple.com/am/app/xcode/id497799835?mt=12)をApp Storeからインストールしてください。
エンドユーザーライセンス契約を受け入れるために少なくとも一度開き、必要なコンポーネントを自動的にインストールします。
次に、最新のCommand Line Toolsがシステムにインストールされ、選択されていることを確認してください:

``` bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

:::note
Appleはデフォルトで大文字小文字を区別しないファイルシステムを使用しています。これにより、通常はコンパイルに影響を与えない（特にscratch makeは機能します）が、`git mv`などのファイル操作が混乱する可能性があります。
macOSでの真剣な開発のためには、ソースコードを大文字小文字を区別するディスクボリュームに保存することを確認してください。例えば、[これらの手順](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)を参照してください。
:::

## ClickHouseのビルド {#build-clickhouse}

HomebrewのClangコンパイラを使用してビルドするには:

``` bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_C_COMPILER=$(brew --prefix llvm)/bin/clang -DCMAKE_CXX_COMPILER=$(brew --prefix llvm)/bin/clang++ -S . -B build
cmake --build build

# 結果のバイナリは次の場所に作成されます: build/programs/clickhouse
```

XCode IDE内のXCodeネイティブAppleClangコンパイラを使用してビルドするには（推奨されない）:

``` bash
cd ClickHouse
rm -rf build
mkdir build
cd build
XCODE_IDE=1 ALLOW_APPLECLANG=1 cmake -G Xcode -DCMAKE_BUILD_TYPE=Debug -DENABLE_JEMALLOC=OFF ..
cmake --open .

# ...その後、XCode IDEでALL_BUILDスキームを選択し、ビルドプロセスを開始します。

# 結果のバイナリは次の場所に作成されます: ./programs/Debug/clickhouse
```

## 注意事項 {#caveats}

`clickhouse-server`を実行する予定の場合は、システムの`maxfiles`変数を増やすことを確認してください。

:::note
sudoを使用する必要があります。
:::

そのためには、`/Library/LaunchDaemons/limit.maxfiles.plist`ファイルを以下の内容で作成してください:

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

ファイルに正しい権限を与えます:

``` bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルが正しいことを確認します:

``` bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルをロードします（または再起動します）:

``` bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

動作しているかどうかを確認するには、`ulimit -n`または`launchctl limit maxfiles`コマンドを使用してください。
