---
description: 'Amazon S3、Azure、HDFS、またはローカルに保存された Apache Iceberg テーブルに対して、読み取り専用のテーブル形式インターフェイスを提供します。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# iceberg テーブル関数 \{#iceberg-table-function\}

Amazon S3、Azure、HDFS 上またはローカルに保存された Apache [Iceberg](https://iceberg.apache.org/) テーブルを、読み取り専用のテーブルとして扱うためのインターフェイスを提供します。

## 構文 \{#syntax\}

```sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```

## 引数 \{#arguments\}

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS`、`file` の引数の説明とそれぞれ同様です。  
`format` は、Iceberg テーブル内のデータファイルの形式を表します。

### 返される値 \{#returned-value\}

指定した Iceberg テーブルのデータを読み取るための、指定した構造を持つテーブルです。

### 例 \{#example\}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS`、`icebergLocal` テーブル関数および `IcebergS3`、`icebergAzure`、`IcebergHDFS`、`IcebergLocal` テーブルエンジンを介して、Iceberg フォーマット v1 および v2 の読み取りをサポートしています。
:::

## 名前付きコレクションの定義 \{#defining-a-named-collection\}

URL と認証情報を保存するための名前付きコレクションを定義する例を次に示します。

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM icebergS3(iceberg_conf, filename = 'test_table')
DESCRIBE icebergS3(iceberg_conf, filename = 'test_table')
```


## データカタログの利用 \{#iceberg-writes-catalogs\}

Iceberg テーブルは、[REST Catalog](https://iceberg.apache.org/rest-catalog-spec/)、[AWS Glue Data Catalog](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html)、[Unity Catalog](https://www.unitycatalog.io/) など、さまざまなデータカタログと併用できます。

:::important
カタログを使用する場合、ほとんどのユーザーは `DataLakeCatalog` データベースエンジンを使用することになるでしょう。これは、ClickHouse をカタログに接続してテーブルを検出できるようにするものです。個々のテーブルを `IcebergS3` テーブルエンジンで手動で作成する代わりに、このデータベースエンジンを使用できます。
:::

これらを使用するには、`IcebergS3` エンジンを使用してテーブルを作成し、必要な設定を指定します。

例として、MinIO ストレージで REST Catalog を使用する場合:

```sql
CREATE TABLE `database_name.table_name`
ENGINE = IcebergS3(
  'http://minio:9000/warehouse-rest/table_name/',
  'minio_access_key',
  'minio_secret_key'
)
SETTINGS 
  storage_catalog_type="rest",
  storage_warehouse="demo",
  object_storage_endpoint="http://minio:9000/warehouse-rest",
  storage_region="us-east-1",
  storage_catalog_url="http://rest:8181/v1"
```

または、AWS Glue Data Catalog と S3 を併用する場合：

```sql
CREATE TABLE `my_database.my_table`  
ENGINE = IcebergS3(
  's3://my-data-bucket/warehouse/my_database/my_table/',
  'aws_access_key',
  'aws_secret_key'
)
SETTINGS 
  storage_catalog_type = 'glue',
  storage_warehouse = 'my_database',
  object_storage_endpoint = 's3://my-data-bucket/',
  storage_region = 'us-east-1',
  storage_catalog_url = 'https://glue.us-east-1.amazonaws.com/iceberg/v1'
```


## スキーマの進化 \{#schema-evolution\}

現時点では、CH を使用して、時間の経過とともにスキーマが変更されてきた iceberg テーブルを読み取ることができます。現在、カラムの追加・削除や、カラム順の変更が行われたテーブルの読み取りをサポートしています。また、値が必須だったカラムを、NULL を許容するカラムに変更することもできます。さらに、プリミティブ型に対して許可される型キャストもサポートしており、具体的には次のとおりです。  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S)（ここで P' > P）

今のところ、ネストした構造や、配列およびマップ内の要素型を変更することはできません。

## パーティションプルーニング \{#partition-pruning\}

ClickHouse は Iceberg テーブルに対する SELECT クエリでパーティションプルーニングをサポートしており、不要なデータファイルをスキップすることでクエリパフォーマンスを最適化できます。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` に設定します。Iceberg のパーティションプルーニングの詳細については、https://iceberg.apache.org/spec/#partitioning を参照してください。

## タイムトラベル \{#time-travel\}

ClickHouse は Iceberg テーブルに対するタイムトラベルをサポートしており、特定のタイムスタンプまたはスナップショット ID を指定して過去のデータをクエリできます。

## 削除済み行を含むテーブルの処理 \{#deleted-rows\}

現在サポートされているのは、[position deletes](https://iceberg.apache.org/spec/#position-delete-files) を使用する Iceberg テーブルのみです。

次の削除方法は**サポートされていません**：

- [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
- [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors)（v3 で導入）

### 基本的な使い方 \{#basic-usage\}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注記: 同じクエリ内で `iceberg_timestamp_ms` パラメータと `iceberg_snapshot_id` パラメータを同時に指定することはできません。

### 重要な考慮事項 \{#important-considerations\}

* **スナップショット** は通常、次のような場合に作成されます：
* 新しいデータがテーブルに書き込まれたとき
* 何らかのデータ圧縮処理（コンパクション）が実行されたとき

* **スキーマ変更では通常スナップショットは作成されません** — その結果、スキーマ進化が行われたテーブルでタイムトラベルを使用する場合の重要な挙動につながります。

### サンプルシナリオ \{#example-scenarios\}

CH はまだ Iceberg テーブルへの書き込みをサポートしていないため、すべてのシナリオは Spark で記述されています。

#### シナリオ 1: 新しいスナップショットを伴わないスキーマ変更 \{#scenario-1\}

次の一連の操作を考えてみます。

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

  -- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

  -- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

  -- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

  -- Query the table at each timestamp
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts1;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts2;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+

  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts3;

+------------+------------+-----+
|order_number|product_code|price|
+------------+------------+-----+
|           1|        Mars| NULL|
|           2|       Venus|100.0|
+------------+------------+-----+
```

異なるタイムスタンプにおけるクエリ結果:

* ts1 および ts2 では: 元の 2 つのカラムのみが表示される
* ts3 では: 3 つすべてのカラムが表示され、1 行目の価格は NULL になる

#### シナリオ 2:  過去のスキーマと現在のスキーマの差異 \{#scenario-2\}

現在時点でのタイムトラベルクエリでは、現在のテーブルとは異なるスキーマが表示される場合があります:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert initial data into the table
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Query the table at a current moment but using timestamp syntax

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Query the table at a current moment
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

これは、`ALTER TABLE` が新しいスナップショットを作成しない一方で、Spark が現在のテーブルについて、スナップショットではなく最新のメタデータファイルから `schema_id` の値を取得するために起こります。


#### シナリオ 3:  過去と現在のスキーマの違い \{#scenario-3\}

2つ目の制約は、タイムトラベル機能を使用しても、テーブルにまだ一度もデータが書き込まれていない時点の状態は取得できない、という点です。

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

ClickHouse でも、動作は Spark と同様です。頭の中で Spark の SELECT クエリを ClickHouse の SELECT クエリに置き換えても、同じように動作します。


## メタデータファイルの解決 \{#metadata-file-resolution\}

ClickHouse で `iceberg` テーブル関数を使用する場合、Iceberg テーブル構造を記述した正しい metadata.json ファイルを特定する必要があります。このときの解決方法は次のとおりです。

### 候補検索（優先順） \{#candidate-search\}

1. **直接パス指定**:
* `iceberg_metadata_file_path` を設定した場合、システムは Iceberg テーブルディレクトリパスと組み合わせて、このパスをそのまま使用します。

* この設定が指定されている場合、他のすべての解決用の設定は無視されます。

2. **テーブル UUID の照合**:
* `iceberg_metadata_table_uuid` が指定されている場合、システムは次のように動作します:
    * `metadata` ディレクトリ内の `.metadata.json` ファイルのみを対象とします。
    * 指定された UUID と一致する `table-uuid` フィールドを含むファイル（大文字/小文字は区別しない）でフィルタリングします。

3. **デフォルト検索**:
* 上記いずれの設定も指定されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補となります。

### 最新のファイルの選択 \{#most-recent-file\}

上記のルールで候補ファイルを特定した後、システムは次のようにして最も新しいファイルを判定します。

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合：

* `last-updated-ms` の値が最大のファイルが選択されます

* それ以外の場合：

* バージョン番号が最も大きいファイルが選択されます

* （バージョンは、`V.metadata.json` または `V-uuid.metadata.json` という形式のファイル名内の `V` として表されます）

**注記**: ここで言及している設定はすべてテーブル関数の設定（グローバル設定やクエリレベルの設定ではない）であり、以下に示すように指定する必要があります。

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**補足**: 通常は Iceberg カタログ側でメタデータの解決が行われますが、ClickHouse の `iceberg` テーブル関数は S3 に保存されたファイルを直接 Iceberg テーブルとして解釈します。そのため、これらの解決ルールを理解しておくことが重要です。

## メタデータキャッシュ \{#metadata-cache\}

`Iceberg` テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、およびメタデータ JSON の情報を格納するメタデータキャッシュをサポートします。キャッシュはメモリ上に保存されます。この機能は設定項目 `use_iceberg_metadata_files_cache` によって制御されており、デフォルトで有効になっています。

## エイリアス \{#aliases\}

現在、テーブル関数 `iceberg` は `icebergS3` のエイリアスになっています。

## 仮想カラム \{#virtual-columns\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。
- `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合、値は `NULL` になります。

## iceberg テーブルへの書き込み \{#writes-into-iceberg-table\}

バージョン 25.7 以降、ClickHouse はユーザーの Iceberg テーブルに対する変更をサポートします。

これは現在実験的な機能のため、まず明示的に有効化する必要があります。

```sql
SET allow_insert_into_iceberg = 1;
```


### テーブルの作成 \{#create-iceberg-table\}

空の Iceberg テーブルを作成するには、読み取り時と同じコマンドを使用しますが、スキーマを明示的に指定します。
書き込み処理では、Parquet、Avro、ORC など、Iceberg の仕様に含まれるすべてのデータ形式をサポートしています。

### 例 \{#example-iceberg-writes-create\}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

注意: version hint ファイルを作成するには、`iceberg_use_version_hint` 設定を有効にします。
metadata.json ファイルを圧縮する場合は、`iceberg_metadata_compression_method` 設定で使用するコーデック名を指定します。

### INSERT \{#writes-inserts\}

新しいテーブルを作成したら、通常どおり ClickHouse の構文を使ってデータを挿入できます。

### 例 \{#example-iceberg-writes-insert\}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Pavel
y: 777

Row 2:
──────
x: Ivanov
y: 993
```

### DELETE \{#iceberg-writes-delete\}

`merge-on-read` フォーマットで余分な行を削除することも、ClickHouse でサポートされています。
このクエリは、position delete ファイルを含む新しいスナップショットを作成します。

NOTE: 将来、他の Iceberg エンジン（Spark など）でテーブルを読み取りたい場合は、`output_format_parquet_use_custom_encoder` と `output_format_parquet_parallel_encoding` の設定を無効化する必要があります。
これは、Spark がこれらのファイルを Parquet の field-id によって読み取る一方、ClickHouse はこれらのフラグが有効な場合に field-id の書き込みを現在サポートしていないためです。
この動作は今後修正する予定です。

### 例 \{#example-iceberg-writes-delete\}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```

### スキーマの進化 \{#iceberg-writes-schema-evolution\}

ClickHouse では、タプル・配列・マップ以外の単純な型を持つカラムの追加・削除・変更が可能です。

### 例 \{#example-iceberg-writes-evolution\}

```sql
ALTER TABLE iceberg_writes_example MODIFY COLUMN y Nullable(Int64);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

ALTER TABLE iceberg_writes_example ADD COLUMN z Nullable(Int32);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64),                                 ↴│
   │↳    `z` Nullable(Int32)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
z: ᴺᵁᴸᴸ

ALTER TABLE iceberg_writes_example DROP COLUMN z;
SHOW CREATE TABLE iceberg_writes_example;
   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```

### コンパクション \{#iceberg-writes-compaction\}

ClickHouse は Iceberg テーブルのコンパクションをサポートしています。現在、メタデータを更新しながら position delete ファイルをデータファイルにマージできます。以前のスナップショット ID とタイムスタンプは変更されないため、同じ値を使ってタイムトラベル機能を引き続き利用できます。

使用方法:

```sql
SET allow_experimental_iceberg_compaction = 1

OPTIMIZE TABLE iceberg_writes_example;

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```


## 関連項目 \{#see-also\}

* [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
* [Iceberg クラスターテーブル関数](/sql-reference/table-functions/icebergCluster.md)