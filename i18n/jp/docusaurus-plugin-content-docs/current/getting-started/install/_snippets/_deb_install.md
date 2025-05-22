---
{}
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickHouseをDebian/Ubuntuにインストールする {#install-from-deb-packages}

> **Debian**または**Ubuntu**には、公式にコンパイルされた`deb`パッケージを使用することを推奨します。

<VerticalStepper>

## Debianリポジトリの設定 {#setup-the-debian-repository}

ClickHouseをインストールするには、以下のコマンドを実行します。

```bash

# 必要なパッケージをインストール
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg


# ClickHouse GPGキーをダウンロードしてキーハンドリングに保存
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg


# システムアーキテクチャを取得
ARCH=$(dpkg --print-architecture)


# ClickHouseリポジトリをaptソースに追加
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list


# aptパッケージリストを更新
sudo apt-get update
```

- 必要に応じて`stable`を`lts`に置き換えて異なる[リリース種別](/knowledgebase/production)を使用できます。
- [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/)から手動でパッケージをダウンロードしてインストールすることもできます。
<br/>
<details>
<summary>古いディストリビューションのdebパッケージインストール方法</summary>

```bash

# 必要なパッケージをインストール
sudo apt-get install apt-transport-https ca-certificates dirmngr


# パッケージを認証するためにClickHouse GPGキーを追加
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754


# ClickHouseリポジトリをaptソースに追加
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    

# aptパッケージリストを更新
sudo apt-get update


# ClickHouseサーバーおよびクライアントパッケージをインストール
sudo apt-get install -y clickhouse-server clickhouse-client


# ClickHouseサーバーサービスを起動
sudo service clickhouse-server start


# ClickHouseコマンドラインクライアントを起動
clickhouse-client # またはパスワードを設定している場合は "clickhouse-client --password" 。
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

サーバーにパスワードを設定した場合は、次のコマンドを実行する必要があります。

```bash
clickhouse-client --password
```

## スタンドアロンのClickHouse Keeperをインストールする {#install-standalone-clickhouse-keeper}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強く推奨します。
テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで実行する場合、
ClickHouse KeeperはClickHouseサーバーに含まれているため、別途インストールする必要はありません。
:::

スタンドアロンのClickHouse Keeperサーバーに`clickhouse-keeper`をインストールするには、次を実行します。

```bash
sudo apt-get install -y clickhouse-keeper
```

## ClickHouse Keeperを有効にして起動する {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## パッケージ {#packages}

利用可能なさまざまなdebパッケージの詳細は以下の通りです。

| パッケージ                           | 説明                                                                                                                                                                                                                      |
|--------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`           | ClickHouseのコンパイルされたバイナリファイルをインストールします。                                                                                                                                                       |
| `clickhouse-server`                  | `clickhouse-server`のシンボリックリンクを作成し、デフォルトのサーバー構成をインストールします。                                                                                                                                 |
| `clickhouse-client`                  | `clickhouse-client`およびその他のクライアント関連ツールのシンボリックリンクを作成し、クライアント構成ファイルをインストールします。                                                                                          |
| `clickhouse-common-static-dbg`       | デバッグ情報付きのClickHouseのコンパイルされたバイナリファイルをインストールします。                                                                                                                                     |
| `clickhouse-keeper`                  | 専用のClickHouse KeeperノードにClickHouse Keeperをインストールするために使用します。同じサーバー上でClickHouseサーバーを実行している場合、このパッケージをインストールする必要はありません。ClickHouse KeeperとデフォルトのClickHouse Keeper構成ファイルをインストールします。 |

<br/>
:::info
特定のバージョンのClickHouseをインストールする場合、すべてのパッケージを同じバージョンでインストールする必要があります：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
