---
'alias': []
'description': 'ParquetフォーマットのDocumentation'
'input_format': true
'keywords':
- 'Parquet'
'output_format': true
'slug': '/interfaces/formats/Parquet'
'title': 'Parquet'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Parquet](https://parquet.apache.org/) は、Hadoop エコシステムで広く使用されている列指向ストレージ形式です。ClickHouseはこの形式の読み取りおよび書き込み操作をサポートしています。

## データ型のマッチング {#data-types-matching-parquet}

以下の表は、サポートされているデータ型と、`INSERT`および`SELECT`クエリにおける ClickHouse の [データ型](/sql-reference/data-types/index.md) との対応を示しています。

| Parquet データ型（`INSERT`）                      | ClickHouse データ型                                                                                           | Parquet データ型（`SELECT`）  |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------|
| `BOOL`                                           | [Bool](/sql-reference/data-types/boolean.md)                                                              | `BOOL`                        |
| `UINT8`, `BOOL`                                  | [UInt8](/sql-reference/data-types/int-uint.md)                                                            | `UINT8`                       |
| `INT8`                                           | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)         | `INT8`                        |
| `UINT16`                                         | [UInt16](/sql-reference/data-types/int-uint.md)                                                           | `UINT16`                      |
| `INT16`                                          | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)       | `INT16`                       |
| `UINT32`                                         | [UInt32](/sql-reference/data-types/int-uint.md)                                                           | `UINT32`                      |
| `INT32`                                          | [Int32](/sql-reference/data-types/int-uint.md)                                                            | `INT32`                       |
| `UINT64`                                         | [UInt64](/sql-reference/data-types/int-uint.md)                                                           | `UINT64`                      |
| `INT64`                                          | [Int64](/sql-reference/data-types/int-uint.md)                                                            | `INT64`                       |
| `FLOAT`                                          | [Float32](/sql-reference/data-types/float.md)                                                             | `FLOAT`                       |
| `DOUBLE`                                         | [Float64](/sql-reference/data-types/float.md)                                                             | `DOUBLE`                      |
| `DATE`                                           | [Date32](/sql-reference/data-types/date.md)                                                               | `DATE`                        |
| `TIME (ms)`                                      | [DateTime](/sql-reference/data-types/datetime.md)                                                         | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                     | [DateTime64](/sql-reference/data-types/datetime64.md)                                                     | `TIMESTAMP`                   |
| `STRING`, `BINARY`                               | [String](/sql-reference/data-types/string.md)                                                             | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY`    | [FixedString](/sql-reference/data-types/fixedstring.md)                                                   | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                        | [Decimal](/sql-reference/data-types/decimal.md)                                                           | `DECIMAL`                     |
| `LIST`                                           | [Array](/sql-reference/data-types/array.md)                                                               | `LIST`                        |
| `STRUCT`                                         | [Tuple](/sql-reference/data-types/tuple.md)                                                               | `STRUCT`                      |
| `MAP`                                            | [Map](/sql-reference/data-types/map.md)                                                                   | `MAP`                         |
| `UINT32`                                         | [IPv4](/sql-reference/data-types/ipv4.md)                                                                 | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`              | [IPv6](/sql-reference/data-types/ipv6.md)                                                                 | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`              | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                   | `FIXED_LENGTH_BYTE_ARRAY`     |
| `JSON`                                           | [JSON](/sql-reference/data-types/newjson.md)                                                               | `JSON`                        |

配列は入れ子にすることができ、引数として `Nullable` 型の値を持つことができます。`Tuple` および `Map` 型も入れ子にすることができます。

サポートされていない Parquet データ型は次のとおりです:
- `FIXED_SIZE_BINARY`
- `UUID`
- `ENUM`.

ClickHouse テーブルのカラムのデータ型は、挿入された Parquet データの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouse は上記の表に従ってデータ型を解釈し、その後、ClickHouse のテーブルカラムに設定されているデータ型にデータを [キャスト](/sql-reference/functions/type-conversion-functions#cast) します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下のデータを持つ Parquet ファイル、`football.parquet` を使用します:

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.parquet' FORMAT Parquet;
```

### データの読み取り {#reading-data}

`Parquet` 形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet はバイナリ形式であり、端末上で人間が読みやすい形式では表示されません。Parquet ファイルを出力するには `INTO OUTFILE` を使用してください。
:::

Hadoop とのデータ交換には、[`HDFS table engine`](/engines/table-engines/integrations/hdfs.md) を使用できます。

## フォーマット設定 {#format-settings}

| 設定                                                                           | 説明                                                                                                                                                                                                                          | デフォルト     |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                        | Parquet カラムと CH カラムの照合の際に大文字小文字を無視します。                                                                                                                                                                 | `0`         |
| `input_format_parquet_preserve_order`                                          | Parquet ファイルから読み取る際に行の順序を変更しないようにします。通常、これにより速度が大幅に遅くなります。                                                                                                                                       | `0`         |
| `input_format_parquet_filter_push_down`                                        | Parquet ファイルを読み取る際に、WHERE/PREWHERE 式と Parquet メタデータの最小/最大統計に基づいて、全行グループをスキップします。                                                                                                                              | `1`         |
| `input_format_parquet_bloom_filter_push_down`                                  | Parquet ファイルを読み取る際に、WHERE 式と Parquet メタデータのブloomフィルターに基づいて、全行グループをスキップします。                                                                                                                         | `0`         |
| `input_format_parquet_use_native_reader`                                       | Parquet ファイルを読み取る際に、Arrow リーダーの代わりにネイティブリーダーを使用します。                                                                                                                                                               | `0`         |
| `input_format_parquet_allow_missing_columns`                                   | Parquet 入力フォーマットを読み取る際に欠落しているカラムを許可します。                                                                                                                                                          | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Parquet 入力フォーマットで無視して読み取る代わりに、ローカル読み取り（ファイル）をシークするために必要な最小バイト数です。                                                                                                                       | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                               | パーケット解析中に行グループのプリフェッチを有効にします。現在、シングルスレッドの解析のみがプリフェッチできます。                                                                                                                                                    | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | スキーマ推論中にサポートされていない型のカラムをスキップします。                                                                                                                                                             | `0`         |
| `input_format_parquet_max_block_size`                                          | Parquet リーダーの最大ブロックサイズです。                                                                                                                                                                                            | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet リーダーから出力される平均ブロックバイト数です。                                                                                                                                              | `16744704`  |
| `input_format_parquet_enable_json_parsing`                                     | Parquet ファイルを読み取る際に、JSON カラムを ClickHouse の JSON カラムとして解析します。                                                                                                                                  | `1`  |
| `output_format_parquet_row_group_size`                                         | 行のターゲット行グループサイズです。                                                                                                                                                                                              | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                   | 圧縮前のバイト単位でのターゲット行グループサイズです。                                                                                                                                                                                 | `536870912` |
| `output_format_parquet_string_as_string`                                       | 文字列カラムに対して Parquet の String 型を使用します。                                                                                                                                                                      | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | FixedString カラムに対して Parquet の FIXED_LENGTH_BYTE_ARRAY 型を使用します。                                                                                                                                                    | `1`         |
| `output_format_parquet_version`                                                | 出力フォーマット用の Parquet フォーマットバージョンです。サポートされているバージョン: 1.0, 2.4, 2.6, および 2.latest（デフォルト）                                                                                                                  | `2.latest`  |
| `output_format_parquet_compression_method`                                     | Parquet 出力フォーマット用の圧縮方法です。サポートされているコーデック: snappy, lz4, brotli, zstd, gzip, none（非圧縮）                                                                                                            | `zstd`      |
| `output_format_parquet_compliant_nested_types`                                 | パーケットファイルスキーマでは、リスト要素に対して 'item' の代わりに 'element' という名前を使用します。これは Arrow ライブラリ実装の履歴的な遺物です。通常の互換性を高め、古いバージョンの Arrow では問題が発生する場合があります。	| `1`         | 
| `output_format_parquet_use_custom_encoder`                                     | より高速な Parquet エンコーダー実装を使用します。                                                                                                                                                                          | `1`         |
| `output_format_parquet_parallel_encoding`                                      | 複数のスレッドで Parquet エンコーディングを行います。`output_format_parquet_use_custom_encoder` が必要です。                                                                                                                        | `1`         |
| `output_format_parquet_data_page_size`                                         | 圧縮前のターゲットページサイズ（バイト単位）です。                                                                                                                                                                                      | `1048576`   |
| `output_format_parquet_batch_size`                                             | この行数ごとにページサイズを確認します。平均値サイズが数 KB を超えるカラムがある場合は減少を検討してください。                                                                                                                                         | `1024`      |
| `output_format_parquet_write_page_index`                                       | パーケットファイルにページインデックスを書き込む可能性を追加します。                                                                                                                                                        | `1`         |
| `input_format_parquet_import_nested`                                           | 廃止された設定で、何も行いません。                                                                                                                                                                                             | `0`         |
