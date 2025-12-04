
[//]: # (This file is included in FAQ > Troubleshooting)

- [インストール](#troubleshooting-installation-errors)
- [サーバーへの接続](#troubleshooting-accepts-no-connections)
- [クエリ処理](#troubleshooting-does-not-process-queries)
- [クエリ処理のパフォーマンス](#troubleshooting-too-slow)

## インストール {#troubleshooting-installation-errors}

### apt-get を使用して ClickHouse リポジトリから deb パッケージを取得できない {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

* ファイアウォールの設定を確認してください。
* 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md)の記事で説明されているようにパッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールしてください。`tzdata` パッケージも必要です。

### apt-get を使用して ClickHouse リポジトリから deb パッケージを更新できない {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

* GPG キーが変更された場合にこの問題が発生することがあります。

リポジトリ設定を更新するには、[セットアップ](../getting-started/install.md#setup-the-debian-repository) ページの手順に従ってください。

### `apt-get update` でさまざまな警告が表示される {#you-get-different-warnings-with-apt-get-update}

* 実際の警告メッセージは次のいずれかになります:

```bash
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' はアーキテクチャ 'i386' に対応していないため、設定ファイル 'main/binary-i386/Packages' の取得をスキップします
```

```bash
E: https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz の取得に失敗しました  ファイルサイズが想定と異なります (30451 != 28154)。ミラー同期中ですか?
```

```text
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Origin' 値が 'Artifactory' から 'ClickHouse' に変更されました
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Label' 値が 'Artifactory' から 'ClickHouse' に変更されました
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Suite' 値が 'stable' から '' に変更されました
N: このリポジトリの更新を適用するには、明示的に承認する必要があります。詳細は apt-secure(8) マニュアルページを参照してください。
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Bad Request [IP: 172.66.40.249 443]
```

上記の問題を解決するには、以下のスクリプトを使用してください。

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 誤った署名が原因で yum からパッケージを取得できない {#you-cant-get-packages-with-yum-because-of-wrong-signature}

起こりうる原因: キャッシュが不正です。2022 年 9 月に GPG キーを更新した後に壊れた可能性があります。

解決策は、yum のキャッシュと lib ディレクトリをクリアすることです。

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後は、[インストールガイド](../getting-started/install.md#from-rpm-packages) に従ってください。

### Docker コンテナを実行できない {#you-cant-run-docker-container}

単純に `docker run clickhouse/clickhouse-server` を実行すると、以下のようなスタックトレースが出力されてクラッシュします。

```bash
$ docker run -it clickhouse/clickhouse-server
........
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (このメッセージをコピーする際は、以下の行を必ず含めてください):
```

0. Poco::ThreadImpl::startImpl(Poco::SharedPtr<Poco::Runnable, Poco::ReferenceCounter, Poco::ReleasePolicy<Poco::Runnable>>) @ 0x00000000157c7b34
1. Poco::Thread::start(Poco::Runnable&) @ 0x00000000157c8a0e
2. BaseDaemon::initializeTerminationAndSignalProcessing() @ 0x000000000d267a14
3. BaseDaemon::initialize(Poco::Util::Application&) @ 0x000000000d2652cb
4. DB::Server::initialize(Poco::Util::Application&) @ 0x000000000d128b38
5. Poco::Util::Application::run() @ 0x000000001581cfda
6. DB::Server::run() @ 0x000000000d1288f0
7. Poco::Util::ServerApplication::run(int, char\*\*) @ 0x0000000015825e27
8. mainEntryClickHouseServer(int, char\*\*) @ 0x000000000d125b38
9. main @ 0x0000000007ea4eee
10. ? @ 0x00007f67ff946d90
11. ? @ 0x00007f67ff946e40
12. \_start @ 0x00000000062e802e
    (version 24.10.1.2812 (official build))

```

原因は、`20.10.10`より古いバージョンのDockerデーモンです。修正するには、アップグレードするか、`docker run [--privileged | --security-opt seccomp=unconfined]`を実行してください。後者にはセキュリティ上の影響があります。

```

## サーバーへの接続 {#troubleshooting-accepts-no-connections}

想定される問題:

* サーバーが起動していない
* 想定外または誤った設定パラメータ

### サーバーが起動していない {#server-is-not-running}

**サーバーが起動しているか確認する**

コマンド:

```bash
$ sudo service clickhouse-server status
```

サーバーが起動していない場合は、次のコマンドで起動してください。

```bash
$ sudo service clickhouse-server start
```

**ログを確認する**

`clickhouse-server` のメインログは、デフォルトで `/var/log/clickhouse-server/clickhouse-server.log` に出力されます。

サーバーが正常に起動していれば、次のような行が表示されます。

* `<Information> Application: starting up.` — サーバーが起動しました。
* `<Information> Application: Ready for connections.` — サーバーが稼働中で、接続を受け付ける準備ができています。

`clickhouse-server` の起動が設定エラーで失敗した場合は、エラー内容の説明とともに `<Error>` という行が表示されます。例えば、次のようになります。

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 外部ディクショナリ 'event2id' の再読み込みに失敗しました: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの末尾にエラーが表示されていない場合は、次の文字列以降を起点にファイル全体を確認してください。

```text
<Information> Application: 起動中。
```

サーバー上で 2 つ目の `clickhouse-server` インスタンスを起動しようとすると、次のようなログが表示されます。

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

**systemd のログを確認する**

`clickhouse-server` のログに有用な情報が見つからない場合や、ログ自体が存在しない場合は、次のコマンドを実行して `systemd` のログを確認できます。

```bash
$ sudo journalctl -u clickhouse-server
```

**対話モードで clickhouse-server を起動する**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、autostart スクリプトの標準パラメータを使用してサーバーを対話型アプリケーションとして起動します。このモードでは、`clickhouse-server` はすべてのイベントメッセージをコンソールに出力します。

### 設定パラメータ {#configuration-parameters}

次の点を確認します。

* Docker 設定

  IPv6 ネットワーク上の Docker で ClickHouse を実行している場合は、`network=host` が設定されていることを確認します。

* エンドポイント設定

  [listen&#95;host](../operations/server-configuration-parameters/settings.md#listen_host) と [tcp&#95;port](../operations/server-configuration-parameters/settings.md#tcp_port) の設定を確認します。

  ClickHouse サーバーは、デフォルトでは localhost からの接続のみを受け付けます。

* HTTP プロトコル設定

  HTTP API のプロトコル設定を確認します。

* セキュア接続の設定

  次を確認します。

  * [tcp&#95;port&#95;secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) の設定
  * [SSL certificates](../operations/server-configuration-parameters/settings.md#openssl) の設定

    接続時には適切なパラメータを使用します。たとえば、`clickhouse_client` では `port_secure` パラメータを使用します。

* ユーザー設定

  誤ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#troubleshooting-does-not-process-queries}

ClickHouse がクエリを処理できない場合、エラー内容の説明をクライアントに送信します。`clickhouse-client` を使用している場合は、コンソール上でエラー内容を確認できます。HTTP インターフェイスを使用している場合は、ClickHouse はレスポンスボディ内にエラーの説明を送信します。例えば次のとおりです。

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメータを指定して起動すると、ClickHouse はエラーの説明とともにサーバーのスタックトレースを返します。

接続が切断されたことを示すメッセージが表示される場合があります。この場合は、クエリを再実行してみてください。クエリを実行するたびに接続が切断される場合は、サーバーログにエラーが出力されていないか確認してください。

## クエリ処理の効率 {#troubleshooting-too-slow}

ClickHouse の動作が遅すぎると感じる場合は、クエリに対するサーバーリソースやネットワークへの負荷をプロファイリングする必要があります。

`clickhouse-benchmark` ユーティリティを使用してクエリをプロファイリングできます。1 秒あたりのクエリ処理数、1 秒あたりの行処理数、およびクエリ処理時間のパーセンタイルを表示します。
