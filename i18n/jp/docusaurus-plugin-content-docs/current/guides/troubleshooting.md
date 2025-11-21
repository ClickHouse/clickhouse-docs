---
title: 'トラブルシューティング'
description: 'インストール時のトラブルシューティングガイド'
slug: /guides/troubleshooting
doc_type: 'guide'
keywords: ['トラブルシューティング', 'デバッグ', '問題解決', 'エラー', '診断']
---



## インストール {#installation}

### apt-keyでkeyserver.ubuntu.comからGPGキーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

[Advanced package tool (APT)](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)の`apt-key`機能は非推奨となりました。代わりに`gpg`コマンドを使用してください。詳細は[インストールガイド](../getting-started/install/install.mdx)を参照してください。

### gpgでkeyserver.ubuntu.comからGPGキーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg`がインストールされているか確認してください:

```shell
sudo apt-get install gnupg
```

### apt-getでClickHouseリポジトリからdebパッケージを取得できない {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォール設定を確認してください。
1. 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install/install.mdx)に記載されている方法でパッケージをダウンロードし、`sudo dpkg -i <packages>`コマンドを使用して手動でインストールしてください。`tzdata`パッケージも必要になります。

### apt-getでClickHouseリポジトリからdebパッケージを更新できない {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

この問題はGPGキーが変更された際に発生する可能性があります。

リポジトリ設定を更新するには、[セットアップ](/install/debian_ubuntu)ページの手順を使用してください。

### `apt-get update`で様々な警告が表示される {#you-get-different-warnings-with-apt-get-update}

表示される警告メッセージは以下のいずれかです:

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

### 署名が正しくないためYumでパッケージを取得できない {#cant-get-packages-with-yum-because-of-wrong-signature}

考えられる原因: キャッシュが破損している可能性があります。2022年9月のGPGキー更新後に破損した可能性があります。

解決方法は、Yumのキャッシュとlibディレクトリをクリーンアップすることです:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](/install/redhat)に従ってください


## サーバーへの接続 {#connecting-to-the-server}

発生する可能性のある問題:

- サーバーが起動していない。
- 予期しない、または誤った設定パラメータ。

### サーバーが起動していない {#server-is-not-running}

#### サーバーが起動しているか確認する {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが起動していない場合は、次のコマンドで起動してください:

```shell
sudo service clickhouse-server start
```

#### ログを確認する {#check-the-logs}

`clickhouse-server`のメインログは、デフォルトで`/var/log/clickhouse-server/clickhouse-server.log`にあります。

サーバーが正常に起動した場合、次の文字列が表示されます:

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で、接続を受け付ける準備ができています。

`clickhouse-server`の起動が設定エラーで失敗した場合、エラーの説明とともに`<Error>`文字列が表示されます。例:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの末尾にエラーが表示されない場合は、次の文字列から始まるファイル全体を確認してください:

```plaintext
<Information> Application: starting up.
```

サーバー上で`clickhouse-server`の2つ目のインスタンスを起動しようとすると、次のログが表示されます:

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

#### systemdログを確認する {#see-systemd-logs}

`clickhouse-server`ログに有用な情報が見つからない場合、またはログが存在しない場合は、次のコマンドで`systemd`ログを確認できます:

```shell
sudo journalctl -u clickhouse-server
```

#### clickhouse-serverを対話モードで起動する {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、自動起動スクリプトの標準パラメータを使用して、サーバーを対話型アプリケーションとして起動します。このモードでは、`clickhouse-server`はすべてのイベントメッセージをコンソールに出力します。

### 設定パラメータ {#configuration-parameters}

確認事項:

1. Docker設定:
   - IPv6ネットワークのDocker内でClickHouseを実行する場合は、`network=host`が設定されていることを確認してください。

1. エンドポイント設定。
   - [listen_host](/operations/server-configuration-parameters/settings#listen_host)と[tcp_port](/operations/server-configuration-parameters/settings#tcp_port)の設定を確認してください。
   - ClickHouseサーバーは、デフォルトでlocalhostからの接続のみを受け付けます。

1. HTTPプロトコル設定:
   - HTTP APIのプロトコル設定を確認してください。

1. セキュア接続設定。
   - 確認事項:
     - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure)設定。
     - [SSL証明書](/operations/server-configuration-parameters/settings#openssl)の設定。
   - 接続時には適切なパラメータを使用してください。例えば、`clickhouse_client`では`port_secure`パラメータを使用します。

1. ユーザー設定:
   - 誤ったユーザー名またはパスワードを使用している可能性があります。


## クエリ処理 {#query-processing}

ClickHouseがクエリを処理できない場合、クライアントにエラーの説明を送信します。`clickhouse-client`では、コンソールにエラーの説明が表示されます。HTTPインターフェースを使用している場合、ClickHouseはレスポンスボディにエラーの説明を送信します。例:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`を`stack-trace`パラメータ付きで起動すると、ClickHouseはエラーの説明とともにサーバーのスタックトレースを返します。

接続が切断されたというメッセージが表示されることがあります。この場合、クエリを再実行できます。クエリを実行するたびに接続が切断される場合は、サーバーログでエラーを確認してください。


## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouseの動作が遅いと感じた場合は、クエリに対するサーバーリソースとネットワークの負荷をプロファイリングする必要があります。

clickhouse-benchmarkユーティリティを使用してクエリをプロファイリングできます。このユーティリティは、1秒あたりの処理クエリ数、1秒あたりの処理行数、およびクエリ処理時間のパーセンタイルを表示します。
