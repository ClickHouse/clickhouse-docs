---
{}
---




# ClickHouseをrpmベースのディストリビューションにインストールする {#from-rpm-packages}

> **CentOS**、**RedHat**、および他のすべてのrpmベースのLinuxディストリビューションには、公式の事前コンパイル済み `rpm` パッケージを使用することをお勧めします。

<VerticalStepper>

## RPMリポジトリをセットアップする {#setup-the-rpm-repository}

次のコマンドを実行して公式リポジトリを追加します。

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper` パッケージマネージャーを使用しているシステム（openSUSE、SLES）の場合は、次のコマンドを実行します。

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

以下のステップでは、使用しているパッケージマネージャーに応じて、`yum install` を `zypper install` に置き換えることができます。

## ClickHouseサーバーとクライアントをインストールする {#install-clickhouse-server-and-client-1}

ClickHouseをインストールするには、次のコマンドを実行します。

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 必要に応じて、`stable` を `lts` に置き換えて、異なる [リリースタイプ](/knowledgebase/production) を使用することができます。
- [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable) から手動でパッケージをダウンロードしてインストールすることができます。
- 特定のバージョンを指定するには、パッケージ名の末尾に `-$version` を追加します。例：

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## ClickHouseサーバーを起動する {#start-clickhouse-server-1}

ClickHouseサーバーを起動するには、次のコマンドを実行します。

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouseクライアントを起動するには、次のコマンドを実行します。

```sql
clickhouse-client
```

サーバーのパスワードを設定した場合は、次のコマンドを実行する必要があります。

```bash
clickhouse-client --password
```

## スタンドアロンのClickHouse Keeperをインストールする {#install-standalone-clickhouse-keeper-1}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強くお勧めします。テスト環境では、ClickHouseサーバーとClickHouse Keeperを同一サーバーで実行する場合、ClickHouse KeeperはClickHouseサーバーに含まれているため、インストールする必要はありません。
:::

スタンドアロンのClickHouse Keeperサーバーに `clickhouse-keeper` をインストールするには、次のコマンドを実行します。

```bash
sudo yum install -y clickhouse-keeper
```

## ClickHouse Keeperを有効にして起動する {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
