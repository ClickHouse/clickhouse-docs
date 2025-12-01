# curl でスクリプトを実行して ClickHouse をインストールする {#install-clickhouse-via-script-using-curl}

本番環境向けに ClickHouse をインストールする必要がない場合、最も手早くセットアップする方法は、curl を使ってインストールスクリプトを実行することです。このスクリプトは、利用中の OS に適したバイナリを自動的に判別します。

<VerticalStepper>


## curl を使用して ClickHouse をインストールする {#install-clickhouse-using-curl}

以下のコマンドを実行して、使用しているオペレーティングシステム向けの単一のバイナリをダウンロードします。

```bash
curl https://clickhouse.com/ | sh
```

:::note
Mac をお使いの方へ: バイナリの開発元を検証できないというエラーが発生する場合は、[こちら](/knowledgebase/fix-developer-verification-error-in-macos) を参照してください。
:::


## clickhouse-local を起動する {#start-clickhouse-local}

`clickhouse-local` を使用すると、ClickHouse の強力な SQL 構文を利用して、
ローカルおよびリモートファイルを事前の設定なしに処理できます。テーブルデータは一時領域に保存されるため、
`clickhouse-local` を再起動すると、以前に作成したテーブルは利用できなくなります。

[clickhouse-local](/operations/utilities/clickhouse-local) を起動するには、次のコマンドを実行します。

```bash
./clickhouse
```


## clickhouse-server を起動する {#start-clickhouse-server}

データを永続化する場合は、`clickhouse-server` を起動します。ClickHouse サーバーは、次のコマンドで起動できます。

```bash
./clickhouse server
```


## clickhouse-client を起動する {#start-clickhouse-client}

サーバーが起動して稼働している状態で、新しいターミナルウィンドウを開き、`clickhouse-client` を起動するために次のコマンドを実行します：

```bash
./clickhouse client
```

次のように表示されます：

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

テーブルデータはカレントディレクトリに保存され、ClickHouse サーバーを再起動した後も引き続き利用できます。必要に応じて、`./clickhouse server` に追加のコマンドライン引数として `-C config.xml` を渡し、設定ファイル内でさらに詳細な設定を行うことができます。利用可能なすべての設定は、[こちら](/operations/server-configuration-parameters/settings)および[サンプル設定ファイルのテンプレート](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)に記載されています。

これで ClickHouse に対して SQL コマンドを送信する準備が整いました。

:::tip
[Quick Start](/get-started/quick-start) では、テーブルの作成およびデータの挿入手順を順を追って解説しています。
:::

</VerticalStepper>
