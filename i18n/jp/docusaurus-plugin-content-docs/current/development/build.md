---
'description': 'LinuxシステムでClickHouseをソースからビルドするためのステップバイステップガイド'
'sidebar_label': 'Linuxでビルド'
'sidebar_position': 10
'slug': '/development/build'
'title': 'LinuxでのClickHouseのビルド方法'
'doc_type': 'guide'
---



# ClickHouseをLinux上で構築する方法

:::info ClickHouseを自分でビルドする必要はありません!
[クイックスタート](https://clickhouse.com/#quick-start)で説明されているように、事前にビルドされたClickHouseをインストールできます。
:::

ClickHouseは以下のプラットフォームでビルドできます：

- x86_64
- AArch64
- PowerPC 64 LE（実験的）
- s390/x（実験的）
- RISC-V 64（実験的）

## 前提条件 {#assumptions}

以下のチュートリアルはUbuntu Linuxを基にしていますが、適切な変更を加えることで他のLinuxディストリビューションでも動作するはずです。
開発に推奨される最低限のUbuntuバージョンは24.04 LTSです。

このチュートリアルでは、ClickHouseリポジトリとすべてのサブモジュールがローカルにチェックアウトされていると仮定します。

## 事前準備のインストール {#install-prerequisites}

まず、一般的な[事前準備のドキュメント](developer-instruction.md)を参照してください。

ClickHouseはビルドにCMakeとNinjaを使用しています。

オプションで、ccacheをインストールして、ビルドで既にコンパイルされたオブジェクトファイルを再利用できます。

```bash
sudo apt-get update
sudo apt-get install git cmake ccache python3 ninja-build nasm yasm gawk lsb-release wget software-properties-common gnupg
```

## Clangコンパイラのインストール {#install-the-clang-compiler}

Ubuntu/DebianにClangをインストールするには、[こちら](https://apt.llvm.org/)のLLVMの自動インストールスクリプトを使用します。

```bash
sudo bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

他のLinuxディストリビューションについては、LLVMの[プレビルドパッケージ](https://releases.llvm.org/download.html)をインストールできるか確認してください。

2025年3月現在、Clang 19以上が必要です。
GCCや他のコンパイラはサポートされていません。

## Rustコンパイラのインストール（任意） {#install-the-rust-compiler-optional}

:::note
RustはClickHouseのオプション依存関係です。
Rustがインストールされていない場合、ClickHouseの一部の機能がコンパイルから省かれます。
:::

まず、公式の[Rustドキュメント](https://www.rust-lang.org/tools/install)の手順に従って`rustup`をインストールします。

C++の依存関係と同様に、ClickHouseはサードパーティのサービス（如く `crates.io` レジストリ）に依存せず、何がインストールされるかを制御するためにベンダリングを使用します。

リリースモードでは、現代のrustupツールチェインのバージョンはこれらの依存関係とともに機能するはずですが、サニタイザーを有効にする予定がある場合は、CIで使用されるのと正確に同じ`std`に一致するバージョンを使用する必要があります（そのため、クレートをベンダリングしています）：

```bash
rustup toolchain install nightly-2025-07-07
rustup default nightly-2025-07-07
rustup component add rust-src
```
## ClickHouseをビルドする {#build-clickhouse}

すべてのビルドアーティファクトを含む`ClickHouse`内に別のディレクトリ`build`を作成することをお勧めします：

```sh
mkdir build
cd build
```

異なるビルドタイプのために、複数の異なるディレクトリ（例: `build_release`, `build_debug`など）を持つことができます。

オプション: 複数のコンパイラバージョンがインストールされている場合、使用するコンパイラを正確に指定することもできます。

```sh
export CC=clang-19
export CXX=clang++-19
```

開発目的では、デバッグビルドが推奨されます。
リリースビルドと比較して、コンパイラの最適化レベル（`-O`）が低く、デバッグ体験が向上します。
また、`LOGICAL_ERROR`型の内部例外は、フェイルセーフに失敗するのではなく、すぐにクラッシュします。

```sh
cmake -D CMAKE_BUILD_TYPE=Debug ..
```

:::note
gdbのようなデバッガを使用したい場合は、上記のコマンドに`-D DEBUG_O_LEVEL="0"`を追加して、すべてのコンパイラ最適化を削除し、gdbが変数を表示/アクセスする能力に干渉しないようにしてください。
:::

ビルドするにはninjaを実行します：

```sh
ninja clickhouse
```

すべてのバイナリ（ユーティリティおよびテスト）をビルドするには、パラメータなしでninjaを実行します：

```sh
ninja
```

パラメータ`-j`を使用して、並列ビルドジョブの数を制御できます：

```sh
ninja -j 1 clickhouse-server clickhouse-client
```

:::tip
CMakeは上記のコマンドのショートカットを提供しています：

```sh
cmake -S . -B build  # configure build, run from repository top-level directory
cmake --build build  # compile
```
:::

## ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable}

ビルドが成功した後、実行可能ファイルは`ClickHouse/<build_dir>/programs/`にあります：

ClickHouseサーバは、現在のディレクトリにある構成ファイル`config.xml`を探します。
`-C`を介してコマンドラインで構成ファイルを指定することもできます。

`clickhouse-client`を使用してClickHouseサーバに接続するには、別のターミナルを開き`ClickHouse/build/programs/`に移動して`./clickhouse client`を実行します。

macOSまたはFreeBSDで`Connection refused`メッセージが表示される場合は、ホストアドレス127.0.0.1を指定してみてください：

```bash
clickhouse client --host 127.0.0.1
```

## 高度なオプション {#advanced-options}

### 最小ビルド {#minimal-build}

サードパーティライブラリが提供する機能が必要ない場合、ビルドをさらに高速化できます：

```sh
cmake -DENABLE_LIBRARIES=OFF
```

問題が発生した場合は、自己責任です...

Rustはインターネット接続を必要とします。Rustサポートを無効にするには：

```sh
cmake -DENABLE_RUST=OFF
```

### ClickHouse実行可能ファイルの実行 {#running-the-clickhouse-executable-1}

システムにインストールされたClickHouseのバイナリのプロダクションバージョンをコンパイルされたClickHouseのバイナリで置き換えることができます。
そのためには、公式ウェブサイトの指示に従ってマシンにClickHouseをインストールします。
次に、以下を実行します：

```bash
sudo service clickhouse-server stop
sudo cp ClickHouse/build/programs/clickhouse /usr/bin/
sudo service clickhouse-server start
```

`clickhouse-client`、`clickhouse-server`などは、一般に共有されている`clickhouse`バイナリへのシンボリックリンクです。

また、システムにインストールされたClickHouseパッケージの構成ファイルを使用して、カスタムビルドしたClickHouseバイナリを実行することもできます：

```bash
sudo service clickhouse-server stop
sudo -u clickhouse ClickHouse/build/programs/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

### 任意のLinux上でのビルド {#building-on-any-linux}

OpenSUSE Tumbleweedで事前準備をインストールします：

```bash
sudo zypper install git cmake ninja clang-c++ python lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

Fedora Rawhideで事前準備をインストールします：

```bash
sudo yum update
sudo yum --nogpg install git cmake make clang python3 ccache lld nasm yasm gawk
git clone --recursive https://github.com/ClickHouse/ClickHouse.git
mkdir build
cmake -S . -B build
cmake --build build
```

### Dockerでのビルド {#building-in-docker}

CIと似た環境でローカルに任意のビルドを実行するには、次のようにします：

```bash
python -m ci.praktika "BUILD_JOB_NAME"
```
ここでBUILD_JOB_NAMEはCIレポートに表示されるジョブ名です。例えば、「Build (arm_release)」、「Build (amd_debug)」などです。

このコマンドは、すべての必要な依存関係を含む適切なDockerイメージ`clickhouse/binary-builder`をプルし、その内部でビルドスクリプト`./ci/jobs/build_clickhouse.py`を実行します。

ビルド出力は`./ci/tmp/`に配置されます。

これはAMDおよびARMアーキテクチャの両方で動作し、Docker以外の追加依存関係は必要ありません。
