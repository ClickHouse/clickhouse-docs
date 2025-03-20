---
sidebar_label: BigQuery To ClickHouse
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: ユーザーは Google Dataflow テンプレートを使用して、BigQuery から ClickHouse にデータを取り込むことができます
---

import TOCInline from '@theme/TOCInline';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Dataflow BigQuery to ClickHouse テンプレート

BigQuery to ClickHouse テンプレートは、BigQuery テーブルから ClickHouse テーブルにデータを取り込むバッチパイプラインです。
このテンプレートは、全体のテーブルを読み込むか、提供されたクエリを使用して特定のレコードを読み込むことができます。

<TOCInline toc={toc}></TOCInline>

## パイプライン要件 {#pipeline-requirements}

* ソースの BigQuery テーブルが存在している必要があります。
* 対象の ClickHouse テーブルが存在している必要があります。
* ClickHouse ホストは、Dataflow ワーカーマシンからアクセス可能である必要があります。

## テンプレートパラメータ {#template-parameters}

<br/>
<br/>

| パラメータ名               | パラメータの説明                                                                                                                                                                                                                                                                                                                              | 必須 | 備考                                                                                                                                                                                                                                                            |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`                  | ClickHouse JDBC URL の形式 `jdbc:clickhouse://<host>:<port>/<schema>`。                                                                                                                                                                                                                                                                  | ✅    | ユーザー名とパスワードを JDBC オプションとして追加しないでください。他の JDBC オプションは JDBC URL の末尾に追加できます。ClickHouse Cloud ユーザーの場合、`jdbcUrl` に `ssl=true&sslmode=NONE` を追加してください。                                                                  |
| `clickHouseUsername`       | 認証に使用する ClickHouse のユーザー名。                                                                                                                                                                                                                                                                                                      | ✅    |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`       | 認証に使用する ClickHouse のパスワード。                                                                                                                                                                                                                                                                                                      | ✅    |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`          | データを挿入する対象の ClickHouse テーブル名。                                                                                                                                                                                                                                                                                            | ✅    |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`       | 挿入用の最大ブロックサイズ。ブロックの作成を制御する場合（ClickHouseIO オプション）。                                                                                                                                                                                                                                     |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `insertDistributedSync`    | 設定が有効な場合、分散クエリはデータがクラスター内のすべてのノードに送信されるのを待ちます。（ClickHouseIO オプション）。                                                                                                                                                                                                                     |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `insertQuorum`             | レプリケートされたテーブルの INSERT クエリのため、指定された数のレプリカに書き込みが待機し、データの追加を線形化します。 0 - 無効。                                                                                                                                                                                                                        |      | `ClickHouseIO` オプション。この設定はデフォルトのサーバー設定では無効です。                                                                                                                                                                                    |
| `insertDeduplicate`        | レプリケートされたテーブルの INSERT クエリのため、挿入ブロックの重複排除を実施することを指定します。                                                                                                                                                                                                                                |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `maxRetries`               | 挿入毎の最大リトライ回数。                                                                                                                                                                                                                                                                                                              |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `InputTableSpec`           | 読み取る BigQuery テーブル。`inputTableSpec` または `query` のいずれかを指定します。両方が設定されている場合、`query` パラメータが優先されます。例: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                |      | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) を使用して BigQuery ストレージからデータを直接読み込みます。[Storage Read API の制限](https://cloud.google.com/bigquery/docs/reference/storage#limitations) に注意してください。 |
| `outputDeadletterTable`    | 出力テーブルに到達できなかったメッセージのための BigQuery テーブル。テーブルが存在しない場合、パイプライン実行中に作成されます。指定しない場合は、`<outputTableSpec>_error_records` が使用されます。例: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                              |      |                                                                                                                                                                                                                                                                  |
| `query`                    | BigQuery からデータを読み込むために使用する SQL クエリ。BigQuery データセットが Dataflow ジョブとは異なるプロジェクトにある場合、SQL クエリで完全なデータセット名を指定します。例: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。デフォルトでは [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql) ですが、`useLegacySql` が true の場合を除きます。 |      | `inputTableSpec` または `query` のいずれかを指定する必要があります。両方のパラメータを設定すると、テンプレートは `query` パラメータを使用します。例: `SELECT * FROM sampledb.sample_table`。                                                                                        |
| `useLegacySql`             | Legacy SQL を使用するには `true` に設定します。このパラメータは `query` パラメータを使用しているときのみ適用されます。デフォルトは `false` です。                                                                                                                                                                                                                                |      |                                                                                                                                                                                                                                                                  |
| `queryLocation`            | 基になるテーブルの権限がない状態で承認されたビューから読み取る必要があるときに必要です。例: `US`。                                                                                                                                                                                                                                          |      |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`         | 結果を格納するために一時テーブルを作成するための既存のデータセットを設定します。例: `temp_dataset`。                                                                                                                                                                                                                              |      |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`         | クエリソースを使用して BigQuery から読み取る場合、この Cloud KMS キーを使用して作成された一時テーブルを暗号化します。例: `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                  |      |                                                                                                                                                                                                                                                                  |


:::note
すべての `ClickHouseIO` パラメータのデフォルト値は [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) で確認できます。
:::

## ソースおよびターゲットテーブルのスキーマ {#source-and-target-tables-schema}

BigQuery データセットを ClickHouse に効果的にロードするために、カラムの侵入プロセスが次のフェーズで実施されます。

1. テンプレートはターゲットの ClickHouse テーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートは BigQuery データセットを反復処理し、カラム名に基づいて一致を試みます。

<br/>

:::important
したがって、あなたの BigQuery データセット（テーブルまたはクエリのいずれか）は、あなたの ClickHouse ターゲットテーブルと全く同じカラム名を持っている必要があります。
:::

## データ型マッピング {#data-types-mapping}

BigQuery タイプは、あなたの ClickHouse テーブル定義に基づいて変換されます。したがって、上記の表にはあなたのターゲット ClickHouse テーブルで持つべき推奨マッピングがリストされています（特定の BigQuery テーブル/クエリに対して）：

| BigQuery タイプ                                                                                                     | ClickHouse タイプ                                               | 備考                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)              | [**Array タイプ**](../../../sql-reference/data-types/array)   | 内側のタイプは、この表にリストされているサポートされているプリミティブデータタイプの一つである必要があります。                                                                                                                                                                                                                                                                                                                   |
| [**Boolean タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)          | [**Bool タイプ**](../../../sql-reference/data-types/boolean)  |                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [**Date タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                | [**Date タイプ**](../../../sql-reference/data-types/date)     |                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [**Datetime タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)        | [**Datetime タイプ**](../../../sql-reference/data-types/datetime) | `Enum8`、`Enum16` 及び `FixedString` でも動作します。                                                                                                                                                                                                                                                                                                                                                               |
| [**String タイプ**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)            | [**String タイプ**](../../../sql-reference/data-types/string) | BigQuery では、すべての Int タイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）が `INT64` のエイリアスです。テンプレートは定義されたカラムタイプ（`Int8`、`Int16`、`Int32`、`Int64`）に基づいてカラムを変換するため、ClickHouse で適切な整数サイズを設定することをお勧めします。                                                                                |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | BigQuery では、すべての Int タイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）が `INT64` のエイリアスです。テンプレートは定義されたカラムタイプ（`Int8`、`Int16`、`Int32`、`Int64`）に基づいてカラムを変換するため、ClickHouse で適切な整数サイズを設定することをお勧めします。未割り当ての Int タイプが ClickHouse テーブルで使用される場合も変換されます（`UInt8`、`UInt16`、`UInt32`、`UInt64`）。 |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)    | サポートされている ClickHouse タイプ: `Float32` および `Float64`                                                                                                                                                                                                                                                                                                                                                      |

## テンプレートの実行 {#running-the-template}

BigQuery to ClickHouse テンプレートは Google Cloud CLI による実行が可能です。

:::note
この文書を確認し、特に上記のセクションを確認して、テンプレートの設定要件と前提条件を完全に理解してください。
:::

### `gcloud` CLI のインストールと構成 {#install--configure-gcloud-cli}

- まだインストールしていない場合は [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) をインストールします。
- [このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) の「始める前に」セクションに従って、DataFlow テンプレートを実行するために必要な構成、設定、および権限を設定します。

### コマンドの実行 {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) コマンドを使用して、Flex テンプレートを使用する Dataflow ジョブを実行します。

以下はコマンドの例です：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの詳細 {#command-breakdown}

- **ジョブ名:** `run` キーワードに続くテキストがユニークなジョブ名です。
- **テンプレートファイル:** `--template-file-gcs-location` で指定された JSON ファイルは、テンプレートの構造と受け入れ可能なパラメータに関する詳細を定義します。言及されたファイルパスは公開されており、すぐに使用可能です。
- **パラメータ:** パラメータはカンマで区切られます。文字列ベースのパラメータの場合、値を二重引用符で囲みます。

### 期待される応答 {#expected-response}

コマンドを実行すると、以下のような応答が表示されるはずです：

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

Google Cloud Console の [Dataflow Jobs タブ](https://console.cloud.google.com/dataflow/jobs) にアクセスして、ジョブの状態を監視します。進捗やエラーを含むジョブの詳細を確認できます：

<img src={dataflow_inqueue_job} class="image" alt="DataFlow running job" style={{width: '100%', 'background-color': 'transparent'}}/>

## トラブルシューティング {#troubleshooting}

### コード: 241. DB::Exception: メモリ制限 (合計) 超過 {#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、ClickHouse が大きなデータバッチを処理する際にメモリ不足になると発生します。この問題を解決するには：

* インスタンスリソースを増やす: より大きなインスタンスに ClickHouse サーバーをアップグレードして、データ処理の負荷に対処します。
* バッチサイズを減少させる: Dataflow ジョブの設定でバッチサイズを調整し、ClickHouse に送信するデータのサイズを小さくし、バッチ毎のメモリ消費を減らします。
これらの変更は、データの取り込み中のリソース使用のバランスを取るのに役立つかもしれません。

## テンプレートソースコード {#template-source-code}

テンプレートのソースコードは、ClickHouse の [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) フォークで入手できます。
