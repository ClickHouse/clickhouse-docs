# スクリプトを使用してcurl経由でClickHouseをインストールする

本番環境用にClickHouseをインストールする必要がない場合、最も簡単な方法はcurlを使用してインストールスクリプトを実行することです。このスクリプトは、あなたのOSに適したバイナリを判断します。

<VerticalStepper>

## curlを使用してClickHouseをインストールする {#install-clickhouse-using-curl}

次のコマンドを実行して、あなたのオペレーティングシステム用の単一バイナリをダウンロードします。

```bash
curl https://clickhouse.com/ | sh
```

:::note
Macユーザーへ：バイナリの開発者を確認できないというエラーが表示される場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos)を参照してください。
:::

## clickhouse-localを起動する {#start-clickhouse-local}

`clickhouse-local`を使用すると、ClickHouseの強力なSQL構文を使用して、ローカルおよびリモートファイルを構成なしで処理できます。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動した後は、以前に作成したテーブルは利用できなくなります。

次のコマンドを実行して[clickhouse-local](/operations/utilities/clickhouse-local)を起動します：

```bash
./clickhouse
```

## clickhouse-serverを起動する {#start-clickhouse-server}

データを保持したい場合は、`clickhouse-server`を実行する必要があります。次のコマンドを使用してClickHouseサーバーを起動できます：

```bash
./clickhouse server
```

## clickhouse-clientを起動する {#start-clickhouse-client}

サーバーが稼働している状態で、新しいターミナルウィンドウを開き、次のコマンドを実行して`clickhouse-client`を起動します：

```bash
./clickhouse client
```

次のような出力が表示されます：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータは現在のディレクトリに保存され、ClickHouseサーバーの再起動後も利用可能です。必要に応じて、`./clickhouse server`に追加のコマンドライン引数として`-C config.xml`を渡し、設定ファイルでさらに構成を提供できます。すべての利用可能な設定は、[こちら](/operations/server-configuration-parameters/settings)および[例の設定ファイルテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に文書化されています。

これで、ClickHouseにSQLコマンドを送る準備が整いました！

:::tip
[クイックスタート](/quick-start.mdx)では、テーブルの作成とデータの挿入の手順を説明しています。
:::

</VerticalStepper>
