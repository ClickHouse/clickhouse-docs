---
{}
---



[//]: # (このファイルは FAQ > トラブルシューティング に含まれています)

- [インストール](#troubleshooting-installation-errors)
- [サーバーへの接続](#troubleshooting-accepts-no-connections)
- [クエリ処理](#troubleshooting-does-not-process-queries)
- [クエリ処理の効率](#troubleshooting-too-slow)

## インストール {#troubleshooting-installation-errors}

### Apt-getでClickHouseリポジトリからDebパッケージを取得できない {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- ファイアウォール設定を確認してください。
- リポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md)記事に記載された手順でパッケージをダウンロードし、`sudo dpkg -i <packages>`コマンドを使って手動でインストールしてください。また、`tzdata`パッケージも必要です。

### Apt-getでClickHouseリポジトリからDebパッケージを更新できない {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- GPGキーが変更された場合に問題が発生することがあります。

リポジトリの設定を更新するには、[セットアップ](../getting-started/install.md#setup-the-debian-repository)ページのマニュアルを使用してください。

### `apt-get update`で異なる警告が表示される {#you-get-different-warnings-with-apt-get-update}

- 完全な警告メッセージは次のいずれかです：

```bash
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' はアーキテクチャ 'i386' をサポートしていないため、設定されたファイル 'main/binary-i386/Packages' の取得をスキップしました
```

```bash
E: https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz の取得に失敗しました。ファイルのサイズが予期しないものでした (30451 != 28154)。ミラーの同期中ですか？
```

```text
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Origin' 値が 'Artifactory' から 'ClickHouse' に変更されました
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Label' 値が 'Artifactory' から 'ClickHouse' に変更されました
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Suite' 値が 'stable' から '' に変更されました
N: この変更は明示的に受け入れる必要があります。このリポジトリの更新を適用する前に。詳細は apt-secure(8) マニュアルページを参照してください。
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400  Bad Request [IP: 172.66.40.249 443]
```

上記の問題を解決するために、次のスクリプトを使用してください：

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yumで誤った署名のためにパッケージを取得できない {#you-cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題：キャッシュが壊れている可能性があり、2022-09のGPGキーの更新後に壊れたかもしれません。

解決策は、yumのキャッシュとlibディレクトリをクリアすることです：

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](../getting-started/install.md#from-rpm-packages)に従ってください。

### Dockerコンテナを実行できない {#you-cant-run-docker-container}

`docker run clickhouse/clickhouse-server`を実行していて、次のようなスタックトレースでクラッシュします：

```bash
$ docker run -it clickhouse/clickhouse-server
........
Poco::Exception. Code: 1000, e.code() = 0, System exception: cannot start thread, Stack trace (このメッセージをコピーする際は、必ず以下の行を含めてください):

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
 (version 24.10.1.2812 (公式ビルド))
```

理由は、`20.10.10`未満の古いdockerデーモンです。これを修正する方法は、アップグレードするか、`docker run [--privileged | --security-opt seccomp=unconfined]`を実行することです。後者にはセキュリティ上の影響があります。

## サーバーへの接続 {#troubleshooting-accepts-no-connections}

考えられる問題：

- サーバーが実行されていない。
- 予期しない、または誤った設定パラメータ。

### サーバーが実行されていない {#server-is-not-running}

**サーバーが実行中か確認する**

コマンド：

```bash
$ sudo service clickhouse-server status
```

サーバーが実行されていない場合は、次のコマンドで開始します：

```bash
$ sudo service clickhouse-server start
```

**ログを確認する**

`clickhouse-server`のメインログはデフォルトで `/var/log/clickhouse-server/clickhouse-server.log` にあります。

サーバーが正常にスタートした場合、次の文字列を見ることができます：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で、接続を受け付ける準備ができています。

`clickhouse-server`の起動が構成エラーで失敗した場合、エラーを説明する`<Error>`文字列が表示されます。例えば：

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 'event2id' 外部辞書の再読み込みに失敗しました: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの最後にエラーが表示されていない場合は、次の文字列からファイル全体を確認してください：

```text
<Information> Application: starting up.
```

サーバー上で `clickhouse-server` の二重インスタンスを起動しようとすると、次のログが表示されます：

```text
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : ClickHouse 19.1.0 を54413のリビジョンで起動中
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: ステータスファイル ./status が既に存在します - クリーンでない再起動。内容：
PID: 8510
開始時刻: 2019-01-11 15:24:23
リビジョン: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: ファイル ./status をロックできません。別のサーバーインスタンスが同じディレクトリで既に実行中です。
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: シャットダウン中
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: サブシステムの初期化解除中: ロギングサブシステム
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

**system.dログを確認する**

`clickhouse-server`のログに有用な情報が見つからない、またはログがない場合は、以下のコマンドを使用して`system.d`ログを見ることができます：

```bash
$ sudo journalctl -u clickhouse-server
```

**インタラクティブモードでclickhouse-serverを起動する**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、標準の自動起動スクリプトのパラメータで、サーバーをインタラクティブアプリケーションとして起動します。このモードでは、`clickhouse-server`がすべてのイベントメッセージをコンソールに出力します。

### 設定パラメータ {#configuration-parameters}

以下を確認してください：

- Docker設定。

    DockerでClickHouseをIPv6ネットワークで実行する場合は、`network=host`が設定されていることを確認してください。

- エンドポイント設定。

    [listen_host](../operations/server-configuration-parameters/settings.md#listen_host) と [tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port) の設定を確認してください。

    ClickHouseサーバーはデフォルトでlocalhostの接続のみを受け入れます。

- HTTPプロトコル設定。

    HTTP APIのプロトコル設定を確認してください。

- 安全な接続設定。

    - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure) 設定をチェックしてください。
    - [SSL証明書](../operations/server-configuration-parameters/settings.md#openssl)の設定。

    接続時に適切なパラメータを使用してください。例えば、`clickhouse_client`で`port_secure`パラメータを使用します。

- ユーザー設定。

    誤ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#troubleshooting-does-not-process-queries}

ClickHouseがクエリを処理できない場合、エラーの説明がクライアントに送信されます。`clickhouse-client`の場合、コンソールにエラーの説明が表示されます。HTTPインターフェイスを使用している場合、ClickHouseはレスポンスボディにエラーの説明を送信します。例えば：

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: 不明な識別子: a。クエリにテーブル (FROM句) がないことに注意してください。context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`を`stack-trace`パラメータで起動すると、ClickHouseはエラーの説明と共にサーバースタックトレースを返します。

接続の切断に関するメッセージが表示されることがあります。この場合、クエリを再実行できます。クエリを実行するたびに接続が切断される場合は、サーバーログでエラーを確認してください。

## クエリ処理の効率 {#troubleshooting-too-slow}

ClickHouseが非常に遅く動作している場合、サーバーリソースとネットワークの負荷をプロファイルする必要があります。

クエリをプロファイルするには、clickhouse-benchmarkユーティリティを使用できます。これにより、秒ごとに処理されるクエリの数、秒ごとに処理される行の数、およびクエリ処理時間のパーセンタイルが表示されます。
