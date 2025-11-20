# rpmベースのディストリビューションへのClickHouseのインストール {#from-rpm-packages}

> **CentOS**、**RedHat**、およびその他すべてのrpmベースのLinuxディストリビューションには、公式のプリコンパイル済み`rpm`パッケージを使用することを推奨します。

<VerticalStepper>


## RPMリポジトリのセットアップ {#setup-the-rpm-repository}

以下のコマンドを実行して公式リポジトリを追加してください:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

`zypper`パッケージマネージャーを使用するシステム(openSUSE、SLES)の場合は、以下を実行してください:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

以下の手順では、使用しているパッケージマネージャーに応じて`yum install`を`zypper install`に置き換えてください。


## ClickHouseサーバーとクライアントのインストール {#install-clickhouse-server-and-client-1}

ClickHouseをインストールするには、以下のコマンドを実行してください：

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- ニーズに応じて、`stable`を`lts`に置き換えることで、異なる[リリース種別](/knowledgebase/production)を使用できます。
- [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable)からパッケージを手動でダウンロードしてインストールすることも可能です。
- 特定のバージョンを指定する場合は、パッケージ名の末尾に`-$version`を追加してください。
  例：

```bash
sudo yum install clickhouse-server-22.8.7.34
```


## ClickHouseサーバーの起動 {#start-clickhouse-server-1}

ClickHouseサーバーを起動するには、以下を実行します:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

ClickHouseクライアントを起動するには、以下を実行します:

```sql
clickhouse-client
```

サーバーにパスワードを設定した場合は、以下を実行する必要があります:

```bash
clickhouse-client --password
```


## スタンドアロンClickHouse Keeperのインストール {#install-standalone-clickhouse-keeper-1}

:::tip
本番環境では、ClickHouse Keeperを専用ノードで実行することを強く推奨します。
テスト環境において、ClickHouse ServerとClickHouse Keeperを同じサーバー上で実行する場合、
ClickHouse Keeperは別途インストールする必要はありません。ClickHouse serverに含まれているためです。
:::

スタンドアロンのClickHouse Keeperサーバーに`clickhouse-keeper`をインストールするには、次のコマンドを実行します:

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
