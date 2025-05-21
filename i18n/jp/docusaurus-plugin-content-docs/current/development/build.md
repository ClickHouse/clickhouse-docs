description: 'LinuxシステムでのソースからClickHouseをビルドするためのステップバイステップガイド'
sidebar_label: 'Linuxでビルド'
sidebar_position: 10
slug: /development/build
title: 'LinuxでClickHouseをビルドする方法'
```


# LinuxでClickHouseをビルドする方法

:::info ClickHouseを自分でビルドする必要はありません!
[クイックスタート](https://clickhouse.com/#quick-start)で説明されているように、事前ビルドされたClickHouseをインストールできます。
:::

ClickHouseは以下のプラットフォームでビルド可能です:

- x86_64
- AArch64
- PowerPC 64 LE (実験的)
- s390/x (実験的)
- RISC-V 64 (実験的)

## 前提条件 {#assumptions}

このチュートリアルはUbuntu Linuxを基にしていますが、適切な変更を加えれば他のLinuxディストリビューションでも動作するはずです。
開発のために推奨される最小のUbuntuバージョンは24.04 LTSです。

チュートリアルでは、ClickHouseリポジトリとすべてのサブモジュールがローカルにチェックアウトされていることを前提としています。

## 必要なパッケージのインストール {#install-prerequisites}

最初に、一般的な[前提条件のドキュメント](developer-instruction.md)を確認してください。

ClickHouseは、ビルドにCMakeとNinjaを使用します。

オプションで、ccacheをインストールして、ビルドで既にコンパイルされたオブジェクトファイルを再利用することができます。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clangコンパイラのインストール {#install-the-clang-compiler}

Ubuntu/DebianにClangをインストールするには、[こちら](https://apt.llvm.org/)のLLVMの自動インストールスクリプトを使用します。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他のLinuxディストリビューションでは、LLVMの[事前ビルドパッケージ](https://releases.llvm.org/download.html)がインストールできるか確認してください。

2025年3月現在、Clang 19以上が必要です。
GCCや他のコンパイラはサポートされていません。

## Rustコンパイラのインストール（オプション） {#install-the-rust-compiler-optional}

:::note
RustはClickHouseのオプションの依存関係です。
Rustがインストールされていない場合、ClickHouseのいくつかの機能がコンパイルから省略されます。
:::

まず、公式の[Rustドキュメント](https://www.rust-lang.org/tools/install)に従って`rustup`をインストールします。

C++の依存関係と同様に、ClickHouseはサードパーティサービス（`crates.io`レジストリなど）に依存しないよう、正確に何がインストールされるかを制御するためにベンダリングを使用します。

リリースモードでは、任意のRustの現代的なrustupツールチェーンのバージョンがこれらの依存関係と連携しますが、サニタイザーを有効にする予定がある場合は、CIで使用されるのと同じ`std`に一致するバージョンを使用しなければなりません（そのためにクレートをベンドしています）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## ClickHouseのビルド {#build-clickhouse}

ビルドアーティファクトをすべて含む`ClickHouse`内に`build`という別のディレクトリを作成することをお勧めします：

```sh
mkdir build
cd build
```

異なるビルドタイプのために複数の異なるディレクトリ（例: `build_release`, `build_debug`など）を持つことができます。

オプション：複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを正確に指定できます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的では、デバッグビルドを推奨します。
リリースビルドと比較して、コンパイラの最適化レベルが低く（`-O`）、より良いデバッグ体験を提供します。
また、`LOGICAL_ERROR`タイプの内部例外は、優雅に失敗するのではなく、即座にクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

ビルドを実行するには、ninjaを使用します：

```sh
ninja clickhouse-server clickhouse-client
```

すべてのバイナリ（ユーティリティとテスト）をビルドしたい場合は、パラメータなしでninjaを実行します：

```sh
ninja
```

パラレルビルドジョブの数を`-j`パラメータを使用して制御できます：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMakeは、上記のコマンドのショートカットを提供します：

```sh
cmake -S . -B build  # ビルドを構成し、リポジトリのトップレベルディレクトリから実行
cmake --build build  # コンパイル
```
:::

## ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable}

ビルドが成功裏に完了した後、`ClickHouse/<build_dir>/programs/`に実行可能ファイルがあります：

ClickHouseサーバは、現在のディレクトリに`config.xml`という構成ファイルを探しに行きます。
コマンドラインで`-C`を使って、代わりに構成ファイルを指定できます。

`clickhouse-client`でClickHouseサーバに接続するには、別のターミナルを開いて`ClickHouse/build/programs/`に移動し、`./clickhouse client`を実行します。

macOSやFreeBSDで`Connection refused`メッセージが表示された場合は、ホストアドレス127.0.0.1を指定してみてください：

```bash
clickhouse client --host 127.0.0.1
```

## 高度なオプション {#advanced-options}

### 最小限のビルド {#minimal-build}

サードパーティライブラリによって提供される機能が必要ない場合、ビルドをさらに迅速化できます：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は、自分で対処する必要があります...

Rustはインターネット接続を必要とします。Rustサポートを無効にするには：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable-1}

システムにインストールされているClickHouseバイナリの本番バージョンを、コンパイルしたClickHouseバイナリに置き換えることができます。
そのためには、公式ウェブサイトの指示に従って、自分のマシンにClickHouseをインストールします。
次に、実行します：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server`およびその他は、一般的に共有される`clickhouse`バイナリへのシンボリックリンクであることに注意してください。

システムにインストールされたClickHouseパッケージからの構成ファイルを使用して、カスタムビルドしたClickHouseバイナリを実行することもできます：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 任意のLinuxでのビルド {#building-on-any-linux}

OpenSUSE Tumbleweedに必要なパッケージをインストール：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhideに必要なパッケージをインストール：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Docker内でのビルド {#building-in-docker}

以下のコマンドを使用して、CIに似た環境で任意のビルドをローカルで実行できます：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
ここで、BUILD_JOB_NAMEはCIレポートに表示されているジョブ名（例: "Build (arm_release)", "Build (amd_debug)"）です。

このコマンドは、すべての必要な依存関係を含む適切なDockerイメージ`clickhouse/binary-builder`をプルし、その中でビルドスクリプト`./ci/jobs/build_clickhouse.py`を実行します。

ビルド出力は`./ci/tmp/`に配置されます。

これはAMDとARMの両方のアーキテクチャで動作し、Docker以外の追加の依存関係は必要ありません。
