# rpmベースのディストリビューションにClickHouseをインストールする {#from-rpm-packages}

> **CentOS**、**RedHat**、およびその他の全てのrpmベースのLinuxディストリビューションには、公式の事前コンパイルされた `rpm` パッケージを使用することを推奨します。

<VerticalStepper>

## RPMリポジトリの設定 {#setup-the-rpm-repository}

以下のコマンドを実行して公式リポジトリを追加します:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper` パッケージマネージャーを使用しているシステム（openSUSE、SLES）の場合は、次のコマンドを実行します:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

以下の手順では、使用しているパッケージマネージャーによって `yum install` を `zypper install` に置き換えることができます。

## ClickHouseサーバーおよびクライアントのインストール {#install-clickhouse-server-and-client-1}

ClickHouseをインストールするには、次のコマンドを実行します:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- 必要に応じて、`stable` を `lts` に置き換えることで、別の [リリースの種類](/knowledgebase/production) を使用できます。
- [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable) からパッケージを手動でダウンロードしてインストールすることもできます。
- 特定のバージョンを指定するには、パッケージ名の末尾に `-$version` を追加します。例えば:

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## ClickHouseサーバーの起動 {#start-clickhouse-server-1}

ClickHouseサーバーを起動するには、次のコマンドを実行します:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouseクライアントを起動するには、次のコマンドを実行します:

```sql
clickhouse-client
```

サーバーにパスワードを設定している場合は、次のコマンドを実行する必要があります:

```bash
clickhouse-client --password
```

## スタンドアロンのClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper-1}

:::tip
本番環境では、必ず専用ノードでClickHouse Keeperを実行することを強く推奨します。
テスト環境でClickHouse ServerとClickHouse Keeperを同じサーバー上で実行する場合は、ClickHouseサーバーに含まれているためClickHouse Keeperをインストールする必要はありません。
:::

スタンドアロンのClickHouse Keeperサーバーに `clickhouse-keeper` をインストールするには、次のコマンドを実行します:

```bash
sudo yum install -y clickhouse-keeper
```

## ClickHouse Keeperの有効化と起動 {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
