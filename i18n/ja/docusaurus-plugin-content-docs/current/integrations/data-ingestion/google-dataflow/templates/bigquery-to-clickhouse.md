---
sidebar_label: BigQuery から ClickHouse へ
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: ユーザーは Google Dataflow テンプレートを使用して BigQuery から ClickHouse にデータを取り込むことができます。
---

import TOCInline from '@theme/TOCInline';

# Dataflow BigQuery から ClickHouse へのテンプレート

BigQuery から ClickHouse へのテンプレートは、BigQuery テーブルから ClickHouse テーブルにデータを取り込むバッチパイプラインです。このテンプレートは、テーブル全体を読み取るか、指定されたクエリを使用して特定のレコードを読み取ることができます。

<TOCInline toc={toc}></TOCInline>

## パイプライン要件 {#pipeline-requirements}

* ソースの BigQuery テーブルが存在する必要があります。
* ターゲットの ClickHouse テーブルが存在する必要があります。
* ClickHouse ホストは、Dataflow ワーカー マシンからアクセス可能である必要があります。

## テンプレートパラメータ {#template-parameters}

<br/>
<br/>

| パラメータ名            | パラメータの説明                                                                                                                                                                                                                                                                                                                             | 必須 | ノート                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | `jdbc:clickhouse://<host>:<port>/<schema>` 形式の ClickHouse JDBC URL。                                                                                                                                                                                                                                                                  | ✅        | JDBC オプションとしてユーザー名とパスワードを追加しないでください。他の JDBC オプションは JDBC URL の末尾に追加できます。ClickHouse Cloud のユーザーは、`jdbcUrl` に `ssl=true&sslmode=NONE` を追加してください。                                                                  |
| `clickHouseUsername`    | 認証に使用する ClickHouse ユーザー名。                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 認証に使用する ClickHouse パスワード。                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | データを挿入するターゲットの ClickHouse テーブル名。                                                                                                                                                                                                                                                                                            | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 挿入のための最大ブロックサイズ。挿入用のブロックの作成を制御する場合（ClickHouseIO オプション）。                                                                                                                                                                                                                                    |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `insertDistributedSync` | 設定が有効になっている場合、分散クエリはクラスタ内のすべてのノードにデータが送信されるまで待機します（ClickHouseIO オプション）。                                                                                                                                                                                                                 |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `insertQuorum`          | 複製テーブル内の INSERT クエリでは、指定された数のレプリカへの書き込みを待機し、データの追加を線形化します。 0 - 無効。                                                                                                                                                                                                |          | `ClickHouseIO` オプション。この設定はデフォルトのサーバー設定では無効になっています。                                                                                                                                                                                    |
| `insertDeduplicate`     | 複製テーブル内の INSERT クエリでは、挿入ブロックの重複排除を実行する必要があることを指定します。                                                                                                                                                                                                                                  |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `maxRetries`            | 挿入ごとの最大再試行回数。                                                                                                                                                                                                                                                                                                              |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `InputTableSpec`        | 読み取る BigQuery テーブル。`inputTableSpec` または `query` のいずれかを指定します。両方が設定されている場合は、`query` パラメータが優先されます。例: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                |          | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) を使用して、BigQuery ストレージから直接データを読み取ります。 [Storage Read API の制限](https://cloud.google.com/bigquery/docs/reference/storage#limitations) に注意してください。 |
| `outputDeadletterTable` | 出力テーブルに到達できなかったメッセージのための BigQuery テーブル。テーブルが存在しない場合、パイプライン実行中に作成されます。指定されていない場合、`<outputTableSpec>_error_records` が使用されます。例: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                              |          |                                                                                                                                                                                                                                                                  |
| `query`                 | BigQuery からデータを読み取るために使用する SQL クエリ。BigQuery データセットが Dataflow ジョブとは異なるプロジェクトにある場合、SQL クエリ内でデータセット名を完全に指定してください。例: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。`useLegacySql` が true でない限り、デフォルトは [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql) です。 |          | `inputTableSpec` または `query` のいずれかを指定する必要があります。両方のパラメータを設定すると、テンプレートは `query` パラメータを使用します。例: `SELECT * FROM sampledb.sample_table`。                                                                                        |
| `useLegacySql`          | レガシー SQL を使用するには `true` に設定します。このパラメータは `query` パラメータを使用する場合にのみ適用されます。デフォルトは `false` です。                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 基本テーブルの権限がない状態で承認されたビューから読み取る場合に必要です。例: `US`。                                                                                                                                                                                                                                          |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | クエリの結果を格納するための一時テーブルを作成する既存のデータセットを設定します。例: `temp_dataset`。                                                                                                                                                                                                                              |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | クエリソースを使用して BigQuery から読み取る場合、この Cloud KMS キーを使用して作成された一時テーブルを暗号化します。例: `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                  |          |                                                                                                                                                                                                                                                                  |


:::note
すべての `ClickHouseIO` パラメータのデフォルト値は、[`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) で確認できます。
:::

## ソースとターゲットテーブルスキーマ {#source-and-target-tables-schema}

BigQuery データセットを ClickHouse に効果的に読み込むため、カラムの整合性プロセスが以下のフェーズで実施されます。

1. テンプレートは、ターゲットの ClickHouse テーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートは BigQuery データセットを繰り返し処理し、カラム名に基づいてマッチングを試みます。

<br/>

:::important
言うまでもなく、あなたの BigQuery データセット（テーブルまたはクエリのいずれか）は、ClickHouse ターゲットテーブルと正確に同じカラム名を持っている必要があります。
:::

## データ型マッピング {#data-types-mapping}

BigQuery のタイプは、ClickHouse テーブルの定義に基づいて変換されます。したがって、上記のテーブルは、ターゲットの ClickHouse テーブルに持つべき推奨マッピングを示しています（特定の BigQuery テーブル/クエリの場合）：

| BigQuery タイプ                                                                                                         | ClickHouse タイプ                                                 | ノート                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array タイプ**](../../../sql-reference/data-types/array)       | 内部タイプは、このテーブルにリストされているサポートされているプリミティブデータ型のいずれかでなければなりません。                                                                                                                                                                                                                                                                                                                                 |
| [**Boolean タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool タイプ**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date タイプ**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime タイプ**](../../../sql-reference/data-types/datetime) | `Enum8`、`Enum16` および `FixedString` でも機能します。                                                                                                                                                                                                                                                                                                                                                                |
| [**String タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String タイプ**](../../../sql-reference/data-types/string)     | BigQuery ではすべての Int タイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は `INT64` のエイリアスです。ClickHouse で適切な整数サイズを設定することをお勧めします。テンプレートは、定義されたカラムタイプに基づいてカラムを変換します（`Int8`、`Int16`、`Int32`、`Int64`）。                                                                                                                          |
| [**Numeric - 整数タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**整数タイプ**](../../../sql-reference/data-types/int-uint) | BigQuery ではすべての Int タイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は `INT64` のエイリアスです。ClickHouse で適切な整数サイズを設定することをお勧めします。テンプレートは、定義されたカラムタイプに基づいてカラムを変換します（`Int8`、`Int16`、`Int32`、`Int64`）。ClickHouse テーブルで使用される場合は、未割り当ての Int タイプも変換されます（`UInt8`、`UInt16`、`UInt32`、`UInt64`）。 |
| [**Numeric - 浮動小数点タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**浮動小数点タイプ**](../../../sql-reference/data-types/float)      | サポートされている ClickHouse タイプ：`Float32` と `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## テンプレートの実行 {#running-the-template}

BigQuery から ClickHouse へのテンプレートは、Google Cloud CLI 経由で実行可能です。

:::note
このドキュメント、および特に上記のセクションを確認して、テンプレートの構成要件と前提条件を完全に理解してください。

:::

### `gcloud` CLI のインストールと構成 {#install--configure-gcloud-cli}

- まだインストールされていない場合は、[`gcloud` CLI](https://cloud.google.com/sdk/docs/install) をインストールします。
- [このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) の「始める前の準備」セクションに従って、DataFlow テンプレートを実行するための必要な設定、設定、および権限を整えます。

### コマンドの実行 {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) コマンドを使用して、Flex テンプレートを使用した Dataflow ジョブを実行します。

以下はコマンドの例です：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの内訳 {#command-breakdown}

- **ジョブ名:** `run` キーワードに続くテキストがユニークなジョブ名です。
- **テンプレートファイル:** `--template-file-gcs-location` で指定した JSON ファイルがテンプレートの構造と受け入れられるパラメータについての詳細を定義しています。言及したファイルパスは公開されており、すぐに利用可能です。
- **パラメータ:** パラメータはカンマで区切られます。文字列ベースのパラメータの場合、値を二重引用符で囲みます。

### 期待される応答 {#expected-response}

コマンドを実行後、以下のような応答が表示されるはずです：

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

Google Cloud Console の [Dataflow ジョブタブ](https://console.cloud.google.com/dataflow/jobs) に移動してジョブのステータスを監視します。ジョブの詳細、進行状況、およびエラーを確認できます：

<img src={require('../images/dataflow-inqueue-job.png').default} class="image" alt="DataFlow running job"
style={{width: '100%', 'background-color': 'transparent'}}/>

## トラブルシューティング {#troubleshooting}

### コード: 241. DB::Exception: メモリ制限 (合計) を超えました {#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、ClickHouse が大きなデータバッチの処理中にメモリ不足になると発生します。この問題を解決するために：

* インスタンスリソースを増やす: データ処理の負荷を処理できるように、ClickHouse サーバーをより大きなインスタンスにアップグレードします。
* バッチサイズを減少させる: Dataflow ジョブ構成でバッチサイズを調整し、ClickHouse に送信されるデータを小さなチャンクに分割して、バッチごとのメモリ消費を削減します。
これらの変更は、データ取り込み中のリソース使用のバランスを取るのに役立つかもしれません。

## テンプレートソースコード {#template-source-code}

テンプレートのソースコードは、ClickHouse の [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) フォークで利用可能です。
