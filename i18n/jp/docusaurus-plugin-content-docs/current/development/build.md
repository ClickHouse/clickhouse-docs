---
slug: /development/build
sidebar_position: 10
sidebar_label: Linuxでのビルド
---


# LinuxでのClickHouseのビルド方法

:::info ClickHouseを自分でビルドする必要はありません！
[クイックスタート](https://clickhouse.com/#quick-start)で説明されているように、事前にビルドされたClickHouseをインストールできます。
:::

ClickHouseは以下のプラットフォームでビルドできます：

- x86_64
- AArch64
- PowerPC 64 LE（実験的）
- s390/x（実験的）
- RISC-V 64（実験的）

## 前提条件 {#assumptions}

このチュートリアルはUbuntu Linuxに基づいていますが、適切な変更を加えれば他のLinuxディストリビューションでも動作するはずです。
開発のために推奨される最低Ubuntuバージョンは24.04 LTSです。

このチュートリアルでは、ClickHouseのリポジトリとすべてのサブモジュールがローカルにチェックアウトされていることを前提としています。

## 前提条件のインストール {#install-prerequisites}

ClickHouseはビルドのためにCMakeとNinjaを使用します。

ビルドの際に既にコンパイルされたオブジェクトファイルを再利用できるように、ccacheをオプションでインストールすることができます。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clangコンパイラのインストール {#install-the-clang-compiler}

Ubuntu/DebianにClangをインストールするには、[こちら](https://apt.llvm.org/)からLLVMの自動インストールスクリプトを使用します。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他のLinuxディストリビューションについては、LLVMの[プリビルドパッケージ](https://releases.llvm.org/download.html)をインストールできるか確認してください。

2025年3月現在、Clang 19以上が必要です。
GCCや他のコンパイラはサポートされていません。

## Rustコンパイラのインストール（オプション） {#install-the-rust-compiler-optional}

:::note
RustはClickHouseのオプション依存関係です。
Rustがインストールされていない場合、ClickHouseの一部の機能はコンパイルから省略されます。
:::

まず、公式の[Rustドキュメント](https://www.rust-lang.org/tools/install)の手順に従って、`rustup`をインストールしてください。

C++の依存関係と同様に、ClickHouseはベンダリングを使用して、インストールされる内容を正確に制御し、サードパーティサービス（`crates.io`レジストリなど）に依存しないようにしています。

リリースモードでは、任意の最新のrustupツールチェーンバージョンがこれらの依存関係とともに動作するはずですが、サニタイザーを有効にする予定がある場合は、CIで使用されるのと正確に同じ`std`に一致するバージョンを使用する必要があります（そのため、クレートをベンダーしています）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## ClickHouseのビルド {#build-clickhouse}

ビルド成果物を含む`build`という別のディレクトリを`ClickHouse`内に作成することをお勧めします。

```sh
mkdir build
cd build
```

異なるビルドタイプのために、複数の異なるディレクトリ（例：`build_release`、`build_debug`など）を持つことができます。

オプション：複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを指定することもできます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的のためには、デバッグビルドをお勧めします。
リリースビルドと比較して、コンパイラの最適化レベル（`-O`）が低いため、より良いデバッグ体験を提供します。
また、`LOGICAL_ERROR`タイプの内部例外は、優雅に失敗するのではなく、直ちにクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

ビルドするためにninjaを実行します：

```sh
ninja clickhouse-server clickhouse-client
```

すべてのバイナリ（ユーティリティとテスト）をビルドしたい場合は、パラメータなしでninjaを実行します：

```sh
ninja
```

`-j`パラメータを使用して、並列ビルドジョブの数を制御できます：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMakeは上記のコマンドのショートカットを提供します：

```sh
cmake -S . -B build  # ビルドを構成し、リポジトリのトップレベルディレクトリから実行
cmake --build build  # コンパイル
```
:::

## ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable}

ビルドが成功裏に完了すると、実行可能ファイルは`ClickHouse/<build_dir>/programs/`に見つかります：

ClickHouseサーバーは、現在のディレクトリに`config.xml`という設定ファイルを探します。
代わりに、コマンドラインで`-C`を介して設定ファイルを指定することもできます。

`clickhouse-client`でClickHouseサーバーに接続するには、別のターミナルを開き、`ClickHouse/build/programs/`に移動して`./clickhouse client`を実行します。

macOSやFreeBSDで`Connection refused`メッセージが表示された場合は、ホストアドレス127.0.0.1を指定してみてください：

```bash
clickhouse client --host 127.0.0.1
```

## 高度なオプション {#advanced-options}

### 最小ビルド {#minimal-build}

サードパーティライブラリから提供される機能が必要ない場合、ビルドをさらに高速化できます：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合、自己責任です・・・

Rustはインターネット接続を必要とします。Rustサポートを無効にするには：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable-1}

コンパイルされたClickHouseバイナリでシステムにインストールされたプロダクション版のClickHouseバイナリを置き換えることができます。
そのためには、公式サイトからの指示に従ってマシンにClickHouseをインストールしてください。
次に、実行します：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server`などは、一般的に共有されている`clickhouse`バイナリへのシンボリックリンクであることに注意してください。

システムにインストールされたClickHouseパッケージからの設定ファイルでカスタムビルドのClickHouseバイナリを実行することもできます：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 任意のLinuxでのビルド {#building-on-any-linux}

OpenSUSE Tumbleweedで前提条件をインストールします：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhideでの前提条件をインストールします：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Dockerでのビルド {#building-in-docker}

CIでのビルドには`clickhouse/binary-builder`というdockerイメージを使用します。
このイメージにはバイナリおよびパッケージをビルドするために必要なすべてが含まれています。
画像の使用を容易にするために、`docker/packager/packager`スクリプトがあります：

```bash

# 出力成果物のディレクトリを定義
output_dir="build_results"

# 最も単純なビルド
./docker/packager/packager --package-type=binary --output-dir "$output_dir"

# Debianパッケージをビルド
./docker/packager/packager --package-type=deb --output-dir "$output_dir"

# デフォルトでDebianパッケージはスリムLTOを使用するため、ビルドを高速化するためにこれを上書きできます
CMAKE_FLAGS='-DENABLE_THINLTO=' ./docker/packager/packager --package-type=deb --output-dir "./$(git rev-parse --show-cdup)/build_results"
```
