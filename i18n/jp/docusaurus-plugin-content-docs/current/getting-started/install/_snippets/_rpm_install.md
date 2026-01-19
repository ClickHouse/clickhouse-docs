# rpmベースのディストリビューションへのClickHouseのインストール \{#from-rpm-packages\}

> **CentOS**、**RedHat**、およびその他すべてのrpmベースのLinuxディストリビューションには、公式のプリコンパイル済み`rpm`パッケージを使用することを推奨します。

<VerticalStepper>

## RPM リポジトリの設定 \{#setup-the-rpm-repository\}

次のコマンドを実行して公式リポジトリを追加します：

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper` パッケージマネージャー（openSUSE、SLES）を使用するシステムでは、次を実行してください：

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

以下の手順では、利用しているパッケージマネージャに応じて、`yum install` を `zypper install` に置き換えて構いません。

## ClickHouse サーバーとクライアントをインストールする \{#install-clickhouse-server-and-client-1\}

ClickHouse をインストールするには、次のコマンドを実行します。

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

* 必要に応じて `stable` を `lts` に置き換えることで、異なる[リリース種別](/knowledgebase/production)を利用できます。
* [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable) からパッケージを手動でダウンロードしてインストールできます。
* 特定のバージョンを指定するには、パッケージ名の末尾に `-$version` を追加します。
  例えば次のようにします。

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## ClickHouse サーバーを起動する \{#start-clickhouse-server-1\}

ClickHouse サーバーを起動するには、以下を実行します。

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouse クライアントを起動するには、次のコマンドを実行します。

```sql
clickhouse-client
```

サーバーにパスワードを設定している場合は、次のコマンドを実行してください。

```bash
clickhouse-client --password
```

## スタンドアロン ClickHouse Keeper をインストールする \{#install-standalone-clickhouse-keeper-1\}

:::tip
本番環境では、ClickHouse Keeper を専用ノード上で実行することを強く推奨します。
テスト環境で同じサーバー上で ClickHouse Server と ClickHouse Keeper を実行する場合は、
ClickHouse Server に ClickHouse Keeper が同梱されているため、ClickHouse Keeper を別途インストールする必要はありません。
:::

スタンドアロンの ClickHouse Keeper サーバーに `clickhouse-keeper` をインストールするには、次のコマンドを実行します。

```bash
sudo yum install -y clickhouse-keeper
```

## ClickHouse Keeperを有効化して起動する \{#enable-and-start-clickhouse-keeper-1\}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
