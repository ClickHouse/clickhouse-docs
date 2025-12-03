---
description: 'Amazon S3、Azure、HDFS、またはローカルに保存された Apache Iceberg テーブルに対して、読み取り専用のテーブルライクなインターフェイスを提供します。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# iceberg テーブル関数 {#iceberg-table-function}

Amazon S3、Azure、HDFS、またはローカルに保存された Apache [Iceberg](https://iceberg.apache.org/) テーブルに対する読み取り専用のテーブル形式インターフェイスを提供します。

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

## 引数 {#arguments}

引数の説明は、それぞれテーブル関数 `s3`、`azureBlobStorage`、`HDFS`、`file` の引数の説明と同様です。\
`format` は、Iceberg テーブル内のデータファイルのフォーマットを表します。

### 戻り値 {#returned-value}

指定された Iceberg テーブル内のデータを読み取るための、指定された構造を持つテーブルです。

### 例 {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS`、`icebergLocal` テーブル関数および `IcebergS3`、`icebergAzure`、`IcebergHDFS`、`IcebergLocal` テーブルエンジンを通じて、Iceberg フォーマット v1 および v2 の読み取りをサポートしています。
:::

## 名前付きコレクションの定義 {#defining-a-named-collection}

URL および認証情報を保存するための名前付きコレクションを設定する例を次に示します。

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

## スキーマ進化 {#schema-evolution}

現時点では、CH の機能により、時間の経過とともにスキーマが変更された Iceberg テーブルを読み取ることができます。現在、列の追加・削除や列順の変更が行われたテーブルの読み取りをサポートしています。また、値が必須だった列を、NULL を許容する列に変更することもできます。加えて、単純型に対する許可された型変換もサポートしており、具体的には次のとおりです。  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ここで P' > P。

現時点では、ネストされた構造や、配列および Map 内の要素型を変更することはできません。

## パーティションプルーニング {#partition-pruning}

ClickHouse は Iceberg テーブルに対する SELECT クエリ実行時のパーティションプルーニングをサポートしており、不要なデータファイルをスキップすることでクエリ パフォーマンスを最適化できます。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定します。Iceberg のパーティションプルーニングの詳細については、https://iceberg.apache.org/spec/#partitioning を参照してください。

## タイムトラベル {#time-travel}

ClickHouse は Iceberg テーブルに対するタイムトラベル機能をサポートしており、特定のタイムスタンプまたはスナップショット ID を指定して履歴データをクエリできます。

## 削除行を含むテーブルの処理 {#deleted-rows}

現在、[position deletes](https://iceberg.apache.org/spec/#position-delete-files) を使用する Iceberg テーブルのみがサポートされています。

次の削除方式は **サポートされていません**。

* [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
* [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors)（v3 で導入）

### 基本的な使い方 {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意: 同じクエリ内で `iceberg_timestamp_ms` パラメータと `iceberg_snapshot_id` パラメータの両方を指定することはできません。

### 重要な考慮事項 {#important-considerations}

* **スナップショット** は通常、次のタイミングで作成されます。

* 新しいデータがテーブルに書き込まれたとき

* 何らかのデータのコンパクション処理が実行されたとき

* **スキーマ変更では通常スナップショットは作成されません** — このため、スキーマ進化が行われたテーブルでタイムトラベルを使用する場合に重要な挙動となります。

### 例シナリオ {#example-scenarios}

すべてのシナリオは Spark で記述されています。これは、CH がまだ Iceberg テーブルへの書き込みをサポートしていないためです。

#### シナリオ 1: 新しいスナップショットを伴わないスキーマ変更 {#scenario-1}

次の一連の操作を考えてみましょう:

```sql
-- 2つのカラムを持つテーブルを作成
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

-- 新しいカラムを追加するためにテーブルを変更
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

異なるタイムスタンプにおけるクエリ結果:

* ts1 と ts2 の場合: 元の 2 列のみが表示される
* ts3 の場合: 3 列すべてが表示され、1 行目の price は NULL になる

#### シナリオ 2:  過去と現在のスキーマの違い {#scenario-2}

現在時点で実行したタイムトラベルクエリでは、現在のテーブルとは異なるスキーマが表示される場合があります:

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

これは、`ALTER TABLE` が新しいスナップショットを作成しない一方で、Spark は現在のテーブルに対して、スナップショットではなく最新のメタデータファイルから `schema_id` の値を取得するために発生します。

#### シナリオ 3:  過去と現在のスキーマの差異 {#scenario-3}

2 つ目の制約は、タイムトラベルを行っても、テーブルにまだ一切データが書き込まれていない時点の状態は取得できないという点です。

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- 特定のタイムスタンプでテーブルをクエリする
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラーで終了：ts より古いスナップショットが見つかりません。
```

ClickHouse における動作は Spark と同様です。Spark の SELECT クエリを ClickHouse の SELECT クエリに置き換えるイメージで考えれば、同じように動作します。

## メタデータファイルの解決 {#metadata-file-resolution}

ClickHouse で `iceberg` テーブル関数を使用する場合、システムは Iceberg テーブル構造を記述する正しい metadata.json ファイルを特定する必要があります。ここでは、この解決処理がどのように行われるかを説明します。

### 候補検索（優先順位順） {#candidate-search}

1. **パスの直接指定**:
   *`iceberg_metadata_file_path` を設定した場合、システムは Iceberg テーブルディレクトリパスと結合して、このパスをそのまま使用します。

* この設定が指定されている場合、他のすべての解決用設定は無視されます。

2. **テーブル UUID の一致**:
   *`iceberg_metadata_table_uuid` が指定されている場合、システムは次のように動作します:
   *`metadata` ディレクトリ内の `.metadata.json` ファイルのみを対象とする
   *指定した UUID（大文字小文字を区別しない）と一致する `table-uuid` フィールドを含むファイルだけを残すようにフィルタリングする

3. **デフォルト検索**:
   *上記いずれの設定も指定されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補となります

### 最新ファイルの選択 {#most-recent-file}

上記のルールで候補ファイルを特定した後、システムはどのファイルが最も新しいかを判断します。

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合:

* `last-updated-ms` の値が最大のファイルが選択されます

* それ以外の場合:

* バージョン番号が最も大きいファイルが選択されます

* （バージョンは、`V.metadata.json` または `V-uuid.metadata.json` の形式のファイル名における `V` として現れます）

**注記**: ここで言及している設定はすべてテーブル関数の設定（グローバル設定やクエリレベル設定ではありません）であり、以下に示すように指定する必要があります。

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**: 通常は Iceberg カタログがメタデータの解決を行いますが、ClickHouse の `iceberg` テーブル関数は S3 に保存されたファイルを Iceberg テーブルとして直接解釈します。そのため、これらの解決ルールを理解しておくことが重要です。

## メタデータキャッシュ {#metadata-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、メタデータ JSON の情報を格納するメタデータキャッシュをサポートします。キャッシュはメモリ上に保存されます。この機能は `use_iceberg_metadata_files_cache` 設定で制御されており、デフォルトで有効になっています。

## 別名 {#aliases}

テーブル関数 `iceberg` は、現在 `icebergS3` のエイリアスです。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。
- `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合、値は `NULL` になります。

## Iceberg テーブルへの書き込み {#writes-into-iceberg-table}

バージョン 25.7 から、ClickHouse はユーザーの Iceberg テーブルの変更をサポートしています。

現在、これは実験的な機能のため、まず有効化する必要があります。

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### テーブルの作成 {#create-iceberg-table}

空の Iceberg テーブルを新規作成するには、読み取り時と同じコマンドを使用しつつ、スキーマを明示的に指定します。
書き込み処理は、Parquet、Avro、ORC など、Iceberg 仕様で定義されているすべてのデータ形式をサポートします。

### 例 {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

注記: バージョンヒントファイルを作成するには、`iceberg_use_version_hint` 設定を有効にします。
metadata.json ファイルを圧縮する場合は、`iceberg_metadata_compression_method` 設定でコーデック名を指定します。

### INSERT {#writes-inserts}

新しいテーブルを作成した後は、通常の ClickHouse 構文を使用してデータを挿入できます。

### 例 {#example-iceberg-writes-insert}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

行 1:
──────
x: Pavel
y: 777

行 2:
──────
x: Ivanov
y: 993
```

### DELETE {#iceberg-writes-delete}

merge-on-read 形式で不要な行を削除することも、ClickHouse でサポートされています。
このクエリは、position delete ファイルを含む新しいスナップショットを作成します。

注意: 将来、他の Iceberg エンジン（Spark など）でテーブルを読み込みたい場合は、設定項目 `output_format_parquet_use_custom_encoder` と `output_format_parquet_parallel_encoding` を無効にする必要があります。
これは、Spark が Parquet のフィールド ID によってこれらのファイルを読み込む一方で、これらのフラグが有効な場合、ClickHouse は現在フィールド ID の書き込みをサポートしていないためです。
この挙動は将来的に修正する予定です。

### Example {#example-iceberg-writes-delete}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

行 1:
──────
x: Ivanov
y: 993
```

### スキーマの進化 {#iceberg-writes-schema-evolution}

ClickHouse では、単純な型（タプル型・配列型・マップ型以外）のカラムを追加・削除・変更できます。

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

Row 1:
──────
x: Ivanov
y: 993

````

### コンパクション {#iceberg-writes-compaction}

ClickHouseはIcebergテーブルのコンパクションをサポートしています。現在、メタデータの更新と同時に、位置削除ファイルをデータファイルにマージできます。以前のスナップショットIDとタイムスタンプは変更されないため、タイムトラベル機能は同じ値で引き続き使用可能です。

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

## カタログを利用するテーブル {#iceberg-writes-catalogs}

前述のすべての書き込み機能は、REST カタログおよび Glue カタログでも利用できます。
これらを使用するには、`IcebergS3` エンジンでテーブルを作成し、必要な設定を指定します。

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```

## 関連項目 {#see-also}

* [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
* [Iceberg クラスター テーブル関数](/sql-reference/table-functions/icebergCluster.md)
