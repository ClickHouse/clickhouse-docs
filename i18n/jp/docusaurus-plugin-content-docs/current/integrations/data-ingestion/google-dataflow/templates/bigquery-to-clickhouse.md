---
sidebar_label: 'BigQuery から ClickHouse へのインポート'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'ユーザーは Google Dataflow テンプレートを使用して BigQuery から ClickHouse にデータを取り込むことができます'
title: 'Dataflow BigQuery から ClickHouse へのテンプレート'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Dataflow BigQuery から ClickHouse へのテンプレート

BigQuery から ClickHouse へのテンプレートは、BigQuery テーブルから ClickHouse テーブルへのデータを取り込むバッチパイプラインです。
テンプレートは、テーブル全体を読み取ることも、提供されたクエリを使用して特定のレコードを読み取ることもできます。

<TOCInline toc={toc}></TOCInline>

## パイプライン要件 {#pipeline-requirements}

* ソースの BigQuery テーブルが存在する必要があります。
* ターゲットの ClickHouse テーブルが存在する必要があります。
* ClickHouse ホストは、Dataflow ワーカー マシンからアクセス可能である必要があります。

## テンプレートパラメータ {#template-parameters}

<br/>
<br/>

| パラメータ名                | パラメータの説明                                                                                                                                                                                                                                                                                                           | 必須     | メモ                                                                                                                                                                                                                                                                     |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`                   | ClickHouse JDBC URL の形式は `jdbc:clickhouse://<host>:<port>/<schema>` です。                                                                                                                                                                                                                                             | ✅        | JDBC オプションとしてユーザー名とパスワードを追加しないでください。その他の JDBC オプションは JDBC URL の末尾に追加できます。ClickHouse Cloud ユーザーの場合、`jdbcUrl` に `ssl=true&sslmode=NONE` を追加してください。                                                 |
| `clickHouseUsername`        | 認証に使用する ClickHouse のユーザー名。                                                                                                                                                                                                                                                                                 | ✅        |                                                                                                                                                                                                                                                                           |
| `clickHousePassword`        | 認証に使用する ClickHouse のパスワード。                                                                                                                                                                                                                                                                                 | ✅        |                                                                                                                                                                                                                                                                           |
| `clickHouseTable`           | データを挿入するターゲットの ClickHouse テーブル名。                                                                                                                                                                                                                                                                     | ✅        |                                                                                                                                                                                                                                                                           |
| `maxInsertBlockSize`        | 挿入のための最大ブロックサイズ。挿入用のブロック作成を制御する場合 (ClickHouseIO オプション)。                                                                                                                                                                                                                                  |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                                 |
| `insertDistributedSync`     | 設定が有効な場合、分散クエリの挿入はクラスター内のすべてのノードにデータが送信されるまで待機します (ClickHouseIO オプション)。                                                                                                                                                                                               |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                                 |
| `insertQuorum`              | レプリケートテーブルでの INSERT クエリのために、指定された数のレプリカへの書き込みを待機しデータの追加を整列させます。0 - 無効。                                                                                                                                                                                            |          | `ClickHouseIO` オプション。この設定はデフォルトサーバ設定で無効です。                                                                                                                                                                                                         |
| `insertDeduplicate`         | レプリケートテーブルでの INSERT クエリのために、挿入ブロックの重複除去を行うことを指定します。                                                                                                                                                                                                                                 |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                                 |
| `maxRetries`                | 挿入ごとの最大再試行回数。                                                                                                                                                                                                                                                                                                   |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                                 |
| `InputTableSpec`            | 読み取る BigQuery テーブルを指定します。`inputTableSpec` または `query` のいずれかを指定してください。両方が設定されている場合、`query` パラメータが優先されます。例: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                      |          | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) を使用して BigQuery ストレージから直接データを読み取ります。[Storage Read APIの制限](https://cloud.google.com/bigquery/docs/reference/storage#limitations) に注意してください。 |
| `outputDeadletterTable`     | 出力テーブルに到達できなかったメッセージのための BigQuery テーブル。このテーブルが存在しない場合は、パイプライン実行中に作成されます。指定しない場合、`<outputTableSpec>_error_records` が使用されます。例: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                                         |          |                                                                                                                                                                                                                                                                           |
| `query`                     | BigQuery からデータを読み取るために使用する SQL クエリ。BigQuery データセットが Dataflow ジョブとは異なるプロジェクトにある場合、SQL クエリに完全なデータセット名を指定します。例: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。`useLegacySql` が true でない限り、デフォルトは [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql) です。 |          | `inputTableSpec` または `query` のいずれかを指定する必要があります。両方のパラメータを設定すると、テンプレートは `query` パラメータを使用します。例: `SELECT * FROM sampledb.sample_table`。                                                                                       |
| `useLegacySql`              | 古い SQL を使用するには `true` に設定します。このパラメータは `query` パラメータを使用している場合にのみ適用されます。デフォルトは `false` です。                                                                                                                                                                                           |          |                                                                                                                                                                                                                                                                           |
| `queryLocation`             | 基礎となるテーブルの権限なしで認証されたビューから読み取るときに必要です。例えば、`US`。                                                                                                                                                                                                                                        |          |                                                                                                                                                                                                                                                                           |
| `queryTempDataset`          | クエリ結果を保存するための一時テーブルを作成するために既存のデータセットを設定します。例: `temp_dataset`。                                                                                                                                                                                                                        |          |                                                                                                                                                                                                                                                                           |
| `KMSEncryptionKey`          | クエリソースを使用して BigQuery から読み取る場合、作成された一時テーブルを暗号化するためにこの Cloud KMS キーを使用します。例: `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                       |          |                                                                                                                                                                                                                                                                           |


:::note
すべての `ClickHouseIO` パラメータのデフォルト値は [`ClickHouseIO` Apache Beam コネクタ](/integrations/apache-beam#clickhouseiowrite-parameters) で確認できます。
:::

## ソースおよびターゲットテーブルのスキーマ {#source-and-target-tables-schema}

BigQuery データセットを ClickHouse に効果的にロードするために、カラムの感染プロセスが以下のフェーズで実行されます。

1. テンプレートは、ターゲットの ClickHouse テーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートは BigQuery データセットを反復処理し、カラム名に基づいて一致を試みます。

<br/>

:::important
したがって、あなたの BigQuery データセット (テーブルまたはクエリのいずれか) のカラム名は、ClickHouse ターゲットテーブルのカラム名と正確に一致している必要があります。
:::

## データ型のマッピング {#data-types-mapping}

BigQuery の型は、ClickHouse テーブル定義に基づいて変換されます。したがって、上記のテーブルは、ターゲットの ClickHouse テーブルに持つべき推奨のマッピングを示しています (特定の BigQuery テーブル/クエリの場合):

| BigQuery 型                                                                                                         | ClickHouse 型                                               | メモ                                                                                                                                                                                                                                                                                                                                                                                                                  |
|---------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**配列型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**配列型**](../../../sql-reference/data-types/array)     | 内部の型は、このテーブルにリストされたサポートされているプリミティブデータ型のいずれかである必要があります。                                                                                                                                                                                                                                                                                                           |
| [**ブール型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)               | [**真偽値型**](../../../sql-reference/data-types/boolean)  |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**日付型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**日付型**](../../../sql-reference/data-types/date)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**日付時刻型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)             | [**日付時刻型**](../../../sql-reference/data-types/datetime) | `Enum8`、`Enum16`、および `FixedString` ともうまく動作します。                                                                                                                                                                                                                                                                                                                                                          |
| [**文字列型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**文字列型**](../../../sql-reference/data-types/string)  | BigQuery では、すべての Int 型 (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) は `INT64` のエイリアスです。ClickHouse で正しい整数サイズを設定することをお勧めします。テンプレートは定義されたカラム型 (`Int8`、`Int16`、`Int32`、`Int64`) に基づいてカラムを変換します。                                                                                              |
| [**数値 - 整数型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)         | [**整数型**](../../../sql-reference/data-types/int-uint) | BigQuery では、すべての Int 型 (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) は `INT64` のエイリアスです。ClickHouse で正しい整数サイズを設定することをお勧めします。テンプレートは定義されたカラム型 (`Int8`、`Int16`、`Int32`、`Int64`) に基づいてカラムを変換します。また、ClickHouse テーブルで使用される未割り当ての Int 型 (`UInt8`、`UInt16`、`UInt32`、`UInt64`) も変換されます。 |
| [**数値 - 浮動小数点型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**浮動小数点型**](../../../sql-reference/data-types/float) | サポートされている ClickHouse 型: `Float32` と `Float64`                                                                                                                                                                                                                                                                                                                                                                          |

## テンプレートの実行 {#running-the-template}

BigQuery から ClickHouse へのテンプレートは、Google Cloud CLI を介して実行可能です。

:::note
このドキュメントを確認し、特に上記のセクションを見て、テンプレートの設定要件と前提条件を完全に理解してください。

:::

### `gcloud` CLI のインストールと設定 {#install--configure-gcloud-cli}

- まだインストールされていない場合は、[`gcloud` CLI](https://cloud.google.com/sdk/docs/install)をインストールします。
- [このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) の `Before you begin` セクションに従い、DataFlow テンプレートを実行するために必要な設定、設定、および権限を設定します。

### 実行コマンド {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) コマンドを使用して、Flex テンプレートを使用する Dataflow ジョブを実行します。

以下はコマンドの例です:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの内訳 {#command-breakdown}

- **ジョブ名:** `run` キーワードに続くテキストは一意のジョブ名です。
- **テンプレートファイル:** `--template-file-gcs-location` で指定された JSON ファイルはテンプレートの構造と受け入れ可能なパラメータについての詳細を定義します。言及されたファイルパスはパブリックで、利用可能です。
- **パラメータ:** パラメータはカンマで区切られています。文字列ベースのパラメータの場合、値を二重引用符で囲みます。

### 期待される応答 {#expected-response}

コマンドを実行した後、次のような応答が得られるはずです:

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

Google Cloud Console の [Dataflow Jobs タブ](https://console.cloud.google.com/dataflow/jobs) に移動して、ジョブのステータスを監視します。進捗状況やエラーを含むジョブの詳細が表示されます:

<Image img={dataflow_inqueue_job} size="lg" border alt="データフローモニターに表示された実行中の BigQuery から ClickHouse へのジョブ" />

## トラブルシューティング {#troubleshooting}

### コード: 241. DB::Exception: メモリ制限 (合計) を超えました {#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、ClickHouse が大きなデータバッチを処理中にメモリが不足した場合に発生します。この問題を解決するには:

* インスタンスリソースを増やす: 大きなインスタンスに ClickHouse サーバをアップグレードして、データ処理負荷に対応できるようにします。
* バッチサイズを減少させる: Dataflow ジョブ構成でバッチサイズを調整して、ClickHouse に送信するデータのチャンクを小さくし、バッチごとのメモリ消費を減らします。
これらの変更により、データ取り込み中のリソース使用のバランスが取れる場合があります。

## テンプレートソースコード {#template-source-code}

テンプレートのソースコードは、ClickHouse の [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) フォークで入手可能です。
