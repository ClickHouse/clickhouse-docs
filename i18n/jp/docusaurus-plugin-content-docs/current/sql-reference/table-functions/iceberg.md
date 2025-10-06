---
'description': 'Amazon S3、Azure、HDFS、またはローカルストレージにあるApache Iceberg テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。'
'sidebar_label': 'アイスバーグ'
'sidebar_position': 90
'slug': '/sql-reference/table-functions/iceberg'
'title': 'アイスバーグ'
'doc_type': 'reference'
---


# iceberg Table Function {#iceberg-table-function}

Apache [Iceberg](https://iceberg.apache.org/) テーブルを Amazon S3、Azure、HDFS、またはローカルストレージで読み取り専用のテーブルのようなインターフェースを提供します。

## Syntax {#syntax}

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

## Arguments {#arguments}

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS`、および `file` の引数の説明と一致します。 `format` は Iceberg テーブルのデータファイルのフォーマットを示します。

### Returned value {#returned-value}

指定された Iceberg テーブルを読み取るための指定された構造を持つテーブル。

### Example {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS` および `icebergLocal` テーブル関数を通じて Iceberg フォーマットの v1 および v2 を読み取ることをサポートしています。また、`IcebergS3`、`icebergAzure`、`IcebergHDFS` および `IcebergLocal` テーブルエンジンもサポートされています。
:::

## Defining a named collection {#defining-a-named-collection}

URL と資格情報を保存するための名前付きコレクションを構成する例を以下に示します。

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

## Schema Evolution {#schema-evolution}

現在、CH の助けを借りて、時間の経過とともにスキーマが変更された Iceberg テーブルを読み取ることができます。現在、カラムが追加されたり削除されたり、順序が変更されたテーブルの読み取りをサポートしています。また、NULL が許可されるカラムに値が必要なカラムを変更することもできます。さらに、以下の単純な型に対する型キャストが許可されています：  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし P' > P。

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

## Partition Pruning {#partition-pruning}

ClickHouse は Iceberg テーブルに対する SELECT クエリの際にパーティションのプルーニングをサポートしており、無関係なデータファイルをスキップすることによってクエリパフォーマンスを最適化します。パーティションのプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定します。Iceberg のパーティションプルーニングに関する詳細情報は、https://iceberg.apache.org/spec/#partitioning を参照してください。

## Time Travel {#time-travel}

ClickHouse は Iceberg テーブルのタイムトラベルをサポートしており、特定のタイムスタンプまたはスナップショット ID で履歴データをクエリできます。

## Processing of tables with deleted rows {#deleted-rows}

現在、[位置削除](https://iceberg.apache.org/spec/#position-delete-files)が行われた Iceberg テーブルのみがサポートされています。 

次の削除方法は **サポートされていません**：
- [等価削除](https://iceberg.apache.org/spec/#equality-delete-files)
- [削除ベクター](https://iceberg.apache.org/spec/#deletion-vectors) (v3 で導入)

### Basic usage {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注：同じクエリ内で `iceberg_timestamp_ms` と `iceberg_snapshot_id` パラメーターを両方指定することはできません。

### Important considerations {#important-considerations}

* **スナップショット**は通常、以下のいずれかのときに作成されます：
* 新しいデータがテーブルに書き込まれるとき
* 何らかのデータ圧縮が行われるとき

* **スキーマ変更は通常スナップショットを作成しません** - これは、スキーマが進化したテーブルでタイムトラベルを使用する際の重要な動作につながります。

### Example scenarios {#example-scenarios}

すべてのシナリオは Spark で記述されています。ClickHouse はまだ Iceberg テーブルへの書き込みをサポートしていません。

#### Scenario 1: Schema Changes Without New Snapshots {#scenario-1}

この操作のシーケンスを考えてみましょう：

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

- - Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

  ts2 = now()

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

- - Query the table at each timestamp
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

異なるタイムスタンプでのクエリ結果：

* ts1 および ts2 の場合：元の 2 つのカラムのみが表示されます
* ts3 の場合：3 つのカラムすべてが表示され、最初の行の価格は NULL になります

#### Scenario 2:  Historical vs. Current Schema Differences {#scenario-2}

現在の瞬間でのタイムトラベルクエリは、現在のテーブルとは異なるスキーマを示すかもしれません：

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

これは、`ALTER TABLE` が新しいスナップショットを作成せず、現在のテーブルでは最新のメタデータファイルから `schema_id` の値を取得するために発生します。

#### Scenario 3:  Historical vs. Current Schema Differences {#scenario-3}

もう一つの例は、タイムトラベルを行うと、テーブルにデータが書き込まれる前の状態を取得できないことです：

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

Clickhouse の動作は Spark と一貫しています。Spark の Select クエリを Clickhouse の Select クエリで置き換えても同じように機能します。

## Metadata File Resolution {#metadata-file-resolution}

ClickHouse で `iceberg` テーブル関数を使用する際、システムは Iceberg テーブルの構造を記述した正しい metadata.json ファイルを特定する必要があります。この解決プロセスの仕組みは次の通りです：

### Candidate Search (in Priority Order) {#candidate-search}

1. **直接パスの指定**：
* `iceberg_metadata_file_path` を設定すると、システムはこの正確なパスを Iceberg テーブルディレクトリパスと結合します。
* この設定が提供されている場合、他の解決設定は無視されます。

2. **テーブル UUID の一致**：
* `iceberg_metadata_table_uuid` が指定されている場合、システムは：
    * `metadata` ディレクトリ内の `.metadata.json` ファイルのみを対象にします
    * 指定した UUID と一致する `table-uuid` フィールドを含むファイルをフィルタリングします (大文字と小文字を区別しません)

3. **デフォルト検索**：
* 上記の設定のいずれも提供されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補となります

### Selecting the Most Recent File {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムは最も新しいファイルを決定します：

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合：
* `last-updated-ms` の値が最も大きいファイルが選択されます

* さもなければ：
* バージョン番号が最も高いファイルが選択されます
* (バージョンは `V.metadata.json` または `V-uuid.metadata.json` の形式でファイル名に `V` として表示されます)

**注**：すべての設定はテーブル関数設定であり (グローバルまたはクエリレベルの設定ではない)、以下に示されるように指定する必要があります：

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注**：Iceberg カタログは通常メタデータの解決を扱いますが、ClickHouse の `iceberg` テーブル関数は S3 に保存されたファイルを直接 Iceberg テーブルとして解釈します。これがため、これらの解決ルールを理解することが重要です。

## Metadata cache {#metadata-cache}

`Iceberg` テーブルエンジンとテーブル関数は、マニフェストファイル、マニフェストリスト、およびメタデータ JSON の情報をストアしてキャッシュするメタデータキャッシュをサポートしています。キャッシュはメモリに保存されます。この機能は `use_iceberg_metadata_files_cache` の設定で制御されており、デフォルトで有効です。

## Aliases {#aliases}

テーブル関数 `iceberg` は現在 `icebergS3` のエイリアスです。

## Virtual Columns {#virtual-columns}

- `_path` — ファイルへのパス。タイプ：`LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ：`LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ：`Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時間。タイプ：`Nullable(DateTime)`。時間が不明な場合、値は `NULL` になります。
- `_etag` — ファイルの etag。タイプ：`LowCardinality(String)`。etag が不明な場合、値は `NULL` になります。

## Writes into iceberg table {#writes-into-iceberg-table}

バージョン 25.7 以降、ClickHouse はユーザーの Iceberg テーブルの変更をサポートしています。

現在、これは実験的な機能であるため、最初に有効にする必要があります：

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### Creating table {#create-iceberg-table}

独自の空の Iceberg テーブルを作成するには、読み取りと同じコマンドを使用しますが、スキーマを明示的に指定してください。書き込みは Iceberg の仕様からすべてのデータフォーマット（Parquet、Avro、ORC など）をサポートします。

### Example {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

注：バージョンヒントファイルを作成するには、`iceberg_use_version_hint` 設定を有効にしてください。
metadata.json ファイルを圧縮したい場合は、`iceberg_metadata_compression_method` 設定でコーデック名を指定してください。

### INSERT {#writes-inserts}

新しいテーブルを作成した後、通常の ClickHouse 構文を使用してデータを挿入できます。

### Example {#example-iceberg-writes-insert}

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

### DELETE {#iceberg-writes-delete}

マージオンリード形式での追加行の削除も ClickHouse でサポートされています。このクエリは、位置削除ファイルを持つ新しいスナップショットを作成します。

注意：将来的に Spark などの他の Iceberg エンジンでテーブルを読み取るには、設定 `output_format_parquet_use_custom_encoder` および `output_format_parquet_parallel_encoding` を無効にする必要があります。これは、Spark がこれらのファイルを Parquet フィールド ID に基づいて読むのに対し、ClickHouse は現在これらのフラグが有効な時にフィールド ID の書き込みをサポートしていないためです。この動作は将来的に修正する予定です。

### Example {#example-iceberg-writes-delete}

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

### Schema evolution {#iceberg-writes-schema-evolution}

ClickHouse は単純な型（非タプル、非配列、非マップ）のカラムの追加、削除、または変更を許可します。

### Example {#example-iceberg-writes-evolution}

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

### Compaction {#iceberg-writes-compaction}

ClickHouse は Iceberg テーブルの圧縮をサポートしています。現在、位置削除ファイルをデータファイルに統合し、メタデータを更新できます。これにより、以前のスナップショット ID およびタイムスタンプは変更されないため、同じ値でタイムトラベル機能を引き続き使用できます。

使用方法：

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

## Table with catalogs {#iceberg-writes-catalogs}

上記で説明したすべての書き込み機能は、REST および Glue カタログでも利用できます。それらを使用するには、`IcebergS3` エンジンでテーブルを作成し、必要な設定を提供してください：

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```

## See Also {#see-also}

* [Iceberg engine](/engines/table-engines/integrations/iceberg.md)
* [Iceberg cluster table function](/sql-reference/table-functions/icebergCluster.md)
