---
slug: /development/build-osx
sidebar_position: 15
sidebar_label: macOS上でのClickHouseビルド
---

# macOS上でClickHouseをビルドする方法

:::info ClickHouseを自分でビルドする必要はありません!
[クイックスタート](https://clickhouse.com/#quick-start)に記載されているように、プリビルドのClickHouseをインストールできます。
:::

ClickHouseは、macOS 10.15 (Catalina) 以上の環境で、macOS x86_64 (Intel) と arm64 (Apple Silicon) 上でコンパイルできます。

コンパイラとしては、HomebrewのClangのみがサポートされています。

AppleのXCode `apple-clang`を使用してビルドすることは推奨されておらず、任意の方法で壊れる可能性があります。

## 依存関係のインストール {#install-prerequisites}

まず、[Homebrew](https://brew.sh/)をインストールします。

次に、次のコマンドを実行します:

``` bash
brew update
brew install ccache cmake ninja libtool gettext llvm gcc binutils grep findutils nasm
```

AppleのXCode Clang（推奨されません）を使用する場合は、最新の[XCode](https://apps.apple.com/am/app/xcode/id497799835?mt=12)をApp Storeからインストールしてください。
エンドユーザーライセンス契約を受け入れ、必要なコンポーネントを自動的にインストールするために、少なくとも一度は開いてください。
その後、最新のコマンドラインツールがシステムにインストールされ、選択されていることを確認します:

``` bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

:::note
Appleはデフォルトで大文字小文字を区別しないファイルシステムを使用しています。通常、これはコンパイルに影響しません（特にスクラッチビルドは機能します）が、`git mv`のようなファイル操作を混乱させることがあります。
macOSでの本格的な開発のためには、ソースコードが大文字小文字を区別するディスクボリュームに保存されていることを確認してください。例えば、[こちらの指示](https://brianboyko.medium.com/a-case-sensitive-src-folder-for-mac-programmers-176cc82a3830)を参照してください。
:::

## ClickHouseのビルド {#build-clickhouse}

HomebrewのClangコンパイラを使用してビルドするには:

``` bash
cd ClickHouse
mkdir build
export PATH=$(brew --prefix llvm)/bin:$PATH
cmake -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_C_COMPILER=$(brew --prefix llvm)/bin/clang -DCMAKE_CXX_COMPILER=$(brew --prefix llvm)/bin/clang++ -S . -B build
cmake --build build
# 結果のバイナリは以下に作成されます: build/programs/clickhouse
```

XCode IDE内でXCodeネイティブのAppleClangコンパイラを使用してビルドするには（推奨されません）:

``` bash
cd ClickHouse
rm -rf build
mkdir build
cd build
XCODE_IDE=1 ALLOW_APPLECLANG=1 cmake -G Xcode -DCMAKE_BUILD_TYPE=Debug -DENABLE_JEMALLOC=OFF ..
cmake --open .
# ...その後、XCode IDEでALL_BUILDスキームを選択し、ビルドプロセスを開始します。
# 結果のバイナリは以下に作成されます: ./programs/Debug/clickhouse
```

## 注意事項 {#caveats}

`clickhouse-server`を実行する場合は、システムの`maxfiles`変数を増加させる必要があります。

:::note
sudoを使用する必要があります。
:::

そのためには、次の内容で`/Library/LaunchDaemons/limit.maxfiles.plist`ファイルを作成します:

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

ファイルが正しいか確認します:

``` bash
plutil /Library/LaunchDaemons/limit.maxfiles.plist
```

ファイルを読み込む（あるいは再起動）します:

``` bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

正しく動作しているか確認するには、`ulimit -n`や`launchctl limit maxfiles`コマンドを使用します。
