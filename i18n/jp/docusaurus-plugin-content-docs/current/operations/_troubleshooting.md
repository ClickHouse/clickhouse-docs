[//]: # (このファイルは FAQ > トラブルシューティング に含まれています)

- [インストール](#troubleshooting-installation-errors)
- [サーバーへの接続](#troubleshooting-accepts-no-connections)
- [クエリ処理](#troubleshooting-does-not-process-queries)
- [クエリ処理の効率](#troubleshooting-too-slow)

## インストール {#troubleshooting-installation-errors}

### apt-get で ClickHouse リポジトリから deb パッケージを取得できない {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- ファイアウォールの設定を確認してください。
- リポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md)の記事に記載されている手順でパッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールしてください。 `tzdata` パッケージも必要です。

### apt-get で ClickHouse リポジトリから deb パッケージを更新できない {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- GPG キーが変更された場合にこの問題が発生することがあります。

リポジトリの設定を更新するには、[セットアップ](../getting-started/install.md#setup-the-debian-repository) ページのマニュアルを使用してください。

### `apt-get update` で異なる警告が表示される {#you-get-different-warnings-with-apt-get-update}

- 完全な警告メッセージは、以下のいずれかになります：

```bash
N: Skipping acquire of configured file 'main/binary-i386/Packages' as repository 'https://packages.clickhouse.com/deb stable InRelease' doesn't support architecture 'i386'
```

```bash
E: Failed to fetch https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz  File has unexpected size (30451 != 28154). Mirror sync in progress?
```

```text
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Origin' value from 'Artifactory' to 'ClickHouse'
E: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Label' value from 'Artifactory' to 'ClickHouse'
N: Repository 'https://packages.clickhouse.com/deb stable InRelease' changed its 'Suite' value from 'stable' to ''
N: This must be accepted explicitly before updates for this repository can be applied. See apt-secure(8) manpage for details.
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Bad Request [IP: 172.66.40.249 443]
```

上記の問題を解決するには、以下のスクリプトを使用してください：

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### yum で間違った署名のためにパッケージを取得できない {#you-cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題：キャッシュが破損しているため、2022-09 に GPG キーを更新した後に壊れた可能性があります。

解決策は、yum 用のキャッシュと lib ディレクトリをクリアすることです：

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](../getting-started/install.md#from-rpm-packages)に従ってください。

### Docker コンテナを実行できない {#you-cant-run-docker-container}

シンプルな `docker run clickhouse/clickhouse-server` を実行していて、以下に似たスタックトレースでクラッシュします：

```bash
$ docker run -it clickhouse/clickhouse-server
........
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (when copying this message, always include the lines below):

0. Poco::ThreadImpl::startImpl(Poco::SharedPtr<Poco::Runnable, Poco::ReferenceCounter, Poco::ReleasePolicy<Poco::Runnable>>) @ 0x00000000157c7b34
1. Poco::Thread::start(Poco::Runnable&) @ 0x00000000157c8a0e
2. BaseDaemon::initializeTerminationAndSignalProcessing() @ 0x000000000d267a14
3. BaseDaemon::initialize(Poco::Util::Application&) @ 0x000000000d2652cb
4. DB::Server::initialize(Poco::Util::Application&) @ 0x000000000d128b38
5. Poco::Util::Application::run() @ 0x000000001581cfda
6. DB::Server::run() @ 0x000000000d1288f0
7. Poco::Util::ServerApplication::run(int, char**) @ 0x0000000015825e27
8. mainEntryClickHouseServer(int, char**) @ 0x000000000d125b38
9. main @ 0x0000000007ea4eee
10. ? @ 0x00007f67ff946d90
11. ? @ 0x00007f67ff946e40
12. _start @ 0x00000000062e802e
 (version 24.10.1.2812 (official build))
```

理由は、バージョンが `20.10.10` よりも古い Docker デーモンです。解決策は、アップグレードするか、`docker run [--privileged | --security-opt seccomp=unconfined]` を実行することです。後者にはセキュリティ上の影響があります。

## サーバーへの接続 {#troubleshooting-accepts-no-connections}

考えられる問題：

- サーバーが起動していません。
- 予期しないまたは間違った設定パラメーター。

### サーバーが起動していない {#server-is-not-running}

**サーバーが起動しているか確認する**

コマンド：

```bash
$ sudo service clickhouse-server status
```

サーバーが起動していない場合は、次のコマンドで起動してください：

```bash
$ sudo service clickhouse-server start
```

**ログを確認する**

`clickhouse-server` のメインログは、デフォルトで `/var/log/clickhouse-server/clickhouse-server.log` にあります。

サーバーが正常に起動した場合、以下の文字列が表示されるはずです：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーは実行中であり、接続の準備が整っています。

もし `clickhouse-server` が設定エラーで失敗した場合、エラーの説明を含む `<Error>` 文字列が表示されるはずです。例えば：

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの末尾にエラーが表示されない場合は、以下の文字列からファイル全体を確認してください：

```text
<Information> Application: starting up.
```

サーバーで `clickhouse-server` の2番目のインスタンスを起動しようとすると、以下のログが表示されます：

```text
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

**system.d ログを見る**

`clickhouse-server` のログに役立つ情報が見つからない場合、またはログがない場合は、次のコマンドを使用して `system.d` のログを表示できます：

```bash
$ sudo journalctl -u clickhouse-server
```

**インタラクティブモードで clickhouse-server を起動する**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、オートスタートスクリプトの標準パラメーターでインタラクティブアプリケーションとしてサーバーを起動します。このモードでは、`clickhouse-server` はコンソールにすべてのイベントメッセージを出力します。

### 設定パラメーター {#configuration-parameters}

確認してください：

- Docker 設定。

  ClickHouse を IPv6 ネットワークの Docker で実行する場合、`network=host` が設定されていることを確認してください。

- エンドポイント設定。

  [listen_host](../operations/server-configuration-parameters/settings.md#listen_host) と [tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port) 設定を確認してください。

  ClickHouse サーバーは、デフォルトで localhost の接続のみを受け付けます。

- HTTP プロトコル設定。

  HTTP API のプロトコル設定を確認してください。

- セキュア接続設定。

  確認してください：

  - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) 設定。
  - [SSL証明書](../operations/server-configuration-parameters/settings.md#openssl) の設定。

  接続時に適切なパラメーターを使用してください。例えば、`clickhouse_client` で `port_secure` パラメーターを使用します。

- ユーザー設定。

  間違ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#troubleshooting-does-not-process-queries}

ClickHouse がクエリを処理できない場合、エラー説明がクライアントに送信されます。`clickhouse-client` でエラーの説明がコンソールに表示されます。HTTP インターフェースを使用している場合、ClickHouse はレスポンスボディにエラーの説明を送信します。例えば：

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメーターで起動すると、ClickHouse はサーバースタックトレースをエラーの説明とともに返します。

接続が切断されたというメッセージが表示されることがあります。この場合、クエリを再実行できます。クエリを実行するたびに接続が切れる場合は、サーバーログでエラーを確認してください。

## クエリ処理の効率 {#troubleshooting-too-slow}

ClickHouse の動作が非常に遅い場合は、クエリのためにサーバーリソースとネットワークの負荷をプロファイリングする必要があります。

クエリをプロファイリングするために clickhouse-benchmark ユーティリティを使用できます。これは、1 秒あたりに処理されたクエリの数、1 秒あたりに処理された行数、クエリ処理時間のパーセンタイルを示します。
