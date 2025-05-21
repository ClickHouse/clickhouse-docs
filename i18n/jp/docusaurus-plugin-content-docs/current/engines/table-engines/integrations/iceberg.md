---
description: 'このエンジンは、Amazon S3、Azure、HDFS、およびローカルストレージの既存の Apache Iceberg テーブルとの読み取り専用統合を提供します。'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Iceberg テーブルエンジン'
---


# Iceberg テーブルエンジン {#iceberg-table-engine}

:::warning 
ClickHouse で Iceberg データを扱うには、[Iceberg テーブル関数](/sql-reference/table-functions/iceberg.md) の使用をお勧めします。Iceberg テーブル関数は現在、Iceberg テーブルの部分的な読み取り専用インターフェースを提供する十分な機能を備えています。

Iceberg テーブルエンジンは利用可能ですが、制限がある場合があります。ClickHouseは、外部で変更されるスキーマを持つテーブルをサポートするようには最初から設計されていないため、Iceberg テーブルエンジンの機能に影響を与える可能性があります。その結果、通常のテーブルで動作する機能の一部が利用できないか、正しく機能しない場合があります。特に、古いアナライザーを使用している場合に注意が必要です。

最適な互換性を実現するために、Iceberg テーブルエンジンのサポートを改善している間は、Iceberg テーブル関数の使用をお勧めします。
:::

このエンジンは、Amazon S3、Azure、HDFS、およびローカルストレージの既存の Apache [Iceberg](https://iceberg.apache.org/) テーブルとの読み取り専用統合を提供します。

## テーブルの作成 {#create-table}

Iceberg テーブルはすでにストレージに存在する必要があります。このコマンドは新しいテーブルを作成するための DDL パラメータを受け付けません。

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

引数の説明は、それぞれのエンジン `S3`、`AzureBlobStorage`、`HDFS`、および `File` の引数の説明と一致します。
`format` は Iceberg テーブル内のデータファイルの形式を表します。

エンジンパラメータは、[Named Collections](../../../operations/named-collections.md) を使用して指定できます。

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

テーブルエンジン `Iceberg` は現在 `IcebergS3` のエイリアスです。

## スキーマの進化 {#schema-evolution}
現在、CH の助けにより、時間とともに変更されたスキーマを持つ Iceberg テーブルを読み取ることができます。現在、カラムが追加または削除され、順序が変更されたテーブルの読み取りをサポートしています。カラムの値が必須であるものを NULL が許可されるカラムに変更することも可能です。さらに、次の単純型に対する許可されている型キャストをサポートしています：
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし、P' > P であること。

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

テーブル作成時に動的スキーマ推論を使用して、スキーマが変更されたテーブルを読み取るには、allow_dynamic_metadata_for_data_lakes = true に設定します。

## パーティション プルーニング {#partition-pruning}

ClickHouse は Iceberg テーブルに対する SELECT クエリ中にパーティション プルーニングをサポートしており、関連のないデータファイルをスキップすることでクエリのパフォーマンスを向上させます。パーティション プルーニングを有効にするには、`use_iceberg_partition_pruning = 1` に設定します。Iceberg パーティション プルーニングの詳細については、 https://iceberg.apache.org/spec/#partitioning を参照してください。

## タイムトラベル {#time-travel}

ClickHouse は Iceberg テーブルに対するタイムトラベルをサポートしており、特定のタイムスタンプやスナップショット ID を使用して履歴データをクエリできます。

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

- **スナップショット** は通常、次の場合に作成されます:
    - 新しいデータがテーブルに書き込まれた
    - 何らかのデータ圧縮が行われた

- **スキーマの変更は通常スナップショットを作成しません** - これは、スキーマ進化を経たテーブルでタイムトラベルを使用する際に重要な振る舞いをもたらします。

### 例となるシナリオ {#example-scenarios}

すべてのシナリオは Spark で記述されています。現時点で CH は Iceberg テーブルへの書き込みをサポートしていません。

#### シナリオ 1: 新しいスナップショットなしのスキーマ変更 {#scenario-1}

以下の操作のシーケンスを考慮してください:

```sql
 -- 2 つのカラムを持つテーブルを作成
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

-- 新しいカラムを追加するためにテーブルを変更
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- テーブルにデータを再度挿入
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

- ts1 および ts2 の時: 元の 2 つのカラムのみが表示されます
- ts3 の時: すべての 3 つのカラムが表示され、最初の行の価格には NULL が表示されます

#### シナリオ 2: 現在のスキーマとその変化の違い {#scenario-2}

現在の瞬間におけるタイムトラベルクエリは、現在のテーブルとは異なるスキーマを示す場合があります:

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

-- 新しいカラムを追加するためにテーブルを変更
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- 現在の瞬間でテーブルをクエリするが、タイムスタンプ構文を使用する

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 現在の瞬間にテーブルをクエリ
  SELECT * FROM spark_catalog.db.time_travel_example_2;

    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

これは、`ALTER TABLE` が新しいスナップショットを作成しないため発生しますが、現在のテーブルに対して Spark は最新のメタデータファイルから `schema_id` の値を取得します。

#### シナリオ 3: 書き込まれる前のテーブルの状態を取得 {#scenario-3}

タイムトラベルを行う際に、データが書き込まれる前のテーブルの状態を取得することはできません:

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
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- エラー：Cannot find a snapshot older than ts. で終了します。
```

ClickHouseの動作はSparkと一貫しています。SparkのSelectクエリをClickHouseのSelectクエリに置き換えても同じように動作します。

## メタデータファイル解決 {#metadata-file-resolution}
ClickHouseで `Iceberg` テーブルエンジンを使用する際、システムは Iceberg テーブル構造を記述する正しい metadata.json ファイルを見つける必要があります。この解決プロセスの流れは以下の通りです。

### 候補検索 (優先順位順) {#candidate-search}

1. **直接パス指定**:
   * `iceberg_metadata_file_path` を設定した場合、システムはこの正確なパスを Iceberg テーブルディレクトリパスと結合して使用します。
   * この設定が提供された場合、他のすべての解決設定は無視されます。

2. **テーブル UUID 一致**:
   * `iceberg_metadata_table_uuid` が指定された場合、システムは次の方法で行います:
     * `metadata` ディレクトリ内の `.metadata.json` ファイルのみを探索します
     * 指定された UUID に一致する `table-uuid` フィールドを含むファイルをフィルタリングします（大文字と小文字を区別しません）

3. **デフォルト検索**:
   * 上記のいずれの設定も提供されない場合は、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補になります。

### 最新ファイルの選択 {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムはどれが最新であるかを決定します:

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効な場合:
  * `last-updated-ms` 値が最も大きいファイルが選択されます。

* そうでない場合:
  * バージョン番号が最も高いファイルが選択されます。
  * （バージョンは `V.metadata.json` または `V-uuid.metadata.json` の形式でファイル名に `V` として表示されます）

**注意**: 前述のすべての設定はエンジンレベルの設定であり、以下のようにテーブル作成時に指定する必要があります:

```sql 
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注意**: Iceberg カタログは通常、メタデータ解決を処理しますが、ClickHouse の `Iceberg` テーブルエンジンは直接 S3 に格納されたファイルを Iceberg テーブルとして解釈するため、これらの解決ルールを理解することが重要です。

## データキャッシュ {#data-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様にデータキャッシュをサポートします。詳細は[こちら](../../../engines/table-engines/integrations/s3.md#data-cache)を参照してください。

## メタデータキャッシュ {#metadata-cache}

`Iceberg` テーブルエンジンおよびテーブル関数は、マニフェストファイル、マニフェストリスト、およびメタデータ JSON の情報を保存するためのメタデータキャッシュをサポートしています。このキャッシュはメモリに保存されます。この機能は `use_iceberg_metadata_files_cache` によって制御されており、デフォルトで有効になっています。

## 参照 {#see-also}

- [iceberg テーブル関数](/sql-reference/table-functions/iceberg.md)
