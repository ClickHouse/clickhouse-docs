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
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method] [,extra_credentials])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```


## 引数 \{#arguments\}

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS`、`file` の引数の説明とそれぞれ一致します。
`format` は、Iceberg テーブル内のデータファイルのフォーマットを表します。

`icebergS3` では、オプションの `extra_credentials` パラメータを使用して、ClickHouse Cloud におけるロールベースアクセス用の `role_arn` を渡すことができます。設定手順については、[Secure S3](/cloud/data-sources/secure-s3) を参照してください。

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
```

または、AWS Glue Data Catalog と S3 を併用する場合：

```sql
CREATE TABLE `my_database.my_table`  
ENGINE = IcebergS3(
  's3://my-data-bucket/warehouse/my_database/my_table/',
  'aws_access_key',
  'aws_secret_key'
)
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

ClickHouse では、タプル・配列・マップ以外の単純な型を持つカラムの追加・削除・変更・リネームが可能です。

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

ALTER TABLE iceberg_writes_example RENAME COLUMN y TO value;
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `value` Nullable(Int64)                              ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
value: 993
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


### スナップショットの期限切れ処理 \{#iceberg-expire-snapshots\}

Iceberg テーブルでは、`INSERT`、`DELETE`、`UPDATE` の各操作のたびにスナップショットが蓄積されます。時間の経過とともに、その結果として多数のスナップショットと、それに関連するデータファイルが生じることがあります。`expire_snapshots` コマンドは、古いスナップショットを削除し、保持されているどのスナップショットからも参照されなくなったデータファイルをクリーンアップします。

**構文:**

```sql
ALTER TABLE iceberg_table EXECUTE expire_snapshots(
    ['timestamp']
    [, expire_before = 'timestamp']
    [, retention_period = '3d']
    [, retain_last = 100]
    [, snapshot_ids = [1, 2, 3, 4]]
    [, dry_run = 1]
);
```

デフォルトでは、どのスナップショットを保持するかは [retention policy](#iceberg-snapshot-retention-policy) (テーブルプロパティ `min-snapshots-to-keep`、`max-snapshot-age-ms`、および ref ごとのオーバーライド) によって決まります。`snapshot_ids` を指定すると、retention policy はバイパスされ、列挙したスナップショットだけが期限切れの対象として考慮されます。

**Arguments:**

* `'timestamp'` (位置指定) または `expire_before = 'timestamp'` — **サーバーのタイムゾーン** で解釈される日時文字列 (例: `'2024-06-01 00:00:00'`) 。安全装置として機能します。`timestamp-ms` がこの値と同じかそれ以降のスナップショットは、retention policy では本来期限切れになる場合でも、期限切れ処理から保護されます。`snapshot_ids` と組み合わせることもでき、その場合は、列挙したスナップショットのうちこのタイムスタンプと同じかそれ以降のものは期限切れになりません。
* `retention_period = '<duration>'` — この呼び出しに限り、テーブルレベルの `history.expire.max-snapshot-age-ms` をオーバーライドします。この期間より古いスナップショット (現在時刻を基準に計測) が、期限切れ候補になります。値は、1 つ以上の `{number}{unit}` の組を連結した期間文字列です。サポートされる単位: `y` (365 日) 、`w` (7 日) 、`d` (24 時間) 、`h` (60 分) 、`m` (60 秒) 、`s` (1 秒) 、`ms` (1 ミリ秒) 。単位は組み合わせ可能です。例: `'3d'`、`'12h'`、`'1d12h30m'`、`'500ms'`。
* `retain_last = N` — この呼び出しに限り、テーブルレベルの `history.expire.min-snapshots-to-keep` をオーバーライドします。古さに関係なく、常に少なくとも `N` 個のスナップショットが保持されます。
* `snapshot_ids = [id1, id2, ...]` — 列挙したスナップショット ID のみを期限切れ対象にします (ただし、現在のスナップショット、ブランチ、またはタグから参照されるスナップショットは除きます) 。このモードは retention policy を完全にバイパスし、`retention_period` や `retain_last` とは組み合わせできません。
* `dry_run = 1` — 期限切れになる内容を計算し、新しいメタデータの書き込みやファイルの削除を行わずにメトリクスを返します。

:::note
`retention_period` と `retain_last` は、**テーブルレベル** のデフォルトの保持設定だけをオーバーライドします。Iceberg テーブルプロパティで設定された ref ごと (ブランチ/タグ) の保持オーバーライド (例: `refs.<branch>.min-snapshots-to-keep`) は上書きされることはなく、常にテーブルメタデータで指定されたとおりに適用されます。
:::

**例:**

```sql
SET allow_insert_into_iceberg = 1;

-- Create some snapshots by inserting data
INSERT INTO iceberg_table VALUES (1);
INSERT INTO iceberg_table VALUES (2);
INSERT INTO iceberg_table VALUES (3);

-- Expire using retention policy only
ALTER TABLE iceberg_table EXECUTE expire_snapshots();

-- Expire with a safety fuse: protect snapshots newer than the timestamp (positional syntax)
ALTER TABLE iceberg_table EXECUTE expire_snapshots('2025-01-01 00:00:00');

-- Same using the named argument form
ALTER TABLE iceberg_table EXECUTE expire_snapshots(expire_before = '2025-01-01 00:00:00');

-- Override retention parameters for one execution
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '3d', retain_last = 10);

-- Expire explicit snapshots
ALTER TABLE iceberg_table EXECUTE expire_snapshots(snapshot_ids = [101, 102, 103]);

-- Dry-run preview (no metadata updates, no file deletes)
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '1d', dry_run = 1);
```

**出力:**

このコマンドは、2つのカラム (`metric_name String`、`metric_value Int64`) を持つテーブルを返します。このテーブルには、各メトリクスごとに1行が含まれます。メトリクス名は [Iceberg spec](https://iceberg.apache.org/docs/latest/spark-procedures/#output) に従います。


| metric&#95;name                       | 説明                                 |
| ------------------------------------- | ---------------------------------- |
| `deleted_data_files_count`            | 削除されたデータファイル数                      |
| `deleted_position_delete_files_count` | 削除された position delete ファイル数        |
| `deleted_equality_delete_files_count` | 削除された equality delete ファイル数        |
| `deleted_manifest_files_count`        | 削除されたマニフェストファイル数                   |
| `deleted_manifest_lists_count`        | 削除されたマニフェストリストファイル数                |
| `deleted_statistics_files_count`      | 削除された statistics ファイル数 (現時点では常に 0) |
| `dry_run`                             | ドライランモードでは `1`、通常実行では `0`          |

このコマンドは次の手順を実行します。

1. 保持ポリシー (以下を参照) を評価し、保持する必要があるスナップショットを判定します
2. タイムスタンプ引数が指定されている場合は、そのタイムスタンプ以降のすべてのスナップショットも追加で保護します
3. ポリシーで保持されず、かつタイムスタンプによる保護対象でもないスナップショットを期限切れにします
4. 期限切れになったスナップショットにのみ関連付けられているファイルを特定します
5. 通常モードでは: 期限切れになったスナップショットを含まない新しいメタデータを生成します
6. 通常モードでは: 到達不能になったマニフェストリスト、マニフェストファイル、およびデータファイルを物理的に削除します
7. `dry_run = 1` モードでは: 手順 5 と 6 をスキップし、計算されたメトリクスのみを返します

#### スナップショット保持ポリシー \{#iceberg-snapshot-retention-policy\}

`expire_snapshots` コマンドは、[Iceberg snapshot retention policy](https://iceberg.apache.org/spec/#snapshot-retention-policy) に従います。保持設定は、Iceberg のテーブルプロパティと参照ごとのオーバーライドで構成されます。

| Property                               | Scope | Default                                                                    | 説明                                              |
| -------------------------------------- | ----- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `history.expire.min-snapshots-to-keep` | Table | `iceberg_expire_default_min_snapshots_to_keep` (default `1`)               | 各ブランチの祖先チェーンで保持するスナップショットの最小数                   |
| `history.expire.max-snapshot-age-ms`   | Table | `iceberg_expire_default_max_snapshot_age_ms` (default `432000000`, 5 days) | ブランチで保持するスナップショットの最大経過時間 (ミリ秒)                  |
| `history.expire.max-ref-age-ms`        | Table | `iceberg_expire_default_max_ref_age_ms` (default `∞`)                      | スナップショット参照 (ブランチまたはタグ) 自体が削除されるまでの最大経過時間 (ミリ秒)  |

各スナップショット参照 (Iceberg メタデータ内の `refs`) では、参照ごとのフィールド `min-snapshots-to-keep`、`max-snapshot-age-ms`、`max-ref-age-ms` を使って、これらの値をオーバーライドできます。

**保持の評価:**

* **各ブランチ** (`main` を含む) について: ブランチヘッドから開始して祖先チェーンをたどります。スナップショットは、次のいずれかの条件が真である間、保持されます:
  * そのスナップショットが、チェーン内の先頭から `min-snapshots-to-keep` 個に含まれている
  * そのスナップショットの経過時間が `max-snapshot-age-ms` 以内である (つまり、`now - timestamp-ms <= max-snapshot-age-ms`) 
* **タグ**について: タグ付けされたスナップショットは保持されます。ただし、タグが `max-ref-age-ms` を超過している場合、そのタグ参照は削除されます
* **`main` 以外の参照**で、経過時間が `max-ref-age-ms` を超えているものは完全に削除されます (`main` ブランチが削除されることはありません) 
* 存在しないスナップショットを指す**ダングリング参照**は、警告とともに削除されます
* **現在のスナップショットは常に保持されます**。保持設定に関係なく保持されます

**必要な権限:**

`ALTER TABLE EXECUTE` 権限が必要です。これは ClickHouse のアクセス制御階層において `ALTER TABLE` の子権限です。この権限を個別に付与することも、親権限を通じて付与することもできます。

```sql
-- Grant only EXECUTE permission
GRANT ALTER TABLE EXECUTE ON my_iceberg_table TO my_user;

-- Or grant all ALTER TABLE permissions (includes ALTER TABLE EXECUTE)
GRANT ALTER TABLE ON my_iceberg_table TO my_user;
```

:::note

* サポートされるのは Iceberg フォーマットバージョン 2 のテーブルのみです (v1 スナップショットでは、クリーンアップ対象のファイルを安全に特定するために必要な `manifest-list` が保証されません) 
* 現在のスナップショットは、指定されたタイムスタンプより古い場合でも、常に保持されます
* `allow_insert_into_iceberg` 設定を有効にする必要があります
* `allow_experimental_expire_snapshots` 設定を有効にする必要があります
* ClickHouse がメタデータを更新する際には、カタログ自体の認可 (REST catalog の認証、AWS Glue IAM など) が別途適用されます
  :::


## 関連項目 \{#see-also\}

* [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
* [Iceberg クラスターテーブル関数](/sql-reference/table-functions/icebergCluster.md)