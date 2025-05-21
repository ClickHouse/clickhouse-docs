import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Debian/UbuntuにClickHouseをインストールする {#install-from-deb-packages}

> **Debian** または **Ubuntu** 用の公式の事前コンパイル済み `deb` パッケージを使用することをお勧めします。

<VerticalStepper>

## Debianリポジトリのセットアップ {#setup-the-debian-repository}

ClickHouseをインストールするには、以下のコマンドを実行します。

```bash

# 依存パッケージをインストール
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg


# ClickHouseのGPGキーをダウンロードし、キーリングに保存
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg


# システムアーキテクチャを取得
ARCH=$(dpkg --print-architecture)


# ClickHouseリポジトリをaptソースに追加
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list


# aptパッケージリストを更新
sudo apt-get update
```

- `stable` を `lts` に置き換えることで、ニーズに応じて異なる [リリースの種類](/knowledgebase/production) を使用できます。
- [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/) からパッケージを手動でダウンロードしてインストールすることも可能です。
<br/>
<details>
<summary>旧ディストリビューションのdebパッケージをインストールする方法</summary>

```bash

# 依存パッケージをインストール
sudo apt-get install apt-transport-https ca-certificates dirmngr


# パッケージを認証するためにClickHouseのGPGキーを追加
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754


# ClickHouseリポジトリをaptソースに追加
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    

# aptパッケージリストを更新
sudo apt-get update


# ClickHouseサーバーおよびクライアントパッケージをインストール
sudo apt-get install -y clickhouse-server clickhouse-client


# ClickHouseサーバーサービスを開始
sudo service clickhouse-server start


# ClickHouseコマンドラインクライアントを起動
clickhouse-client # またはパスワードを設定した場合は "clickhouse-client --password"。
```

</details>

## ClickHouseサーバーおよびクライアントのインストール {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## ClickHouseを起動する {#start-clickhouse-server}

ClickHouseサーバーを起動するには、次のコマンドを実行します。

```bash
sudo service clickhouse-server start
```

ClickHouseクライアントを起動するには、次のコマンドを実行します。

```bash
clickhouse-client
```

サーバーのパスワードを設定した場合は、次のコマンドを実行する必要があります。

```bash
clickhouse-client --password
```

## スタンドアロンClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強くお勧めします。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行する場合、ClickHouse KeeperはClickHouseサーバーに含まれているため、インストールする必要はありません。
:::

スタンドアロンClickHouse Keeperサーバーに `clickhouse-keeper` をインストールするには、次のコマンドを実行します。

```bash
sudo apt-get install -y clickhouse-keeper
```

## ClickHouse Keeperの有効化と起動 {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## パッケージ {#packages}

利用可能なさまざまなdebパッケージは以下の通りです。

| パッケージ                          | 説明                                                                                                                                                                                                                  |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`       | ClickHouseのコンパイル済みバイナリファイルをインストールします。                                                                                                                                                               |
| `clickhouse-server`              | `clickhouse-server`へのシンボリックリンクを作成し、デフォルトのサーバー構成をインストールします。                                                                                                                                 |
| `clickhouse-client`              | `clickhouse-client`および他のクライアント関連ツールへのシンボリックリンクを作成し、クライアント構成ファイルをインストールします。                                                                                                 |
| `clickhouse-common-static-dbg`   | デバッグ情報付きのClickHouseのコンパイル済みバイナリファイルをインストールします。                                                                                                                                                       |
| `clickhouse-keeper`              | 専用ClickHouse KeeperノードにClickHouse Keeperをインストールするために使用されます。ClickHouseサーバーと同じサーバーでClickHouse Keeperを実行している場合は、このパッケージをインストールする必要はありません。ClickHouse KeeperとデフォルトのClickHouse Keeper構成ファイルがインストールされます。 |

<br/>
:::info
特定のバージョンのClickHouseをインストールする必要がある場合は、同じバージョンのすべてのパッケージをインストールする必要があります：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
