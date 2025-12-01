---
description: 'Linux 上で ClickHouse をソースコードからビルドするためのステップバイステップガイド'
sidebar_label: 'Linux でのビルド'
sidebar_position: 10
slug: /development/build
title: 'Linux で ClickHouse をビルドする方法'
doc_type: 'guide'
---

# Linux で ClickHouse をビルドする方法 {#how-to-build-clickhouse-on-linux}

:::info 自分で ClickHouse をビルドする必要はありません！
[Quick Start](https://clickhouse.com/#quick-start) に記載されている手順に従って、事前にビルド済みの ClickHouse をインストールできます。
:::

ClickHouse は次のプラットフォーム上でビルドできます：

- x86_64
- AArch64
- PowerPC 64 LE（実験的）
- s390/x（実験的）
- RISC-V 64（実験的）

## 前提条件 {#assumptions}

以下のチュートリアルは Ubuntu Linux を前提としていますが、適宜調整すれば他の Linux ディストリビューション上でも動作します。
開発環境として推奨される Ubuntu の最低バージョンは 24.04 LTS です。

このチュートリアルでは、ClickHouse のリポジトリとすべてのサブモジュールがローカルにチェックアウトされていることを前提としています。

## 前提条件をインストールする {#install-prerequisites}

まず、共通の[前提条件ドキュメント](developer-instruction.md)を参照してください。

ClickHouse はビルドに CMake と Ninja を使用します。

ビルドで既にコンパイル済みのオブジェクトファイルを再利用できるように、必要に応じて ccache をインストールすることもできます。

```bash
sudo apt-get update
sudo apt-get install build-essential git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```


## Clang コンパイラをインストールする {#install-the-clang-compiler}

Ubuntu/Debian に Clang をインストールするには、[こちら](https://apt.llvm.org/) から LLVM の自動インストールスクリプトを使用してください。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他の Linux ディストリビューションについては、LLVM の[事前ビルド済みパッケージ](https://releases.llvm.org/download.html)をインストールできるか確認してください。

2025 年 3 月時点では、Clang 19 以上が必要です。
GCC などの他のコンパイラはサポートされていません。


## Rust コンパイラのインストール（任意） {#install-the-rust-compiler-optional}

:::note
Rust は ClickHouse のオプションの依存関係です。
Rust がインストールされていない場合、ClickHouse の一部の機能はコンパイルされません。
:::

まず、公式の [Rust ドキュメント](https://www.rust-lang.org/tools/install)に記載されている手順に従って `rustup` をインストールします。

C++ の依存関係と同様に、ClickHouse はインストール内容を正確に制御し、`crates.io` レジストリのようなサードパーティサービスへの依存を避けるために vendoring を使用します。

リリースモードでは、これらの依存関係に対して任意の最新の rustup ツールチェーンバージョンが動作するはずですが、サニタイザーを有効にする予定がある場合は、CI で使用しているものとまったく同じ `std` に対応するバージョンを使用する必要があります（そのためのクレートは vendoring 済みです）。

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```


## ClickHouse をビルドする {#build-clickhouse}

すべてのビルド成果物を格納するために、`ClickHouse` ディレクトリ内に専用の `build` ディレクトリを作成することを推奨します。

```sh
mkdir build
cd build
```

ビルドタイプごとに、（例: `build_release`、`build_debug` など）複数のディレクトリを用意できます。

オプション: 複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを明示的に指定することもできます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発用途には、`debug` ビルドの使用を推奨します。
`release` ビルドと比較してコンパイラの最適化レベル（`-O`）が低く、デバッグ時の利便性が向上します。
また、`LOGICAL_ERROR` 型の内部例外は、エラーからの復旧を試みず、即座にクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
gdb のようなデバッガを使用したい場合は、上記のコマンドに `-D DEBUG_O_LEVEL="0"` を追加して、すべてのコンパイラ最適化を無効にしてください。最適化が有効なままだと、gdb による変数の表示やアクセスの妨げになる可能性があります。
:::

ビルドするには `ninja` を実行します。

```sh
ninja clickhouse
```

すべてのバイナリ（ユーティリティおよびテスト）をビルドするには、引数を付けずに `ninja` を実行します。

```sh
ninja
```

パラメータ `-j` を使用して、並列ビルドジョブの数を指定できます。

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMake には、上記のコマンドを簡略化するショートカットが用意されています:

```sh
cmake -S . -B build  # ビルドを構成します。リポジトリのトップレベルディレクトリから実行してください
cmake --build build  # コンパイルします
```

:::


## ClickHouse 実行ファイルの起動 {#running-the-clickhouse-executable}

ビルドが正常に完了すると、`ClickHouse/<build_dir>/programs/` に実行ファイルが生成されます。

ClickHouse サーバーは、カレントディレクトリ内の `config.xml` という設定ファイルを探します。
代わりに、コマンドラインで `-C` オプションを指定して使用する設定ファイルを明示的に指定することもできます。

`clickhouse-client` で ClickHouse サーバーに接続するには、別のターミナルを開き、`ClickHouse/build/programs/` に移動してから `./clickhouse client` を実行します。

macOS または FreeBSD で `Connection refused` というメッセージが表示される場合は、ホストアドレスを 127.0.0.1 に指定してみてください。

```bash
clickhouse client --host 127.0.0.1
```


## 高度なオプション {#advanced-options}

### 最小構成でのビルド {#minimal-build}

サードパーティ製ライブラリが提供する機能が不要な場合は、ビルドをさらに高速化できます。

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は自己対応となります…

Rust にはインターネット接続が必要です。Rust サポートを無効化するには：

```sh
cmake -DENABLE_RUST=OFF
```


### ClickHouse バイナリの実行 {#running-the-clickhouse-executable-1}

システムにインストールされている本番用の ClickHouse バイナリを、コンパイル済みの ClickHouse バイナリに置き換えることができます。
そのためには、まず公式サイトの手順に従ってマシンに ClickHouse をインストールします。
次に、以下を実行します。

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server` などは、共通の `clickhouse` バイナリへのシンボリックリンクであることに注意してください。

システムにインストールされている ClickHouse パッケージに含まれる設定ファイルを使用して、独自にビルドした ClickHouse バイナリを実行することもできます。

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```


### 任意の Linux 環境でのビルド {#building-on-any-linux}

openSUSE Tumbleweed に必要な前提パッケージをインストールします：

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


### Docker でのビルド {#building-in-docker}

次のコマンドを使用して、CI と同様の環境で任意のビルドをローカル環境で実行できます。

```bash
python -m ci.praktika run "BUILD_JOB_NAME"
```

ここで BUILD&#95;JOB&#95;NAME は、CI レポートに表示されるジョブ名であり、例として &quot;Build (arm&#95;release)&quot; や &quot;Build (amd&#95;debug)&quot; などがあります。

このコマンドは、必要な依存関係をすべて含む適切な Docker イメージ `clickhouse/binary-builder` を取得して、
その中でビルドスクリプト `./ci/jobs/build_clickhouse.py` を実行します。

ビルド成果物は `./ci/tmp/` に配置されます。

これは AMD と ARM の両方のアーキテクチャで動作し、`requests` モジュールが利用可能な Python と Docker 以外に、追加の依存関係は必要ありません。
