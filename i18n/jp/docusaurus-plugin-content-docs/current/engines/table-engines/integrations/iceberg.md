---
'description': 'このエンジンは、Amazon S3、Azure、HDFS およびローカルに保存されたテーブルにおける既存の Apache Iceberg
  テーブルとの読み取り専用統合を提供します。'
'sidebar_label': 'Iceberg'
'sidebar_position': 90
'slug': '/engines/table-engines/integrations/iceberg'
'title': 'Iceberg テーブルエンジン'
'doc_type': 'reference'
---


# Iceberg テーブルエンジン {#iceberg-table-engine}

:::warning 
Iceberg データを ClickHouse で扱うためには、[Iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)の使用をお勧めします。Iceberg テーブル関数は、現在、Iceberg テーブル用の部分的な読み取り専用インターフェースを提供する十分な機能を備えています。

Iceberg テーブルエンジンは利用可能ですが、制限がある可能性があります。ClickHouse は元々、外部で変更されるスキーマを持つテーブルをサポートするようには設計されておらず、これが Iceberg テーブルエンジンの機能に影響を与える可能性があります。その結果、通常のテーブルで機能するいくつかの機能が利用できない場合や、特に旧バージョンのアナライザーを使用する場合に正しく機能しないことがあります。

最適な互換性を確保するために、Iceberg テーブルエンジンのサポートを改善している間は、Iceberg テーブル関数の使用をお勧めします。
:::

このエンジンは、Amazon S3、Azure、HDFS、そしてローカルに保存されたテーブルの既存の Apache [Iceberg](https://iceberg.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブルの作成 {#create-table}

Iceberg テーブルはすでにストレージに存在している必要があり、このコマンドは新しいテーブルを作成するための DDL パラメータを受け付けません。

```sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```

## エンジン引数 {#engine-arguments}

引数の説明は、エンジン `S3`、`AzureBlobStorage`、`HDFS`、および `File` のそれぞれの引数の説明と一致しています。
`format` は Iceberg テーブルのデータファイルの形式を示します。

エンジンパラメータは、[Named Collections](../../../operations/named-collections.md)を使用して指定できます。

### 例 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

名前付きコレクションの使用:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3(iceberg_conf, filename = 'test_table')

```

## エイリアス {#aliases}

テーブルエンジン `Iceberg` は現在 `IcebergS3` のエイリアスです。

## スキーマ進化 {#schema-evolution}
現在、CH の助けを借りて、時間の経過とともにスキーマが変更された Iceberg テーブルを読み取ることができます。現在、カラムが追加または削除され、順序が変更されたテーブルの読み取りをサポートしています。また、値が必要なカラムを NULL が許可されるカラムに変更することもできます。さらに、単純な型のために許可されている型キャスティングをサポートしています。
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし P' > P。

現在、ネストした構造体や配列およびマップ内の要素の型を変更することはできません。

作成後にスキーマが変更されたテーブルを動的スキーマ推論を用いて読み取るには、テーブル作成時に `allow_dynamic_metadata_for_data_lakes = true` を設定してください。

## パーティションプルーニング {#partition-pruning}

ClickHouse は Iceberg テーブルの SELECT クエリ中にパーティションプルーニングをサポートしており、これにより関係のないデータファイルをスキップすることでクエリパフォーマンスを最適化します。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定してください。Iceberg パーティションプルーニングの詳細については、 https://iceberg.apache.org/spec/#partitioning をご覧ください。

## タイムトラベル {#time-travel}

ClickHouse は Iceberg テーブルのタイムトラベルをサポートしており、特定のタイムスタンプまたはスナップショット ID を使用して過去のデータをクエリすることができます。

## 削除された行のテーブルの処理 {#deleted-rows}

現在、[ポジションデリート](https://iceberg.apache.org/spec/#position-delete-files) を持つ Iceberg テーブルのみがサポートされています。 

以下の削除メソッドは **サポートされていません**:
- [イコールデリート](https://iceberg.apache.org/spec/#equality-delete-files)
- [デリートベクター](https://iceberg.apache.org/spec/#deletion-vectors) (v3 で導入)

### 基本的な使用法 {#basic-usage}
```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意: 同じクエリ内で `iceberg_timestamp_ms` と `iceberg_snapshot_id` の両方のパラメータを指定することはできません。

### 重要な考慮事項 {#important-considerations}

- **スナップショット**は通常次の時に作成されます:
  - 新しいデータがテーブルに書き込まれるとき
  - 何らかのデータ圧縮が行われるとき

- **スキーマの変更は通常スナップショットを作成しません** - これはスキーマ進化が行われたテーブルでタイムトラベルを使用する際の重要な挙動につながります。

### 例のシナリオ {#example-scenarios}

すべてのシナリオは Spark で記述されています。CH はまだ Iceberg テーブルへの書き込みをサポートしていないためです。

#### シナリオ 1: 新しいスナップショットなしのスキーマ変更 {#scenario-1}

以下の操作のシーケンスを考えてみます:

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
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

異なるタイムスタンプでのクエリ結果:

- ts1 および ts2 では: 元の2つのカラムのみが表示されます。
- ts3 では: すべての3つのカラムが表示され、最初の行の価格は NULL です。

#### シナリオ 2: 過去のスキーマと現在のスキーマの違い {#scenario-2}

現在の時点でのタイムトラベルクエリは、現在のテーブルとは異なるスキーマを表示する可能性があります:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
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

これは `ALTER TABLE` が新しいスナップショットを作成しないために発生しますが、現在のテーブルでは Spark が最新のメタデータファイルから `schema_id` の値を取得するためです。

#### シナリオ 3: 過去のスキーマと現在のスキーマの違い {#scenario-3}

二つ目のポイントは、タイムトラベルを行うときに、データが書き込まれる前のテーブルの状態を取得できないことです:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

ClickHouse の動作は Spark と一致しています。Spark の Select クエリを ClickHouse の Select クエリに置き換えることができ、同じように動作します。

## メタデータファイルの解決 {#metadata-file-resolution}
ClickHouse で `Iceberg` テーブルエンジンを使用する際、システムは Iceberg テーブルの構造を記述する正しい metadata.json ファイルを見つける必要があります。この解決プロセスは以下のように機能します。

### 候補の検索 {#candidate-search}

1. **直接パスの指定**:
* `iceberg_metadata_file_path` を設定すると、システムは Iceberg テーブルディレクトリパスとこの正確なパスを組み合わせて使用します。
* この設定が提供されている場合、他の解決設定は無視されます。
2. **テーブル UUID 一致**:
* `iceberg_metadata_table_uuid` が指定されている場合、システムは:
  * `metadata` ディレクトリ内の `.metadata.json` ファイルのみに着目します。
  * 指定された UUID（大文字小文字を区別しない）と一致する `table-uuid` フィールドを含むファイルをフィルタリングします。

3. **デフォルト検索**:
* 上記の設定が提供されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補となります。

### 最も新しいファイルの選択 {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムはどれが最も新しいかを判断します。

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効になっている場合:
  * 最も大きな `last-updated-ms` 値を持つファイルが選択されます。

* そうでない場合:
  * 最も高いバージョン番号を持つファイルが選択されます。
  * (バージョンは `V.metadata.json` または `V-uuid.metadata.json` という形式のファイル名に `V` で表示されます)

**注意**: 言及されたすべての設定はエンジンレベルの設定であり、テーブル作成時に以下のように指定する必要があります:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注意**: Iceberg カタログは通常メタデータ解決を処理しますが、ClickHouse の `Iceberg` テーブルエンジンは S3 に保存されたファイルを直接 Iceberg テーブルとして解釈するため、これらの解決ルールを理解することが重要です。

## データキャッシュ {#data-cache}

`Iceberg` テーブルエンジンとテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様にデータキャッシングをサポートします。詳細は[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)を参照してください。

## メタデータキャッシュ {#metadata-cache}

`Iceberg` テーブルエンジンとテーブル関数は、マニフェストファイル、マニフェストリスト、およびメタデータ json の情報を保存するメタデータキャッシュをサポートします。キャッシュはメモリに保存されます。この機能は `use_iceberg_metadata_files_cache` を設定することで制御されており、デフォルトで有効です。

## 参照 {#see-also}

- [iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)
