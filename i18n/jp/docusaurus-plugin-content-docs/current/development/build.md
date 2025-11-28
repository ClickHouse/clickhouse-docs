---
description: 'Linux システム上で ClickHouse をソースからビルドするためのステップバイステップガイド'
sidebar_label: 'Linux でビルド'
sidebar_position: 10
slug: /development/build
title: 'Linux で ClickHouse をビルドする方法'
doc_type: 'guide'
---



# Linux 上で ClickHouse をビルドする方法

:::info ClickHouse を自分でビルドする必要はありません！
[Quick Start](https://clickhouse.com/#quick-start) に記載されているように、事前にビルド済みの ClickHouse をインストールできます。
:::

ClickHouse は以下のプラットフォーム上でビルドできます：

- x86_64
- AArch64
- PowerPC 64 LE（実験的）
- s390/x（実験的）
- RISC-V 64（実験的）



## 前提条件 {#assumptions}

このチュートリアルは Ubuntu Linux をベースとしていますが、適切な変更を加えれば他の Linux ディストリビューションでも動作するはずです。
開発用として推奨される最小の Ubuntu バージョンは 24.04 LTS です。

このチュートリアルは、ClickHouse リポジトリとそのすべてのサブモジュールがローカル環境にチェックアウト済みであることを前提としています。



## 前提条件をインストールする

まず、共通の[前提条件のドキュメント](developer-instruction.md)を参照してください。

ClickHouse はビルドに CMake と Ninja を使用します。

ビルド時に既にコンパイル済みのオブジェクトファイルを再利用できるように、任意で ccache をインストールできます。

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Clang コンパイラをインストールする

Ubuntu/Debian に Clang をインストールするには、[こちら](https://apt.llvm.org/)から LLVM 提供の自動インストールスクリプトを使用してください。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他の Linux ディストリビューションの場合は、LLVM の[事前ビルド済みパッケージ](https://releases.llvm.org/download.html)をインストールできるか確認してください。

2025 年 3 月時点では、Clang 19 以降が必要です。
GCC やその他のコンパイラはサポートされていません。


## Rust コンパイラをインストールする（任意） {#install-the-rust-compiler-optional}

:::note
Rust は ClickHouse のオプションの依存関係です。
Rust がインストールされていない場合、ClickHouse の一部の機能はコンパイルされません。
:::

まず、公式の [Rust ドキュメント](https://www.rust-lang.org/tools/install)の手順に従って `rustup` をインストールします。

C++ の依存関係と同様に、ClickHouse は vendoring（ベンダリング）を使用して、何がインストールされるかを正確に制御し、（`crates.io` レジストリのような）サードパーティサービスへの依存を避けています。

リリースモードでは、最新の rustup ツールチェーンであればどのバージョンでもこれらの依存関係は動作するはずですが、サニタイザを有効にする予定がある場合は、CI で使用しているものとまったく同じ `std` に一致するバージョン（そのための crate を vendoring しています）を使用する必要があります。



```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```

## ClickHouse のビルド

すべてのビルド成果物を格納する専用ディレクトリ `build` を `ClickHouse` ディレクトリ内に作成することを推奨します。

```sh
mkdir build
cd build
```

異なるビルドタイプごとに（例：`build_release`、`build_debug` など）、複数のディレクトリを用意できます。

オプション: 複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを明示的に指定することもできます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発用途では、`debug` ビルドを推奨します。
`release` ビルドと比較してコンパイラ最適化レベル（`-O`）が低く、よりデバッグしやすくなります。
また、`LOGICAL_ERROR` 型の内部例外は、穏やかに処理されるのではなく、即座にクラッシュを引き起こします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
gdb などのデバッガを使用したい場合は、上記のコマンドに `-D DEBUG_O_LEVEL="0"` を追加して、すべてのコンパイラ最適化を無効にしてください。コンパイラ最適化により、gdb が変数を表示・参照できなくなる場合があります。
:::

ビルドするには ninja を実行します。

```sh
ninja clickhouse
```

すべてのバイナリ（ユーティリティとテスト）をビルドするには、引数を付けずに `ninja` を実行します：

```sh
ninja
```

並列ビルドジョブの数は、パラメーター `-j` で制御できます。

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake では、上記のコマンドを簡略化するためのショートカットが用意されています。

```sh
cmake -S . -B build  # ビルドを構成、リポジトリのトップレベルディレクトリから実行
cmake --build build  # コンパイル
```

:::


## ClickHouse 実行ファイルの実行

ビルドが正常に完了すると、実行ファイルは `ClickHouse/<build_dir>/programs/` に生成されます。

ClickHouse サーバーは、カレントディレクトリで設定ファイル `config.xml` を探します。
または、コマンドラインで `-C` オプションを指定して設定ファイルを明示的に指定できます。

`clickhouse-client` を使用して ClickHouse サーバーに接続するには、別のターミナルを開き、`ClickHouse/build/programs/` に移動して `./clickhouse client` を実行します。

macOS または FreeBSD で `Connection refused` というメッセージが表示される場合は、ホストアドレスとして 127.0.0.1 を指定してください。

```bash
clickhouse client --host 127.0.0.1
```


## 高度なオプション

### 最小構成でのビルド

サードパーティ製ライブラリが提供する機能が不要な場合は、ビルド時間をさらに短縮できます。

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は、すべて自己解決していただくことになります...

Rust の利用にはインターネット接続が必要です。Rust サポートを無効にするには、次のようにします：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse 実行ファイルの実行

システムにインストールされている本番環境版の ClickHouse バイナリを、コンパイル済みの ClickHouse バイナリに置き換えることができます。
そのためには、公式ウェブサイトの手順に従ってマシンに ClickHouse をインストールしてください。
次に、以下を実行します：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server` などは、共通の `clickhouse` バイナリへのシンボリックリンクであることに注意してください。

システムにインストールされている ClickHouse パッケージの設定ファイルを使って、独自にビルドした ClickHouse バイナリを実行することもできます。

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 任意の Linux 上でのビルド

OpenSUSE Tumbleweed に必要なパッケージをインストールします：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhide に必要な前提パッケージをインストールする：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Docker でのビルド

CI と同様の環境で、任意のビルドを次のコマンドを使ってローカルで実行できます:

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```

ここで BUILD&#95;JOB&#95;NAME は CI レポートに表示されるジョブ名であり、例えば &quot;Build (arm&#95;release)&quot; や &quot;Build (amd&#95;debug)&quot; などです。

このコマンドは、必要な依存関係がすべて含まれた適切な Docker イメージ `clickhouse/binary-builder` を取得して、
その中でビルドスクリプト `./ci/jobs/build_clickhouse.py` を実行します。

ビルド成果物は `./ci/tmp/` に配置されます。

これは AMD と ARM の両方のアーキテクチャで動作し、Docker 以外に追加の依存関係は必要ありません。
