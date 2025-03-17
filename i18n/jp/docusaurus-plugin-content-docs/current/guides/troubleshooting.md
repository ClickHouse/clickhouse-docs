---
title: "トラブルシューティング"
---

## インストール {#installation}

### keyserver.ubuntu.com から apt-key を使用して GPG キーをインポートできません {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

`apt-key` 機能は [Advanced package tool (APT) で非推奨となりました](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。ユーザーは代わりに `gpg` コマンドを使用する必要があります。詳細については、[インストールガイド](../getting-started/install.md) を参照してください。

### keyserver.ubuntu.com から gpg を使用して GPG キーをインポートできません {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg` がインストールされているか確認します:

```shell
sudo apt-get install gnupg
```

### apt-get で ClickHouse リポジトリから deb パッケージを取得できません {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォールの設定を確認します。
1. リポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install.md) に記載されている方法でパッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールします。`tzdata` パッケージも必要です。

### apt-get で ClickHouse リポジトリから deb パッケージを更新できません {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

GPG キーが変更された場合にこの問題が発生することがあります。

リポジトリの設定を更新するには、[セットアップ](../getting-started/install.md#setup-the-debian-repository) ページの手動を使用してください。

### `apt-get update` で異なる警告が表示されます {#you-get-different-warnings-with-apt-get-update}

表示される警告メッセージは次のいずれかです:

```shell
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' が 'i386' アーキテクチャをサポートしていないため、設定されたファイル 'main/binary-i386/Packages' の取得をスキップします
```

```shell
E: https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz の取得に失敗しました。ファイルのサイズが予期しないものでした (30451 != 28154)。ミラーの同期が進行中ですか？
```

```shell
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Origin' 値が 'Artifactory' から 'ClickHouse' に変更されました
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Label' 値が 'Artifactory' から 'ClickHouse' に変更されました
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Suite' 値が 'stable' から '' に変更されました
N: このリポジトリの更新を適用するには、明示的に受け入れる必要があります。詳細については、apt-secure(8) マンページを参照してください。
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

上記の問題を解決するには、次のスクリプトを使用してください:

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### Yum で誤った署名のためにパッケージを取得できません {#cant-get-packages-with-yum-because-of-wrong-signature}

考えられる問題: キャッシュが間違っている、または 2022年9月に GPG キーを更新した後に壊れた可能性があります。

解決策は、Yum のキャッシュと lib ディレクトリをクリーンアウトすることです:

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後、[インストールガイド](../getting-started/install.md#from-rpm-packages)に従ってください。

## サーバーへの接続 {#connecting-to-the-server}

考えられる問題:

- サーバーが実行されていない。
- 予期しないまたは間違った設定パラメータ。

### サーバーが実行されていません {#server-is-not-running}

#### サーバーが実行されているか確認 {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが実行されていない場合は、次のコマンドで起動します:

```shell
sudo service clickhouse-server start
```

#### ログを確認 {#check-the-logs}

`clickhouse-server` のメインログはデフォルトで `/var/log/clickhouse-server/clickhouse-server.log` にあります。

サーバーが正常に起動した場合、次の文字列が表示されるはずです:

- `<Information> Application: starting up.` — サーバーが起動しました。
- `<Information> Application: Ready for connections.` — サーバーが実行中で接続の準備が整っています。

`clickhouse-server` の起動が構成エラーで失敗した場合、エラーの説明が含まれる `<Error>` 文字列が表示されるはずです。たとえば:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 'event2id' 外部辞書の再読み込みに失敗しました: Poco::Exception. コード: 1000, e.code() = 111, e.displayText() = 接続が拒否されました, e.what() = 接続が拒否されました
```

ファイルの最後にエラーが表示されない場合は、次の文字列からファイル全体を確認してください:

```plaintext
<Information> Application: starting up.
```

サーバーで `clickhouse-server` の別のインスタンスを起動しようとすると、次のログが表示されます:

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : Starting ClickHouse 19.1.0 with revision 54413
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: starting up
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: ステータスファイル ./status は既に存在しています - クリーンでない再起動。内容:
PID: 8510
開始時刻: 2019-01-11 15:24:23
リビジョン: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: ファイル ./status をロックできません。別のサーバーインスタンスが同じディレクトリで既に実行されています。
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: シャットダウンしています
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: サブシステムの初期化解除: ロギングサブシステム
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: 停止シグナルリスナースレッド
```

#### system.d ログを確認 {#see-systemd-logs}

`clickhouse-server` のログに役立つ情報が見つからない場合、またはログがない場合は、次のコマンドを使用して `system.d` ログを表示できます:

```shell
sudo journalctl -u clickhouse-server
```

#### インタラクティブモードで clickhouse-server を起動 {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、標準パラメータを使用してサーバーをインタラクティブアプリとして起動します。このモードでは、`clickhouse-server` はすべてのイベントメッセージをコンソールに出力します。

### 設定パラメータ {#configuration-parameters}

次を確認してください:

1. Docker 設定:

    - ClickHouse を Docker で IPv6 ネットワーク上で実行する場合は、`network=host` が設定されていることを確認してください。

1. エンドポイント設定。
    - [listen_host](/operations/server-configuration-parameters/settings#listen_host) および [tcp_port](/operations/server-configuration-parameters/settings#tcp_port) 設定を確認してください。
    - ClickHouse サーバーは、デフォルトでは localhost からの接続のみを受け入れます。

1. HTTP プロトコル設定:

    - HTTP API のプロトコル設定を確認してください。

1. セキュア接続設定。

    - 次を確認してください:
        - [tcp_port_secure](/operations/server-configuration-parameters/settings#tcp_port_secure) 設定。
        - [SSL証明書](/operations/server-configuration-parameters/settings#openssl) の設定。
    - 接続時に適切なパラメータを使用してください。たとえば、`clickhouse_client` では `port_secure` パラメータを使用します。

1. ユーザー設定:

    - 間違ったユーザー名やパスワードを使用している可能性があります。

## クエリ処理 {#query-processing}

ClickHouse がクエリを処理できない場合、クライアントにエラーの説明を送信します。`clickhouse-client` では、コンソールにエラーの説明が表示されます。HTTP インターフェースを使用している場合、ClickHouse はレスポンスボディにエラーの説明を送信します。たとえば:

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: 未知の識別子: a。クエリにはテーブルがありません (FROM 句)。コンテキスト: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメータで起動すると、ClickHouse はエラーの説明とともにサーバースタックトレースを返します。

接続が切断されたというメッセージが表示されることがあります。この場合、クエリを再試行できます。クエリを実行するたびに接続が切断される場合は、サーバーログにエラーがないか確認してください。

## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouse が非常に遅く動作している場合は、クエリのためにサーバーリソースとネットワークへの負荷をプロファイルする必要があります。

クエリをプロファイルするために `clickhouse-benchmark` ユーティリティを使用できます。これにより、秒あたりに処理されたクエリの数、秒あたりに処理された行の数、クエリ処理時間のパーセンタイルを表示します。
