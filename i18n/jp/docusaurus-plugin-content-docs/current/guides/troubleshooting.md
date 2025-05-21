---
title: 'トラブルシューティング'
description: 'インストールトラブルシューティングガイド'
slug: /guides/troubleshooting
---
```

## インストール {#installation}

### `apt-key` で keyserver.ubuntu.com から GPG キーをインポートできません {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key` 機能は [Advanced package tool (APT) で非推奨となりました](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。ユーザーは代わりに `gpg` コマンドを使用する必要があります。詳細は [インストールガイド](../getting-started/install/install.mdx) 記事を参照してください。

### `gpg` で keyserver.ubuntu.com から GPG キーをインポートできません {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg` がインストールされているか確認してください:

```shell
sudo apt-get install gnupg
```

### `apt-get` で ClickHouse リポジトリから deb パッケージを取得できません {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォール設定を確認してください。
1. 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install/install.mdx) 記事で説明されているように、パッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールしてください。また、`tzdata` パッケージも必要になります。

### `apt-get` で ClickHouse リポジトリから deb パッケージを更新できません {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

GPG キーが変更された場合に問題が発生することがあります。

リポジトリ設定を更新するには、[セットアップ](/install/debian_ubuntu) ページのマニュアルを使用してください。

### `apt-get update` で異なる警告が表示されます {#you-get-different-warnings-with-apt-get-update}

完了した警告メッセージは以下のいずれかです:

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

上記の問題を解決するには、以下のスクリプトを使用してください:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yum で不正な署名のためにパッケージを取得できません {#cant-get-packages-with-yum-because-of-wrong-signature}

可能な問題: キャッシュが不正、2022年09月に更新された GPG キーの後に壊れたかもしれません。

解決策は、Yum 用のキャッシュとライブラリディレクトリをクリーンアップすることです:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](/install/redhat) に従ってください。

## サーバーへの接続 {#connecting-to-the-server}

可能な問題:

- サーバーが稼働していない。
- 想定外または誤った設定パラメータ。

### サーバーが稼働していない {#server-is-not-running}

#### サーバーが稼働しているか確認する {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが稼働していない場合は、次のコマンドで起動します:

```shell
sudo service clickhouse-server start
```

#### ログを確認する {#check-the-logs}

`clickhouse-server` のメインログは、デフォルトで `/var/log/clickhouse-server/clickhouse-server.log` にあります。

サーバーが正常に起動した場合、次の文字列が表示されるはずです:

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーは稼働しており接続の準備ができています。

`clickhouse-server` の起動が設定エラーで失敗した場合、エラーの説明を含む `<Error>` 文字列が表示されるはずです。例えば:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの最後にエラーが表示されない場合、次の文字列から始まるファイル全体を確認してください:

```plaintext
<Information> Application: starting up.
```

サーバーで `clickhouse-server` の2番目のインスタンスを起動しようとすると、次のようなログが表示されます:

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

#### system.d のログを見る {#see-systemd-logs}

`clickhouse-server` のログに有用な情報が見つからない場合やログが存在しない場合は、次のコマンドを使用して `system.d` のログを表示できます:

```shell
sudo journalctl -u clickhouse-server
```

#### インタラクティブモードで clickhouse-server を起動する {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、autostart スクリプトの標準パラメータでサーバーをインタラクティブアプリとして起動します。このモードでは `clickhouse-server` はコンソールにすべてのイベントメッセージを出力します。

### 設定パラメータ {#configuration-parameters}

チェック:

1. Docker 設定:

    - ClickHouse を IPv6 ネットワークの Docker で実行する場合は、`network=host` が設定されていることを確認してください。

1. エンドポイント設定。
    - [listen_host](/operations/server-configuration-parameters/settings#listen_host) と [tcp_port](/operations/server-configuration-parameters/settings#tcp_port) の設定を確認してください。
    - ClickHouse サーバーはデフォルトで localhost 接続のみを受け入れます。

1. HTTP プロトコル設定:

    - HTTP API のプロトコル設定を確認してください。

1. セキュア接続設定。

    - 確認:
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure) 設定。
        - [SSL 証明書](/operations/server-configuration-parameters/settings#openssl) の設定。
    - 接続時に適切なパラメータを使用してください。例えば、`clickhouse_client` で `port_secure` パラメータを使用します。

1. ユーザー設定:

    - 誤ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#query-processing}

ClickHouse がクエリを処理できない場合、クライアントにエラー説明を送信します。`clickhouse-client` では、コンソールにエラーの説明が表示されます。HTTP インターフェイスを使用している場合、ClickHouse はレスポンスボディにエラーの説明を送信します。例えば:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメータで起動すると、ClickHouse はエラーの説明とともにサーバースタックトレースを返します。

切断された接続に関するメッセージが表示されることがあります。この場合、クエリを再実行できます。クエリを実行するたびに接続が切断される場合は、サーバーログを確認してエラーを探してください。

## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouse が非常に遅く動作している場合、クエリのサーバーリソースとネットワークの負荷をプロファイリングする必要があります。

`clickhouse-benchmark` ユーティリティを使用してクエリをプロファイリングできます。これは、1 秒あたりに処理されたクエリの数、1 秒あたりに処理された行の数、クエリ処理時間のパーセンタイルを表示します。
