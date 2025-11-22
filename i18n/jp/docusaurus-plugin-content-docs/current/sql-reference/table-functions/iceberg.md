---
description: 'Amazon S3、Azure、HDFS、またはローカルに保存された Apache Iceberg テーブルに対して、読み取り専用のテーブル形式インターフェイスを提供します。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---



# iceberg テーブル関数 {#iceberg-table-function}

Amazon S3、Azure、HDFS、またはローカルに保存された Apache [Iceberg](https://iceberg.apache.org/) テーブルに対する読み取り専用のテーブルライクなインターフェースを提供します。


## 構文 {#syntax}

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

引数の説明は、それぞれテーブル関数 `s3`、`azureBlobStorage`、`HDFS`、`file` の引数の説明と同じです。
`format` は Iceberg テーブル内のデータファイルの形式を指定します。

### Returned value {#returned-value}

指定された Iceberg テーブルからデータを読み取るための、指定された構造を持つテーブル。

### Example {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS`、`icebergLocal` テーブル関数および `IcebergS3`、`icebergAzure`、`IcebergHDFS`、`IcebergLocal` テーブルエンジンを介して、Iceberg 形式の v1 および v2 の読み取りをサポートしています。
:::


## 名前付きコレクションの定義 {#defining-a-named-collection}

URLと認証情報を格納するための名前付きコレクションの設定例を以下に示します：

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


## スキーマの進化 {#schema-evolution}

現時点では、ClickHouseを使用することで、時間の経過とともにスキーマが変更されたIcebergテーブルを読み取ることができます。現在、列の追加や削除、および列の順序変更が行われたテーブルの読み取りをサポートしています。また、必須値の列をNULL許容列に変更することも可能です。さらに、単純型に対する以下の型キャストをサポートしています:

- int -> long
- float -> double
- decimal(P, S) -> decimal(P', S) ただし P' > P

現在、ネストされた構造体や、配列およびマップ内の要素の型を変更することはできません。


## パーティションプルーニング {#partition-pruning}

ClickHouseは、Icebergテーブルに対するSELECTクエリ実行時のパーティションプルーニングをサポートしており、無関係なデータファイルをスキップすることでクエリパフォーマンスを最適化します。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1`を設定してください。Icebergパーティションプルーニングの詳細については、https://iceberg.apache.org/spec/#partitioning を参照してください。


## タイムトラベル {#time-travel}

ClickHouseはIcebergテーブルに対するタイムトラベル機能をサポートしており、特定のタイムスタンプまたはスナップショットIDを指定して過去のデータをクエリできます。


## 削除された行を含むテーブルの処理 {#deleted-rows}

現在、[position deletes](https://iceberg.apache.org/spec/#position-delete-files)を使用したIcebergテーブルのみがサポートされています。

以下の削除方式は**サポートされていません**:

- [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
- [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors) (v3で導入)

### 基本的な使用方法 {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意: 同一クエリ内で`iceberg_timestamp_ms`と`iceberg_snapshot_id`の両方のパラメータを指定することはできません。

### 重要な考慮事項 {#important-considerations}

- **スナップショット**は通常、以下の場合に作成されます:
- テーブルに新しいデータが書き込まれたとき
- 何らかのデータコンパクションが実行されたとき

- **スキーマ変更は通常スナップショットを作成しません** - これにより、スキーマ進化を経たテーブルでタイムトラベルを使用する際に重要な動作が発生します。

### シナリオ例 {#example-scenarios}

すべてのシナリオはSparkで記述されています。これは、ClickHouseがまだIcebergテーブルへの書き込みをサポートしていないためです。

#### シナリオ1: 新しいスナップショットを伴わないスキーマ変更 {#scenario-1}

次の一連の操作を考えてみましょう:

```sql
-- 2つの列を持つテーブルを作成
 CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
 order_number bigint,
 product_code string
 )
 USING iceberg
 OPTIONS ('format-version'='2')

-- テーブルにデータを挿入
 INSERT INTO spark_catalog.db.time_travel_example VALUES
   (1, 'Mars')

 ts1 = now() // 疑似コードの一部

-- テーブルを変更して新しい列を追加
 ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

 ts2 = now()

-- テーブルにデータを挿入
 INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

  ts3 = now()

-- 各タイムスタンプでテーブルをクエリ
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

異なるタイムスタンプでのクエリ結果:

- ts1とts2の時点: 元の2つの列のみが表示されます
- ts3の時点: 3つの列すべてが表示され、最初の行の価格はNULLになります

#### シナリオ2: 履歴スキーマと現在のスキーマの違い {#scenario-2}

現在の時点でのタイムトラベルクエリは、現在のテーブルとは異なるスキーマを表示する場合があります:

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2')

-- テーブルに初期データを挿入
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- テーブルを変更して新しい列を追加
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- タイムスタンプ構文を使用して現在の時点でテーブルをクエリ

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 現在の時点でテーブルをクエリ
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

これは、`ALTER TABLE`が新しいスナップショットを作成しないためですが、現在のテーブルに対してSparkはスナップショットではなく最新のメタデータファイルから`schema_id`の値を取得するためです。


#### シナリオ3: 履歴スキーマと現在のスキーマの差異 {#scenario-3}

2つ目の制約は、タイムトラベルを実行する際に、データが書き込まれる前のテーブルの状態を取得できないことです:

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2');

  ts = now();

-- 特定のタイムスタンプでテーブルをクエリ
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラーで終了: ts より古いスナップショットが見つかりません。
```

ClickHouseの動作はSparkと一致しています。SparkのSELECTクエリをClickHouseのSELECTクエリに置き換えても、同じように動作します。


## メタデータファイルの解決 {#metadata-file-resolution}

ClickHouseで`iceberg`テーブル関数を使用する際、システムはIcebergテーブル構造を記述する正しいmetadata.jsonファイルを特定する必要があります。この解決プロセスは以下のように動作します:

### 候補の検索(優先順位順) {#candidate-search}

1. **直接パス指定**:
   *`iceberg_metadata_file_path`を設定すると、システムはこのパスをIcebergテーブルディレクトリパスと組み合わせて使用します。

- この設定が指定されている場合、他のすべての解決設定は無視されます。

2. **テーブルUUIDマッチング**:
   *`iceberg_metadata_table_uuid`が指定されている場合、システムは以下を実行します:
   *`metadata`ディレクトリ内の`.metadata.json`ファイルのみを参照
   *指定されたUUIDに一致する`table-uuid`フィールドを含むファイルをフィルタリング(大文字小文字を区別しない)

3. **デフォルト検索**:
   *上記の設定がいずれも指定されていない場合、`metadata`ディレクトリ内のすべての`.metadata.json`ファイルが候補となります

### 最新ファイルの選択 {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムは以下の方法で最新のファイルを判断します:

- `iceberg_recent_metadata_file_by_last_updated_ms_field`が有効な場合:
- `last-updated-ms`値が最大のファイルが選択されます

- それ以外の場合:
- バージョン番号が最も高いファイルが選択されます
- (バージョンは`V.metadata.json`または`V-uuid.metadata.json`形式のファイル名で`V`として表示されます)

**注意**: 上記のすべての設定はテーブル関数設定(グローバル設定やクエリレベル設定ではありません)であり、以下のように指定する必要があります:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table',
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**: Icebergカタログは通常メタデータ解決を処理しますが、ClickHouseの`iceberg`テーブル関数はS3に保存されたファイルをIcebergテーブルとして直接解釈するため、これらの解決ルールを理解することが重要です。


## メタデータキャッシュ {#metadata-cache}

`Iceberg`テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、メタデータJSONの情報を格納するメタデータキャッシュをサポートしています。キャッシュはメモリに格納されます。この機能は設定`use_iceberg_metadata_files_cache`で制御され、デフォルトで有効化されています。


## エイリアス {#aliases}

テーブル関数 `iceberg` は、現在 `icebergS3` のエイリアスとなっています。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。


## Icebergテーブルへの書き込み {#writes-into-iceberg-table}

バージョン25.7以降、ClickHouseはユーザーのIcebergテーブルの変更をサポートしています。

現在、これは実験的機能であるため、まず有効化する必要があります:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### テーブルの作成 {#create-iceberg-table}

独自の空のIcebergテーブルを作成するには、読み取りと同じコマンドを使用しますが、スキーマを明示的に指定します。
書き込みは、Parquet、Avro、ORCなど、Iceberg仕様のすべてのデータ形式をサポートしています。

### 例 {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

注意: バージョンヒントファイルを作成するには、`iceberg_use_version_hint`設定を有効にしてください。
metadata.jsonファイルを圧縮する場合は、`iceberg_metadata_compression_method`設定でコーデック名を指定してください。

### INSERT {#writes-inserts}

新しいテーブルを作成した後、通常のClickHouse構文を使用してデータを挿入できます。

### 例 {#example-iceberg-writes-insert}

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

merge-on-read形式での余分な行の削除もClickHouseでサポートされています。
このクエリは、位置削除ファイルを含む新しいスナップショットを作成します。

注意: 将来、他のIcebergエンジン(Sparkなど)でテーブルを読み取る場合は、`output_format_parquet_use_custom_encoder`および`output_format_parquet_parallel_encoding`設定を無効にする必要があります。
これは、Sparkがparquetフィールドidでこれらのファイルを読み取るのに対し、ClickHouseは現在、これらのフラグが有効な場合にフィールドidの書き込みをサポートしていないためです。
この動作は将来修正する予定です。

### 例 {#example-iceberg-writes-delete}

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

### スキーマの進化 {#iceberg-writes-schema-evolution}

ClickHouseでは、単純な型(タプル、配列、マップ以外)のカラムを追加、削除、または変更できます。

### 例 {#example-iceberg-writes-evolution}

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

```


ALTER TABLE iceberg&#95;writes&#95;example DROP COLUMN z;
SHOW CREATE TABLE iceberg&#95;writes&#95;example;
┌─statement─────────────────────────────────────────────────┐

1. │ CREATE TABLE default.iceberg&#95;writes&#95;example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal(&#39;/home/scanhex12/iceberg&#95;example/&#39;) │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg&#95;writes&#95;example
FORMAT VERTICAL;

1 行目:
──────
x: Ivanov
y: 993

````

### コンパクション {#iceberg-writes-compaction}

ClickHouseはIcebergテーブルのコンパクションをサポートしています。現在、メタデータの更新と同時に、位置削除ファイルをデータファイルにマージすることができます。以前のスナップショットIDとタイムスタンプは変更されないため、タイムトラベル機能は同じ値で引き続き使用できます。

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
````


## カタログを使用したテーブル {#iceberg-writes-catalogs}

上記で説明したすべての書き込み機能は、RESTおよびGlueカタログでも利用できます。
これらを使用するには、`IcebergS3`エンジンでテーブルを作成し、必要な設定を指定します:

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```


## 関連項目 {#see-also}

- [Icebergエンジン](/engines/table-engines/integrations/iceberg.md)
- [icebergClusterテーブル関数](/sql-reference/table-functions/icebergCluster.md)
