---
sidebar_label: 'BigQuery から ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'Google Dataflow テンプレートを使用して BigQuery のデータを ClickHouse に取り込めます'
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


# Dataflow BigQuery から ClickHouse へのテンプレート {#dataflow-bigquery-to-clickhouse-template}

BigQuery から ClickHouse への Dataflow テンプレートは、BigQuery テーブルから ClickHouse テーブルへデータをバッチで取り込むパイプラインです。
このテンプレートは、テーブル全体を読み取ることも、指定された SQL クエリを使用して特定のレコードに絞り込むこともできます。

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>



## パイプラインの要件 {#pipeline-requirements}

* ソース BigQuery テーブルが存在している必要があります。
* ターゲット ClickHouse テーブルが存在している必要があります。
* ClickHouse ホストが Dataflow ワーカーマシンからアクセス可能である必要があります。



## テンプレートパラメータ {#template-parameters}

<br/>
<br/>

| Parameter Name          | Parameter Description                                                                                                                                                                                                                                                                                                                              | Required | Notes                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | `jdbc:clickhouse://<host>:<port>/<schema>` 形式の ClickHouse JDBC URL。                                                                                                                                                                                                                                                                             | ✅        | ユーザー名とパスワードは JDBC オプションとして追加しないでください。その他の JDBC オプションは JDBC URL の末尾に追加できます。ClickHouse Cloud ユーザーは、`jdbcUrl` に `ssl=true&sslmode=NONE` を追加してください。                                                                     |
| `clickHouseUsername`    | 認証に使用する ClickHouse のユーザー名。                                                                                                                                                                                                                                                                                                           | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 認証に使用する ClickHouse のパスワード。                                                                                                                                                                                                                                                                                                           | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | データの挿入先となる ClickHouse テーブル。                                                                                                                                                                                                                                                                                                         | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 挿入用のブロック作成を制御する場合の、挿入時の最大ブロックサイズ（ClickHouseIO オプション）。                                                                                                                                                                                                                                                     |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                      |
| `insertDistributedSync` | この設定が有効な場合、分散テーブルへの INSERT クエリは、データがクラスタ内のすべてのノードへ送信されるまで待機します（ClickHouseIO オプション）。                                                                                                                                                                                                |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                      |
| `insertQuorum`          | レプリケートされたテーブルに対する INSERT クエリで、指定された数のレプリカへの書き込み完了を待機し、データの追加を直列化します。0 の場合は無効。                                                                                                                                                                                                  |          | `ClickHouseIO` オプション。この設定はデフォルトのサーバー設定では無効になっています。                                                                                                                                                                         |
| `insertDeduplicate`     | レプリケートされたテーブルに対する INSERT クエリで、挿入ブロックの重複排除を実行することを指定します。                                                                                                                                                                                                                                             |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                      |
| `maxRetries`            | 1 回の挿入あたりの最大リトライ回数。                                                                                                                                                                                                                                                                                                               |          | `ClickHouseIO` オプション。                                                                                                                                                                                                                                      |
| `InputTableSpec`        | 読み取り元の BigQuery テーブル。`inputTableSpec` または `query` のいずれか一方を指定します。両方が設定されている場合は、`query` パラメータが優先されます。例: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                    |          | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) を使用して BigQuery ストレージから直接データを読み取ります。[Storage Read API の制限事項](https://cloud.google.com/bigquery/docs/reference/storage#limitations) に注意してください。 |
| `outputDeadletterTable` | 出力テーブルへの書き込みに失敗したメッセージ用の BigQuery テーブル。テーブルが存在しない場合は、パイプライン実行中に作成されます。指定しない場合、`<outputTableSpec>_error_records` が使用されます。例: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                                 |          |                                                                                                                                                                                                                                                                  |
| `query`                 | BigQuery からデータを読み取るために使用する SQL クエリ。BigQuery データセットが Dataflow ジョブとは別のプロジェクトにある場合は、SQL クエリ内で完全なデータセット名を指定します（例: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`）。`useLegacySql` が true の場合を除き、デフォルトでは [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql) が使用されます。 |          | `inputTableSpec` または `query` のいずれか一方を必ず指定してください。両方のパラメータを設定した場合、テンプレートは `query` パラメータを使用します。例: `SELECT * FROM sampledb.sample_table`。                                                                                                  |
| `useLegacySql`          | レガシー SQL を使用する場合は `true` に設定します。このパラメータは `query` パラメータを使用する場合にのみ適用されます。デフォルトは `false`。                                                                                                                                                                                                    |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 基盤となるテーブルへの権限なしで承認済みビューから読み取る場合に必要です。例: `US`。                                                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | クエリ結果を保存する一時テーブルを作成するために使用する既存のデータセットを指定します。例: `temp_dataset`。                                                                                                                                                                                                                                     |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | クエリソースを使用して BigQuery から読み取る場合に、一時テーブルを暗号化するために使用する Cloud KMS キー。例: `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                            |          |                                                                                                                                                                                                                                                                  |



:::note
すべての `ClickHouseIO` パラメータのデフォルト値は、[`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) で確認できます。
:::



## ソースおよびターゲットテーブルのスキーマ {#source-and-target-tables-schema}

BigQuery のデータセットを ClickHouse に効果的にロードするために、このパイプラインは次の段階からなる列推論プロセスを実行します。

1. テンプレートは、ターゲットの ClickHouse テーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートは BigQuery データセットを反復処理し、列名に基づいて列の対応付けを試みます。

<br/>

:::important
ただし、BigQuery データセット（テーブルまたはクエリ）の列名は、ClickHouse のターゲットテーブルと完全に一致している必要があります。
:::



## データ型のマッピング {#data-types-mapping}

BigQuery の型は、ClickHouse テーブル定義に基づいて変換されます。したがって、上記の表では（特定の BigQuery テーブル／クエリに対して）ClickHouse 側のテーブルで使用することを推奨するマッピングを示しています。

| BigQuery 型                                                                                                           | ClickHouse 型                                                   | 備考                                                                                                                                                                                                                                                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**配列型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                     | [**配列型**](../../../sql-reference/data-types/array)           | 内側の型は、この表に記載されているサポート対象のプリミティブ型のいずれかである必要があります。                                                                                                                                                                                                                                                                                                                        |
| [**ブール型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)                 | [**Bool 型**](../../../sql-reference/data-types/boolean)        |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**日付型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                      | [**日付型**](../../../sql-reference/data-types/date)            |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime 型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)             | [**Datetime 型**](../../../sql-reference/data-types/datetime)   | `Enum8`、`Enum16`、`FixedString` に対しても同様に使用できます。                                                                                                                                                                                                                                                                                                                                                        |
| [**文字列型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)                  | [**文字列型**](../../../sql-reference/data-types/string)        | BigQuery では、すべての Int 型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は `INT64` のエイリアスです。テンプレートは定義されたカラム型（`Int8`、`Int16`、`Int32`、`Int64`）に基づいてカラムを変換するため、ClickHouse では適切な整数サイズを設定することを推奨します。                                                                                           |
| [**数値 - 整数型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)           | [**整数型**](../../../sql-reference/data-types/int-uint)        | BigQuery では、すべての Int 型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は `INT64` のエイリアスです。テンプレートは定義されたカラム型（`Int8`、`Int16`、`Int32`、`Int64`）に基づいてカラムを変換するため、ClickHouse では適切な整数サイズを設定することを推奨します。また、ClickHouse テーブルで符号なし整数型（`UInt8`、`UInt16`、`UInt32`、`UInt64`）が使用されている場合も、テンプレートはそれらにも変換します。 |
| [**数値 - 浮動小数点型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)     | [**浮動小数点型**](../../../sql-reference/data-types/float)     | サポートされる ClickHouse 型：`Float32` および `Float64` がサポートされています。                                                                                                                                                                                                                                                                                                                                      |



## テンプレートの実行 {#running-the-template}

BigQuery から ClickHouse へのテンプレートは、Google Cloud CLI を通じて実行できます。

:::note
本ドキュメント、とくに前述のセクションをよく確認し、テンプレートの構成要件と前提条件を十分に理解してください。

:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Google Cloud Console にサインインし、Dataflow を検索します。

1. `CREATE JOB FROM TEMPLATE` ボタンを押します
   <Image img={dataflow_create_job_from_template_button} border alt="Dataflow コンソール" />
2. テンプレートフォームが開いたら、ジョブ名を入力し、希望するリージョンを選択します。
   <Image img={dataflow_template_initial_form} border alt="Dataflow テンプレートの初期フォーム" />
3. `Dataflow Template` 入力欄に `ClickHouse` または `BigQuery` と入力し、`BigQuery to ClickHouse` テンプレートを選択します
   <Image img={dataflow_template_clickhouse_search} border alt="BigQuery to ClickHouse テンプレートの選択" />
4. テンプレートを選択すると、追加の詳細を入力できるようにフォームが展開されます:
    * ClickHouse サーバーの JDBC URL（形式: `jdbc:clickhouse://host:port/schema`）。
    * ClickHouse のユーザー名。
    * ClickHouse のターゲットテーブル名。

<br/>

:::note
ClickHouse のパスワードオプションは、パスワードが設定されていないユースケース向けに省略可能としてマークされています。
パスワードを追加するには、`Password for ClickHouse Endpoint` オプションまでスクロールしてください。
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse 拡張テンプレートフォーム" />

5. [テンプレートパラメータ](#template-parameters) セクションで説明されているとおりに、BigQuery/ClickHouseIO 関連の設定をカスタマイズして追加してください。

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### `gcloud` CLI のインストールと設定 {#install--configure-gcloud-cli}

- まだインストールしていない場合は、[`gcloud` CLI](https://cloud.google.com/sdk/docs/install) をインストールします。
- Dataflow テンプレートを実行するために必要な設定・構成・権限を準備するには、
  [このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) の
  `Before you begin` セクションに従ってください。

### コマンドの実行 {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)
コマンドを使用して、Flex Template を利用する Dataflow ジョブを実行します。

以下はコマンドの例です:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの詳細 {#command-breakdown}

- **ジョブ名:** `run` キーワードの後に続く文字列が一意のジョブ名です。
- **テンプレートファイル:** `--template-file-gcs-location` で指定された JSON ファイルには、テンプレートの構造および
  受け付けるパラメータに関する詳細が定義されています。記載されているファイルパスは公開されており、すぐに利用できます。
- **パラメータ:** パラメータはカンマで区切ります。文字列型のパラメータ値は、ダブルクォートで囲んでください。

### 想定されるレスポンス {#expected-response}

コマンドを実行すると、次のようなレスポンスが表示されます:

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

Google Cloud Console の [Dataflow Jobs タブ](https://console.cloud.google.com/dataflow/jobs) に移動し、
ジョブのステータスを監視します。進捗状況やエラーなどのジョブの詳細を確認できます。



<Image img={dataflow_inqueue_job} size="lg" border alt="BigQuery から ClickHouse へのジョブが実行中の Dataflow コンソール" />



## トラブルシューティング {#troubleshooting}

### メモリ制限（合計）超過エラー（コード 241）{#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、大きなバッチのデータを処理している際に ClickHouse のメモリが不足した場合に発生します。これを解決するには、次の対応を行います。

* インスタンスのリソースを増やす: データ処理負荷に対応できるよう、より多くのメモリを持つ大きなインスタンスに ClickHouse サーバーをアップグレードします。
* バッチサイズを減らす: Dataflow ジョブ設定でバッチサイズを調整し、より小さなデータチャンクを ClickHouse に送信することで、バッチごとのメモリ消費を抑えます。これらの変更により、データインジェスト時のリソース使用をバランスさせることができます。



## テンプレートのソースコード {#template-source-code}

このテンプレートのソースコードは、ClickHouseの [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) フォーク先リポジトリで公開されています。
