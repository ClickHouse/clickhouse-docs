---
title: "トラブルシューティング"
---

## インストール {#installation}

### keyserver.ubuntu.comからapt-keyでGPGキーをインポートできません {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key`機能は、[Advanced package tool (APT)によって非推奨となりました](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。ユーザーは代わりに`gpg`コマンドを使用するべきです。詳しくは、[インストールガイド](../getting-started/install.md)の記事を参照してください。

### keyserver.ubuntu.comからgpgでGPGキーをインポートできません {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg`がインストールされているか確認してください：

```shell
sudo apt-get install gnupg
```

### apt-getでClickHouseリポジトリからdebパッケージを取得できません {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォール設定を確認してください。
1. リポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md)の記事で説明されているようにパッケージをダウンロードし、`sudo dpkg -i <packages>`コマンドを使用して手動でインストールしてください。`tzdata`パッケージも必要です。

### apt-getでClickHouseリポジトリからdebパッケージを更新できません {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

GPGキーが変更された場合にこの問題が発生することがあります。

リポジトリ構成を更新するために、[セットアップ](../getting-started/install.md#setup-the-debian-repository)ページのマニュアルを使用してください。

### `apt-get update`で異なる警告が表示されます {#you-get-different-warnings-with-apt-get-update}

表示される警告メッセージは以下のいずれかです：

```shell
N: スキップして取得する設定されたファイル 'main/binary-i386/Packages' リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' がアーキテクチャ 'i386' をサポートしていないため。
```

```shell
E: https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gzの取得に失敗しました フィアルのサイズが予期しない値です (30451 != 28154)。ミラーの同期が進行中か？
```

```shell
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' が 'Origin'の値を 'Artifactory' から 'ClickHouse' に変更しました
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' が 'Label'の値を 'Artifactory' から 'ClickHouse' に変更しました
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' が 'Suite'の値を 'stable' から '' に変更しました
N: このリポジトリの更新が適用される前に、明示的に受け入れる必要があります。詳細はapt-secure(8)のマニュアルページを参照してください。
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

### Yumでパッケージを取得できないのは署名が無効なためです {#cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題：キャッシュが壊れている可能性があります。2022年9月にGPGキーが更新された後に壊れたかもしれません。

解決策としては、Yumのキャッシュとlibディレクトリをクリアすることです：

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](../getting-started/install.md#from-rpm-packages)に従ってください。

## サーバーに接続する {#connecting-to-the-server}

可能性のある問題：

- サーバーが実行されていない。
- 予期しないまたは間違った構成パラメータ。

### サーバーが実行されていない {#server-is-not-running}

#### サーバーが実行中か確認する {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが実行されていない場合は、次のコマンドで起動します：

```shell
sudo service clickhouse-server start
```

#### ログを確認する {#check-the-logs}

`clickhouse-server`のメインログはデフォルトで`/var/log/clickhouse-server/clickhouse-server.log`にあります。

サーバーが正常に起動した場合は、以下の文字列が表示されるはずです：

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で接続を待機しています。

`clickhouse-server`が構成エラーで起動に失敗した場合、エラー説明付きの`<Error>`文字列が表示されるはずです。例えば：

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 'event2id'外部辞書のリロードに失敗しました: Poco::Exception. コード: 1000, e.code() = 111, e.displayText() = 接続拒否, e.what() = 接続拒否
```

ファイルの末尾にエラーが表示されない場合は、以下の文字列からファイル全体を検索してください：

```plaintext
<Information> Application: starting up.
```

サーバー上で`clickhouse-server`の2つ目のインスタンスを起動しようとした場合、以下のようなログが表示されます：

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : ClickHouse 19.1.0を54413の改訂版で起動中です
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: ステータスファイル ./status は既に存在します - クリーンではない再起動。内容：
PID: 8510
開始時刻: 2019-01-11 15:24:23
改訂版: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: ./statusファイルをロックできません。同じディレクトリで別のサーバーインスタンスが既に実行されています。
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: シャットダウン中
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: サブシステムの初期化解除中: ロギングサブシステム
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: 停止シグナルリスナースレッド
```

#### system.dログを確認する {#see-systemd-logs}

`clickhouse-server`のログに役立つ情報が見つからない場合やログが存在しない場合は、次のコマンドを使用して`system.d`のログを表示できます：

```shell
sudo journalctl -u clickhouse-server
```

#### インタラクティブモードでclickhouse-serverを起動する {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、標準パラメータの自動起動スクリプトを使用してサーバーをインタラクティブアプリケーションとして開始します。このモードでは、`clickhouse-server`はすべてのイベントメッセージをコンソールに出力します。

### 構成パラメータ {#configuration-parameters}

確認してください：

1. Docker設定：

    - ClickHouseをDockerでIPv6ネットワークで実行する場合は、`network=host`が設定されていることを確認してください。

1. エンドポイント設定。
    - [listen_host](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-listen_host)及び[tcp_port](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-tcp_port)の設定を確認してください。
    - ClickHouseサーバーはデフォルトでlocalhost接続のみを受け入れます。

1. HTTPプロトコル設定：

    - HTTP APIのプロトコル設定を確認してください。

1. セキュア接続設定。

    - 確認してください：
        - [tcp_port_secure](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-tcp_port_secure)設定。
        - [SSL証明書](../operations/server-configuration-parameters/settings.md#server_configuration_parameters-openssl)の設定。
    - 接続時に適切なパラメータを使用してください。例えば、`clickhouse_client`に`port_secure`パラメータを使用します。

1. ユーザー設定：

    - ユーザー名やパスワードが間違っている可能性があります。

## クエリ処理 {#query-processing}

ClickHouseがクエリを処理できない場合、エラーの説明をクライアントに送信します。`clickhouse-client`では、コンソールにエラーの説明が表示されます。HTTPインターフェースを使用している場合、ClickHouseはレスポンスボディ内にエラーの説明を送信します。例えば：

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: 不明な識別子: a。クエリにテーブルが存在しないことに注意してください (FROM句)、context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client`を`stack-trace`パラメータを指定して起動した場合、ClickHouseはエラーの説明と共にサーバーのスタックトレースを返します。

接続が切れた場合のメッセージが表示されることがあります。この場合、クエリを再試行できます。クエリを実行するたびに接続が切れる場合は、サーバーログにエラーがないか確認してください。

## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouseが非常に遅い場合は、サーバーリソースとネットワークの負荷をプロファイリングする必要があります。

`clickhouse-benchmark`ユーティリティを使用してクエリをプロファイリングできます。これにより、秒あたりの処理クエリ数、秒あたりの処理行数、およびクエリ処理時間のパーセンタイルが表示されます。
