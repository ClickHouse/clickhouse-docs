---
description: 'Step-by-step guide for building ClickHouse from source on Linux systems'
sidebar_label: 'Build on Linux'
sidebar_position: 10
slug: '/development/build'
title: 'How to Build ClickHouse on Linux'
---




# ClickHouseをLinuxにビルドする方法

:::info ClickHouseを自分でビルドする必要はありません!
事前にビルドされたClickHouseを[クイックスタート](https://clickhouse.com/#quick-start)に従ってインストールできます。
:::

ClickHouseは以下のプラットフォームでビルド可能です:

- x86_64
- AArch64
- PowerPC 64 LE（実験的）
- s390/x（実験的）
- RISC-V 64（実験的）

## 前提条件 {#assumptions}

このチュートリアルはUbuntu Linuxに基づいていますが、適切な変更を加えることで他のLinuxディストリビューションでも動作するはずです。
開発に推奨される最小のUbuntuバージョンは24.04 LTSです。

このチュートリアルは、ClickHouseのリポジトリとすべてのサブモジュールがローカルにチェックアウトされていることを前提としています。

## 必要な前提条件をインストールする {#install-prerequisites}

まず、一般的な[前提条件のドキュメント](developer-instruction.md)を参照してください。

ClickHouseはビルドにCMakeとNinjaを使用します。

オプションで、ccacheをインストールして、すでにコンパイルされたオブジェクトファイルを再利用できるようにすることができます。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clangコンパイラをインストールする {#install-the-clang-compiler}

Ubuntu/DebianにClangをインストールするには、[こちら](https://apt.llvm.org/)からLLVMの自動インストールスクリプトを使用します。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他のLinuxディストリビューションの場合は、LLVMの[事前ビルドパッケージ](https://releases.llvm.org/download.html)をインストールできるか確認してください。

2025年3月時点では、Clang 19以上が必要です。
GCCや他のコンパイラはサポートされていません。

## Rustコンパイラをインストールする（オプション） {#install-the-rust-compiler-optional}

:::note
RustはClickHouseのオプション依存関係です。
Rustがインストールされていない場合、ClickHouseのいくつかの機能はコンパイルから省略されます。
:::

まず、公式の[Rustドキュメント](https://www.rust-lang.org/tools/install)に従って`rustup`をインストールします。

C++の依存関係と同様に、ClickHouseはベンダリングを使用して、正確に何がインストールされるかを制御し、サードパーティサービス（`crates.io`レジストリなど）への依存を避けます。

リリースモードでは、すべての新しいrustupツールチェーンバージョンがこれらの依存関係と動作するはずですが、サニタイザーを有効にする予定の場合は、CIで使用されているのと同じ`std`に一致するバージョンを使用する必要があります（私たちはクレートをベンドしています）：

```bash
rustup toolchain install nightly-2024-12-01
rustup default nightly-2024-12-01
rustup component add rust-src
```

## ClickHouseをビルドする {#build-clickhouse}

すべてのビルドアーティファクトが含まれる`build`という別のディレクトリを`ClickHouse`内に作成することをお勧めします：

```sh
mkdir build
cd build
```

異なるビルドタイプ用に、複数の異なるディレクトリ（例: `build_release`, `build_debug`など）を持つことができます。

オプション: 複数のコンパイラバージョンがインストールされている場合は、使用する正確なコンパイラを指定できます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的の場合、デバッグビルドを推奨します。
リリースビルドと比較して、コンパイラの最適化レベルが低く（`-O`）、デバッグ体験が向上します。
また、`LOGICAL_ERROR`タイプの内部例外は正常に失敗するのではなく、即座にクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

ビルドを実行するにはninjaを使用します：

```sh
ninja clickhouse-server clickhouse-client
```

すべてのバイナリ（ユーティリティとテスト）をビルドしたい場合は、引数なしでninjaを実行します：

```sh
ninja
```

並列ビルドジョブの数を制御するには、`-j`パラメータを使用します：

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

ビルドが成功した後、実行可能ファイルは`ClickHouse/<build_dir>/programs/`にあります：

ClickHouseサーバーは現在のディレクトリに`config.xml`という設定ファイルを探そうとします。
代わりにコマンドラインで`-C`を使って設定ファイルを指定することもできます。

`clickhouse-client`でClickHouseサーバーに接続するためには、別のターミナルを開き、`ClickHouse/build/programs/`に移動して`./clickhouse client`を実行します。

macOSやFreeBSDで`Connection refused`メッセージが表示される場合は、ホストアドレス127.0.0.1を指定してみてください：

```bash
clickhouse client --host 127.0.0.1
```

## 高度なオプション {#advanced-options}

### 最小ビルド {#minimal-build}

サードパーティライブラリによって提供される機能が不要な場合、さらにビルドを高速化できます：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合、自己責任でお願いします…

Rustはインターネット接続を必要とします。Rustサポートを無効にするには：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable-1}

システムにインストールされているClickHouseバイナリーのプロダクションバージョンをコンパイルしたClickHouseバイナリーで置き換えることができます。
そのためには、公式ウェブサイトの指示に従ってマシンにClickHouseをインストールします。
次に、実行：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server`などは、一般的に共有される`clickhouse`バイナリーへのシンボリックリンクであることに注意してください。

システムにインストールされているClickHouseパッケージから設定ファイルを使用して、カスタムビルドのClickHouseバイナリーも実行できます：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 任意のLinuxでのビルド {#building-on-any-linux}

OpenSUSE Tumbleweedでの前提条件をインストール：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhideでの前提条件をインストール：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Dockerでのビルド {#building-in-docker}

以下のコマンドを使用して、CIと似た環境で任意のビルドをローカルで実行できます：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
ここで、BUILD_JOB_NAMEはCIレポートに表示されるジョブ名（例: "Build (arm_release)", "Build (amd_debug)"）です。

このコマンドは、必要なすべての依存関係を含む適切なDockerイメージ`clickhouse/binary-builder`をプルし、その中でビルドスクリプト`./ci/jobs/build_clickhouse.py`を実行します。

ビルド出力は`./ci/tmp/`に置かれます。

これはAMDおよびARMアーキテクチャの両方で動作し、Docker以外の追加依存関係は必要ありません。
