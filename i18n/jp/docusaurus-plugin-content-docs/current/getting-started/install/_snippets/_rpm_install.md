


# Install ClickHouse on rpm-based distributions {#from-rpm-packages}

> **CentOS**、**RedHat**、およびその他のrpmベースのLinuxディストリビューションには、公式のプリコンパイル済み `rpm` パッケージを使用することをお勧めします。

<VerticalStepper>

## Setup the RPM repository {#setup-the-rpm-repository}

次のコマンドを実行して、公式リポジトリを追加します。

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper` パッケージマネージャー (openSUSE、SLES) を使用しているシステムの場合は、次のコマンドを実行します：

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

以下の手順では、使用しているパッケージマネージャーに応じて `yum install` を `zypper install` に置き換えることができます。

## Install ClickHouse server and client {#install-clickhouse-server-and-client-1}

ClickHouse をインストールするには、次のコマンドを実行します：

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 要件に応じて、`stable` を `lts` に置き換えて異なる [release kinds](/knowledgebase/production) を使用できます。
- [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable) からパッケージを手動でダウンロードしてインストールすることもできます。
- 特定のバージョンを指定するには、パッケージ名の末尾に `-$version` を追加します。
例えば：

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## Start ClickHouse server {#start-clickhouse-server-1}

ClickHouse サーバーを起動するには、次のコマンドを実行します：

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouse クライアントを起動するには、次のコマンドを実行します：

```sql
clickhouse-client
```

サーバーのパスワードを設定している場合は、次のコマンドを実行する必要があります：

```bash
clickhouse-client --password
```

## Install standalone ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
本番環境では、ClickHouse Keeper を専用ノードで実行することを強くお勧めします。
テスト環境では、ClickHouse Server と ClickHouse Keeper を同じサーバーで実行することに決めた場合でも、ClickHouse Keeper は ClickHouse サーバーに含まれているため、インストールする必要はありません。
:::

スタンドアロンの ClickHouse Keeper サーバーに `clickhouse-keeper` をインストールするには、次のコマンドを実行します：

```bash
sudo yum install -y clickhouse-keeper
```

## Enable and start ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
