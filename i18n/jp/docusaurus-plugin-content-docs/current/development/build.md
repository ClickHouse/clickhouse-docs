---
slug: /development/build
sidebar_position: 10
sidebar_label: Linuxでのビルド
---


# Linux上でのClickHouseのビルド方法

:::info ClickHouseを自分でビルドする必要はありません！
[クイックスタート](https://clickhouse.com/#quick-start)に記載されているように、あらかじめビルドされたClickHouseをインストールできます。
:::

ClickHouseは以下のプラットフォームでビルド可能です：

- x86_64
- AArch64
- PowerPC 64 LE (実験的)
- s390/x (実験的)
- RISC-V 64 (実験的)

## 前提条件 {#assumptions}

このチュートリアルはUbuntu Linuxに基づいていますが、適切な変更を行えば他のLinuxディストリビューションでも動作するはずです。
開発用に推奨されるUbuntuの最小バージョンは24.04 LTSです。

このチュートリアルは、ClickHouseリポジトリとすべてのサブモジュールがローカルにチェックアウトされていることを前提としています。

## 前提条件のインストール {#install-prerequisites}

ClickHouseはCMakeとNinjaを使用してビルドします。

オプションで、ビルドが既にコンパイルされたオブジェクトファイルを再利用できるように`ccache`をインストールすることができます。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clangコンパイラのインストール {#install-the-clang-compiler}

Ubuntu/DebianにClangをインストールするには、[こちら](https://apt.llvm.org/)のLLVMの自動インストールスクリプトを使用します。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他のLinuxディストリビューションでは、LLVMの[プリビルドパッケージ](https://releases.llvm.org/download.html)をインストールできるか確認してください。

2025年1月現在、Clang 18以上が必要です。
GCCや他のコンパイラはサポートされていません。

## Rustコンパイラのインストール（オプショナル） {#install-the-rust-compiler-optional}

:::note
RustはClickHouseのオプションの依存関係です。
Rustがインストールされていない場合、ClickHouseのいくつかの機能はコンパイルから省略されます。
:::

まず、公式の[Rustドキュメント](https://www.rust-lang.org/tools/install)の手順に従って`rustup`をインストールします。

C++の依存関係と同様に、ClickHouseはベンダリングを使用して、何がインストールされるかを正確に制御し、サードパーティのサービス（`crates.io`レジストリなど）に依存しないようにしています。

リリースモードでは、これらの依存関係とともに任意の最新のrustupツールチェーンバージョンが機能するはずですが、サニタイザを有効にする予定がある場合は、CIで使用されるものと同じ`std`に一致するバージョンを使用する必要があります（そこでクレートをベンダリングしています）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## ClickHouseをビルドする {#build-clickhouse}

すべてのビルドアーティファクトを含む`ClickHouse`内に別のディレクトリ`build`を作成することを推奨します：

```sh
mkdir build
cd build
```

異なるビルドタイプのために、複数の異なるディレクトリ（例えば、`build_release`、`build_debug`など）を持つことができます。

オプション：複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを正確に指定することができます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的には、デバッグビルドを推奨します。
リリースビルドと比較して、コンパイラの最適化レベルが低く（`-O`）、より良いデバッグ体験を提供します。
また、`LOGICAL_ERROR`タイプの内部例外は、優雅に失敗するのではなく直ちにクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

ビルドするにはninjaを実行します：

```sh
ninja clickhouse-server clickhouse-client
```

すべてのバイナリ（ユーティリティやテスト）をビルドするには、パラメータなしでninjaを実行します：

```sh
ninja
```

並行ビルドジョブの数を`-j`パラメータを使用して制御できます：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMakeは上記のコマンドに対するショートカットを提供します：

```sh
cmake -S . -B build  # ビルドの設定、リポジトリのトップレベルディレクトリから実行
cmake --build build  # コンパイル
```
:::

## ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable}

ビルドが正常に完了した後、実行可能ファイルは`ClickHouse/<build_dir>/programs/`にあります：

ClickHouseサーバーは、現在のディレクトリに`config.xml`という設定ファイルを探します。
代わりに、コマンドラインで`-C`を使用して設定ファイルを指定することもできます。

`clickhouse-client`でClickHouseサーバーに接続するには、別のターミナルを開き、`ClickHouse/build/programs/`に移動して`./clickhouse client`を実行します。

macOSやFreeBSDで`Connection refused`メッセージが表示された場合は、ホストアドレス127.0.0.1を指定してみてください：

```bash
clickhouse client --host 127.0.0.1
```

## 高度なオプション {#advanced-options}

### 最小限のビルド {#minimal-build}

サードパーティのライブラリが提供する機能が不要な場合、ビルドをさらに高速化できます：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は、自力で解決してください...

Rustはインターネット接続を必要とします。Rustサポートを無効にするには：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable-1}

システムにインストールされたClickHouseの本番版バイナリを、コンパイルしたClickHouseバイナリで置き換えることができます。
そのためには、公式ウェブサイトの指示に従ってマシンにClickHouseをインストールします。
次に、実行します：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

注意してください、`clickhouse-client`、`clickhouse-server`などは、一般的に共有される`clickhouse`バイナリへのシンボリックリンクです。

システムにインストールされているClickHouseパッケージからの設定ファイルを使用して、カスタムビルドしたClickHouseバイナリを実行することもできます：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### すべてのLinuxでのビルド {#building-on-any-linux}

OpenSUSE Tumbleweedで前提条件をインストールします：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhideで前提条件をインストールします：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Dockerでのビルド {#building-in-docker}

CI用にビルドするために、`clickhouse/binary-builder` Dockerイメージを使用します。
このイメージには、バイナリとパッケージをビルドするために必要なすべてが含まれています。
イメージ使用を容易にするためのスクリプト`docker/packager/packager`があります：

```bash

# 出力アーティファクトのためのディレクトリを定義
output_dir="build_results"

# 最も簡単なビルド
./docker/packager/packager --package-type=binary --output-dir "$output_dir"

# Debianパッケージをビルド
./docker/packager/packager --package-type=deb --output-dir "$output_dir"

# デフォルトではDebianパッケージは薄いLTOを使用するので、ビルドを速くするためにこれをオーバーライドできます
CMAKE_FLAGS='-DENABLE_THINLTO=' ./docker/packager/packager --package-type=deb --output-dir "./$(git rev-parse --show-cdup)/build_results"
```
