---
description: 'Amazon S3、Azure、HDFS、またはローカルに保存されたApache Icebergテーブルへの読み取り専用のテーブルライクインターフェースを提供します。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
---


# iceberg テーブル関数 {#iceberg-table-function}

Amazon S3、Azure、HDFS、またはローカルに保存されたApache [Iceberg](https://iceberg.apache.org/) テーブルへの読み取り専用のテーブルライクインターフェースを提供します。

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

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS` および `file` における引数の説明に一致します。
`format` は、Iceberg テーブル内のデータファイルのフォーマットを表します。

### 戻り値 {#returned-value}
指定された Iceberg テーブル内のデータを読み取るための指定された構造を持つテーブル。

### 例 {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse は現在、`icebergS3`、`icebergAzure`、`icebergHDFS` および `icebergLocal` テーブル関数と、`IcebergS3`、`icebergAzure`、`IcebergHDFS` および `IcebergLocal` テーブルエンジンを介して Iceberg フォーマットの v1 および v2 の読み取りをサポートしています。
:::

## 名前付きコレクションの定義 {#defining-a-named-collection}

URL と資格情報を格納するための名前付きコレクションを構成する例を示します。

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
現在、CHを使用すれば、時間の経過とともにスキーマが変更されたIcebergテーブルを読み取ることができます。現在、カラムが追加または削除されたり、その順序が変更されたテーブルの読み取りをサポートしています。また、値が必要なカラムをNULLが許容されるカラムに変更することも可能です。さらに、以下のような単純タイプの許可された型キャストをサポートしています：  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) ただし P' > P。

現在、ネストされた構造や配列およびマップ内の要素の型を変更することはできません。

## パーティションプルーニング {#partition-pruning}

ClickHouse は、Iceberg テーブルの SELECT クエリ中にパーティションプルーニングをサポートしており、無関係なデータファイルをスキップすることによってクエリパフォーマンスを最適化します。パーティションプルーニングを有効にするには、`use_iceberg_partition_pruning = 1` を設定します。Iceberg パーティションプルーニングに関する詳細情報は、 https://iceberg.apache.org/spec/#partitioning を参照してください。

## タイムトラベル {#time-travel}

ClickHouse は Iceberg テーブルに対するタイムトラベルをサポートしており、特定のタイムスタンプまたはスナップショット ID を使用して履歴データをクエリできます。

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

- **スナップショット** は通常、次の場合に作成されます：
    - 新しいデータがテーブルに書き込まれたとき
    - 何らかのデータコンパクションが実行されたとき

- **スキーマの変更は通常スナップショットを作成しません** - これは、スキーマの進化を経たテーブルでタイムトラベルを使用する際の重要な動作につながります。

### 例シナリオ {#example-scenarios}

すべてのシナリオは、CHがまだIcebergテーブルへの書き込みをサポートしていないため、Sparkで書かれています。

#### シナリオ 1: スナップショットなしでのスキーマ変更 {#scenario-1}

次の操作のシーケンスを考えます。

 ```sql
 -- 列を2つ持つテーブルを作成
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

異なるタイムスタンプでのクエリ結果：

- ts1 と ts2 では：元の 2 列のみが表示されます。
- ts3 では：すべての 3 列が表示され、最初の行の価格は NULL です。

#### シナリオ 2: 現在のスキーマとの履歴的な違い {#scenario-2}

現在の瞬間でのタイムトラベルクエリは、現在のテーブルとは異なるスキーマを示す場合があります：

```sql
-- テーブルを作成
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- 初期データをテーブルに挿入
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- 新しいカラムを追加するためにテーブルを変更
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

これは、`ALTER TABLE` が新しいスナップショットを作成せず、現在のテーブルに対して Spark が最新のメタデータファイルから `schema_id` の値を取得するために発生します。

#### シナリオ 3: 履歴的な状態と現在のスキーマの違い {#scenario-3}

タイムトラベル中に、テーブルにデータが書き込まれる前の状態を取得することはできません：

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
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- 終了: エラーが発生しました: ts より古いスナップショットが見つかりません。
```

ClickHouse における動作は Spark と一貫しています。Spark の Select クエリを ClickHouse の Select クエリに置き換えると、同じように機能します。

## メタデータファイルの解決 {#metadata-file-resolution}

ClickHouse で `iceberg` テーブル関数を使用する際、システムは Iceberg テーブルの構造を説明する正しい metadata.json ファイルを特定する必要があります。この解決プロセスは次のように機能します。

### 候補の検索 (優先順) {#candidate-search}

1. **直接パスの指定**:
   * `iceberg_metadata_file_path` を設定すると、システムはこれを Iceberg テーブルのディレクトリパスと組み合わせてこの正確なパスを使用します。
   * この設定が提供されると、他の解決設定はすべて無視されます。

2. **テーブル UUID の一致**:
   * `iceberg_metadata_table_uuid` が指定されると、システムは以下を行います：
     * `metadata` ディレクトリ内の `.metadata.json` ファイルのみを検討します
     * 指定された UUID と一致する `table-uuid` フィールドを含むファイルをフィルタリングします（大文字と小文字を区別しません）

3. **デフォルト検索**:
   * 上記の設定がいずれも提供されない場合は、`metadata` ディレクトリ内のすべての `.metadata.json` ファイルが候補となります。

### 最新ファイルの選択 {#most-recent-file}

上記のルールを使用して候補ファイルを特定した後、システムはどのファイルが最新かを判断します：

* `iceberg_recent_metadata_file_by_last_updated_ms_field` が有効になっている場合：
  * `last-updated-ms` 値が最も大きいファイルが選択されます

* そうでない場合：
  * バージョン番号が最も高いファイルが選択されます
  * （バージョンは `V` として表示され、ファイル名は `V.metadata.json` または `V-uuid.metadata.json` の形式になります）

**注意**: すべての設定はテーブル関数の設定であり（グローバルまたはクエリレベルの設定ではありません）、以下のように指定する必要があります：

```sql 
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**: Iceberg カタログが通常メタデータ解決を処理しますが、ClickHouse の `iceberg` テーブル関数は S3 に保存されたファイルを直接 Iceberg テーブルとして解釈しますので、これらの解決ルールを理解することが重要です。

## メタデータキャッシュ {#metadata-cache}

`Iceberg` テーブルエンジンとテーブル関数は、マニフェストファイル、マニフェストリスト、およびメタデータ JSON の情報を保存するメタデータキャッシュをサポートしています。このキャッシュはメモリ内に保存されます。この機能は `use_iceberg_metadata_files_cache` を設定することで制御され、デフォルトで有効になっています。

## エイリアス {#aliases}

テーブル関数 `iceberg` は現在 `icebergS3` のエイリアスです。

## 関連項目 {#see-also}

- [Icebergエンジン](/engines/table-engines/integrations/iceberg.md)
- [Icebergクラスター テーブル関数](/sql-reference/table-functions/icebergCluster.md)
