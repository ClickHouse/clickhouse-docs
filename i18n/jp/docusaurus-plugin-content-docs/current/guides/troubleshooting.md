---
title: 'トラブルシューティング'
description: 'インストールのトラブルシューティングガイド'
slug: /guides/troubleshooting
doc_type: 'guide'
keywords: ['トラブルシューティング', 'デバッグ', '問題解決', 'エラー', '診断']
---

## インストール {#installation}

### apt-key を使用して keyserver.ubuntu.com から GPG キーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-apt-key}

[Advanced Package Tool (APT) の `apt-key` 機能は非推奨になりました](https://manpages.debian.org/bookworm/apt/apt-key.8.en.html)。代わりに `gpg` コマンドを使用する必要があります。[インストールガイド](../getting-started/install/install.mdx)を参照してください。

### gpg を使用して keyserver.ubuntu.com から GPG キーをインポートできない {#cannot-import-gpg-keys-from-keyserverubuntucom-with-gpg}

1. `gpg` がインストールされているか確認します。

```shell
sudo apt-get install gnupg
```

### apt-get で ClickHouse リポジトリから deb パッケージを取得できない {#cannot-get-deb-packages-from-clickhouse-repository-with-apt-get}

1. ファイアウォール設定を確認します。
2. 何らかの理由でリポジトリにアクセスできない場合は、[インストールガイド](../getting-started/install/install.mdx)の記事に記載されている方法でパッケージをダウンロードし、`sudo dpkg -i <packages>` コマンドを使用して手動でインストールしてください。`tzdata` パッケージも必要になります。

### apt-get で ClickHouse リポジトリから deb パッケージを更新できない {#cannot-update-deb-packages-from-clickhouse-repository-with-apt-get}

この問題は、GPG キーが変更された際に発生する可能性があります。

リポジトリ設定を更新するには、[セットアップ](/install/debian_ubuntu) ページの手順に従ってください。

### `apt-get update` でさまざまな警告が表示される {#you-get-different-warnings-with-apt-get-update}

表示される警告メッセージは、次のいずれかになります。

```shell
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' はアーキテクチャ 'i386' に対応していないため、設定ファイル 'main/binary-i386/Packages' の取得をスキップします
```

```shell
E: https://packages.clickhouse.com/deb/dists/stable/main/binary-amd64/Packages.gz の取得に失敗しました  ファイルサイズが想定と異なります (30451 != 28154)。ミラー同期中ですか?
```

```shell
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Origin' 値が 'Artifactory' から 'ClickHouse' に変更されました
E: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Label' 値が 'Artifactory' から 'ClickHouse' に変更されました
N: リポジトリ 'https://packages.clickhouse.com/deb stable InRelease' の 'Suite' 値が 'stable' から '' に変更されました
N: このリポジトリの更新を適用するには、事前に明示的な承認が必要です。詳細は apt-secure(8) マニュアルページを参照してください。
```

```shell
Err:11 https://packages.clickhouse.com/deb stable InRelease
400  Bad Request [IP: 172.66.40.249 443]
```

この問題を解決するには、以下のスクリプトを実行してください。

```shell
sudo rm /var/lib/apt/lists/packages.clickhouse.com_* /var/lib/dpkg/arch /var/lib/apt/lists/partial/packages.clickhouse.com_*
sudo apt-get clean
sudo apt-get autoclean
```

### 署名エラーにより Yum でパッケージを取得できない {#cant-get-packages-with-yum-because-of-wrong-signature}

考えられる原因: キャッシュが不正です。2022-09 に GPG キーを更新した後に破損した可能性があります。

解決策は、Yum のキャッシュと lib ディレクトリを削除してクリーンアップすることです。

```shell
sudo find /var/lib/yum/repos/ /var/cache/yum/ -name 'clickhouse-*' -type d -exec rm -rf {} +
sudo rm -f /etc/yum.repos.d/clickhouse.repo
```

その後は、[インストールガイド](/install/redhat)に従ってください

## サーバーへの接続 {#connecting-to-the-server}

考えられる問題:

* サーバーが起動していない。
* 想定外または誤った設定パラメータ。

### サーバーが起動していない {#server-is-not-running}

#### サーバーが起動しているか確認する {#check-if-server-is-running}

```shell
sudo service clickhouse-server status
```

サーバーが起動していない場合は、次のコマンドで起動してください。

```shell
sudo service clickhouse-server start
```

#### ログを確認する {#check-the-logs}

`clickhouse-server` のメインログは、デフォルトで `/var/log/clickhouse-server/clickhouse-server.log` に出力されます。

サーバーが正常に起動した場合、次の文字列がログに出力されます。

* `<Information> Application: starting up.` — サーバーが起動しました。
* `<Information> Application: Ready for connections.` — サーバーが稼働中で、接続を受け付ける準備ができています。

`clickhouse-server` の起動が設定エラーで失敗した場合は、エラー内容の説明とともに `<Error>` という文字列を含むログ行が出力されます。例:

```plaintext
2019.01.11 15:23:25.549505 [ 45 ] {} <Error> ExternalDictionaries: 外部ディクショナリ 'event2id' の再読み込みに失敗しました: Poco::Exception. Code: 1000, e.code() = 111, e.displayText() = Connection refused, e.what() = Connection refused
```

ファイルの末尾にエラーが表示されていない場合は、次の文字列以降についてファイル全体を確認してください。

```plaintext
<Information> Application: 起動中。
```

サーバー上で `clickhouse-server` の2つ目のインスタンスを起動しようとすると、次のログが出力されます：

```plaintext
2019.01.11 15:25:11.151730 [ 1 ] {} <Information> : ClickHouse 19.1.0 をリビジョン 54413 で起動しています
2019.01.11 15:25:11.154578 [ 1 ] {} <Information> Application: 起動中
2019.01.11 15:25:11.156361 [ 1 ] {} <Information> StatusFile: ステータスファイル ./status は既に存在します - 不正な再起動です。内容:
PID: 8510
開始時刻: 2019-01-11 15:24:23
Revision: 54413

2019.01.11 15:25:11.156673 [ 1 ] {} <Error> Application: DB::Exception: ファイル ./status をロックできません。同じディレクトリ内で別のサーバーインスタンスが既に実行されています。
2019.01.11 15:25:11.156682 [ 1 ] {} <Information> Application: シャットダウン中
2019.01.11 15:25:11.156686 [ 1 ] {} <Debug> Application: サブシステムの初期化を解除中: ロギングサブシステム
2019.01.11 15:25:11.156716 [ 2 ] {} <Information> BaseDaemon: SignalListener スレッドを停止
```

#### system.d ログの確認 {#see-systemd-logs}

`clickhouse-server` のログに有用な情報が含まれていない場合、またはログ自体が出力されていない場合は、次のコマンドを使用して `system.d` のログを確認できます。

```shell
sudo journalctl -u clickhouse-server
```

#### インタラクティブ モードで clickhouse-server を起動する {#start-clickhouse-server-in-interactive-mode}

```shell
sudo -u clickhouse /usr/bin/clickhouse-server --config-file /etc/clickhouse-server/config.xml
```

このコマンドは、自動起動スクリプトの標準パラメータでサーバーを対話型アプリケーションとして起動します。このモードでは、`clickhouse-server` はすべてのイベントメッセージをコンソールに出力します。

### 設定パラメータ {#configuration-parameters}

次を確認してください。

1. Docker の設定:

   * IPv6 ネットワーク上で Docker で ClickHouse を実行している場合は、`network=host` が設定されていることを確認します。

2. エンドポイントの設定。
   * [listen&#95;host](/operations/server-configuration-parameters/settings#listen_host) および [tcp&#95;port](/operations/server-configuration-parameters/settings#tcp_port) の設定を確認します。
   * ClickHouse サーバーはデフォルトでは localhost からの接続のみを受け付けます。

3. HTTP プロトコルの設定:

   * HTTP API のプロトコル設定を確認します。

4. セキュア接続の設定。

   * 次を確認します。
     * [tcp&#95;port&#95;secure](/operations/server-configuration-parameters/settings#tcp_port_secure) の設定
     * [SSL 証明書](/operations/server-configuration-parameters/settings#openssl) の設定
   * 接続時には適切なパラメータを使用します。たとえば、`clickhouse_client` では `port_secure` パラメータを使用します。

5. ユーザー設定:

   * ユーザー名またはパスワードが間違っている可能性があります。

## クエリ処理 {#query-processing}

ClickHouse がクエリを処理できない場合、エラー内容をクライアントに送信します。`clickhouse-client` では、コンソール上にエラー内容が表示されます。HTTP インターフェイスを使用している場合、ClickHouse はレスポンスボディ内にエラー内容を返します。例えば、次のようになります。

```shell
$ curl 'http://localhost:8123/' --data-binary "SELECT a"
Code: 47, e.displayText() = DB::Exception: Unknown identifier: a. Note that there are no tables (FROM clause) in your query, context: required_names: 'a' source_tables: table_aliases: private_aliases: column_aliases: public_columns: 'a' masked_columns: array_join_columns: source_columns: , e.what() = DB::Exception
```

`clickhouse-client` を `stack-trace` パラメータ付きで起動すると、ClickHouse はエラーの説明とともにサーバー側のスタックトレースを返します。

接続が切断されたことを示すメッセージが表示されることがあります。この場合は、クエリを再実行してみてください。クエリを実行するたびに接続が切断される場合は、サーバーログにエラーがないか確認してください。

## クエリ処理の効率 {#efficiency-of-query-processing}

ClickHouse のクエリ実行が遅すぎると感じた場合は、クエリがサーバーリソースやネットワークに与える負荷をプロファイルする必要があります。

クエリのプロファイリングには `clickhouse-benchmark` ユーティリティを使用できます。このユーティリティは、1 秒あたりに処理されたクエリ数、1 秒あたりに処理された行数、およびクエリ処理時間のパーセンタイルを表示します。
