---
title: 'トラブルシューティング'
description: 'インストールのトラブルシューティングガイド'
slug: '/guides/troubleshooting'
---



## インストール {#installation}

### apt-key で keyserver.ubuntu.com から GPG キーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key` 機能は、[Advanced package tool (APT) で非推奨になりました](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。ユーザーは代わりに `gpg` コマンドを使用するべきです。詳細は [インストールガイド](../getting-started/install/install.mdx) を参照してください。

### gpg で keyserver.ubuntu.com から GPG キーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg` がインストールされているか確認します：

```shell
sudo apt-get install gnupg
```

### apt-get で ClickHouse リポジトリから deb パッケージを取得できない {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォールの設定を確認します。
1. 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install/install.mdx) に記載されている方法でパッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールします。また、`tzdata` パッケージも必要です。

### apt-get で ClickHouse リポジトリから deb パッケージを更新できない {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

GPG キーが変更されると、この問題が発生することがあります。

リポジトリ設定を更新するには、[セットアップ](/install/debian_ubuntu) ページのマニュアルを使用してください。

### `apt-get update` で異なる警告が表示される {#you-get-different-warnings-with-apt-get-update}

表示される警告メッセージは以下のいずれかです：

```shell
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```shell
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```shell
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

上記の問題を解決するには、次のスクリプトを使用してください：

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yum でパッケージを取得できない理由が署名の不正 {#cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題：キャッシュが不正で、2022-09 に GPG キーが更新された後に破損した可能性があります。

解決策は、Yum のキャッシュと lib ディレクトリを削除することです：

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](/install/redhat) に従ってください。

## サーバーへの接続 {#connecting-to-the-server}

考えられる問題：

- サーバーが実行されていない。
- 予期しないか不正な設定パラメータ。

### サーバーが実行されていない {#server-is-not-running}

#### サーバーが実行されているか確認 {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが実行されていない場合は、次のコマンドで起動します：

```shell
sudo service clickhouse-server start
```

#### ログを確認 {#check-the-logs}

`clickhouse-server` の主要なログは、デフォルトで `/var/log/clickhouse-server/clickhouse-server.log` にあります。

サーバーが正常に起動した場合は、次の文字列が表示されるはずです：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で、接続の準備が整いました。

`clickhouse-server` の起動が設定エラーで失敗した場合は、エラーの説明が含まれた `<Error>` 文字列が表示されます。例えば：

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの末尾にエラーが表示されない場合は、次の文字列からファイル全体を確認してください：

```plaintext
<Information> Application: starting up.
```

サーバー上で `clickhouse-server` の2回目のインスタンスを起動しようとすると、次のログが表示されます：

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Starting ClickHouse 19.1.0 with revision 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: Status file ./status already exists - unclean restart. Contents:
PID: 8510
Started at: 2019-01-11 15:24:23
Revision: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: Cannot lock file ./status. Another server instance in same directory is already running.
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: shutting down
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: Uninitializing subsystem: Logging Subsystem
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

#### system.d ログを確認 {#see-systemd-logs}

`clickhouse-server` のログに役立つ情報が見つからない場合やログがない場合は、次のコマンドを使用して `system.d` ログを表示できます：

```shell
sudo journalctl -u clickhouse-server
```

#### インタラクティブモードで clickhouse-server を起動 {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、autostart スクリプトの標準パラメータでサーバーをインタラクティブアプリとして起動します。このモードでは `clickhouse-server` がコンソールにすべてのイベントメッセージを出力します。

### 設定パラメータ {#configuration-parameters}

確認してください：

1. Docker 設定：

    - IPv6 ネットワークで Docker 内で ClickHouse を実行している場合は、`network=host` が設定されていることを確認してください。

1. エンドポイント設定。
    - [listen_host](/operations/server-configuration-parameters/settings#listen_host) と [tcp_port](/operations/server-configuration-parameters/settings#tcp_port) の設定を確認します。
    - デフォルトでは、ClickHouse サーバーはローカルホスト接続のみを受け入れます。

1. HTTP プロトコル設定：

    - HTTP API のプロトコル設定を確認してください。

1. セキュア接続設定。

    - 次の項目を確認してください：
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure) の設定。
        - [SSL証明書](/operations/server-configuration-parameters/settings#openssl) の設定。
    - 接続時に適切なパラメータを使用してください。例えば、`clickhouse_client` で `port_secure` パラメータを使用します。

1. ユーザー設定：

    - 不正なユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#query-processing}

ClickHouse がクエリを処理できない場合、エラーの説明をクライアントに送信します。`clickhouse-client` では、コンソールにエラーの説明が表示されます。HTTP インターフェースを使用している場合、ClickHouse はレスポンスボディにエラーの説明を送信します。例えば：

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメータで起動する場合、ClickHouse はエラーの説明とともにサーバースタックトレースを返します。

接続の切断に関するメッセージが表示されることがあります。この場合、クエリを繰り返すことができます。クエリを実行するたびに接続が切断される場合は、サーバーログにエラーがないか確認してください。

## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouse の動作が非常に遅い場合は、サーバーリソースとネットワークへの負荷をクエリごとにプロファイリングする必要があります。

clickhouse-benchmark ツールを使用してクエリをプロファイリングできます。これにより、1秒あたりに処理されたクエリの数、1秒あたりに処理された行の数、クエリ処理時間のパーセンタイルが表示されます。
