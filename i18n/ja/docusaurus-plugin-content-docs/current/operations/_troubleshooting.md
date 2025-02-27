[//]: # (このファイルは FAQ > トラブルシューティングに含まれています)

- [インストール](#troubleshooting-installation-errors)
- [サーバーへの接続](#troubleshooting-accepts-no-connections)
- [クエリ処理](#troubleshooting-does-not-process-queries)
- [クエリ処理の効率](#troubleshooting-too-slow)

## インストール {#troubleshooting-installation-errors}

### Apt-getでClickHouseリポジトリからDebパッケージを取得できない {#you-cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

- ファイアウォールの設定を確認してください。
- 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md)記事に従ってパッケージをダウンロードし、`sudo dpkg -i <packages>`コマンドを使用して手動でインストールしてください。`tzdata`パッケージも必要です。

### Apt-getでClickHouseリポジトリからDebパッケージを更新できない {#you-cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

- GPGキーが変更された場合に問題が発生する可能性があります。

リポジトリ設定を更新するには、[セットアップ](../getting-started/install.md#setup-the-debian-repository)ページのマニュアルを参照してください。

### `apt-get update`で異なる警告が表示される {#you-get-different-warnings-with-apt-get-update}

- 完了した警告メッセージは以下のいずれかです：

```bash
N: 'main/binary-i386/Packages'の取得をスキップしています。リポジトリ'https://packages.clickhouse.com/deb stable InRelease'はアーキテクチャ'i386'をサポートしていません
```

```bash
E: https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gzを取得できませんでした。ファイルのサイズが予期しない値です (30451 != 28154)。ミラーの同期が進行中ですか？
```

```text
E: リポジトリ'https://packages.clickhouse.com/deb stable InRelease'の'Origin'値が'Artifactory'から'ClickHouse'に変更されました
E: リポジトリ'https://packages.clickhouse.com/deb stable InRelease'の'Label'値が'Artifactory'から'ClickHouse'に変更されました
N: リポジトリ'https://packages.clickhouse.com/deb stable InRelease'の'Suite'値が'stable'から''に変更されました
N: この変更を明示的に受け入れる必要があります。このリポジトリの更新を適用する前に。詳細についてはapt-secure(8)マニュアルページを参照してください。
```

```bash
Err:11 https://packages.clickhouse.com/deb stable InRelease
  400 Bad Request [IP: 172.66.40.249 443]
```

上記の問題を解決するには、以下のスクリプトを使用してください：

```bash
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yumでパッケージを取得できないのは不正な署名のため {#you-cant-get-packages-with-yum-because-of-wrong-signature}

可能な問題：キャッシュが不正で、2022年9月のGPGキー更新後に壊れたかもしれません。

解決策は、yumのキャッシュとlibディレクトリをクリーンアップすることです：

```bash
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](../getting-started/install.md#from-rpm-packages)に従ってください。

### Dockerコンテナを実行できない {#you-cant-run-docker-container}

単純に `docker run clickhouse/clickhouse-server` を実行すると、次のようなスタックトレースでクラッシュします：

```bash
$ docker run -it clickhouse/clickhouse-server
........
2024.11.06 21:04:48.912036 [ 1 ] {} <Information> SentryWriter: クラッシュレポートの送信は無効です
Poco::Exception. コード: 1000, e.code() = 0, システム例外: スレッドを開始できません, スタックトレース（このメッセージをコピーする際は、常に以下の行を含めてください）:

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
 (バージョン 24.10.1.2812 (公式ビルド))
```

これの原因は、バージョンが `20.10.10` よりも古いDockerデーモンです。これを修正する方法は、アップグレードするか、`docker run [--privileged | --security-opt seccomp=unconfined]`を実行することです。後者はセキュリティに関する影響があります。

## サーバーへの接続 {#troubleshooting-accepts-no-connections}

可能な問題：

- サーバーが実行されていない。
- 予期しないか不正な構成パラメータ。

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

`clickhouse-server`のメインログは、デフォルトで`/var/log/clickhouse-server/clickhouse-server.log`にあります。

サーバーが正常に起動すると、次の文字列が表示されるはずです：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で、接続の準備が整いました。

`clickhouse-server`が構成エラーで起動に失敗した場合は、エラー記述が含まれた`<Error>`文字列が表示されます。例えば：

```text
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 'event2id'外部辞書の再読み込みに失敗しました: Poco::Exception. コード: 1000, e.code() = 111, e.displayText() = 接続が拒否されました, e.what() = 接続が拒否されました
```

ファイルの最後にエラーが表示されない場合は、次の文字列から始まる全ファイルを確認してください：

```text
<Information> Application: starting up.
```

サーバーで`clickhouse-server`の2番目のインスタンスを起動しようとすると、次のようなログが表示されます：

```text
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : ClickHouse 19.1.0をリビジョン54413で起動しています
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: ステータスファイル ./status はすでに存在します - 不完全な再起動。内容：
PID: 8510
開始日: 2019-01-11 15:24:23
リビジョン: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: ファイル ./status にロックできません。すでに同じディレクトリで別のサーバーインスタンスが実行中です。
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: シャットダウンしています
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: サブシステムを初期化解除しています: ロギングサブシステム
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: Stop SignalListener thread
```

**system.dロギングを確認する**

`clickhouse-server`ログに有用な情報が見つからない場合や、ログがない場合は、次のコマンドを使用して`system.d`ログを表示できます：

```bash
$ sudo journalctl -u clickhouse-server
```

**対話モードでclickhouse-serverを起動する**

```bash
$ sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、サーバーを対話型アプリとして標準の自動起動スクリプトのパラメータで起動します。このモードでは、`clickhouse-server`はすべてのイベントメッセージをコンソールに出力します。

### 構成パラメータ {#configuration-parameters}

確認すべきこと：

- Docker設定。

    IPv6ネットワークでDocker内でClickHouseを実行している場合は、`network=host`が設定されていることを確認してください。

- エンドポイント設定。

    [listen_host](../operations/server-configuration-parameters/settings.md#listen_host)と[tcp_port](../operations/server-configuration-parameters/settings.md#tcp_port)の設定を確認します。

    ClickHouseサーバーはデフォルトでローカルホスト接続のみを受け入れます。

- HTTPプロトコル設定。

    HTTP APIのプロトコル設定を確認します。

- セキュア接続設定。

    以下を確認してください：

    - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#tcp_port_secure)設定。
    - [SSL証明書](../operations/server-configuration-parameters/settings.md#openssl)の設定。

    接続時には適切なパラメータを使用してください。例えば、`clickhouse_client`と共に`port_secure`パラメータを使用します。

- ユーザー設定。

    誤ったユーザー名またはパスワードを使用している可能性があります。

## クエリ処理 {#troubleshooting-does-not-process-queries}

ClickHouseがクエリを処理できない場合、エラーの説明をクライアントに送信します。`clickhouse-client`では、コンソールにエラーの説明が表示されます。HTTPインターフェースを使用している場合、ClickHouseはレスポンスボディ内にエラーの説明を送信します。例えば：

```bash
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: 不明な識別子: a。クエリにテーブルがないことに注意してください (FROM句)、context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`を`stack-trace`パラメータで起動すると、ClickHouseはエラーの説明とともにサーバースタックトレースを返します。

切断が発生しているというメッセージが表示されることがあります。この場合は、再度クエリを実行してみてください。クエリを実行するたびに接続が切れる場合は、サーバーログでエラーを確認してください。

## クエリ処理の効率 {#troubleshooting-too-slow}

ClickHouseの動作が遅すぎる場合は、クエリのためのサーバー資源およびネットワークの負荷をプロファイリングする必要があります。

クエリをプロファイリングするために、clickhouse-benchmarkユーティリティを使用できます。これは、毎秒処理されるクエリ数、毎秒処理される行数、およびクエリ処理時間のパーセンタイルを表示します。
