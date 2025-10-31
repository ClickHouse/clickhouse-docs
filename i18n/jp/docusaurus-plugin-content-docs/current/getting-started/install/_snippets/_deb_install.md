

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickHouseをDebian/Ubuntuにインストールする {#install-from-deb-packages}

> **Debian** または **Ubuntu** 用の公式の事前コンパイル済み `deb` パッケージを使用することをお勧めします。

<VerticalStepper>

## Debianリポジトリをセットアップする {#setup-the-debian-repository}

ClickHouseをインストールするには、次のコマンドを実行します。

```bash

# Install prerequisite packages
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg


# Download the ClickHouse GPG key and store it in the keyring
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg


# Get the system architecture
ARCH=$(dpkg --print-architecture)


# Add the ClickHouse repository to apt sources
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list


# Update apt package lists
sudo apt-get update
```

- 必要に応じて、`stable` を `lts` に置き換えて異なる [リリースの種類](/knowledgebase/production) を使用できます。
- [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/) からパッケージを手動でダウンロードしてインストールできます。
<br/>
<details>
<summary>古い配布方法でdebパッケージをインストールする</summary>

```bash

# Install prerequisite packages
sudo apt-get install apt-transport-https ca-certificates dirmngr


# Add the ClickHouse GPG key to authenticate packages
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754


# Add the ClickHouse repository to apt sources
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list


# Update apt package lists
sudo apt-get update


# Install ClickHouse server and client packages
sudo apt-get install -y clickhouse-server clickhouse-client


# Start the ClickHouse server service
sudo service clickhouse-server start


# Launch the ClickHouse command line client
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

## ClickHouseサーバーとクライアントをインストールする {#install-clickhouse-server-and-client}

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

サーバーにパスワードを設定した場合、次のコマンドを実行する必要があります。

```bash
clickhouse-client --password
```

## スタンドアロンのClickHouse Keeperをインストールする {#install-standalone-clickhouse-keeper}

:::tip
本番環境では、専用ノードでClickHouse Keeperを実行することを強くお勧めします。
テスト環境では、同じサーバーでClickHouse ServerとClickHouse Keeperを実行することを決定した場合、
ClickHouse KeeperはClickHouseサーバーに含まれているため、インストールする必要はありません。
:::

スタンドアロンのClickHouse Keeperサーバーに `clickhouse-keeper` をインストールするには、次のコマンドを実行します。

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

以下に、利用可能なさまざまなdebパッケージの詳細を示します。

| パッケージ                      | 説明                                                                                                                                                                                                                              |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | ClickHouseのコンパイル済みバイナリファイルをインストールします。                                                                                                                                                                 |
| `clickhouse-server`            | `clickhouse-server` のシンボリックリンクを作成し、デフォルトのサーバー構成をインストールします。                                                                                                                                 |
| `clickhouse-client`            | `clickhouse-client` およびその他のクライアント関連ツールのシンボリックリンクを作成し、クライアント構成ファイルをインストールします。                                                                                              |
| `clickhouse-common-static-dbg` | デバッグ情報を含むClickHouseのコンパイル済みバイナリファイルをインストールします。                                                                                                                                               |
| `clickhouse-keeper`            | 専用のClickHouse KeeperノードにClickHouse Keeperをインストールするために使用されます。ClickHouseサーバーと同じサーバーでClickHouse Keeperを実行している場合、このパッケージをインストールする必要はありません。ClickHouse KeeperとデフォルトのClickHouse Keeper構成ファイルをインストールします。 |

<br/>
:::info
特定のバージョンのClickHouseをインストールする必要がある場合、同じバージョンのすべてのパッケージをインストールする必要があります：
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
