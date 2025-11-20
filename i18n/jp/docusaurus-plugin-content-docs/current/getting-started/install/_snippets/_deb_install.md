import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



# Debian/UbuntuへのClickHouseのインストール {#install-from-deb-packages}

> **Debian**または**Ubuntu**では、公式のプリコンパイル済み`deb`パッケージの使用を推奨します。

<VerticalStepper>


## Debianリポジトリのセットアップ {#setup-the-debian-repository}

ClickHouseをインストールするには、以下のコマンドを実行します:


```bash
# 前提パッケージのインストール
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
```


# ClickHouse の GPG キーをダウンロードしてキーリングに保存する
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg



# システムアーキテクチャを取得
ARCH=$(dpkg --print-architecture)



# ClickHouse リポジトリを apt のソースに追加
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list



# apt パッケージリストを更新する

sudo apt-get update

```

- 必要に応じて、`stable` を `lts` に置き換えることで、異なる[リリース種別](/knowledgebase/production)を使用できます。
- [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/)からパッケージを手動でダウンロードしてインストールすることもできます。
<br/>
<details>
<summary>debパッケージをインストールする従来の方法</summary>
```


```bash
# 前提パッケージのインストール
sudo apt-get install apt-transport-https ca-certificates dirmngr
```


# パッケージを認証するために ClickHouse の GPG キーを追加する
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754



# ClickHouse リポジトリを apt のソースに追加
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    


# apt パッケージリストを更新
sudo apt-get update



# ClickHouse サーバーおよびクライアントのパッケージをインストールする
sudo apt-get install -y clickhouse-server clickhouse-client



# ClickHouse サーバーサービスを起動する
sudo service clickhouse-server start



# ClickHouse コマンドラインクライアントを起動する

clickhouse-client # パスワードを設定している場合は &quot;clickhouse-client --password&quot;。

```

</details>
```


## ClickHouseサーバーとクライアントのインストール {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```


## ClickHouseの起動 {#start-clickhouse-server}

ClickHouseサーバーを起動するには、以下を実行します:

```bash
sudo service clickhouse-server start
```

ClickHouseクライアントを起動するには、以下を実行します:

```bash
clickhouse-client
```

サーバーにパスワードを設定した場合は、以下を実行する必要があります:

```bash
clickhouse-client --password
```


## スタンドアロンClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強く推奨します。
テスト環境で、ClickHouse ServerとClickHouse Keeperを同じサーバー上で実行する場合は、
ClickHouse Keeperは ClickHouse serverに含まれているため、別途インストールする必要はありません。
:::

スタンドアロンのClickHouse Keeperサーバーに`clickhouse-keeper`をインストールするには、次のコマンドを実行します:

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

利用可能な各種debパッケージの詳細は以下の通りです:

| パッケージ                        | 説明                                                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse-common-static`     | ClickHouseのコンパイル済みバイナリファイルをインストールします。                                                                                                                                                                                                                                            |
| `clickhouse-server`            | `clickhouse-server`のシンボリックリンクを作成し、デフォルトのサーバー設定をインストールします。                                                                                                                                                                                        |
| `clickhouse-client`            | `clickhouse-client`およびその他のクライアント関連ツールのシンボリックリンクを作成し、クライアント設定ファイルをインストールします。                                                                                                                                                                              |
| `clickhouse-common-static-dbg` | デバッグ情報を含むClickHouseのコンパイル済みバイナリファイルをインストールします。                                                                                                                                                                                                                            |
| `clickhouse-keeper`            | 専用のClickHouse KeeperノードにClickHouse Keeperをインストールする際に使用します。ClickHouseサーバーと同じサーバー上でClickHouse Keeperを実行している場合は、このパッケージをインストールする必要はありません。ClickHouse KeeperとデフォルトのClickHouse Keeper設定ファイルをインストールします。 |

<br />
:::info 特定のバージョンのClickHouseをインストールする必要がある場合は、すべてのパッケージを同じバージョンでインストールする必要があります: `sudo apt-get install
clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7
clickhouse-common-static=21.8.5.7` :::
