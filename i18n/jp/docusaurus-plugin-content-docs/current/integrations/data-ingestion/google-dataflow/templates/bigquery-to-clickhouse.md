---
sidebar_label: 'BigQuery から ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'ユーザーは Google Dataflow テンプレートを使用して BigQuery から ClickHouse にデータを取り込むことができます'
title: 'Dataflow BigQuery から ClickHouse へのテンプレート'
doc_type: 'guide'
keywords: ['Dataflow', 'BigQuery']
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'
import dataflow_create_job_from_template_button from '@site/static/images/integrations/data-ingestion/google-dataflow/create_job_from_template_button.png'
import dataflow_template_clickhouse_search from '@site/static/images/integrations/data-ingestion/google-dataflow/template_clickhouse_search.png'
import dataflow_template_initial_form from '@site/static/images/integrations/data-ingestion/google-dataflow/template_initial_form.png'
import dataflow_extended_template_form from '@site/static/images/integrations/data-ingestion/google-dataflow/extended_template_form.png'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Dataflow BigQuery から ClickHouse へのテンプレート

BigQuery から ClickHouse へのテンプレートは、BigQuery テーブルから ClickHouse テーブルにデータを取り込むバッチ パイプラインです。
このテンプレートは、テーブル全体を読み取ることも、指定した SQL クエリを使用して特定のレコードをフィルタリングすることもできます。

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>



## パイプラインの要件 {#pipeline-requirements}

- ソースのBigQueryテーブルが存在する必要があります。
- ターゲットのClickHouseテーブルが存在する必要があります。
- ClickHouseホストがDataflowワーカーマシンからアクセス可能である必要があります。


## テンプレートパラメータ {#template-parameters}

<br />
<br />

| パラメータ名          | パラメータの説明                                                                                                                                                                                                                                                                                                                              | 必須 | 備考                                                                                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jdbcUrl`               | `jdbc:clickhouse://<host>:<port>/<schema>` 形式のClickHouse JDBC URL。                                                                                                                                                                                                                                                                  | ✅       | ユーザー名とパスワードをJDBCオプションとして追加しないでください。その他のJDBCオプションはJDBC URLの末尾に追加できます。ClickHouse Cloudユーザーの場合は、`jdbcUrl`に`ssl=true&sslmode=NONE`を追加してください。                                                                  |
| `clickHouseUsername`    | 認証に使用するClickHouseのユーザー名。                                                                                                                                                                                                                                                                                                      | ✅       |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 認証に使用するClickHouseのパスワード。                                                                                                                                                                                                                                                                                                      | ✅       |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | データが挿入される対象のClickHouseテーブル。                                                                                                                                                                                                                                                                                                      | ✅       |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 挿入用のブロック作成を制御する場合の、挿入時の最大ブロックサイズ(ClickHouseIOオプション)。                                                                                                                                                                                                                                    |          | `ClickHouseIO`オプション。                                                                                                                                                                                                                                         |
| `insertDistributedSync` | この設定を有効にすると、分散テーブルへの挿入クエリは、データがクラスタ内のすべてのノードに送信されるまで待機します(ClickHouseIOオプション)。                                                                                                                                                                                                                 |          | `ClickHouseIO`オプション。                                                                                                                                                                                                                                         |
| `insertQuorum`          | レプリケートされたテーブルへのINSERTクエリにおいて、指定された数のレプリカへの書き込みを待機し、データの追加を線形化します。0 - 無効。                                                                                                                                                                                                                |          | `ClickHouseIO`オプション。この設定はデフォルトのサーバー設定では無効になっています。                                                                                                                                                                                    |
| `insertDeduplicate`     | レプリケートされたテーブルへのINSERTクエリにおいて、挿入ブロックの重複排除を実行するかどうかを指定します。                                                                                                                                                                                                                                  |          | `ClickHouseIO`オプション。                                                                                                                                                                                                                                         |
| `maxRetries`            | 挿入ごとの最大再試行回数。                                                                                                                                                                                                                                                                                                              |          | `ClickHouseIO`オプション。                                                                                                                                                                                                                                         |
| `InputTableSpec`        | 読み取り元のBigQueryテーブル。`inputTableSpec`または`query`のいずれかを指定してください。両方が設定されている場合は、`query`パラメータが優先されます。例: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                |          | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage)を使用してBigQueryストレージから直接データを読み取ります。[Storage Read APIの制限事項](https://cloud.google.com/bigquery/docs/reference/storage#limitations)に注意してください。 |
| `outputDeadletterTable` | 出力テーブルへの到達に失敗したメッセージ用のBigQueryテーブル。テーブルが存在しない場合は、パイプライン実行時に作成されます。指定されていない場合は、`<outputTableSpec>_error_records`が使用されます。例: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                              |          |                                                                                                                                                                                                                                                                  |
| `query`                 | BigQueryからデータを読み取るために使用するSQLクエリ。BigQueryデータセットがDataflowジョブとは異なるプロジェクトにある場合は、SQLクエリで完全なデータセット名を指定してください。例: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。`useLegacySql`がtrueでない限り、デフォルトは[GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)です。 |          | `inputTableSpec`または`query`のいずれかを指定する必要があります。両方のパラメータを設定した場合、テンプレートは`query`パラメータを使用します。例: `SELECT * FROM sampledb.sample_table`。                                                                                        |
| `useLegacySql`          | レガシーSQLを使用する場合は`true`に設定します。このパラメータは`query`パラメータを使用する場合にのみ適用されます。デフォルトは`false`です。                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 基礎となるテーブルの権限なしで承認されたビューから読み取る場合に必要です。例: `US`。                                                                                                                                                                                                                                          |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | クエリの結果を格納する一時テーブルを作成するための既存のデータセットを設定します。例: `temp_dataset`。                                                                                                                                                                                                                              |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | クエリソースを使用してBigQueryから読み取る場合、作成される一時テーブルを暗号化するためにこのCloud KMSキーを使用します。例: `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                  |          |                                                                                                                                                                                                                                                                  |


:::note
すべての `ClickHouseIO` パラメータのデフォルト値は、[`ClickHouseIO` Apache Beam コネクタ](/integrations/apache-beam#clickhouseiowrite-parameters) に記載されています。
:::



## ソーステーブルとターゲットテーブルのスキーマ {#source-and-target-tables-schema}

BigQueryデータセットをClickHouseに効果的にロードするため、パイプラインは以下のフェーズでカラム推論処理を実行します:

1. テンプレートはターゲットのClickHouseテーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートはBigQueryデータセットを反復処理し、カラム名に基づいてカラムのマッチングを試みます。

<br />

:::important
そのため、BigQueryデータセット(テーブルまたはクエリ)は、ClickHouseのターゲットテーブルと完全に同じカラム名を持つ必要があります。
:::


## データ型マッピング {#data-types-mapping}

BigQueryの型は、ClickHouseテーブル定義に基づいて変換されます。したがって、以下の表は、特定のBigQueryテーブル/クエリに対して、ターゲットとなるClickHouseテーブルに設定すべき推奨マッピングを示しています。

| BigQuery型                                                                                                         | ClickHouse型                                                 | 注記                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Array型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array型**](../../../sql-reference/data-types/array)       | 内部型は、この表に記載されているサポート対象のプリミティブデータ型のいずれかである必要があります。                                                                                                                                                                                                                                                                                                                 |
| [**Boolean型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool型**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date型**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime型**](../../../sql-reference/data-types/datetime) | `Enum8`、`Enum16`、`FixedString`でも動作します。                                                                                                                                                                                                                                                                                                                                                                |
| [**String型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String型**](../../../sql-reference/data-types/string)     | BigQueryでは、すべてのInt型(`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`)は`INT64`のエイリアスです。テンプレートは定義されたカラム型(`Int8`、`Int16`、`Int32`、`Int64`)に基づいてカラムを変換するため、ClickHouseでは適切な整数サイズを設定することを推奨します。                                                                                                                          |
| [**数値型 - 整数型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**整数型**](../../../sql-reference/data-types/int-uint) | BigQueryでは、すべてのInt型(`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`)は`INT64`のエイリアスです。テンプレートは定義されたカラム型(`Int8`、`Int16`、`Int32`、`Int64`)に基づいてカラムを変換するため、ClickHouseでは適切な整数サイズを設定することを推奨します。また、ClickHouseテーブルで符号なし整数型(`UInt8`、`UInt16`、`UInt32`、`UInt64`)が使用されている場合も、テンプレートは変換を行います。 |
| [**数値型 - 浮動小数点型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**浮動小数点型**](../../../sql-reference/data-types/float)      | サポートされるClickHouse型:`Float32`および`Float64`                                                                                                                                                                                                                                                                                                                                                                    |


## テンプレートの実行 {#running-the-template}

BigQuery to ClickHouseテンプレートは、Google Cloud CLIを使用して実行できます。

:::note
テンプレートの設定要件と前提条件を完全に理解するために、このドキュメント、特に上記のセクションを必ず確認してください。

:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Google Cloud Consoleにサインインし、DataFlowを検索します。

1. `CREATE JOB FROM TEMPLATE`ボタンをクリックします
   <Image
     img={dataflow_create_job_from_template_button}
     border
     alt='DataFlowコンソール'
   />
2. テンプレートフォームが開いたら、ジョブ名を入力し、目的のリージョンを選択します。
   <Image
     img={dataflow_template_initial_form}
     border
     alt='DataFlowテンプレート初期フォーム'
   />
3. `DataFlow Template`入力欄に`ClickHouse`または`BigQuery`と入力し、`BigQuery to ClickHouse`テンプレートを選択します
   <Image
     img={dataflow_template_clickhouse_search}
     border
     alt='BigQuery to ClickHouseテンプレートを選択'
   />
4. 選択すると、フォームが展開され、以下の追加情報を入力できるようになります：
   - ClickHouseサーバーのJDBC URL（形式：`jdbc:clickhouse://host:port/schema`）
   - ClickHouseのユーザー名
   - ClickHouseのターゲットテーブル名

<br />

:::note
ClickHouseのパスワードオプションはオプションとしてマークされており、パスワードが設定されていない場合に使用します。
パスワードを追加するには、`Password for ClickHouse Endpoint`オプションまでスクロールしてください。
:::

<Image
  img={dataflow_extended_template_form}
  border
  alt='BigQuery to ClickHouse拡張テンプレートフォーム'
/>

5. [テンプレートパラメータ](#template-parameters)セクションで説明されているように、BigQuery/ClickHouseIO関連の設定をカスタマイズして追加します

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### `gcloud` CLIのインストールと設定 {#install--configure-gcloud-cli}

- まだインストールされていない場合は、[`gcloud` CLI](https://cloud.google.com/sdk/docs/install)をインストールします。
- DataFlowテンプレートを実行するために必要な設定、構成、権限をセットアップするには、[このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin)の`Before you begin`セクションに従ってください。

### コマンドの実行 {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)コマンドを使用して、Flex Templateを使用するDataflowジョブを実行します。

以下はコマンドの例です：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの詳細 {#command-breakdown}

- **ジョブ名：** `run`キーワードに続くテキストが一意のジョブ名です。
- **テンプレートファイル：** `--template-file-gcs-location`で指定されたJSONファイルは、テンプレートの構造と受け入れ可能なパラメータの詳細を定義します。記載されているファイルパスは公開されており、すぐに使用できます。
- **パラメータ：** パラメータはカンマで区切られます。文字列ベースのパラメータの場合は、値を二重引用符で囲みます。

### 期待されるレスポンス {#expected-response}

コマンドを実行すると、以下のようなレスポンスが表示されます：

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

  </TabItem>
</Tabs>

### ジョブの監視 {#monitor-the-job}

Google Cloud Consoleの[Dataflow Jobsタブ](https://console.cloud.google.com/dataflow/jobs)に移動して、ジョブのステータスを監視します。進捗状況やエラーを含むジョブの詳細が表示されます：


<Image img={dataflow_inqueue_job} size="lg" border alt="実行中の BigQuery から ClickHouse へのジョブを表示している Dataflow コンソール" />



## トラブルシューティング {#troubleshooting}

### メモリ制限（合計）超過エラー（コード241） {#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、ClickHouseが大量のデータバッチを処理する際にメモリ不足になった場合に発生します。この問題を解決するには：

- インスタンスリソースを増やす：データ処理負荷に対応できるよう、より多くのメモリを搭載した大きなインスタンスにClickHouseサーバーをアップグレードします。
- バッチサイズを減らす：Dataflowジョブ設定でバッチサイズを調整し、ClickHouseに送信するデータのチャンクを小さくすることで、バッチあたりのメモリ消費量を削減します。これらの変更により、データ取り込み時のリソース使用量のバランスを取ることができます。


## テンプレートのソースコード {#template-source-code}

テンプレートのソースコードは、ClickHouseの[DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates)フォークで公開されています。
