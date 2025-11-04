


# Install ClickHouse via script using curl

プロダクション用に ClickHouse をインストールする必要がない場合、最も迅速な方法は、curl を使用してインストールスクリプトを実行することです。このスクリプトは、あなたの OS に適したバイナリを決定します。

<VerticalStepper>

## Install ClickHouse using curl {#install-clickhouse-using-curl}

以下のコマンドを実行して、あなたのオペレーティングシステム用の単一バイナリをダウンロードします。

```bash
curl https://clickhouse.com/ | sh
```

:::note
Mac ユーザーの方へ: バイナリの開発者を確認できないというエラーが表示される場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos)をご覧ください。
:::

## Start clickhouse-local {#start-clickhouse-local}

`clickhouse-local` を使用すると、ClickHouse の強力な SQL 構文を使ってローカルおよびリモートファイルを処理でき、設定の必要がありません。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動すると、以前に作成したテーブルは利用できなくなります。

次のコマンドを実行して [clickhouse-local](/operations/utilities/clickhouse-local) を起動します:

```bash
./clickhouse
```

## Start clickhouse-server {#start-clickhouse-server}

データを永続化したい場合は、`clickhouse-server` を実行する必要があります。次のコマンドを使用して ClickHouse サーバーを起動できます:

```bash
./clickhouse server
```

## Start clickhouse-client {#start-clickhouse-client}

サーバーが起動したら、新しいターミナルウィンドウを開き、以下のコマンドを実行して `clickhouse-client` を起動します:

```bash
./clickhouse client
```

以下のような表示がされます:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータはカレントディレクトリに保存され、ClickHouse サーバーを再起動した後も引き続き利用可能です。必要に応じて、追加のコマンドライン引数として `-C config.xml` を `./clickhouse server` に渡し、設定ファイルでさらに設定を行うことができます。すべての利用可能な設定は、[こちら](/operations/server-configuration-parameters/settings)および[例の設定ファイルテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に文書化されています。

これで、ClickHouse に SQL コマンドを送信する準備が整いました！

:::tip
[クイックスタート](/get-started/quick-start)では、テーブルの作成とデータの挿入の手順を説明しています。
:::

</VerticalStepper>
