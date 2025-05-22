---
'description': 'Provides a read-only table-like interface to Apache Iceberg tables
  in Amazon S3, Azure, HDFS or locally stored.'
'sidebar_label': 'iceberg'
'sidebar_position': 90
'slug': '/sql-reference/table-functions/iceberg'
'title': 'Iceberg'
---





# iceberg Table Function {#iceberg-table-function}

Apache [Iceberg](https://iceberg.apache.org/) テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。Amazon S3、Azure、HDFS、またはローカルに保存されたテーブルに対応しています。

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

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS`、および `file` の引数の説明に一致します。
`format` は Iceberg テーブル内のデータファイルの形式を示します。

### Returned value {#returned-value}

指定された Iceberg テーブルのデータを読み取るための指定された構造を持つテーブル。

### Example {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS`、および `icebergLocal` テーブル関数と `IcebergS3`、`icebergAzure`、`IcebergHDFS`、`IcebergLocal` テーブルエンジンを介して、Iceberg フォーマットの v1 および v2 の読み取りをサポートしています。
:::

## Defining a named collection {#defining-a-named-collection}

URL および資格情報を保存するために名前付きコレクションを構成する例を以下に示します。

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
現在、CH の助けを借りて、時間の経過とともにスキーマが変更された Iceberg テーブルを読み取ることができます。現在、列が追加および削除され、順序が変更されたテーブルの読み取りをサポートしています。また、値が必須の列を NULL を許可する列に変更することもできます。さらに、次の単純タイプに対する許可された型変換をサポートしています。 
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし、P' > P。

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

## Partition Pruning {#partition-pruning}

ClickHouse は Iceberg テーブルに対する SELECT クエリ中のパーティショニング プルーニングをサポートしています。これは、無関係なデータファイルをスキップすることによってクエリのパフォーマンスを最適化するのに役立ちます。パーティショニング プルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定します。Iceberg のパーティショニング プルーニングに関する詳細は、 https://iceberg.apache.org/spec/#partitioning を参照してください。

## Time Travel {#time-travel}

ClickHouse は Iceberg テーブル用の時間旅行をサポートしており、特定のタイムスタンプまたはスナップショット ID を使用して過去のデータをクエリできます。

### Basic usage {#basic-usage}
```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意: 同じクエリ内で `iceberg_timestamp_ms` と `iceberg_snapshot_id` の両方のパラメータを指定することはできません。

### Important considerations {#important-considerations}

- **スナップショット** は通常、以下のような場合に作成されます：
    - 新しいデータがテーブルに書き込まれるとき
    - 何らかのデータ圧縮が行われるとき

- **スキーマの変更は通常、スナップショットを作成しません** - これは、スキーマが進化したテーブルで時間旅行を使用する際に重要な動作をもたらします。

### Example scenarios {#example-scenarios}

すべてのシナリオは Spark で記述されています。CH はまだ Iceberg テーブルへの書き込みをサポートしていません。

#### Scenario 1: Schema Changes Without New Snapshots {#scenario-1}

この操作のシーケンスを考えてみましょう：

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

異なるタイムスタンプでのクエリ結果：

- ts1 および ts2 の場合：元の 2 列のみが表示されます。
- ts3 の場合：3 列すべてが表示され、最初の行の価格は NULL です。

#### Scenario 2: Historical vs. Current Schema Differences {#scenario-2}

現在の瞬間での時間旅行クエリは、現在のテーブルとは異なるスキーマを示す可能性があります：

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

-- 現在の瞬間でテーブルをクエリするが、タイムスタンプ構文を使用
SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           2|       Venus|
+------------+------------+

-- 現在の瞬間でテーブルをクエリ
SELECT * FROM spark_catalog.db.time_travel_example_2;

+------------+------------+-----+
|order_number|product_code|price|
+------------+------------+-----+
|           2|       Venus| NULL|
+------------+------------+-----+
```

このようになるのは、`ALTER TABLE` が新しいスナップショットを作成せず、現在のテーブルでは Spark が最新のメタデータファイルから `schema_id` の値を取得するためです。

#### Scenario 3: Historical vs. Current Schema Differences {#scenario-3}

時間旅行を行うと、データが書き込まれる前のテーブルの状態を取得することはできません：

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
SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラーで終了します：Cannot find a snapshot older than ts.
```

ClickHouse の動作は Spark と一致しています。Spark の Select クエリを Clickhouse の Select クエリと置き換えれば、同じように動作します。

## Metadata File Resolution {#metadata-file-resolution}

ClickHouse の `iceberg` テーブル関数を使用する際、システムは Iceberg テーブル構造を記述する正しい metadata.json ファイルを見つける必要があります。この解決プロセスは以下のように機能します。

### Candidate Search (in Priority Order) {#candidate-search}

1. **直接パスの指定**:
   * `iceberg_metadata_file_path` が設定されている場合、システムはこのパスを Iceberg テーブルのディレクトリパスと結合して使用します。
   * この設定が提供されると、他のすべての解決設定は無視されます。

2. **テーブル UUID マッチング**:
   * `iceberg_metadata_table_uuid` が指定されている場合、システムは：
     * `metadata` ディレクトリの `.metadata.json` ファイルのみを確認します。
     * 指定された UUID（大文字と小文字を区別しない）に一致する `table-uuid` フィールドを含むファイルをフィルタリングします。

3. **デフォルト検索**:
   * 上記の設定が提供されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補になります。

### Selecting the Most Recent File {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムはどれが最も新しいかを判断します：

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合：
  * `last-updated-ms` 値が最も大きいファイルが選択されます。

* そうでない場合：
  * バージョン番号が最も高いファイルが選択されます。
  * （バージョンは、`V.metadata.json` または `V-uuid.metadata.json` の形式のファイル名に表示されます）

**注意**: すべての設定はテーブル関数の設定です（グローバルまたはクエリレベルの設定ではなく）、以下のように指定する必要があります：

```sql 
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**: Iceberg カタログは通常、メタデータ解決を処理しますが、ClickHouse の `iceberg` テーブル関数は S3 に保存されているファイルを Iceberg テーブルとして直接解釈します。このため、これらの解決ルールを理解することが重要です。

## Metadata cache {#metadata-cache}

`Iceberg` テーブルエンジンとテーブル関数は、マニフェストファイル、マニフェストリスト、およびメタデータ JSON の情報を保存するメタデータキャッシュをサポートしています。キャッシュはメモリに保存されます。この機能は `use_iceberg_metadata_files_cache` を設定することで制御されており、デフォルトでは有効です。

## Aliases {#aliases}

テーブル関数 `iceberg` は現在 `icebergS3` のエイリアスです。

## See Also {#see-also}

- [Iceberg engine](/engines/table-engines/integrations/iceberg.md)
- [Iceberg cluster table function](/sql-reference/table-functions/icebergCluster.md)
