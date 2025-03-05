---
sidebar_label: インストール
keywords: [clickhouse, install, getting started, quick start]
description: ClickHouseのインストール
slug: /install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# ClickHouseのインストール

ClickHouseを始めるには、4つのオプションがあります：

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** ClickHouseの公式クラウドサービス。ClickHouseの作成者によって構築され、管理され、サポートされています。
- **[クイックインストール](#quick-install):** ClickHouseをテストおよび開発するための簡単にダウンロードできるバイナリ。
- **[プロダクション展開](#available-installation-options):** ClickHouseは、x86-64、最新のARM (ARMv8.2-A以上)、またはPowerPC64LE CPUアーキテクチャを持つ任意のLinux、FreeBSD、またはmacOS上で実行できます。
- **[Dockerイメージ](https://hub.docker.com/_/clickhouse):** Docker Hubの公式Dockerイメージを使用します。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouseを迅速かつ簡単に始めるには、[ClickHouse Cloud](https://clickhouse.cloud/)で新しいサービスを作成するのが最も早い方法です。

## クイックインストール {#quick-install}

:::tip
特定のリリースバージョンのプロダクションインストールについては、下にある[インストールオプション](#available-installation-options)を参照してください。
:::

Linux、macOS、およびFreeBSDの場合：

1. ClickHouseを試してみたい場合、ClickHouseをローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです。これにより、ClickHouseサーバー、`clickhouse-client`、`clickhouse-local`、ClickHouse Keeper、およびその他のツールを実行するために使用できるオペレーティングシステム用の単一のバイナリがダウンロードされます：

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Macユーザーへ：バイナリの開発者を確認できないというエラーが発生した場合は、[こちら](https://clickhouse.com/knowledgebase/fix-developer-verification-error-in-macos)を参照してください。
   :::

2. 次のコマンドを実行して[clickhouse-local](../operations/utilities/clickhouse-local.md)を起動します：

   ```bash
   ./clickhouse
   ```

   `clickhouse-local`を使用すると、ClickHouseの強力なSQLを使用して、設定なしでローカルおよびリモートファイルを処理できます。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`の再起動後、以前に作成したテーブルは再び利用できなくなります。

   代替として、次のコマンドでClickHouseサーバーを起動できます...

    ```bash
    ./clickhouse server
    ```

   ... 新しいターミナルを開いて、`clickhouse-client`でサーバーに接続します：

    ```bash
    ./clickhouse client
    ```

    ```response
    ./clickhouse client
    ClickHouseクライアントバージョン 24.5.1.117 (公式ビルド)。
    ユーザー default として localhost:9000 に接続しています。
    ClickHouseサーバーバージョン 24.5.1 に接続されました。

    local-host :)
    ```

   テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーの再起動後も利用可能です。必要に応じて、`-C config.xml`を追加のコマンドライン引数として`./clickhouse server`に渡し、設定ファイルでさらに設定を提供できます。すべての利用可能な設定は[こちら](../operations/settings/settings.md)および[サンプル設定ファイルテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に文書化されています。

   SQLコマンドをClickHouseに送信する準備が整いました！

:::tip
[クイックスタート](/quick-start.mdx)では、テーブルの作成とデータの挿入に関する手順が説明されています。
:::

## プロダクション展開 {#available-installation-options}

ClickHouseのプロダクション展開には、次のインストールオプションから選択できます。

### DEBパッケージからのインストール {#install-from-deb-packages}

DebianまたはUbuntuの公式事前コンパイルされた`deb`パッケージを使用することをお勧めします。これらのコマンドを実行してパッケージをインストールします：

#### Debianリポジトリのセットアップ {#setup-the-debian-repository}
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
clickhouse-client # もしパスワードを設定している場合は "clickhouse-client --password" と入力します。
```

<details>
<summary>古いディストリビューションのdebパッケージのインストール方法</summary>

```bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # もしパスワードを設定している場合は "clickhouse-client --password" と入力します。
```

</details>

ニーズに応じて、`stable`を`lts`に置き換えて異なる[リリース種別](/knowledgebase/production)を使用できます。

また、[こちら](https://packages.clickhouse.com/deb/pool/main/c/)から手動でパッケージをダウンロードしてインストールすることもできます。

#### 独立したClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper}

:::tip
プロダクション環境では、ClickHouse Keeperを専用ノードで実行することを強くお勧めします。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行する場合、ClickHouseサーバーに含まれているため、ClickHouse Keeperをインストールする必要はありません。
このコマンドは、スタンドアロンのClickHouse Keeperサーバーでのみ必要です。
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

- `clickhouse-common-static` — ClickHouseのコンパイルされたバイナリファイルをインストールします。
- `clickhouse-server` — `clickhouse-server`のシンボリックリンクを作成し、デフォルトのサーバー設定をインストールします。
- `clickhouse-client` — `clickhouse-client`のシンボリックリンクと他のクライアント関連のツールを作成し、クライアント設定ファイルをインストールします。
- `clickhouse-common-static-dbg` — デバッグ情報を含むClickHouseのコンパイルされたバイナリファイルをインストールします。
- `clickhouse-keeper` - 専用のClickHouse KeeperノードにClickHouse Keeperをインストールするために使用されます。同じサーバー上でClickHouse KeeperをClickHouseサーバーと一緒に実行している場合は、このパッケージをインストールする必要はありません。ClickHouse KeeperとデフォルトのClickHouse Keeper設定ファイルをインストールします。

:::info
特定のバージョンのClickHouseをインストールする必要がある場合は、同じバージョンのすべてのパッケージをインストールする必要があります：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### RPMパッケージからのインストール {#from-rpm-packages}

CentOS、RedHat、その他のrpmベースのLinuxディストリビューション用には、公式の事前コンパイルされた`rpm`パッケージを使用することをお勧めします。

#### RPMリポジトリのセットアップ {#setup-the-rpm-repository}
まず、公式リポジトリを追加する必要があります：

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper`パッケージマネージャーを持つシステム（openSUSE、SLES）のためには：

```bash
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
clickhouse-client # もしパスワードを設定している場合は "clickhouse-client --password" と入力します。
```

#### 独立したClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper-1}

:::tip
プロダクション環境では、私たちは[強く推奨します](/operations/tips.md#L143-L144) ClickHouse Keeperを専用ノードで実行すること。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行する場合、ClickHouseサーバーに含まれているため、ClickHouse Keeperをインストールする必要はありません。
このコマンドは、スタンドアロンのClickHouse Keeperサーバーでのみ必要です。
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

`stable`を`lts`に置き換えて、ニーズに応じた異なる[リリース種別](/knowledgebase/production)を使用できます。

次に、これらのコマンドを実行してパッケージをインストールします：

```bash
sudo yum install clickhouse-server clickhouse-client
```

また、[こちら](https://packages.clickhouse.com/rpm/stable)から手動でパッケージをダウンロードしてインストールすることもできます。

### Tgzアーカイブからのインストール {#from-tgz-archives}

`deb`や`rpm`パッケージのインストールが不可能なすべてのLinuxディストリビューションでは、公式の事前コンパイルされた`tgz`アーカイブを使用することをお勧めします。

必要なバージョンは、https://packages.clickhouse.com/tgz/ から`curl`または`wget`でダウンロードできます。
その後、ダウンロードしたアーカイブは解凍され、インストールスクリプトを使用してインストールされるべきです。最新の安定版の例：

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

プロダクション環境には、最新の`stable`バージョンを使用することが推奨されます。その番号はGitHubページhttps://github.com/ClickHouse/ClickHouse/tags で`-stable`の接尾辞と共に見つけることができます。

### Dockerイメージからのインストール {#from-docker-image}

Docker内でClickHouseを実行するには、[Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/)のガイドに従ってください。これらのイメージは内部で公式の`deb`パッケージを使用します。

## 非プロダクション展開（高度な） {#non-production-deployments-advanced}

### ソースからのコンパイル {#from-sources}

ClickHouseを手動でコンパイルするには、[Linux](/development/build.md)または[macOS](/development/build-osx.md)の手順に従ってください。

パッケージをコンパイルしてインストールするか、パッケージをインストールせずにプログラムを使用できます。

```xml
クライアント: <build_directory>/programs/clickhouse-client
サーバー: <build_directory>/programs/clickhouse-server
```

データとメタデータのフォルダーを手動で作成し、希望するユーザーに対して`chown`する必要があります。そのパスはサーバー設定（src/programs/server/config.xml）で変更できます。デフォルトでは次のようになります：

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

Gentooでは、`emerge clickhouse`を実行するだけでClickHouseをソースからインストールできます。

### CI生成バイナリのインストール {#install-a-ci-generated-binary}

ClickHouseの継続的インテグレーション(CI)インフラストラクチャは、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/)の各コミットのための特別なビルドを生成します。 例えば、[sanitized](https://github.com/google/sanitizers)ビルド、最適化されていない（デバッグ）ビルド、クロスコンパイルされたビルドなどです。このようなビルドは通常、開発中のみ便利ですが、特定の状況ではユーザーにとっても興味深い場合があります。

:::note
ClickHouseのCIは進化しているため、CI生成ビルドをダウンロードする正確な手順は変わる可能性があります。
また、CIは古すぎるビルドアーティファクトを削除する場合があり、それらをダウンロードできなくなることもあります。
:::

例えば、ClickHouse v23.4のaarch64バイナリをダウンロードするための手順は次の通りです：

- リリースv23.4のGitHubプルリクエストを見つけます：[ブランチ23.4のプルリクエスト](https://github.com/ClickHouse/ClickHouse/pull/49238)
- 「コミット」をクリックし、インストールしたいバージョンに対して「自動生成されたバージョンを23.4.2.1と貢献者に更新する」のようなコミットをクリックします。
- CIチェックのリストを開くために、緑のチェック/黄色の点/赤いバツをクリックします。
- リスト内の「ビルド」の横の「詳細」をクリックすると、[このページ](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)に似たページが開きます。
- 「compiler = "clang-*-aarch64"」の行を見つけます - 複数の行が表示されます。
- これらのビルドのアーティファクトをダウンロードします。

### macOSのみ：Homebrewを使ってインストール {#macos-only-install-with-homebrew}

[homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouse [コミュニティのhomebrewフォーミュラ](https://formulae.brew.sh/cask/clickhouse)を参照してください。

:::note
Macユーザーへ：バイナリの開発者を確認できないというエラーが発生した場合は、[こちら](https://clickhouse.com/knowledgebase/fix-developer-verification-error-in-macos)を参照してください。
:::

## 起動 {#launch}

デーモンとしてサーバーを起動するには、次のように実行します：

```bash
$ clickhouse start
```

ClickHouseを実行する他の方法もあります：

```bash
$ sudo service clickhouse-server start
```

`service`コマンドがない場合は、次のように実行します

```bash
$ sudo /etc/init.d/clickhouse-server start
```

`systemctl`コマンドがある場合は、次のように実行します

```bash
$ sudo systemctl start clickhouse-server.service
```

ログは`/var/log/clickhouse-server/`ディレクトリに見ます。

サーバーが起動しない場合は、`/etc/clickhouse-server/config.xml`ファイルの設定を確認してください。

また、コンソールから手動でサーバーを起動することもできます：

```bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

この場合、ログはコンソールに出力され、開発中には便利です。
設定ファイルが現在のディレクトリにある場合、`--config-file`パラメーターを指定する必要はありません。デフォルトでは`./config.xml`を使用します。

ClickHouseはアクセス制限設定をサポートしています。これらは`users.xml`ファイルにあります（`config.xml`の隣に）。
デフォルトでは、`default`ユーザーに対してパスワードなしでどこからでもアクセスが許可されています。`user/default/networks`を確認してください。
詳細については、["設定ファイル"](/operations/configuration-files.md)のセクションを参照してください。

サーバーを起動した後、コマンドラインクライアントを使用して接続できます：

```bash
$ clickhouse-client
```

デフォルトでは、パスワードなしで`default`ユーザーとして`localhost:9000`に接続されます。また、`--host`引数を使用してリモートサーバーに接続することもできます。

ターミナルはUTF-8エンコーディングを使用する必要があります。
詳細については、["コマンドラインクライアント"](/interfaces/cli.md)のセクションを参照してください。

例：

```bash
$ ./clickhouse-client
ClickHouseクライアントバージョン 0.0.18749。
localhost:9000 に接続中。
ClickHouseサーバーバージョン 0.0.18749 に接続されました。

:) SELECT 1

SELECT 1

┌─1─┐
│ 1 │
└───┘

1 rows in set. 経過時間: 0.003 sec.

:)
```

**おめでとうございます、システムは正常に動作しています！**

実験を続けるには、テストデータセットの1つをダウンロードするか、[チュートリアル](/tutorial.md)に従ってください。

## セルフマネージドのClickHouseに関する推奨事項 {#recommendations-for-self-managed-clickhouse}

ClickHouseは、x86-64、ARM、またはPowerPC64LE CPUアーキテクチャを持つ任意のLinux、FreeBSD、またはmacOS上で実行できます。

ClickHouseはデータを処理するために利用可能なすべてのハードウェアリソースを使用します。

ClickHouseは、高いクロックレートの少数のコアよりも、低いクロックレートの多数のコアでより効率的に動作する傾向があります。

非自明なクエリを実行するには、最低でも4GBのRAMを使用することをお勧めします。ClickHouseサーバーははるかに少ないRAMで実行できますが、その場合クエリは頻繁に中止されます。

必要なRAMのボリュームは一般に、次のように決まります：

- クエリの複雑さ。
- クエリで処理するデータ量。

必要なRAMのボリュームを計算するには、[GROUP BY](/sql-reference/statements/select/group-by)、[DISTINCT](/sql-reference/statements/select/distinct)、[JOIN](/sql-reference/statements/select/join)などに使用する一時データのサイズを推定することができます。

メモリの消費を減らすために、ClickHouseは一時データを外部ストレージにスワップすることができます。詳細は[GROUP BY in External Memory](/sql-reference/statements/select/group-by#group-by-in-external-memory)を参照してください。

プロダクション環境では、オペレーティングシステムのスワップファイルを無効にすることをお勧めします。

ClickHouseバイナリをインストールするには、少なくとも2.5GBのディスクスペースが必要です。

データのために必要なストレージのボリュームは、次のように別々に計算できます：

- データ量の推定。

    データのサンプルを取得し、そこから行の平均サイズを取得できます。その値を保存予定の行数で掛け算します。

- データ圧縮係数。

    データ圧縮係数を推定するには、データのサンプルをClickHouseにロードし、データの実際のサイズとテーブルに保存されたサイズを比較します。例えば、クリックストリームデータは通常6-10倍圧縮されます。

保存されるデータの最終的なボリュームを計算するには、推定データボリュームに圧縮係数を適用します。複数のレプリカにデータを保存する予定の場合、推定ボリュームをレプリカの数で掛け算します。

分散ClickHouse展開（クラスタリング）の場合、最低でも10Gクラスのネットワーク接続を推奨します。

ネットワーク帯域幅は、大量の中間データを持つ分散クエリを処理するために重要です。さらに、ネットワーク速度はレプリケーションプロセスにも影響します。
