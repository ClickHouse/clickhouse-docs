---
'title': 'トラブルシューティング'
'description': 'インストール トラブルシューティング ガイド'
'slug': '/guides/troubleshooting'
'doc_type': 'guide'
---

## インストール {#installation}

### apt-keyでkeyserver.ubuntu.comからGPGキーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key`の機能は、[Advanced package tool (APT)が非推奨になりました](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。ユーザーは代わりに`gpg`コマンドを使用する必要があります。詳細については、[インストールガイド](../getting-started/install/install.mdx)の記事を参照してください。

### gpgでkeyserver.ubuntu.comからGPGキーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg`がインストールされているか確認してください：

```shell
sudo apt-get install gnupg
```

### apt-getでClickHouseリポジトリからdebパッケージを取得できない {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォール設定を確認してください。
1. 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install/install.mdx)の記事に従ってパッケージをダウンロードし、`sudo dpkg -i <packages>`コマンドを使用して手動でインストールしてください。`tzdata`パッケージも必要です。

### apt-getでClickHouseリポジトリからdebパッケージを更新できない {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

GPGキーが変更された場合にこの問題が発生する可能性があります。

リポジトリの構成を更新するには、[セットアップ](/install/debian_ubuntu)ページのマニュアルを使用してください。

### `apt-get update`で異なる警告が表示される {#you-get-different-warnings-with-apt-get-update}

完了した警告メッセージは以下のいずれかです：

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

上記の問題を解決するには、以下のスクリプトを使用してください：

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yumでパッケージが取得できないのは署名が無効だから {#cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題：キャッシュが無効です。2022年9月のGPGキー更新後に壊れた可能性があります。

解決策は、Yumのキャッシュとlibディレクトリをクリーンアップすることです：

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](/install/redhat)に従ってください。

## サーバーへの接続 {#connecting-to-the-server}

考えられる問題：

- サーバーが稼働していない。
- 予期しないまたは間違った構成パラメータ。

### サーバーが稼働していない {#server-is-not-running}

#### サーバーが稼働しているか確認する {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが稼働していない場合は、以下のコマンドで起動してください：

```shell
sudo service clickhouse-server start
```

#### ログを確認する {#check-the-logs}

`clickhouse-server`の主なログは、デフォルトで`/var/log/clickhouse-server/clickhouse-server.log`にあります。

サーバーが正常に起動した場合は、次の文字列が表示されます：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが稼働中で接続の準備が整いました。

`clickhouse-server`が構成エラーで起動に失敗した場合は、エラー記述が含まれた`<Error>`文字列が表示されます。例：

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの最後にエラーが表示されない場合は、次の文字列から始まるファイル全体を確認してください：

```plaintext
<Information> Application: starting up.
```

サーバー上で`clickhouse-server`の2番目のインスタンスを起動しようとすると、次のログが表示されます：

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

#### system.dログを確認する {#see-systemd-logs}

`clickhouse-server`のログに有用な情報が見つからなかった場合、またはログが存在しない場合は、次のコマンドを使用して`system.d`ログを表示できます：

```shell
sudo journalctl -u clickhouse-server
```

#### インタラクティブモードでclickhouse-serverを起動する {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、オートスタートスクリプトの標準パラメータを使用して、インタラクティブアプリとしてサーバーを起動します。このモードでは、`clickhouse-server`はコンソールにすべてのイベントメッセージを印刷します。

### 構成パラメータ {#configuration-parameters}

確認してください：

1. Docker設定：

    - Docker内でClickHouseをIPv6ネットワークで実行している場合は、`network=host`が設定されていることを確認してください。

1. エンドポイント設定。
    - [listen_host](/operations/server-configuration-parameters/settings#listen_host)および[tcp_port](/operations/server-configuration-parameters/settings#tcp_port)の設定を確認してください。
    - ClickHouseサーバーは、デフォルトではlocalhost接続のみを受け入れます。

1. HTTPプロトコル設定：

    - HTTP APIのためのプロトコル設定を確認してください。

1. セキュア接続設定。

    - 次を確認してください：
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure)設定。
        - [SSL証明書](/operations/server-configuration-parameters/settings#openssl)の設定。
    - 接続時に適切なパラメータを使用してください。例えば、`clickhouse_client`で`port_secure`パラメータを使用します。

1. ユーザー設定：

    - 間違ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#query-processing}

ClickHouseがクエリを処理できない場合、クライアントにエラー記述を送信します。`clickhouse-client`では、コンソールにエラーの説明が表示されます。HTTPインターフェイスを使用している場合、ClickHouseは応答ボディ内にエラー記述を送信します。例えば：

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`を`stack-trace`パラメータで起動すると、ClickHouseはエラーの説明を含むサーバースタックトレースを返します。

接続が切断されたとのメッセージが表示されることがあります。この場合、クエリを繰り返すことができます。クエリを実行するたびに接続が切断される場合は、サーバーログにエラーがないか確認してください。

## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouseが非常に遅く動作していることがわかった場合、サーバーリソースとネットワークへの負荷をプロファイリングする必要があります。

クエリをプロファイリングするには、clickhouse-benchmarkユーティリティを使用できます。これにより、1秒あたりに処理されるクエリの数、1秒あたりに処理される行の数、およびクエリ処理時間のパーセンタイルが表示されます。
