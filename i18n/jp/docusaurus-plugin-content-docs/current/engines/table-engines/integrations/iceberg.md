---
description: 'このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存された既存の Apache Iceberg テーブルとの読み取り専用の統合を提供します。'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Iceberg テーブルエンジン'
doc_type: 'reference'
---



# Icebergテーブルエンジン {#iceberg-table-engine}

:::warning
ClickHouseでIcebergデータを扱う際は、[Icebergテーブル関数](/sql-reference/table-functions/iceberg.md)の使用を推奨します。Icebergテーブル関数は現在、Icebergテーブルに対する部分的な読み取り専用インターフェースを提供しており、十分な機能を備えています。

Icebergテーブルエンジンは利用可能ですが、制限がある場合があります。ClickHouseは元々、外部でスキーマが変更されるテーブルをサポートするように設計されていないため、Icebergテーブルエンジンの機能に影響を与える可能性があります。その結果、通常のテーブルで動作する一部の機能が利用できない、または正しく機能しない場合があります(特に旧アナライザーを使用している場合)。

最適な互換性を得るために、Icebergテーブルエンジンのサポート改善を継続している間は、Icebergテーブル関数の使用を推奨します。
:::

このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存されている既存のApache [Iceberg](https://iceberg.apache.org/)テーブルとの読み取り専用統合を提供します。


## テーブルの作成 {#create-table}

注意: Icebergテーブルはストレージ内に既に存在している必要があります。このコマンドは新しいテーブルを作成するためのDDLパラメータを受け取りません。

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

引数の説明は、`S3`、`AzureBlobStorage`、`HDFS`、`File` の各エンジンの引数の説明とそれぞれ対応しています。
`format` は Iceberg テーブル内のデータファイルの形式を指定します。

エンジンパラメータは [Named Collections](../../../operations/named-collections.md) を使用して指定できます。

### 例 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

Named Collections を使用する場合:

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

テーブルエンジン `Iceberg` は、現在 `IcebergS3` のエイリアスとなっています。


## スキーマの進化 {#schema-evolution}

現在、ClickHouseを使用することで、時間の経過とともにスキーマが変更されたIcebergテーブルを読み取ることができます。現在サポートしているのは、カラムの追加・削除、およびカラムの順序が変更されたテーブルの読み取りです。また、必須値のカラムをNULL許可のカラムに変更することも可能です。さらに、以下の単純型に対する型キャストをサポートしています:

- int -> long
- float -> double
- decimal(P, S) -> decimal(P', S) ただし P' > P

現在、ネストされた構造体や、配列およびマップ内の要素の型を変更することはできません。

動的スキーマ推論を使用して、作成後にスキーマが変更されたテーブルを読み取るには、テーブル作成時に allow_dynamic_metadata_for_data_lakes = true を設定してください。


## パーティションプルーニング {#partition-pruning}

ClickHouseは、IcebergテーブルへのSELECTクエリ実行時にパーティションプルーニングをサポートしており、無関係なデータファイルをスキップすることでクエリパフォーマンスを最適化します。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1`を設定してください。Icebergパーティションプルーニングの詳細については、https://iceberg.apache.org/spec/#partitioning を参照してください。


## タイムトラベル {#time-travel}

ClickHouseはIcebergテーブルのタイムトラベル機能をサポートしており、特定のタイムスタンプまたはスナップショットIDを指定して過去のデータをクエリできます。


## 削除された行を含むテーブルの処理 {#deleted-rows}

現在、[位置削除](https://iceberg.apache.org/spec/#position-delete-files)を使用したIcebergテーブルのみがサポートされています。

以下の削除方式は**サポートされていません**:

- [等価削除](https://iceberg.apache.org/spec/#equality-delete-files)
- [削除ベクトル](https://iceberg.apache.org/spec/#deletion-vectors)(v3で導入)

### 基本的な使用方法 {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意: 同じクエリ内で`iceberg_timestamp_ms`と`iceberg_snapshot_id`の両方のパラメータを指定することはできません。

### 重要な考慮事項 {#important-considerations}

- **スナップショット**は通常、以下の場合に作成されます:
  - テーブルに新しいデータが書き込まれたとき
  - 何らかのデータ圧縮が実行されたとき

- **スキーマ変更は通常スナップショットを作成しません** - これにより、スキーマ進化を経たテーブルでタイムトラベルを使用する際に重要な動作が発生します。

### シナリオ例 {#example-scenarios}

すべてのシナリオはSparkで記述されています。これは、ClickHouseがまだIcebergテーブルへの書き込みをサポートしていないためです。

#### シナリオ1: 新しいスナップショットを伴わないスキーマ変更 {#scenario-1}

次の一連の操作を考えてみましょう:

```sql
-- テーブルを作成 with two columns
 CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
 order_number int,
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
  order_number int,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2');

  ts = now();

-- 特定のタイムスタンプでテーブルをクエリ
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラーで終了: ts より古いスナップショットが見つかりません。
```

ClickHouseの動作はSparkと一貫しています。SparkのSELECTクエリをClickHouseのSELECTクエリに置き換えても、同じように動作します。


## メタデータファイルの解決 {#metadata-file-resolution}

ClickHouseで`Iceberg`テーブルエンジンを使用する場合、システムはIcebergテーブル構造を記述する正しいmetadata.jsonファイルを特定する必要があります。この解決プロセスは以下のように動作します:

### 候補の検索 {#candidate-search}

1. **直接パス指定**:

- `iceberg_metadata_file_path`を設定した場合、システムはこのパスをIcebergテーブルディレクトリパスと組み合わせて使用します。
- この設定が指定されている場合、他のすべての解決設定は無視されます。

2. **テーブルUUIDマッチング**:

- `iceberg_metadata_table_uuid`が指定されている場合、システムは以下を実行します:
  - `metadata`ディレクトリ内の`.metadata.json`ファイルのみを検索
  - 指定されたUUIDに一致する`table-uuid`フィールドを含むファイルをフィルタリング(大文字小文字を区別しない)

3. **デフォルト検索**:

- 上記の設定がいずれも指定されていない場合、`metadata`ディレクトリ内のすべての`.metadata.json`ファイルが候補となります

### 最新ファイルの選択 {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムは以下の方法で最新のファイルを判断します:

- `iceberg_recent_metadata_file_by_last_updated_ms_field`が有効な場合:
  - `last-updated-ms`値が最大のファイルが選択されます

- それ以外の場合:
  - 最も高いバージョン番号を持つファイルが選択されます
  - (バージョンは`V.metadata.json`または`V-uuid.metadata.json`形式のファイル名で`V`として表示されます)

**注**: 上記のすべての設定はエンジンレベルの設定であり、以下に示すようにテーブル作成時に指定する必要があります:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注**: Icebergカタログは通常メタデータ解決を処理しますが、ClickHouseの`Iceberg`テーブルエンジンはS3に保存されたファイルをIcebergテーブルとして直接解釈するため、これらの解決ルールを理解することが重要です。


## データキャッシュ {#data-cache}

`Iceberg`テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS`ストレージと同様のデータキャッシュ機能をサポートしています。詳細は[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)を参照してください。


## メタデータキャッシュ {#metadata-cache}

`Iceberg`テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、メタデータJSONの情報を格納するメタデータキャッシュに対応しています。キャッシュはメモリ上に保存されます。この機能は`use_iceberg_metadata_files_cache`設定で制御され、デフォルトで有効化されています。


## 関連項目 {#see-also}

- [iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)
