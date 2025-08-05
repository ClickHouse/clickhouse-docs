---
description: 'This engine provides a read-only integration with existing Apache
  Iceberg tables in Amazon S3, Azure, HDFS and locally stored tables.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: '/engines/table-engines/integrations/iceberg'
title: 'Iceberg Table Engine'
---




# Iceberg テーブルエンジン {#iceberg-table-engine}

:::warning 
ClickHouseでIcebergデータを扱うためには、[Iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)の使用を推奨します。Iceberg テーブル関数は現在、Iceberg テーブルに対して部分的な読み取り専用インターフェースを提供する十分な機能を備えています。

Iceberg テーブルエンジンは利用可能ですが、制限がある場合があります。ClickHouseは元々、外部で変更されるスキーマを持つテーブルをサポートするように設計されていないため、Iceberg テーブルエンジンの機能に影響を与える可能性があります。その結果、通常のテーブルで動作する機能の一部が利用できないか、正しく機能しない場合があります。特に古いアナライザーを使用している場合です。

最適な互換性のために、Iceberg テーブルエンジンのサポートを改善し続ける間、Iceberg テーブル関数の使用をお勧めします。
:::

このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存されたテーブルにある既存のApache [Iceberg](https://iceberg.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブル作成 {#create-table}

Icebergテーブルはストレージ内に既に存在している必要があります。このコマンドは新しいテーブルを作成するためのDDLパラメータを取らないことに注意してください。

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

引数の説明は、エンジン `S3`、`AzureBlobStorage`、`HDFS` および `File` の引数の説明と一致します。
`format` はIcebergテーブルのデータファイルのフォーマットを表します。

エンジンパラメータは、[Named Collections](../../../operations/named-collections.md)を使用して指定できます。

### 例 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

名前付きコレクションを使用する場合：

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

テーブルエンジン `Iceberg` は現時点で `IcebergS3` のエイリアスです。

## スキーマ進化 {#schema-evolution}
現在、CHを使用すると、時間とともにスキーマが変更されたIcebergテーブルを読み取ることができます。現在、列の追加や削除、列の順序変更が行われたテーブルの読み取りをサポートしています。また、値が必須のカラムをNULLを許可するカラムに変更することも可能です。さらに、次の単純型に対する型キャストをサポートしています：  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし P' > P。

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

スキーマが作成後に変更されたテーブルを動的スキーマ推論で読み取るには、テーブルの作成時に `allow_dynamic_metadata_for_data_lakes = true` を設定します。

## パーティションプルーニング {#partition-pruning}

ClickHouseはIcebergテーブルに対するSELECTクエリ中にパーティションプルーニングをサポートしており、これにより無関係なデータファイルをスキップすることでクエリパフォーマンスを最適化します。パーティションプルーニングを有効にするには、 `use_iceberg_partition_pruning = 1` を設定します。Icebergパーティションプルーニングの詳細については、https://iceberg.apache.org/spec/#partitioningにアクセスしてください。

## タイムトラベル {#time-travel}

ClickHouseはIcebergテーブルに対するタイムトラベルをサポートしており、特定のタイムスタンプまたはスナップショットIDを使用して過去のデータをクエリすることができます。

### 基本的な使い方 {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

注意：同一のクエリで `iceberg_timestamp_ms` と `iceberg_snapshot_id` の両方のパラメータを指定することはできません。

### 重要な考慮事項 {#important-considerations}

- **スナップショット** は通常、以下のときに作成されます：
    - テーブルに新しいデータが書き込まれるとき
    - 何らかのデータ圧縮が行われるとき

- **スキーマの変更は通常スナップショットを作成しません** - これは、スキーマ進化が行われたテーブルでタイムトラベルを使用するときに重要な挙動につながります。

### 例となるシナリオ {#example-scenarios}

すべてのシナリオはSparkで記述されています。ClickHouseは現在Icebergテーブルへの書き込みをサポートしていないためです。

#### シナリオ 1: 新しいスナップショットなしのスキーマ変更 {#scenario-1}

以下の操作のシーケンスを考えます：

 ```sql
 -- 2つの列を持つテーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- テーブルにデータを挿入
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // 擬似コードの一部

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

- ts1 と ts2 では、オリジナルの2つの列のみが表示されます。
- ts3では、すべての3つの列が表示され、最初の行の価格はNULLになります。

#### シナリオ 2: 過去のスキーマと現在のスキーマの違い {#scenario-2}


現在の瞬間でのタイムトラベルクエリは、現在のテーブルとは異なるスキーマを示す場合があります：

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- テーブルに初期データを挿入
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- テーブルを変更して新しい列を追加
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- 現在の瞬間のテーブルをクエリしますが、タイムスタンプ構文を使用します

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 現在の瞬間のテーブルをクエリします
  SELECT * FROM spark_catalog.db.time_travel_example_2;


    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

これは、`ALTER TABLE` が新しいスナップショットを作成しないために発生しますが、現在のテーブルに対してSparkは最新のメタデータファイルから `schema_id` の値を取得するためです。

#### シナリオ 3:  過去のスキーマと現在のスキーマの違い {#scenario-3}

もう一つは、タイムトラベルを行っているときに、任意のデータが書き込まれる前のテーブルの状態を取得できないことです：

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- 特定のタイムスタンプでテーブルをクエリ
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラー: tsより古いスナップショットが見つかりません。
```


Clickhouseの動作はSparkと一貫しています。SparkのSelectクエリをClickhouseのSelectクエリに置き換えることができ、同じように機能します。

## メタデータファイルの解決 {#metadata-file-resolution}
ClickHouseで`Iceberg`テーブルエンジンを使用する際、システムはIcebergテーブルの構造を記述した正しいmetadata.jsonファイルを見つける必要があります。この解決プロセスの仕組みは次のとおりです。

### 候補の検索（優先順） {#candidate-search}

1. **直接パスの指定**:
   * `iceberg_metadata_file_path` を設定すると、システムはこの正確なパスをIcebergテーブルのディレクトリパスと組み合わせて使用します。
   * この設定が提供されると、他の解決設定は無視されます。

2. **テーブルUUIDの一致**:
   * `iceberg_metadata_table_uuid` が指定されている場合、システムは：
     * `metadata` ディレクトリ内の `.metadata.json` ファイルのみを調べます。
     * 指定したUUIDと一致する `table-uuid` フィールドを含むファイルをフィルタリングします（大文字と小文字を区別しません）。

3. **デフォルトの検索**:
   * 上記の設定がいずれも提供されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補になります。

### 最新のファイルの選択 {#most-recent-file}

上記の規則を使用して候補ファイルを特定した後、システムは最も新しいファイルを決定します。

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合：
  * `last-updated-ms` 値が最大のファイルが選択されます。

* それ以外の場合：
  * バージョン番号が最も高いファイルが選択されます。
  * （バージョンは、 `V.metadata.json` または `V-uuid.metadata.json` という形式のファイル名に `V` として表示されます。）

**注**: 上記に言及したすべての設定はエンジンレベルの設定であり、テーブルの作成時に以下のように指定する必要があります：

```sql 
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注**: Icebergカタログは通常、メタデータ解決を処理しますが、ClickHouseの `Iceberg` テーブルエンジンは S3 に保存されたファイルを直接 Iceberg テーブルとして解釈します。これが、これらの解決ルールを理解することが重要な理由です。

## データキャッシュ {#data-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、 `S3`、`AzureBlobStorage`、`HDFS` ストレージと同様にデータキャッシングをサポートしています。詳しくは[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)。

## メタデータキャッシュ {#metadata-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、メタデータjsonの情報を保存するメタデータキャッシュをサポートしています。キャッシュはメモリ内に保存されます。この機能は `use_iceberg_metadata_files_cache` を設定することで制御されており、デフォルトで有効になっています。

## 参照 {#see-also}

- [iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)
