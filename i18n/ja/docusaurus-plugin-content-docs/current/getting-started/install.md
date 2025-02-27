---
sidebar_label: インストール
keywords: [clickhouse, インストール, 入門, クイックスタート]
description: ClickHouseのインストール
slug: /install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# ClickHouseのインストール

ClickHouseを使い始めるための4つのオプションがあります。

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** 公式のClickHouseサービスで、ClickHouseの開発者によって構築、維持、サポートされています。
- **[クイックインストール](#quick-install):** ClickHouseを使用するためのテストおよび開発用の簡単にダウンロードできるバイナリ。
- **[本番環境の展開](#available-installation-options):** ClickHouseは、x86-64、最新のARM（ARMv8.2-A以降）、またはPowerPC64LE CPUアーキテクチャを持つ任意のLinux、FreeBSD、またはmacOSで実行できます。
- **[Dockerイメージ](https://hub.docker.com/_/clickhouse):** Docker Hubの公式Dockerイメージを使用します。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouseを最も迅速かつ簡単に始める方法は、[ClickHouse Cloud](https://clickhouse.cloud/)で新しいサービスを作成することです。

## クイックインストール {#quick-install}

:::tip
特定のリリースバージョンの本番環境へのインストールについては、下記の[インストールオプション](#available-installation-options)を参照してください。
:::

Linux、macOS、FreeBSDの場合：

1. 初めてClickHouseを使い、その機能を確認したい場合、ClickHouseをローカルにダウンロードする最も簡単な方法は、以下のコマンドを実行することです。このコマンドは、ClickHouseサーバー、`clickhouse-client`、`clickhouse-local`、ClickHouse Keeper、その他のツールを実行するためのオペレーティングシステム用のバイナリを1つダウンロードします：

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Macユーザーへ：バイナリの開発者を確認できないというエラーが表示された場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos)をご覧ください。
   :::

2. 次のコマンドを実行して[clickhouse-local](../operations/utilities/clickhouse-local.md)を起動します：

   ```bash
   ./clickhouse
   ```

   `clickhouse-local`を使用すると、ClickHouseの強力なSQLを使って、設定なしでローカルおよびリモートファイルを処理できます。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動した後以前に作成したテーブルは利用できなくなります。

   代わりに、次のコマンドでClickHouseサーバーを起動できます...

    ```bash
    ./clickhouse server
    ```

   ... 新しいターミナルを開いて`clickhouse-client`でサーバーに接続します：

    ```bash
    ./clickhouse client
    ```

    ```response
    ./clickhouse client
    ClickHouse client version 24.5.1.117 (official build).
    Connecting to localhost:9000 as user default.
    Connected to ClickHouse server version 24.5.1.

    local-host :)
    ```

   テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーを再起動した後も利用可能です。必要に応じて、`./clickhouse server`に`-C config.xml`を追加のコマンドライン引数として渡し、設定ファイルでさらに設定を提供できます。すべての利用可能な設定は、[こちら](../operations/settings/settings.md)および[サンプル設定ファイルテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に記載されています。

   SQLコマンドをClickHouseに送信する準備が整いました！

:::tip
[クイックスタート](/quick-start.mdx)では、テーブルの作成とデータの挿入手順を説明しています。
:::

## 本番環境の展開 {#available-installation-options}

ClickHouseの本番環境への展開には、以下のインストールオプションのいずれかを選択してください。

### DEBパッケージからインストール {#install-from-deb-packages}

DebianまたはUbuntu用の公式に事前コンパイルされた`deb`パッケージを使用することをお勧めします。次のコマンドを実行してパッケージをインストールします：

#### Debianリポジトリの設定 {#setup-the-debian-repository}
``` bash
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

ARCH=$(dpkg --print-architecture)
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
```

#### ClickHouseサーバーとクライアントのインストール {#install-clickhouse-server-and-client}
```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

#### ClickHouseサーバーの起動 {#start-clickhouse-server}

```bash
sudo service clickhouse-server start
clickhouse-client # パスワードを設定した場合は "clickhouse-client --password"を使用してください。
```

<details>
<summary>古いディストリビューション用のdebパッケージのインストール方法</summary>

```bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # パスワードを設定した場合は "clickhouse-client --password"を使用してください。
```

</details>

ニーズに応じて`stable`を`lts`に置き換えて、異なる[リリースの種類](/knowledgebase/production)を使用することができます。

こちらからパッケージを手動でダウンロードしてインストールすることもできます [here](https://packages.clickhouse.com/deb/pool/main/c/)。

#### スタンドアロンのClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを[強く推奨します](/operations/tips.md#L143-L144)。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行することを決定した場合、ClickHouse KeeperはClickHouseサーバーに含まれているため、別途インストールする必要はありません。このコマンドは、スタンドアロンのClickHouse Keeperサーバーにのみ必要です。
:::

```bash
sudo apt-get install -y clickhouse-keeper
```

#### ClickHouse Keeperの有効化と起動 {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### パッケージ {#packages}

- `clickhouse-common-static` — ClickHouseのコンパイル済みバイナリファイルをインストールします。
- `clickhouse-server` — `clickhouse-server`のシンボリックリンクを作成し、デフォルトのサーバー設定をインストールします。
- `clickhouse-client` — `clickhouse-client`とその他のクライアント関連ツールのシンボリックリンクを作成し、クライアント設定ファイルをインストールします。
- `clickhouse-common-static-dbg` — デバッグ情報付きのClickHouseのコンパイル済みバイナリファイルをインストールします。
- `clickhouse-keeper` - 専用のClickHouse KeeperノードにClickHouse Keeperをインストールするために使用されます。ClickHouseサーバーと同じサーバーでClickHouse Keeperを運用している場合、このパッケージをインストールする必要はありません。ClickHouse KeeperとデフォルトのClickHouse Keeper設定ファイルをインストールします。

:::info
特定のバージョンのClickHouseをインストールする必要がある場合は、同じバージョンのすべてのパッケージをインストールする必要があります：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### RPMパッケージからのインストール {#from-rpm-packages}

CentOS、RedHat、およびその他のrpmベースのLinuxディストリビューション用の公式に事前コンパイルされた`rpm`パッケージを使用することをお勧めします。

#### RPMリポジトリの設定 {#setup-the-rpm-repository}
まず、公式リポジトリを追加する必要があります：

``` bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper`パッケージマネージャー（openSUSE、SLES）のあるシステムの場合：

``` bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

その後、任意の`yum install`は`zypper install`に置き換えることができます。特定のバージョンを指定するには、パッケージ名の末尾に`-$VERSION`を追加します。例えば、`clickhouse-client-22.2.2.22`。

#### ClickHouseサーバーとクライアントのインストール {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### ClickHouseサーバーの起動 {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # パスワードを設定した場合は "clickhouse-client --password"を使用してください。
```

#### スタンドアロンのClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper-1}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを[強く推奨します](/operations/tips.md#L143-L144)。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行することを決定した場合、ClickHouse KeeperはClickHouseサーバーに含まれているため、別途インストールする必要はありません。このコマンドは、スタンドアロンのClickHouse Keeperサーバーにのみ必要です。
:::

```bash
sudo yum install -y clickhouse-keeper
```

#### ClickHouse Keeperの有効化と起動 {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

ニーズに応じて`stable`を`lts`に置き換えて、異なる[リリースの種類](/knowledgebase/production)を使用することができます。

その後、次のコマンドを実行してパッケージをインストールします：

``` bash
sudo yum install clickhouse-server clickhouse-client
```

こちらからパッケージを手動でダウンロードしてインストールすることもできます [here](https://packages.clickhouse.com/rpm/stable)。

### Tgzアーカイブからのインストール {#from-tgz-archives}

`deb`または`rpm`パッケージのインストールが不可能な場合、すべてのLinuxディストリビューション用に公式に事前コンパイルされた`tgz`アーカイブを使用することをお勧めします。

必要なバージョンは、リポジトリhttps://packages.clickhouse.com/tgz/から`curl`または`wget`でダウンロードできます。その後、ダウンロードしたアーカイブは.unpackされ、インストールスクリプトでインストールする必要があります。最新の安定版の例：

``` bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION

case $(uname -m) in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "不明なアーキテクチャ $(uname -m)"; exit 1 ;;
esac

for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done

tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"

tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"

tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start

tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

本番環境では、最新の`stable`バージョンを使用することをお勧めします。GitHubページでその番号を[こちらに](https://github.com/ClickHouse/ClickHouse/tags)で確認できます（後に`-stable`を付けてください）。

### Dockerイメージからのインストール {#from-docker-image}

Docker内でClickHouseを実行するには、[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)のガイドに従ってください。これらのイメージは、内部で公式の`deb`パッケージを使用しています。

## 非本番環境の展開（高度な使い方） {#non-production-deployments-advanced}

### ソースからのコンパイル {#from-sources}

ClickHouseを手動でコンパイルするには、[Linux](/development/build.md)または[macOS](/development/build-osx.md)の手順に従ってください。

パッケージをコンパイルしてインストールすることも、パッケージをインストールせずにプログラムを使用することもできます。

```xml
クライアント: <build_directory>/programs/clickhouse-client
サーバー: <build_directory>/programs/clickhouse-server
```

データとメタデータのフォルダを手動で作成し、必要に応じて適切なユーザーに`chown`する必要があります。そのパスはサーバーの設定（src/programs/server/config.xml）で変更できます。デフォルトのパスは以下の通りです：

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

Gentooでは、単に`emerge clickhouse`を使用してClickHouseをソースからインストールできます。

### CI生成バイナリのインストール {#install-a-ci-generated-binary}

ClickHouseの継続的インテグレーション（CI）インフラストラクチャは、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/)内の各コミットに対して特化したビルドを生成します。例えば、[sanitized](https://github.com/google/sanitizers)ビルドや、最適化されていない（Debug）ビルド、交差コンパイルされたビルドなどです。このようなビルドは通常、開発中にのみ有用ですが、特定の状況でユーザーにも興味深い場合があります。

:::note
ClickHouseのCIは進化し続けているため、CI生成ビルドをダウンロードする正確な手順は変わる場合があります。また、CIは古いビルドアーティファクトを削除することもあるため、ダウンロードできなくなることがあります。
:::

例えば、ClickHouse v23.4のaarch64バイナリをダウンロードするための手順は次の通りです：

- リリースv23.4のGitHubプルリクエストを探します：[バージョン23.4のリリースプルリクエスト](https://github.com/ClickHouse/ClickHouse/pull/49238)
- 「コミット」をクリックし、インストールしたい特定のバージョンのために「バージョンを23.4.2.1と更新」などのコミットをクリックします。
- 「ビルド」の横にある緑のチェック / 黄色の点 / 赤いクロスをクリックすると、CIチェックのリストが開きます。
- リスト内の「詳細」をクリックすると、[このページ](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)のようなページが開きます。
- `compiler = "clang-*-aarch64"`の行を見つけます - 複数の行があります。
- これらのビルドのアーティファクトをダウンロードします。

### macOS専用：Homebrewでのインストール {#macos-only-install-with-homebrew}

[homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouseの[コミュニティのhomebrewフォーミュラ](https://formulae.brew.sh/cask/clickhouse)を参照してください。

:::note
Macユーザーへ：バイナリの開発者を確認できないというエラーが表示された場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos)をご覧ください。
:::

## 起動 {#launch}

サーバーをデーモンとして起動するには、次のコマンドを実行します：

``` bash
$ clickhouse start
```

ClickHouseを実行する他の方法もあります：

``` bash
$ sudo service clickhouse-server start
```

`service`コマンドがない場合は、次のように実行します：

``` bash
$ sudo /etc/init.d/clickhouse-server start
```

`systemctl`コマンドがある場合は、次のように実行します：

``` bash
$ sudo systemctl start clickhouse-server.service
```

`/var/log/clickhouse-server/`ディレクトリ内のログを確認してください。

サーバーが起動しない場合は、`/etc/clickhouse-server/config.xml`ファイルの構成を確認してください。

また、コンソールから手動でサーバーを起動することも可能です：

``` bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

この場合、ログはコンソールに表示され、開発中は便利です。
設定ファイルが現在のディレクトリにある場合は、`--config-file`パラメータを指定する必要はありません。デフォルトでは`./config.xml`が使用されます。

ClickHouseはアクセス制限の設定をサポートしています。これらは、`config.xml`と同じディレクトリにある`users.xml`ファイル内にあります。
デフォルトでは、`default`ユーザーはパスワードなしでどこからでもアクセス可能です。`user/default/networks`を参照してください。
詳細については、["設定ファイル"](/operations/configuration-files.md)のセクションを参照してください。

サーバーを起動した後、コマンドラインクライアントを使用して接続できます：

``` bash
$ clickhouse-client
```

デフォルトでは、パスワードなしで`default`ユーザーとして`localhost:9000`に接続されます。`--host`引数を使用してリモートサーバーに接続することもできます。

ターミナルはUTF-8エンコーディングを使用する必要があります。
詳細については、["コマンドラインクライアント"](/interfaces/cli.md)のセクションを参照してください。

例：

```bash
$ ./clickhouse-client
ClickHouse client version 0.0.18749.
Connecting to localhost:9000.
Connected to ClickHouse server version 0.0.18749.

:) SELECT 1

SELECT 1

┌─1─┐
│ 1 │
└───┘

1 rows in set. Elapsed: 0.003 sec.

:)
```

**おめでとうございます、システムが動作しました！**

実験を続けるために、テストデータセットの1つをダウンロードするか、[チュートリアル](/tutorial.md)を通過してください。

## セルフマネージドClickHouseの推奨事項 {#recommendations-for-self-managed-clickhouse}

ClickHouseは、x86-64、ARM、またはPowerPC64LE CPUアーキテクチャを持つ任意のLinux、FreeBSD、またはmacOS上で実行できます。

ClickHouseは、データを処理するために利用可能なすべてのハードウェアリソースを使用します。

ClickHouseは、少ないクロックレートで多くのコアを使用する場合の方が、より高いクロックレートで少数のコアを使用する場合よりも効率よく動作する傾向があります。

トリビアルでないクエリを実行するには、最低でも4GBのRAMを使用することをお勧めします。ClickHouseサーバーは、少ないRAMでも実行可能ですが、その場合クエリは頻繁に中止されます。

必要なRAMの量は、一般に以下の要因に依存します：

- クエリの複雑さ。
- クエリ内で処理されるデータの量。

必要なRAMの量を計算するには、[GROUP BY](/sql-reference/statements/select/group-by.md#select-group-by-clause)、[DISTINCT](/sql-reference/statements/select/distinct.md#select-distinct)、[JOIN](/sql-reference/statements/select/join.md#select-join)などの操作に対する一時データのサイズを推定できます。

メモリ消費を削減するために、ClickHouseは外部ストレージに一時データをスワップすることができます。詳細については、[外部メモリでのGROUP BY](/sql-reference/statements/select/group-by.md#select-group-by-in-external-memory)を参照してください。

本番環境では、オペレーティングシステムのスワップファイルを無効にすることをお勧めします。

ClickHouseバイナリのインストールには、少なくとも2.5 GBのディスクスペースが必要です。

データに必要なストレージの容量は、以下に基づいて別途計算できます：

- データボリュームの推定。

    データのサンプルを取り、その平均的な行サイズを取得できます。その後、その値を保管予定の行数で掛け算します。

- データ圧縮係数。

    データ圧縮係数を推定するには、データのサンプルをClickHouseにロードし、データの実際のサイズと保存されたテーブルのサイズを比較します。例えば、クリックストリームデータは通常6〜10倍に圧縮されます。

最終的なストレージボリュームを計算するには、見積もりデータボリュームに圧縮係数を適用します。複数のレプリカにデータを保存する予定がある場合、見積もりボリュームにレプリカの数を掛けます。

分散ClickHouse展開（クラスタリング）の場合、最低でも10Gクラスのネットワーク接続を推奨します。

ネットワーク帯域幅は、大量の中間データを持つ分散クエリの処理にとって重要です。さらに、ネットワーク速度はレプリケーションプロセスにも影響します。
