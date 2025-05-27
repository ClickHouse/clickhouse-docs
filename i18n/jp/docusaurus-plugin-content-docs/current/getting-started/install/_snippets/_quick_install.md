---
{}
---




# ClickHouseのインストールスクリプトをcurlを使用して実行する

本番環境でClickHouseをインストールする必要がない場合、最も迅速な方法は、curlを使用してインストールスクリプトを実行することです。このスクリプトは、あなたのOSに適したバイナリを判断します。

<VerticalStepper>

## curlを使用してClickHouseをインストールする {#install-clickhouse-using-curl}

次のコマンドを実行して、あなたのオペレーティングシステム用の単一のバイナリをダウンロードします。

```bash
curl https://clickhouse.com/ | sh
```

:::note
Macユーザーへ: バイナリの開発者が確認できないというエラーが表示される場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos)を参照してください。
:::

## clickhouse-localを起動する {#start-clickhouse-local}

`clickhouse-local`を使用すると、ClickHouseの強力なSQL構文を使用してローカルおよびリモートファイルを処理できます。設定を必要とせずに使用できます。テーブルデータは一時的な場所に保存されるため、`clickhouse-local`を再起動した後は、以前に作成したテーブルは利用できなくなります。

以下のコマンドを実行して[clickhouse-local](/operations/utilities/clickhouse-local)を起動します：

```bash
./clickhouse
```

## clickhouse-serverを起動する {#start-clickhouse-server}

データを永続化したい場合は、`clickhouse-server`を実行します。以下のコマンドを使用してClickHouseサーバーを起動できます：

```bash
./clickhouse server
```

## clickhouse-clientを起動する {#start-clickhouse-client}

サーバーが稼働している状態で、新しいターミナルウィンドウを開き、以下のコマンドを実行して`clickhouse-client`を起動します：

```bash
./clickhouse client
```

次のような表示がされます：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータは現在のディレクトリに保存されており、ClickHouseサーバーを再起動後も利用可能です。必要に応じて、`./clickhouse server`に`-C config.xml`を追加のコマンドライン引数として渡し、設定ファイルでさらなる設定を提供することができます。すべての利用可能な設定は[こちら](/operations/server-configuration-parameters/settings)に文書化されており、[例の設定ファイルテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)にも記載されています。

これで、SQLコマンドをClickHouseに送信する準備が整いました！

:::tip
[クイックスタート](/quick-start.mdx)では、テーブルの作成とデータの挿入に関する手順を説明しています。
:::

</VerticalStepper>
