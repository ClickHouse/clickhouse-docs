# curlを使用したスクリプトによるClickHouseのインストール

本番環境用のインストールが不要な場合、最も迅速にセットアップする方法は、curlを使用してインストールスクリプトを実行することです。このスクリプトは、お使いのOSに適したバイナリを自動的に判別します。

<VerticalStepper>


## curlを使用したClickHouseのインストール {#install-clickhouse-using-curl}

お使いのオペレーティングシステム用のシングルバイナリをダウンロードするには、以下のコマンドを実行します。

```bash
curl https://clickhouse.com/ | sh
```

:::note
Macユーザーの方へ：バイナリの開発者を検証できないというエラーが表示される場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos)をご参照ください。
:::


## clickhouse-localの起動 {#start-clickhouse-local}

`clickhouse-local`を使用すると、設定不要でClickHouseの強力なSQL構文を使ってローカルファイルやリモートファイルを処理できます。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動すると、以前に作成したテーブルは利用できなくなります。

[clickhouse-local](/operations/utilities/clickhouse-local)を起動するには、次のコマンドを実行します:

```bash
./clickhouse
```


## clickhouse-serverの起動 {#start-clickhouse-server}

データを永続化したい場合は、`clickhouse-server`を実行します。ClickHouseサーバーは以下のコマンドで起動できます:

```bash
./clickhouse server
```


## clickhouse-clientの起動 {#start-clickhouse-client}

サーバーが起動して実行中の状態で、新しいターミナルウィンドウを開き、以下のコマンドを実行して`clickhouse-client`を起動します:

```bash
./clickhouse client
```

次のような出力が表示されます:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーの再起動後も引き続き利用可能です。必要に応じて、`./clickhouse server`に追加のコマンドライン引数として`-C config.xml`を渡し、設定ファイルで追加の設定を行うことができます。利用可能なすべての設定項目は[こちら](/operations/server-configuration-parameters/settings)および[設定ファイルテンプレートの例](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に記載されています。

これでClickHouseにSQLコマンドを送信する準備が整いました!

:::tip
[クイックスタート](/get-started/quick-start)では、テーブルの作成とデータの挿入手順を説明しています。
:::

</VerticalStepper>
