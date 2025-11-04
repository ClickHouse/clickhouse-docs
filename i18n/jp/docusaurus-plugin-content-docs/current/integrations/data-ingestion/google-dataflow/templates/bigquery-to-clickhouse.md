---
'sidebar_label': 'BigQuery To ClickHouse'
'sidebar_position': 1
'slug': '/integrations/google-dataflow/templates/bigquery-to-clickhouse'
'description': 'ユーザーは Google Dataflow テンプレートを使用して、BigQuery から ClickHouse にデータを取り込むことができます。'
'title': 'Dataflow BigQuery から ClickHouse テンプレート'
'doc_type': 'guide'
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


# Dataflow BigQuery to ClickHouse テンプレート

BigQuery から ClickHouse へのテンプレートは、BigQuery テーブルから ClickHouse テーブルにデータを取り込むバッチパイプラインです。テンプレートは、全てのテーブルを読み込むか、提供された SQL クエリを使用して特定のレコードをフィルタリングすることができます。

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## パイプライン要件 {#pipeline-requirements}

* ソースの BigQuery テーブルが存在する必要があります。
* ターゲットの ClickHouse テーブルが存在する必要があります。
* ClickHouse ホストは、Dataflow ワーカー マシンからアクセス可能でなければなりません。

## テンプレートパラメータ {#template-parameters}

<br/>
<br/>

| パラメータ名              | パラメータの説明                                                                                                                                                                                                                                                                                                                                  | 必須 | 注記                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | `jdbc:clickhouse://<host>:<port>/<schema>` 形式の ClickHouse JDBC URL。                                                                                                                                                                                                                                                                       | ✅    | JDBC オプションとしてユーザー名とパスワードは追加しないでください。他の JDBC オプションは JDBC URL の末尾に追加できます。ClickHouse Cloud ユーザーの場合は、`jdbcUrl` に `ssl=true&sslmode=NONE` を追加してください。                                                                   |
| `clickHouseUsername`    | 認証に使用する ClickHouse のユーザー名。                                                                                                                                                                                                                                                                                                           | ✅    |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 認証に使用する ClickHouse のパスワード。                                                                                                                                                                                                                                                                                                           | ✅    |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | データが挿入されるターゲット ClickHouse テーブル。                                                                                                                                                                                                                                                                                            | ✅    |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 挿入用の最大ブロックサイズ。挿入のためのブロックの作成を制御する場合（ClickHouseIO オプション）。                                                                                                                                                                                                                                                 |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `insertDistributedSync` | 設定が有効な場合、分散挿入クエリはクラスタ内の全ノードにデータが送信されるまで待機します。 （ClickHouseIO オプション）。                                                                                                                                                                                                                                       |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `insertQuorum`          | レプリケートされたテーブルへの INSERT クエリについて、指定された数のレプリカへの書き込みを待機し、データの追加を直線化します。0 - 無効。                                                                                                                                                                                        |      | `ClickHouseIO` オプション。この設定は既定のサーバー設定では無効です。                                                                                                                                                                                    |
| `insertDeduplicate`     | レプリケートされたテーブルへの INSERT クエリについて、挿入ブロックの重複排除を行うことを指定します。                                                                                                                                                                                                                                           |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `maxRetries`            | 挿入ごとの最大再試行回数。                                                                                                                                                                                                                                                                                                                     |      | `ClickHouseIO` オプション。                                                                                                                                                                                                                                         |
| `InputTableSpec`        | 読み取る BigQuery テーブル。`inputTableSpec` または `query` のいずれかを指定します。両方が設定されている場合、`query` パラメータが優先されます。例: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                        |      | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) を使用して、BigQuery ストレージから直接データを読み取ります。[Storage Read API の制限](https://cloud.google.com/bigquery/docs/reference/storage#limitations)に注意してください。 |
| `outputDeadletterTable` | 出力テーブルに到達できなかったメッセージのための BigQuery テーブルです。テーブルが存在しない場合、パイプライン実行中に作成されます。指定されていない場合、`<outputTableSpec>_error_records` が使用されます。例えば、`<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                              |      |                                                                                                                                                                                                                                                                  |
| `query`                 | BigQuery からデータを読み取るために使用する SQL クエリ。BigQuery データセットが Dataflow ジョブとは異なるプロジェクトにある場合は、SQL クエリに完全なデータセット名を指定してください。例：`<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。デフォルトは [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql) です。`useLegacySql` が true の場合を除きます。 |      | `inputTableSpec` または `query` のいずれかを指定する必要があります。両方のパラメータを設定した場合、テンプレートは `query` パラメータを使用します。例: `SELECT * FROM sampledb.sample_table`。                                                                                      |
| `useLegacySql`          | レガシー SQL を使用する場合は `true` に設定します。このパラメータは `query` パラメータを使用する場合にのみ適用されます。デフォルトは `false` です。                                                                                                                                                                     |      |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 基となるテーブルの権限がない認可ビューから読み取るときに必要です。例えば、`US`。                                                                                                                                                                                                                                          |      |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | クエリの結果を格納する一時テーブルを作成する既存のデータセットを設定します。例えば、`temp_dataset`。                                                                                                                                                                                                                            |      |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | クエリソースを使用して BigQuery から読み取る場合、この Cloud KMS キーを使用して作成された一時テーブルを暗号化します。例えば、`projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                                   |      |                                                                                                                                                                                                                                                                  |

:::note
すべての `ClickHouseIO` パラメータのデフォルト値は、[`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) で確認できます。
:::

## ソースおよびターゲットテーブルのスキーマ {#source-and-target-tables-schema}

BigQuery データセットを ClickHouse に効果的にロードするために、パイプラインは以下のフェーズでカラム推論プロセスを実行します。

1. テンプレートは、ターゲット ClickHouse テーブルに基づいてスキーマオブジェクトを構築します。
2. テンプレートは、BigQuery データセットを反復処理し、カラム名に基づいてカラムの一致を試みます。

<br/>

:::important
言い換えれば、あなたの BigQuery データセット（テーブルまたはクエリのいずれか）は、ClickHouse ターゲットテーブルと正確に同じカラム名を持っている必要があります。
:::

## データ型マッピング {#data-types-mapping}

BigQuery タイプは、あなたの ClickHouse テーブル定義に基づいて変換されます。したがって、上記の表は、あなたのターゲット ClickHouse テーブルで持つべき推奨マッピングを示します（指定された BigQuery テーブル/クエリ用）：

| BigQuery タイプ                                                                                                         | ClickHouse タイプ                                                 | 注記                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | 内部型は、この表にリストされているサポートされているプリミティブデータ型の1つでなければなりません。                                                                                                                                                                                                                                                                                                                     |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | `Enum8`、`Enum16`、`FixedString` でも動作します。                                                                                                                                                                                                                                                                                                                                                                      |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | BigQuery では、すべての Int タイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は `INT64` のエイリアスです。ClickHouse で適切な整数サイズを設定することをお勧めします。テンプレートは定義されたカラム型に基づいてカラムを変換します（`Int8`、`Int16`、`Int32`、`Int64`）。                                                                          |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | BigQuery では、すべての Int タイプ（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）は `INT64` のエイリアスです。ClickHouse で適切な整数サイズを設定することをお勧めします。テンプレートは定義されたカラム型（`Int8`、`Int16`、`Int32`、`Int64`）に基づいてカラムを変換します。ClickHouse テーブルで使用される非指定の Int タイプも変換します（`UInt8`、`UInt16`、`UInt32`、`UInt64`）。                                 |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | サポートされている ClickHouse タイプ: `Float32` および `Float64`                                                                                                                                                                                                                                                                                                                                                 |

## テンプレートの実行 {#running-the-template}

BigQuery から ClickHouse へのテンプレートは、Google Cloud CLI を介して実行可能です。

:::note
このドキュメント、特に上記のセクションをよく確認して、テンプレートの構成要件と前提条件を完全に理解してください。
:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Google Cloud Console にサインインし、DataFlow を検索します。

1. `CREATE JOB FROM TEMPLATE` ボタンを押します。
   <Image img={dataflow_create_job_from_template_button} border alt="DataFlow console" />
2. テンプレートフォームが開いたら、ジョブ名を入力し、希望するリージョンを選択します。
   <Image img={dataflow_template_initial_form} border alt="DataFlow template initial form" />
3. `DataFlow Template` 入力に、`ClickHouse` または `BigQuery` と入力し、`BigQuery to ClickHouse` テンプレートを選択します。
   <Image img={dataflow_template_clickhouse_search} border alt="Select BigQuery to ClickHouse template" />
4. 選択すると、フォームが展開されて、追加の詳細を提供できるようになります：
    * ClickHouse サーバーの JDBC URL、形式は `jdbc:clickhouse://host:port/schema`。
    * ClickHouse のユーザー名。
    * ClickHouse のターゲットテーブル名。

<br/>

:::note
ClickHouse パスワードオプションはオプションとしてマークされています。パスワードが設定されていないユースケースで使用します。追加するには、`Password for ClickHouse Endpoint` オプションまでスクロールしてください。
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse extended template form" />

5. [テンプレートパラメータ](#template-parameters) セクションに詳述されている BigQuery / ClickHouseIO 関連の設定をカスタマイズおよび追加します。

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### `gcloud` CLI のインストールと設定 {#install--configure-gcloud-cli}

- まだインストールされていない場合は、[`gcloud` CLI](https://cloud.google.com/sdk/docs/install) をインストールします。
- [このガイド](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) の `Before you begin` セクションに従って、DataFlow テンプレートを実行するために必要な設定、設定、アクセス許可を設定します。

### 実行コマンド {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) コマンドを使用して、Flex テンプレートを使用する Dataflow ジョブを実行します。

以下はコマンドの例です：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### コマンドの内訳 {#command-breakdown}

- **ジョブ名:** `run` キーワードに続くテキストがユニークなジョブ名です。
- **テンプレートファイル:** `--template-file-gcs-location` で指定された JSON ファイルが、テンプレートの構造と受け入れられるパラメータについての詳細を定義します。言及されたファイルパスは公開されていて、使用可能です。
- **パラメータ:** パラメータはカンマで区切ります。文字列ベースのパラメータには、値を二重引用符で囲みます。

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

  </TabItem>
</Tabs>

### ジョブのモニタリング {#monitor-the-job}

Google Cloud Console の [Dataflow Jobs タブ](https://console.cloud.google.com/dataflow/jobs) に移動して、ジョブのステータスを監視します。進行状況やエラーを含むジョブの詳細が表示されます：

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow console showing a running BigQuery to ClickHouse job" />

## トラブルシューティング {#troubleshooting}

### メモリ制限（合計）超過エラー (コード 241) {#code-241-dbexception-memory-limit-total-exceeded}

このエラーは、ClickHouse が大規模なデータバッチを処理している際にメモリ不足になると発生します。この問題を解決するために：

* インスタンスリソースを増やす: ClickHouse サーバーをより多くのメモリを搭載した大きなインスタンスにアップグレードして、データ処理の負荷を処理します。
* バッチサイズを減少させる: Dataflow ジョブ設定でバッチサイズを調整して、ClickHouse に送信するデータの小さなチャンクを送信し、バッチごとのメモリ消費を削減します。これらの変更により、データ取り込み中のリソース使用をバランスさせるのに役立ちます。

## テンプレートソースコード {#template-source-code}

テンプレートのソースコードは、ClickHouse の [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) フォークで利用可能です。
