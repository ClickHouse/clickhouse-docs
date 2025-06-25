---
'sidebar_label': 'BigQuery To ClickHouse'
'sidebar_position': 1
'slug': '/integrations/google-dataflow/templates/bigquery-to-clickhouse'
'description': 'Users can ingest data from BigQuery into ClickHouse using Google Dataflow
  Template'
'title': 'Dataflow BigQuery to ClickHouse template'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Dataflow BigQuery to ClickHouse テンプレート

BigQueryからClickHouseへのテンプレートは、BigQueryテーブルからClickHouseテーブルにデータを取り込むためのバッチパイプラインです。このテンプレートは、テーブル全体を読み取ることも、提供されたクエリを使用して特定のレコードを読み取ることもできます。

<TOCInline toc={toc}></TOCInline>

## パイプライン要件 {#pipeline-requirements}

* ソースのBigQueryテーブルが存在する必要があります。
* ターゲットのClickHouseテーブルが存在する必要があります。
* ClickHouseホストは、Dataflowワーカーのマシンからアクセス可能でなければなりません。

## テンプレートパラメータ {#template-parameters}

<br/>
<br/>

| パラメータ名           | パラメータの説明                                                                                                                                                                                                                                                                                                                             | 必須   | ノート                                                                                                                                                                                                                                                            |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`              | `jdbc:clickhouse://<host>:<port>/<schema>` 形式のClickHouse JDBC URLです。                                                                                                                                                                                                                                                                  | ✅     | ユーザー名とパスワードをJDBCオプションとして追加しないでください。その他のJDBCオプションは、JDBC URLの末尾に追加できます。ClickHouse Cloudユーザーの場合は、`jdbcUrl`に`ssl=true&sslmode=NONE`を追加してください。                                                                  |
| `clickHouseUsername`   | 認証に使用するClickHouseのユーザー名です。                                                                                                                                                                                                                                                                                                    | ✅     |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`   | 認証に使用するClickHouseのパスワードです。                                                                                                                                                                                                                                                                                                    | ✅     |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`      | データを挿入するターゲットのClickHouseテーブル名です。                                                                                                                                                                                                                                                                                        | ✅     |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`   | 挿入の最大ブロックサイズ（ClickHouseIOオプション）。                                                                                                                                                                                                                                                                                        |       | `ClickHouseIO`オプションです。                                                                                                                                                                                                                                  |
| `insertDistributedSync` | 設定が有効な場合、分散挿入クエリはクラスタ内のすべてのノードにデータが送信されるまで待機します（ClickHouseIOオプション）。                                                                                                                                                                                                                   |       | `ClickHouseIO`オプションです。                                                                                                                                                                                                                                  |
| `insertQuorum`         | 複製されたテーブルへのINSERTクエリのために、指定された数のレプリカへの書き込みを待機し、データの追加を線形化します。0 - 無効。                                                                                                                                                                                                             |       | `ClickHouseIO`オプションです。この設定はデフォルトのサーバー設定では無効です。                                                                                                                                                                                        |
| `insertDeduplicate`    | 複製されたテーブルへのINSERTクエリのために、挿入ブロックの重複除去を行うべきかを指定します。                                                                                                                                                                                                                                                     |       | `ClickHouseIO`オプションです。                                                                                                                                                                                                                                  |
| `maxRetries`           | 挿入あたりの最大再試行回数です。                                                                                                                                                                                                                                                                                                               |       | `ClickHouseIO`オプションです。                                                                                                                                                                                                                                  |
| `InputTableSpec`       | 読み取るBigQueryテーブルです。`inputTableSpec`または`query`のいずれかを指定します。両方が設定されている場合、`query`パラメータが優先されます。例：`<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                             |       | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage)を使用して、BigQueryストレージからデータを直接読み取ります。[Storage Read APIの制限](https://cloud.google.com/bigquery/docs/reference/storage#limitations)に注意してください。 |
| `outputDeadletterTable`| 出力テーブルに到達できなかったメッセージのためのBigQueryテーブルです。テーブルが存在しない場合、パイプライン実行中に作成されます。指定しない場合、`<outputTableSpec>_error_records`が使用されます。例：`<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                                        |       |                                                                                                                                                                                                                                                                  |
| `query`                | BigQueryからデータを読み取るために使用するSQLクエリです。BigQueryデータセットがDataflowジョブとは異なるプロジェクトにある場合、SQLクエリに完全なデータセット名を指定してください。例：`<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。デフォルトでは[GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)が使用され、`useLegacySql`が`true`の場合を除きます。 |       | `inputTableSpec`または`query`のいずれかを指定する必要があります。両方のパラメータを設定した場合、テンプレートは`query`パラメータを使用します。例：`SELECT * FROM sampledb.sample_table`。                                                                                  |
| `useLegacySql`         | レガシーSQLを使用するには`true`に設定します。このパラメータは`query`パラメータを使用している場合のみ適用されます。デフォルトは`false`です。                                                                                                                                                                                              |       |                                                                                                                                                                                                                                                                  |
| `queryLocation`        | 基となるテーブルの権限なしで認可されたビューから読み取る際に必要です。例：`US`。                                                                                                                                                                                                                                       |       |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`     | クエリの結果を格納するために一時テーブルを作成する既存のデータセットを設定します。例：`temp_dataset`。                                                                                                                                                                                                                                   |       |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`     | クエリソースを使用してBigQueryから読み取る場合、このCloud KMSキーを使用して作成された一時テーブルを暗号化します。例：`projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                      |       |                                                                                                                                                                                                                                                                  |


:::note
すべての`ClickHouseIO`パラメータのデフォルト値は、[`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)で見つけることができます。
:::

## ソースおよびターゲットテーブルのスキーマ {#source-and-target-tables-schema}

BigQueryデータセットをClickHouseに効果的にロードするために、カラムの浸透プロセスが次のフェーズで実施されます。

1. テンプレートはターゲットClickHouseテーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートはBigQueryデータセットを反復処理し、カラム名に基づいてマッチングを試みます。

<br/>

:::important
言うまでもなく、あなたのBigQueryデータセット（テーブルまたはクエリのいずれか）は、ClickHouseのターゲットテーブルと全く同じカラム名を持っている必要があります。
:::

## データ型マッピング {#data-types-mapping}

BigQueryの型は、ClickHouseテーブルの定義に基づいて変換されます。したがって、上記の表は、指定されたBigQueryテーブル/クエリのターゲットClickHouseテーブルに持っているべき推奨マッピングを示しています。

| BigQueryタイプ                                                                                                         | ClickHouseタイプ                                                 | ノート                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**配列型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                     | [**配列型**](../../../sql-reference/data-types/array)           | 内部型は、この表にリストされているサポートされている基本データ型のいずれかでなければなりません。                                                                                                                                                                                                                                                                                                             |
| [**ブーリアン型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)               | [**ブール型**](../../../sql-reference/data-types/boolean)        |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**日付型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                       | [**日付型**](../../../sql-reference/data-types/date)             |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**日時型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)                   | [**日時型**](../../../sql-reference/data-types/datetime)         | `Enum8`、`Enum16`、`FixedString`でも動作します。                                                                                                                                                                                                                                                                                                                                                                 |
| [**文字列型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)                   | [**文字列型**](../../../sql-reference/data-types/string)         | BigQueryのすべてのIntタイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は`INT64`のエイリアスです。ClickHouseにおいて適切な整数サイズを設定することをお勧めします。テンプレートは定義されたカラムタイプ（`Int8`、`Int16`、`Int32`、`Int64`）に基づいてカラムを変換します。                                                |
| [**数値 - 整数型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)                | [**整数型**](../../../sql-reference/data-types/int-uint)        | BigQueryのすべてのIntタイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は`INT64`のエイリアスです。ClickHouseにおいて適切な整数サイズを設定することをお勧めします。テンプレートは定義されたカラムタイプに基づいてカラムを変換します。未割り当てのIntタイプがClickHouseテーブルで使用されている場合（`UInt8`、`UInt16`、`UInt32`、`UInt64`）。                                |
| [**数値 - 浮動小数点型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)           | [**浮動小数点型**](../../../sql-reference/data-types/float)      | サポートされているClickHouseタイプ：`Float32`と`Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## テンプレートの実行 {#running-the-template}

BigQueryからClickHouseへのテンプレートは、Google Cloud CLIを介して実行できます。

:::note
この文書を確認し、特に上記のセクションをレビューして、テンプレートの設定要件と前提条件を完全に理解してください。

:::

### `gcloud` CLIのインストールと設定 {#install--configure-gcloud-cli}

- まだインストールされていない場合は、[`gcloud` CLI](https://cloud.google.com/sdk/docs/install)をインストールします。
- [このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin)の「始める前に」セクションに従って、DataFlowテンプレートを実行するために必要な設定、設定、権限をセットアップします。

### 実行コマンド {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)コマンドを使用して、Flexテンプレートを使用したDataflowジョブを実行します。

以下はコマンドの例です：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの分解 {#command-breakdown}

- **ジョブ名**：`run`キーワードに続くテキストが一意のジョブ名です。
- **テンプレートファイル**：`--template-file-gcs-location`で指定されたJSONファイルがテンプレートの構造と受け入れられるパラメータに関する詳細を定義しています。指定されたファイルパスは公開されており、使用する準備が整っています。
- **パラメータ**：パラメータはカンマで区切ります。文字列ベースのパラメータの値はダブルクオーテーションで囲みます。

### 予想される応答 {#expected-response}

コマンドを実行した後、以下のような応答が表示されるはずです。

```bash
job:
  createTime: '2025-01-26T14:34:04.608442Z'
  currentStateTime: '1970-01-01T00:00:00Z'
  id: 2025-01-26_06_34_03-13881126003586053150
  location: us-central1
  name: bigquery-clickhouse-dataflow-20250126-153400
  projectId: ch-integrations
  startTime: '2025-01-26T14:34:04.608442Z'
```

### ジョブの監視 {#monitor-the-job}

Google Cloud Consoleの[Dataflowジョブタブ](https://console.cloud.google.com/dataflow/jobs)に移動して、ジョブのステータスを監視します。進捗やエラーを含むジョブの詳細が表示されます：

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow コンソールが実行中の BigQuery から ClickHouse へのジョブを示しています" />

## トラブルシューティング {#troubleshooting}

### コード: 241. DB::Exception: メモリ制限（合計）が超過しました {#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、ClickHouseが大規模なデータバッチを処理中にメモリが不足すると発生します。この問題を解決するには：

* インスタンスリソースを増やす：データ処理負荷を処理するために、より大きなインスタンスにClickHouseサーバーをアップグレードします。
* バッチサイズを減らす：Dataflowジョブ設定でバッチサイズを調整し、ClickHouseに送信するデータのチャンクを小さくして、バッチごとのメモリ消費を減らします。
これらの変更により、データ取り込み中のリソース使用量のバランスを取るのに役立つかもしれません。

## テンプレートソースコード {#template-source-code}

テンプレートのソースコードは、ClickHouseの[DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates)フォークで利用可能です。
