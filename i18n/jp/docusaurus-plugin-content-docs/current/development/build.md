---
description: 'Linux システム上でソースコードから ClickHouse をビルドするためのステップバイステップガイド'
sidebar_label: 'Linux でのビルド'
sidebar_position: 10
slug: /development/build
title: 'Linux 上で ClickHouse をビルドする方法'
doc_type: 'guide'
---



# Linux で ClickHouse をビルドする方法

:::info ClickHouse を自分でビルドする必要はありません！
[Quick Start](https://clickhouse.com/#quick-start) に記載された手順に従えば、あらかじめビルド済みの ClickHouse をインストールできます。
:::

ClickHouse は、次のプラットフォームでビルドできます。

- x86_64
- AArch64
- PowerPC 64 LE（実験的）
- s390/x（実験的）
- RISC-V 64（実験的）



## 前提条件 {#assumptions}

このチュートリアルはUbuntu Linuxをベースにしていますが、適切な変更を加えれば他のLinuxディストリビューションでも動作します。
開発に推奨される最小Ubuntuバージョンは24.04 LTSです。

このチュートリアルでは、ClickHouseリポジトリとすべてのサブモジュールがローカルにチェックアウト済みであることを前提としています。


## 前提条件のインストール {#install-prerequisites}

まず、汎用的な[前提条件のドキュメント](developer-instruction.md)を参照してください。

ClickHouseはビルドにCMakeとNinjaを使用します。

オプションでccacheをインストールすると、ビルド時にコンパイル済みのオブジェクトファイルを再利用できます。

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Clangコンパイラのインストール {#install-the-clang-compiler}

Ubuntu/DebianにClangをインストールするには、[こちら](https://apt.llvm.org/)からLLVMの自動インストールスクリプトを使用してください。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

その他のLinuxディストリビューションについては、LLVMの[ビルド済みパッケージ](https://releases.llvm.org/download.html)がインストール可能かどうかを確認してください。

2025年3月時点では、Clang 19以上が必要です。
GCCやその他のコンパイラはサポートされていません。


## Rustコンパイラのインストール（オプション） {#install-the-rust-compiler-optional}

:::note
RustはClickHouseのオプション依存関係です。
Rustがインストールされていない場合、ClickHouseの一部の機能はコンパイルから除外されます。
:::

まず、公式の[Rustドキュメント](https://www.rust-lang.org/tools/install)の手順に従って`rustup`をインストールします。

C++の依存関係と同様に、ClickHouseはベンダリングを使用して、インストールされる内容を正確に制御し、サードパーティサービス（`crates.io`レジストリなど）への依存を回避しています。

リリースモードでは、最新のrustup toolchainバージョンであればこれらの依存関係で動作しますが、サニタイザを有効にする場合は、CI で使用されているものと完全に同じ`std`に一致するバージョンを使用する必要があります（CI ではクレートをベンダリングしています）：


```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## ClickHouseのビルド {#build-clickhouse}

`ClickHouse`ディレクトリ内に、すべてのビルド成果物を格納する専用の`build`ディレクトリを作成することを推奨します:

```sh
mkdir build
cd build
```

異なるビルドタイプごとに複数のディレクトリ(例:`build_release`、`build_debug`など)を作成できます。

オプション:複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを明示的に指定できます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的では、デバッグビルドを推奨します。
リリースビルドと比較して、コンパイラの最適化レベル(`-O`)が低く、より良いデバッグ体験が得られます。
また、`LOGICAL_ERROR`型の内部例外は、正常に失敗するのではなく即座にクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
gdbなどのデバッガを使用する場合は、上記のコマンドに`-D DEBUG_O_LEVEL="0"`を追加して、すべてのコンパイラ最適化を無効にしてください。最適化はgdbが変数を表示/アクセスする機能を妨げる可能性があります。
:::

ninjaを実行してビルドします:

```sh
ninja clickhouse
```

すべてのバイナリ(ユーティリティとテスト)をビルドする場合は、パラメータなしでninjaを実行します:

```sh
ninja
```

パラメータ`-j`を使用して、並列ビルドジョブの数を制御できます:

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMakeは上記のコマンドのショートカットを提供しています:

```sh
cmake -S . -B build  # ビルドを設定、リポジトリのトップレベルディレクトリから実行
cmake --build build  # コンパイル
```

:::


## ClickHouse実行ファイルの実行 {#running-the-clickhouse-executable}

ビルドが正常に完了すると、実行ファイルは`ClickHouse/<build_dir>/programs/`に配置されます:

ClickHouseサーバーは、カレントディレクトリ内の設定ファイル`config.xml`を検索します。
または、コマンドラインで`-C`オプションを使用して設定ファイルを指定することもできます。

`clickhouse-client`を使用してClickHouseサーバーに接続するには、別のターミナルを開き、`ClickHouse/build/programs/`に移動して`./clickhouse client`を実行してください。

macOSまたはFreeBSDで`Connection refused`メッセージが表示される場合は、ホストアドレス127.0.0.1を指定してみてください:

```bash
clickhouse client --host 127.0.0.1
```


## 高度なオプション {#advanced-options}

### 最小限のビルド {#minimal-build}

サードパーティライブラリが提供する機能が不要な場合、ビルドをさらに高速化できます:

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は自己責任となります...

Rustはインターネット接続が必要です。Rustサポートを無効にするには:

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse実行ファイルの実行 {#running-the-clickhouse-executable-1}

システムにインストールされている本番環境用のClickHouseバイナリを、コンパイルしたClickHouseバイナリに置き換えることができます。
そのためには、公式ウェブサイトの手順に従ってマシンにClickHouseをインストールしてください。
次に、以下を実行します:

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server`などは、共通の`clickhouse`バイナリへのシンボリックリンクであることに注意してください。

システムにインストールされているClickHouseパッケージの設定ファイルを使用して、カスタムビルドしたClickHouseバイナリを実行することもできます:

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 任意のLinux環境でのビルド {#building-on-any-linux}

OpenSUSE Tumbleweedで前提条件をインストールします:

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhideで前提条件をインストールします:

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Dockerでのビルド {#building-in-docker}

以下のコマンドを使用して、CI環境と同様の環境でローカルで任意のビルドを実行できます:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```

ここで、BUILD_JOB_NAMEはCIレポートに表示されるジョブ名です(例: "Build (arm_release)"、"Build (amd_debug)")。

このコマンドは、必要なすべての依存関係を含む適切なDockerイメージ`clickhouse/binary-builder`をプルし、
その中でビルドスクリプト`./ci/jobs/build_clickhouse.py`を実行します。

ビルド出力は`./ci/tmp/`に配置されます。

AMDとARMの両方のアーキテクチャで動作し、Docker以外の追加の依存関係は必要ありません。
