---
slug: /development/build
sidebar_position: 10
sidebar_label: Linux 上でのビルド
---

# Linux 上で ClickHouse をビルドする方法

:::info ClickHouse を自分でビルドする必要はありません!
事前にビルドされた ClickHouse は、[クイックスタート](https://clickhouse.com/#quick-start) に記載されている通りにインストールできます。
:::

ClickHouse は以下のプラットフォームでビルド可能です：

- x86_64
- AArch64
- PowerPC 64 LE (実験的)
- s390/x (実験的)
- RISC-V 64 (実験的)

## 前提条件 {#assumptions}

以下のチュートリアルは Ubuntu Linux を基にしていますが、適切な変更により他の Linux ディストリビューションでも動作するはずです。
開発に推奨される最小の Ubuntu バージョンは 24.04 LTS です。

チュートリアルでは、ClickHouse リポジトリとすべてのサブモジュールがローカルにチェックアウトされていることを前提としています。

## 前提条件のインストール {#install-prerequisites}

ClickHouse では CMake と Ninja をビルドに使用します。

ビルドが既にコンパイルされたオブジェクトファイルを再利用できるように、オプショナルで ccache をインストールできます。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clang コンパイラのインストール {#install-the-clang-compiler}

Ubuntu/Debian に Clang をインストールするには、[こちら](https://apt.llvm.org/) から LLVM の自動インストールスクリプトを使用します。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他の Linux ディストリビューションでは、LLVM の [事前ビルドパッケージ](https://releases.llvm.org/download.html) をインストールできるか確認してください。

2025年1月現在、Clang 18 以上が必要です。
GCC や他のコンパイラはサポートされていません。

## Rust コンパイラのインストール (オプショナル) {#install-the-rust-compiler-optional}

:::note
Rust は ClickHouse のオプショナルな依存関係です。
Rust がインストールされていない場合、ClickHouse の一部の機能はコンパイルから省略されます。
:::

まず、公式の [Rust ドキュメント](https://www.rust-lang.org/tools/install) に従って `rustup` をインストールします。

C++ 依存関係と同様に、ClickHouse はベンダリングを使用して、何がインストールされるかを正確に制御し、サードパーティのサービス（`crates.io` レジストリなど）への依存を回避します。

リリースモードでは、モダンな rustup ツールチェインの任意のバージョンがこれらの依存関係で機能するはずですが、サニタイザを有効にする場合は、CI で使用されている `std` と正確に同じバージョンを使用する必要があります（そのためにクレートはベンダリングします）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## ClickHouse のビルド {#build-clickhouse}

すべてのビルドアーティファクトを含む `ClickHouse` 内に `build` という別のディレクトリを作成することをお勧めします：

```sh
mkdir build
cd build
```

異なるビルドタイプのために、複数の異なるディレクトリ（例：`build_release`、`build_debug` など）を持つことができます。

オプショナル：複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを指定できます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的では、デバッグビルドが推奨されます。
リリースビルドと比較して、コンパイラ最適化レベルが低く（`-O`）、より良いデバッグ体験を提供します。
また、`LOGICAL_ERROR` 型の内部例外は、優雅に失敗するのではなく即座にクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

ビルドするには ninja を実行します：

```sh
ninja clickhouse-server clickhouse-client
```

すべてのバイナリ（ユーティリティやテスト）をビルドしたい場合は、パラメータなしで ninja を実行します：

```sh
ninja
```

並行ビルドジョブの数を `-j` パラメータで制御できます：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake は上記のコマンドのショートカットを提供します：

```sh
cmake -S . -B build  # ビルドを設定する、リポジトリトップレベルディレクトリから実行
cmake --build build  # コンパイル
```
:::

## ClickHouse 実行ファイルの実行 {#running-the-clickhouse-executable}

ビルドが成功裏に完了した後、実行ファイルは `ClickHouse/<build_dir>/programs/` に見つけることができます：

ClickHouse サーバーは現在のディレクトリに `config.xml` という設定ファイルを探します。
代替として、コマンドライン上で `-C` オプションを使って設定ファイルを指定できます。

`clickhouse-client` で ClickHouse サーバーに接続するには、別のターミナルを開き、`ClickHouse/build/programs/` に移動して `./clickhouse client` を実行します。

macOS や FreeBSD で `Connection refused` メッセージが表示された場合は、ホストアドレス 127.0.0.1 を指定してみてください：

```bash
clickhouse client --host 127.0.0.1
```

## 高度なオプション {#advanced-options}

### 最小ビルド {#minimal-build}

サードパーティライブラリが提供する機能が必要ない場合、ビルドをさらに高速化できます：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は、自責です・・・

Rust にはインターネット接続が必要です。Rust サポートを無効にするには：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse 実行ファイルの実行 {#running-the-clickhouse-executable-1}

コンパイルされた ClickHouse バイナリでシステムにインストールされたプロダクション版の ClickHouse バイナリを置き換えることができます。
そのためには、公式ウェブサイトの指示に従って ClickHouse をマシンにインストールします。
次に、実行します：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server` などは、一般的に共有される `clickhouse` バイナリへのシンボリックリンクであることに注意してください。

システムにインストールされた ClickHouse パッケージの設定ファイルを使って、自分のビルドした ClickHouse バイナリを実行することもできます：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### すべての Linux でのビルド {#building-on-any-linux}

OpenSUSE Tumbleweed に前提条件をインストール：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhide に前提条件をインストール：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Docker でのビルド {#building-in-docker}

CI では、`clickhouse/binary-builder` という Docker イメージを使用してビルドします。
このイメージには、バイナリとパッケージをビルドするために必要なすべてが含まれています。
イメージの使用を簡単にするスクリプト `docker/packager/packager` があります：

```bash
# 出力アーティファクトのためのディレクトリを定義
output_dir="build_results"
# 最もシンプルなビルド
./docker/packager/packager --package-type=binary --output-dir "$output_dir"
# Debian パッケージをビルド
./docker/packager/packager --package-type=deb --output-dir "$output_dir"
# デフォルトでは、Debian パッケージはスリム LTO を使用するため、ビルドを高速化するために上書きします
CMAKE_FLAGS='-DENABLE_THINLTO=' ./docker/packager/packager --package-type=deb --output-dir "./$(git rev-parse --show-cdup)/build_results"
```
