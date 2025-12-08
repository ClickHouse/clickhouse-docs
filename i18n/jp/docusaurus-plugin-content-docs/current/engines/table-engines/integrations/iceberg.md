---
description: 'このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存された既存の Apache Iceberg テーブルと読み取り専用で統合します。'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Iceberg テーブルエンジン'
doc_type: 'reference'
---

# Iceberg テーブルエンジン {#iceberg-table-engine}

:::warning 
ClickHouse で Iceberg データを扱う場合は、[Iceberg Table Function](/sql-reference/table-functions/iceberg.md) の使用を推奨します。Iceberg Table Function は現在、Iceberg テーブルに対する読み取り専用の一部機能に限られたインターフェースを提供しますが、現時点では十分な機能を備えています。

Iceberg Table Engine も利用可能ですが、いくつかの制限があります。ClickHouse はもともと外部でスキーマが変更されるテーブルをサポートするように設計されていないため、この特性が Iceberg Table Engine の機能に影響することがあります。その結果、通常のテーブルで動作する一部の機能が利用できなかったり、特に旧アナライザーを使用している場合に正しく動作しなかったりする可能性があります。

可能な限り高い互換性を確保するため、Iceberg Table Engine のサポートを継続的に改善している間は、Iceberg Table Function の使用を推奨します。
:::

このエンジンは、Amazon S3、Azure、HDFS 上およびローカルに保存された既存の Apache [Iceberg](https://iceberg.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブルを作成 {#create-table}

Iceberg テーブルはあらかじめストレージ上に存在している必要がある点に注意してください。このコマンドには、新しいテーブルを作成するための DDL パラメータを指定できません。

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

引数の説明は、それぞれ `S3`、`AzureBlobStorage`、`HDFS` および `File` エンジンにおける引数の説明と同様です。
`format` は Iceberg テーブル内のデータファイルの形式を表します。

エンジンパラメータは [Named Collections](../../../operations/named-collections.md) を使用して指定できます。

### 例 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

名前付きコレクションの使用：

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

テーブルエンジン `Iceberg` は、現在は `IcebergS3` のエイリアスになっています。

## スキーマの進化 {#schema-evolution}
現時点では、CH を用いることで、時間の経過とともにスキーマが変更された Iceberg テーブルを読み取ることができます。現在サポートしているのは、カラムの追加・削除が行われたり、その順序が変更されたテーブルの読み取りです。また、値が必須だったカラムを、NULL を許容するカラムに変更することもできます。加えて、単純型に対しては、以下の許可されている型変換をサポートしています:
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S)（P' > P の場合）

現時点では、ネストされた構造や、配列およびマップ内の要素の型を変更することはできません。

作成後にスキーマが変更されたテーブルを動的スキーマ推論で読み取るには、テーブル作成時に `allow_dynamic_metadata_for_data_lakes = true` を設定してください。

## パーティションプルーニング {#partition-pruning}

ClickHouse は Iceberg テーブルに対する SELECT クエリの実行時にパーティションプルーニングをサポートしており、関係のないデータファイルをスキップすることでクエリパフォーマンスを最適化できます。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定します。Iceberg におけるパーティションプルーニングの詳細については https://iceberg.apache.org/spec/#partitioning を参照してください。

## タイムトラベル {#time-travel}

ClickHouse は Iceberg テーブルに対するタイムトラベルをサポートしており、特定のタイムスタンプまたはスナップショット ID を指定して過去のデータをクエリできます。

## 削除行を含むテーブルの処理 {#deleted-rows}

現在サポートされているのは、[position deletes](https://iceberg.apache.org/spec/#position-delete-files) を使用する Iceberg テーブルのみです。

次の削除方式は**サポートされていません**：

* [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
* [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors)（v3 で導入）

### 基本的な使用方法 {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意: 同じクエリ内で `iceberg_timestamp_ms` パラメータと `iceberg_snapshot_id` パラメータを同時に指定することはできません。

### 重要な考慮事項 {#important-considerations}

* **スナップショット** は通常、次のタイミングで作成されます：
  * 新しいデータがテーブルに書き込まれたとき
  * 何らかのデータコンパクションが実行されたとき

* **スキーマ変更によってスナップショットが作成されることは通常ない** — このため、スキーマ進化を行ったテーブルでタイムトラベルを使用する場合に特有の挙動が発生します。

### シナリオ例 {#example-scenarios}

すべてのシナリオは Spark を用いて記述されています。これは、CH がまだ Iceberg テーブルへの書き込みをサポートしていないためです。

#### シナリオ 1: 新しいスナップショットを伴わないスキーマ変更 {#scenario-1}

次の一連の操作を考えてみます:

```sql
-- 2つの列を持つテーブルを作成
 CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
 order_number int, 
 product_code string
 ) 
 USING iceberg 
 OPTIONS ('format-version'='2')

-- テーブルにデータを挿入する
 INSERT INTO spark_catalog.db.time_travel_example VALUES 
   (1, 'Mars')

 ts1 = now() // 疑似コードの一例

-- テーブルを変更して新しい列を追加する
 ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

 ts2 = now()

-- テーブルにデータを挿入する
 INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

  ts3 = now()

-- 各タイムスタンプ時点でテーブルを問い合わせる
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

* ts1 と ts2 の時点: 元の 2 列のみが表示される
* ts3 の時点: 3 列すべてが表示され、1 行目の price 列は NULL になる

#### シナリオ 2: 履歴スキーマと現在のスキーマの差異 {#scenario-2}

現在時点を指定したタイムトラベルクエリでは、現在のテーブルとは異なるスキーマが表示される場合があります:

```sql
-- テーブルを作成する
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- テーブルに初期データを挿入する
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- テーブルを変更して新しい列を追加する
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- タイムスタンプ構文を使用して現在時点のテーブルをクエリする

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 現在時点のテーブルをクエリする
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

これは、`ALTER TABLE` が新しいスナップショットを作成せず、現在のテーブルについては Spark がスナップショットではなく最新のメタデータファイルから `schema_id` の値を取得するために発生します。

#### シナリオ 3: 過去と現在のスキーマの差異 {#scenario-3}

2つ目の制約は、タイムトラベルを行っても、テーブルに最初のデータが書き込まれる前の状態は取得できないという点です。

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- 特定のタイムスタンプ時点でテーブルをクエリする
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラーで終了: ts より古いスナップショットが見つかりません
```

ClickHouse における挙動は Spark と同じです。概念的には Spark の SELECT クエリを ClickHouse の SELECT クエリに置き換えて考えれば、同じように動作します。

## メタデータファイルの解決 {#metadata-file-resolution}

ClickHouse で `Iceberg` テーブルエンジンを使用する場合、システムは Iceberg テーブル構造を記述する適切な metadata.json ファイルを特定する必要があります。以下は、この解決プロセスの概要です。

### 候補の検索 {#candidate-search}

1. **パスの直接指定**:

* `iceberg_metadata_file_path` を設定した場合、システムは Iceberg テーブルディレクトリパスにこれを結合したパスをそのまま使用します。
* この設定が指定されている場合、他の解決用設定はすべて無視されます。

2. **テーブル UUID の一致**:

* `iceberg_metadata_table_uuid` が指定されている場合、システムは次のように動作します:
  * `metadata` ディレクトリ内の `.metadata.json` ファイルのみを参照する
  * 指定された UUID と一致する `table-uuid` フィールドを含むファイルをフィルタリングする（大文字小文字は区別しない）

3. **デフォルト検索**:

* 上記いずれの設定も指定されていない場合、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補になります

### 最新のファイルの選択 {#most-recent-file}

上記のルールで候補ファイルを特定した後、システムはその中で最も新しいものを決定します:

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合:
  * `last-updated-ms` の値が最大のファイルが選択されます

* それ以外の場合:
  * バージョン番号が最も高いファイルが選択されます
  * （バージョンは `V.metadata.json` または `V-uuid.metadata.json` 形式のファイル名中の `V` として表現されます）

**Note**: 上記で言及した設定はすべてエンジンレベルの設定であり、以下に示すようにテーブル作成時に指定する必要があります。

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注**: 通常は Iceberg Catalog がメタデータの解決を担当しますが、ClickHouse の `Iceberg` テーブルエンジンは S3 に保存されたファイルを Iceberg テーブルとして直接解釈します。そのため、これらの解決ルールを理解しておくことが重要です。

## データキャッシュ {#data-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様にデータキャッシュをサポートします。詳細は[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)を参照してください。

## メタデータキャッシュ {#metadata-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、メタデータ JSON の情報を格納するメタデータキャッシュをサポートしています。キャッシュはメモリ内に保存されます。この機能は `use_iceberg_metadata_files_cache` 設定によって制御され、デフォルトで有効になっています。

## 関連項目 {#see-also}

- [Iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)
