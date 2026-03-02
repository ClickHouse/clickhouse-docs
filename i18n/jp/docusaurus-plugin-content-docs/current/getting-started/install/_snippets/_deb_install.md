import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Install ClickHouse on Debian/Ubuntu \{#install-from-deb-packages\}

> **Debian** または **Ubuntu** では、公式の事前コンパイル済み `deb` パッケージの使用を推奨します。

<VerticalStepper>

## Debian リポジトリをセットアップする \{#setup-the-debian-repository\}

ClickHouse をインストールするには、次のコマンドを実行します:

```bash
# 必要なパッケージをインストール
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# ClickHouse の GPG キーをダウンロードして keyring に保存
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

# システムアーキテクチャを取得
ARCH=$(dpkg --print-architecture)

# ClickHouse リポジトリを apt のソースに追加
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list

# apt パッケージリストを更新
sudo apt-get update
```

- 必要に応じて、`stable` を `lts` に置き換えることで、用途に合わせて異なる[リリース種別](/knowledgebase/production)を使用できます。
- [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/) からパッケージを手動でダウンロードしてインストールすることもできます。
<br/>
<details>
<summary>deb パッケージをインストールするための旧方式</summary>

```bash
# 必要なパッケージをインストール
sudo apt-get install apt-transport-https ca-certificates dirmngr

# パッケージ認証用に ClickHouse の GPG キーを追加
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754

# ClickHouse リポジトリを apt のソースに追加
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    
# apt パッケージリストを更新
sudo apt-get update

# ClickHouse server および client パッケージをインストール
sudo apt-get install -y clickhouse-server clickhouse-client

# ClickHouse server サービスを起動
sudo service clickhouse-server start

# ClickHouse コマンドラインクライアントを起動
clickhouse-client # パスワードを設定した場合は "clickhouse-client --password" を使用します。
```

</details>

## ClickHouse server と client をインストールする \{#install-clickhouse-server-and-client\}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## ClickHouse を起動する \{#start-clickhouse-server\}

ClickHouse server を起動するには、次を実行します:

```bash
sudo service clickhouse-server start
```

ClickHouse client を起動するには、次を実行します:

```bash
clickhouse-client
```

サーバーにパスワードを設定した場合は、次を実行する必要があります:

```bash
clickhouse-client --password
```

## スタンドアロンの ClickHouse Keeper をインストールする \{#install-standalone-clickhouse-keeper\}

:::tip
本番環境では、専用ノード上で ClickHouse Keeper を実行することを強く推奨します。
テスト環境で同じサーバー上に ClickHouse Server と ClickHouse Keeper を配置して実行する場合は、
ClickHouse server に ClickHouse Keeper が同梱されているため、ClickHouse Keeper を別途インストールする必要はありません。
:::

スタンドアロンの ClickHouse Keeper サーバー上に `clickhouse-keeper` をインストールするには、次を実行します:

```bash
sudo apt-get install -y clickhouse-keeper
```

## ClickHouse Keeper を有効化して起動する \{#enable-and-start-clickhouse-keeper\}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## パッケージ \{#packages\}

利用可能な各種 deb パッケージの詳細は次のとおりです。

| パッケージ名                   | 説明                                                                                                                                                                                                                                                                                   |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | ClickHouse のコンパイル済みバイナリファイルをインストールします。                                                                                                                                                                                                                     |
| `clickhouse-server`            | `clickhouse-server` のシンボリックリンクを作成し、デフォルトのサーバー設定ファイルをインストールします。                                                                                                                                                                            |
| `clickhouse-client`            | `clickhouse-client` およびその他のクライアント関連ツールのシンボリックリンクを作成し、クライアント設定ファイルをインストールします。                                                                                                                                               |
| `clickhouse-common-static-dbg` | デバッグ情報付きの ClickHouse のコンパイル済みバイナリファイルをインストールします。                                                                                                                                                                                                 |
| `clickhouse-keeper`            | 専用の ClickHouse Keeper ノードに ClickHouse Keeper をインストールするために使用します。ClickHouse server と同じサーバー上で ClickHouse Keeper を実行している場合、このパッケージをインストールする必要はありません。ClickHouse Keeper 本体とデフォルトの ClickHouse Keeper 設定ファイルをインストールします。 |

<br/>

:::info
特定のバージョンの ClickHouse をインストールする必要がある場合は、同じバージョンのパッケージをすべてインストールする必要があります:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::