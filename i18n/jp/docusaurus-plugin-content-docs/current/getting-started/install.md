---
sidebar_label: インストール
keywords: [clickhouse, インストール, 始めに, クイックスタート]
description: ClickHouseのインストール
slug: /install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# ClickHouseのインストール

ClickHouseを始めるためのオプションは4つあります:

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** ClickHouseの公式サービスで、ClickHouseの作成者によって構築、維持、サポートされています。
- **[クイックインストール](#quick-install):** ClickHouseでのテストと開発のための簡単にダウンロードできるバイナリ。
- **[本番環境デプロイメント](#available-installation-options):** ClickHouseは、x86-64や最新のARM (ARMv8.2-A以降)、またはPowerPC64LE CPUアーキテクチャを備えた任意のLinux、FreeBSD、macOSで動作します。
- **[Dockerイメージ](https://hub.docker.com/_/clickhouse):** Docker Hubの公式Dockerイメージを使用します。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouseを最も早く簡単に始める方法は、[ClickHouse Cloud](https://clickhouse.cloud/)で新しいサービスを作成することです。

## クイックインストール {#quick-install}

:::tip
特定のリリースバージョンの本番インストールについては、下記の[インストールオプション](#available-installation-options)を参照してください。
:::

Linux、macOS、FreeBSDで:

1. もしあなたが初めてでClickHouseの機能を見たい場合、最も簡単にClickHouseをローカルにダウンロードする方法は以下のコマンドを実行することです。このコマンドは、ClickHouseサーバー、`clickhouse-client`、`clickhouse-local`、ClickHouse Keeper、およびその他のツールを実行するために使用できる単一のバイナリをオペレーティングシステム用にダウンロードします:

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Macユーザーへ: バイナリの開発者を確認できないというエラーが発生する場合、[こちら](https://knowledgebase/fix-developer-verification-error-in-macos)をご参照ください。
   :::

2. 次のコマンドを実行して、[clickhouse-local](../operations/utilities/clickhouse-local.md)を起動します:

   ```bash
   ./clickhouse
   ```

   `clickhouse-local`は、ClickHouseの強力なSQLを使用してローカルおよびリモートファイルを処理することを可能にし、設定の必要はありません。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動すると以前に作成したテーブルは利用できなくなります。

   代替として、以下のコマンドでClickHouseサーバーを起動できます…

    ```bash
    ./clickhouse server
    ```

   … そして新しいターミナルを開いて、`clickhouse-client`でサーバーに接続します:

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

   テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーの再起動後も利用可能です。必要に応じて、`./clickhouse server`に追加のコマンドライン引数として`-C config.xml`を指定し、設定ファイルにさらに構成を提供できます。利用可能なすべての設定は、[こちら](../operations/settings/settings.md)および[設定ファイルテンプレートの例](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に文書化されています。

   SQLコマンドをClickHouseに送信する準備ができました!

:::tip
[クイックスタート](/quick-start.mdx)では、テーブルの作成とデータの挿入の手順を説明しています。
:::

## 本番環境デプロイメント {#available-installation-options}

ClickHouseの本番デプロイメントのために、以下のインストールオプションから選択してください。

### DEBパッケージから {#install-from-deb-packages}

DebianまたはUbuntu用の公式にプリコンパイルされた`deb`パッケージを使用することをお勧めします。以下のコマンドを実行してパッケージをインストールします:

#### Debianリポジトリの設定 {#setup-the-debian-repository}
```bash
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
clickhouse-client # または、パスワードを設定している場合は "clickhouse-client --password"を使用。
```

<details>
<summary>古いディストリビューションのdebパッケージインストール方法</summary>

```bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # または、パスワードを設定している場合は "clickhouse-client --password"を使用。
```

</details>

必要に応じて、`stable`を`lts`に置き換えて、必要に応じて異なる[リリースの種類](/knowledgebase/production)を使用できます。

また、[こちら](https://packages.clickhouse.com/deb/pool/main/c/)からパッケージを手動でダウンロードしてインストールできます。

#### スタンドアロンのClickHouse Keeperをインストール {#install-standalone-clickhouse-keeper}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強く推奨します。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行することを決定した場合、ClickHouse KeeperはClickHouseサーバーに含まれているため、インストールする必要はありません。
このコマンドは、スタンドアロンのClickHouse Keeperサーバーのみで必要です。
:::

```bash
sudo apt-get install -y clickhouse-keeper
```

#### ClickHouse Keeperを有効化して起動 {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### パッケージ {#packages}

- `clickhouse-common-static` — ClickHouseのコンパイルされたバイナリファイルをインストールします。
- `clickhouse-server` — `clickhouse-server`のシンボリックリンクを作成し、デフォルトのサーバー構成をインストールします。
- `clickhouse-client` — `clickhouse-client`のシンボリックリンクとその他のクライアント関連ツールを作成し、クライアント構成ファイルをインストールします。
- `clickhouse-common-static-dbg` — デバッグ情報を含むClickHouseコンパイルされたバイナリファイルをインストールします。
- `clickhouse-keeper` - 専用のClickHouse KeeperノードにClickHouse Keeperをインストールするために使用します。ClickHouse KeeperをClickHouseサーバーと同じサーバーで実行している場合、このパッケージをインストールする必要はありません。ClickHouse Keeper値をインストールし、デフォルトのClickHouse Keeper構成ファイルをインストールします。

:::info
特定のバージョンのClickHouseをインストールする必要がある場合は、同じバージョンのすべてのパッケージをインストールする必要があります:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### RPMパッケージから {#from-rpm-packages}

CentOS、RedHat、および他のすべてのrpmベースのLinuxディストリビューション向けに公式にプリコンパイルされた`rpm`パッケージを使用することをお勧めします。

#### RPMリポジトリの設定 {#setup-the-rpm-repository}
まず、公式リポジトリを追加する必要があります:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper`パッケージマネージャーを持つシステム（openSUSE、SLES）の場合:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

後で、任意の`yum install`は`zypper install`に置き換えることができます。特定のバージョンを指定するには、パッケージ名の末尾に`-$VERSION`を追加します。例: `clickhouse-client-22.2.2.22`。

#### ClickHouseサーバーとクライアントのインストール {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### ClickHouseサーバーの起動 {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # または、パスワードを設定している場合は "clickhouse-client --password"を使用。
```

#### スタンドアロンのClickHouse Keeperをインストール {#install-standalone-clickhouse-keeper-1}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強く推奨します。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行することを決定した場合、ClickHouse KeeperはClickHouseサーバーに含まれているため、インストールする必要はありません。
このコマンドは、スタンドアロンのClickHouse Keeperサーバーのみで必要です。
:::

```bash
sudo yum install -y clickhouse-keeper
```

#### ClickHouse Keeperを有効化して起動 {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

必要に応じて、`stable`を`lts`に置き換えて、必要に応じて異なる[リリースの種類](/knowledgebase/production)を使用できます。

その後、以下のコマンドを実行してパッケージをインストールします:

```bash
sudo yum install clickhouse-server clickhouse-client
```

また、[こちら](https://packages.clickhouse.com/rpm/stable)からパッケージを手動でダウンロードしてインストールできます。

### Tgzアーカイブから {#from-tgz-archives}

公式にプリコンパイルされた`tgz`アーカイブを、`deb`や`rpm`パッケージのインストールが不可能なすべてのLinuxディストリビューション向けに使用することをお勧めします。

必要なバージョンは、リポジトリ https://packages.clickhouse.com/tgz/ から`curl`または`wget`でダウンロードできます。
その後、ダウンロードしたアーカイブを展開し、インストールスクリプトでインストールする必要があります。最新の安定版の例:

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION

case $(uname -m) in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;;
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

本番環境では、最新の`stable`バージョンを使用することをお勧めします。その番号はGitHubページ https://github.com/ClickHouse/ClickHouse/tags で`-stable`という接尾辞とともに見つけることができます。

### Dockerイメージから {#from-docker-image}

Docker内でClickHouseを実行するには、[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)のガイドに従ってください。これらのイメージは、内部で公式の`deb`パッケージを使用しています。

## 非本番環境デプロイメント (高度な) {#non-production-deployments-advanced}

### ソースからコンパイル {#from-sources}

ClickHouseを手動でコンパイルするには、[Linux](/development/build.md)または[macOS](/development/build-osx.md)の指示に従ってください。

パッケージをコンパイルしてインストールするか、パッケージをインストールせずにプログラムを使用できます。

```xml
クライアント: <build_directory>/programs/clickhouse-client
サーバー: <build_directory>/programs/clickhouse-server
```

データおよびメタデータフォルダーを手動で作成し、望ましいユーザーのために`chown`する必要があります。これらのパスはサーバー構成 (src/programs/server/config.xml) で変更できます。デフォルトでは次のようになります:

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

Gentooでは、`emerge clickhouse`を使用してClickHouseをソースからインストールできます。

### CI生成バイナリをインストール {#install-a-ci-generated-binary}

ClickHouseの継続的インテグレーション (CI) インフラストラクチャは、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/)内の各コミットに対して専門のビルドを生成します。例えば、[sanitized](https://github.com/google/sanitizers) ビルド、最適化されていない (Debug) ビルド、クロスコンパイルビルドなどです。このようなビルドは通常、開発中のみ有用ですが、特定の状況下でユーザーにとっても興味深いことがあります。

:::note
ClickHouseのCIは時間と共に進化しているため、CI生成ビルドをダウンロードするための正確な手順は異なる場合があります。
また、CIは古いビルドアーティファクトを削除する場合があり、それによりダウンロードできなくなることがあります。
:::

例えば、ClickHouse v23.4のaarch64バイナリをダウンロードするには、以下の手順に従います:

- リリース v23.4 のGitHubプルリクエストを見つけます: [ブランチ 23.4 のリリースプルリクエスト](https://github.com/ClickHouse/ClickHouse/pull/49238)
- "Commits"をクリックし、インストールしたい特定のバージョン用に「バージョンを23.4.2.1に自動生成の更新と貢献者」を含むコミットをクリックします。
- CIチェックのリストを開くには、緑のチェック / 黄の点 / 赤のバツをクリックします。
- リスト内の「Builds」の横にある「Details」をクリックすると、[こちらのページのようなページ](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)が開きます。
- コンパイラ = "clang-*-aarch64" の行を見つけます - 複数の行があります。
- これらのビルドのアーティファクトをダウンロードします。

### macOSのみ: Homebrewでインストール {#macos-only-install-with-homebrew}

[homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouseの[コミュニティHomebrewフォーミュラ](https://formulae.brew.sh/cask/clickhouse)を参照してください。

:::note
Macユーザーへ: バイナリの開発者を確認できないというエラーが発生する場合、[こちら](https://knowledgebase/fix-developer-verification-error-in-macos)をご参照ください。
:::

## サーバーの起動 {#launch}

デーモンとしてサーバーを起動するには、以下のコマンドを実行します:

```bash
$ clickhouse start
```

ClickHouseを実行する他の方法もあります:

```bash
$ sudo service clickhouse-server start
```

もし`service`コマンドがない場合は、次のように実行します:

```bash
$ sudo /etc/init.d/clickhouse-server start
```

`systemctl`コマンドがある場合は、次のように実行します:

```bash
$ sudo systemctl start clickhouse-server.service
```

ログは`/var/log/clickhouse-server/`ディレクトリで確認できます。

サーバーが起動しない場合は、構成ファイル`/etc/clickhouse-server/config.xml`を確認してください。

また、コンソールからサーバーを手動で起動することもできます:

```bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

この場合、ログはコンソールに表示され、開発中には便利です。
構成ファイルが現在のディレクトリにある場合、`--config-file`パラメーターを指定する必要はありません。デフォルトでは`./config.xml`が使用されます。

ClickHouseはアクセス制限設定をサポートしています。これらは`config.xml`と同じ場所にある`users.xml`ファイルにあります。
デフォルトでは、`default`ユーザーにはパスワードなしでどこからでもアクセスが許可されています。`user/default/networks`を参照してください。
詳細は["構成ファイル"](/operations/configuration-files.md)のセクションを参照してください。

サーバーを起動したら、コマンドラインクライアントを使用して接続できます:

```bash
$ clickhouse-client
```

デフォルトでは、パスワードなしでユーザー`default`として`localhost:9000`に接続されます。`--host`引数を使用してリモートサーバーに接続することもできます。

ターミナルはUTF-8エンコーディングを使用する必要があります。
詳細は["コマンドラインクライアント"](/interfaces/cli.md)のセクションを参照してください。

例:

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

**おめでとうございます、システムは動作しています！**

実験を続けるために、テストデータセットの1つをダウンロードするか、[チュートリアル](/tutorial.md)を進んでください。

## セルフマネージドClickHouseの推奨事項 {#recommendations-for-self-managed-clickhouse}

ClickHouseは、x86-64、ARM、またはPowerPC64LE CPUアーキテクチャを備えた任意のLinux、FreeBSD、またはmacOSで動作します。

ClickHouseは、データ処理のために利用可能なすべてのハードウェアリソースを使用します。

ClickHouseは、クロック周波数の低い多数のコアでより効率的に動作する傾向があります。

トリビアルでないクエリを実行するためには、最低4GBのRAMを推奨します。ClickHouseサーバーははるかに少ないRAMでも動作しますが、その場合、クエリは頻繁に中断されます。

必要なRAMの量は一般的に次の要因に依存します:

- クエリの複雑さ。
- クエリで処理されるデータの量。

必要なRAMの量を計算するには、[GROUP BY](/sql-reference/statements/select/group-by)、[DISTINCT](/sql-reference/statements/select/distinct)、[JOIN](/sql-reference/statements/select/join)など、使用する操作の一時データのサイズを推定できます。

メモリ消費を削減するために、ClickHouseは一時データを外部ストレージにスワップすることができます。詳細については、[外部メモリでのGROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory)を参照してください。

本番環境では、オペレーティングシステムのスワップファイルを無効にすることをお勧めします。

ClickHouseのバイナリは、インストールに最低2.5GBのディスクスペースを必要とします。

データ量に必要なストレージの量は、次の基準に基づいて別途計算できます。

- データ量の推定。

    データのサンプルを取得し、その平均サイズを取得できます。その後、その値を計画した行数に掛けます。

- データ圧縮係数。

    データ圧縮係数を見積もるには、データのサンプルをClickHouseにロードし、実際のデータサイズとテーブルのストレージサイズを比較します。例えば、クリックストリームデータは通常6〜10倍圧縮されます。

ストレージされる最終データボリュームを計算するには、推定データ量に圧縮係数を適用します。レプリカにデータを保存する予定がある場合は、推定量をレプリカの数で掛けます。

分散したClickHouseデプロイメント（クラスタリング）のために、少なくとも10Gクラスのネットワーク接続を推奨します。

ネットワーク帯域幅は、大量の中間データを持つ分散クエリを処理するために重要です。また、ネットワーク速度はレプリケーションプロセスにも影響を与えます。
