
[//]: # (このファイルは FAQ > トラブルシューティング に含まれています)

- [インストール](#troubleshooting-installation-errors)
- [サーバーへの接続](#troubleshooting-accepts-no-connections)
- [クエリ処理](#troubleshooting-does-not-process-queries)
- [クエリ処理の効率](#troubleshooting-too-slow)

## インストール {#troubleshooting-installation-errors}

### Apt-get で ClickHouse リポジトリから Deb パッケージを取得できない {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- ファイアウォールの設定を確認してください。
- 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md)の記事に記載されている手順に従ってパッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールしてください。また、`tzdata` パッケージも必要です。

### Apt-get で ClickHouse リポジトリから Deb パッケージを更新できない {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- これは GPG キーが変更された場合に発生することがあります。

リポジトリの構成を更新するには、[セットアップ](../getting-started/install.md#setup-the-debian-repository)ページの手順を使用してください。

### `apt-get update`で異なる警告を取得する {#you-get-different-warnings-with-apt-get-update}

- 完了した警告メッセージは以下のいずれかです：

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

上記の問題を解決するには、次のスクリプトを使用してください：

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yum でパッケージが信号の誤りで取得できない {#you-cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題：キャッシュが間違っている、2022-09 に GPG キーが更新された後に壊れた可能性があります。

解決策は、yum のキャッシュおよび lib ディレクトリをクリアすることです：

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](../getting-started/install.md#from-rpm-packages)に従ってください。

### Docker コンテナを実行できない {#you-cant-run-docker-container}

`docker run clickhouse/clickhouse-server`を実行していると、以下のようなスタックトレースでクラッシュします：

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

理由は、`20.10.10`未満のバージョンの古い Docker デーモンです。修正方法は、アップグレードするか、`docker run [--privileged | --security-opt seccomp=unconfined]`を実行することです。後者にはセキュリティ上の影響があります。

## サーバーへの接続 {#troubleshooting-accepts-no-connections}

考えられる問題：

- サーバーが実行されていない。
- 予期しないまたは誤った設定パラメータ。

### サーバーが実行されていない {#server-is-not-running}

**サーバーが実行されているか確認する**

コマンド：

```bash
$ sudo service clickhouse-server status
```

サーバーが実行されていない場合は、次のコマンドで起動します：

```bash
$ sudo service clickhouse-server start
```

**ログを確認する**

`clickhouse-server`のメインログはデフォルトで `/var/log/clickhouse-server/clickhouse-server.log` にあります。

サーバーが正常に起動すると、次の文字列が表示されます：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で接続の準備が整いました。

もし `clickhouse-server` の起動が設定エラーで失敗した場合は、エラーメッセージのある `<Error>` 文字列が表示されるべきです。例えば：

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: Failed reloading 'event2id' external dictionary: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの終わりにエラーが表示されていない場合、次の文字列からファイル全体を確認してください：

```text
<Information> Application: starting up.
```

サーバー上で `clickhouse-server` の別のインスタンスを起動しようとすると、次のログが表示されます：

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

**system.d ログを確認する**

`clickhouse-server` のログに有用な情報が見つからない場合、またはログが存在しない場合は、次のコマンドを使用して `system.d` ログを表示できます：

```bash
$ sudo journalctl -u clickhouse-server
```

**インタラクティブモードで clickhouse-server を起動する**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、サーバーをインタラクティブアプリケーションとして標準パラメータで起動します。このモードでは、`clickhouse-server` はすべてのイベントメッセージをコンソールに出力します。

### 設定パラメータ {#configuration-parameters}

確認してください：

- Docker の設定。

    IPv6 ネットワークで ClickHouse を Docker で実行している場合は、`network=host` が設定されていることを確認してください。

- エンドポイント設定。

    [listen_host](../operations/server-configuration-parameters/settings.md#listen_host) および [tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port) の設定を確認します。

    ClickHouse サーバーはデフォルトで localhost 接続のみを受け入れます。

- HTTP プロトコル設定。

    HTTP API のプロトコル設定を確認します。

- セキュア接続設定。

    確認してください：

    - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) の設定。
    - [SSL証明書](../operations/server-configuration-parameters/settings.md#openssl) の設定。

    接続時に適切なパラメータを使用します。例えば、`clickhouse_client` で `port_secure` パラメータを使用します。

- ユーザー設定。

    誤ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#troubleshooting-does-not-process-queries}

ClickHouse がクエリを処理できない場合、エラーがクライアントに送信されます。`clickhouse-client` ではコンソールにエラーの説明が表示されます。HTTP インターフェースを使用している場合、ClickHouse はレスポンスボディにエラーの説明を送信します。例えば：

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメータで起動すると、ClickHouse はエラーの説明とともにサーバースタックトレースを返します。

切断された接続についてのメッセージが表示されることがあります。この場合、クエリを繰り返すことができます。クエリを実行するたびに接続が切断される場合は、サーバーログを確認してエラーを探してください。

## クエリ処理の効率 {#troubleshooting-too-slow}

ClickHouse の動作が非常に遅い場合、サーバーリソースとネットワークへの負荷をプロファイルする必要があります。

`clickhouse-benchmark` ユーティリティを使用してクエリをプロファイルできます。これにより、1 秒あたりに処理されたクエリ数、1 秒あたりに処理された行数、およびクエリ処理時間のパーセンタイルが表示されます。
```
