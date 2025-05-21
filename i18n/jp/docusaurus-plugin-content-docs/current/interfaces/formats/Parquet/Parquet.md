---
alias: []
description: 'Parquetフォーマットに関するドキュメント'
input_format: true
keywords: ['Parquet']
output_format: true
slug: /interfaces/formats/Parquet
title: 'Parquet'
---

| 入力 | 出力 | エイリアス |
|------|------|------------|
| ✔    | ✔    |            |

## 説明 {#description}

[Apache Parquet](https://parquet.apache.org/) は、Hadoopエコシステムで広く使用されている列指向ストレージフォーマットです。 ClickHouseは、このフォーマットの読み取りおよび書き込み操作をサポートしています。

## データ型の一致 {#data-types-matching-parquet}

以下の表は、サポートされているデータ型と、ClickHouseの[データ型](/sql-reference/data-types/index.md)との一致を示しています。これは `INSERT` および `SELECT` クエリで使用されます。

| Parquetデータ型（`INSERT`）                  | ClickHouseデータ型                                                                                           | Parquetデータ型（`SELECT`）  |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------------------|
| `BOOL`                                        | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                        |
| `UINT8`, `BOOL`                               | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                       |
| `INT8`                                        | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                        |
| `UINT16`                                      | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                      |
| `INT16`                                       | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                       |
| `UINT32`                                      | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                      |
| `INT32`                                       | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                       |
| `UINT64`                                      | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                      |
| `INT64`                                       | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                       |
| `FLOAT`                                       | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT`                       |
| `DOUBLE`                                      | [Float64](/sql-reference/data-types/float.md)                                                      | `DOUBLE`                      |
| `DATE`                                        | [Date32](/sql-reference/data-types/date.md)                                                        | `DATE`                        |
| `TIME (ms)`                                   | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                  | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                   |
| `STRING`, `BINARY`                            | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                     | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                     |
| `LIST`                                        | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                        |
| `STRUCT`                                      | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                      |
| `MAP`                                         | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                         |
| `UINT32`                                      | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_LENGTH_BYTE_ARRAY`     |

配列はネスト可能であり、引数として `Nullable` 型の値を持つことができます。 `Tuple` および `Map` 型もネスト可能です。

サポートされていないParquetデータ型は以下の通りです： 
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`

ClickHouseのテーブルカラムのデータ型は、挿入されたParquetデータの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouseは上記の表に従ってデータ型を解釈し、次にそのデータ型をClickHouseのテーブルカラムに設定されたデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。

## 使用例 {#example-usage}

### データの挿入と選択 {#inserting-and-selecting-data-parquet}

次のコマンドを使用して、ファイルからClickHouseテーブルにParquetデータを挿入できます。

```bash
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT Parquet"
```

次のコマンドを使用して、ClickHouseテーブルからデータを選択し、Parquetフォーマットでいくつかのファイルに保存できます。

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Parquet" > {some_file.pq}
```

Hadoopとのデータ交換には、[`HDFSテーブルエンジン`](/engines/table-engines/integrations/hdfs.md)を使用できます。

## フォーマット設定 {#format-settings}

| 設定                                                                          | 説明                                                                                                                                                                                                                       | デフォルト     |
|-------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `input_format_parquet_case_insensitive_column_matching`                        | ParquetのカラムとCHのカラムを一致させる際に、大文字と小文字を無視します。                                                                                                                                               | `0`            |
| `input_format_parquet_preserve_order`                                          | Parquetファイルから読み取る際に行を再配置しないようにします。通常、これにより非常に遅くなります。                                                                                                                     | `0`            |
| `input_format_parquet_filter_push_down`                                        | Parquetファイルを読み取る際に、WHERE/PREWHERE式およびParquetメタデータの最小/最大統計に基づいて、全行グループをスキップします。                                                                                  | `1`            |
| `input_format_parquet_bloom_filter_push_down`                                  | Parquetファイルを読み取る際に、WHERE式とParquetメタデータのブloomフィルターに基づいて、全行グループをスキップします。                                                                                              | `0`            |
| `input_format_parquet_use_native_reader`                                       | Parquetファイルを読み取る際に、Arrowリーダーではなくネイティブリーダーを使用します。                                                                                                                                  | `0`            |
| `input_format_parquet_allow_missing_columns`                                   | Parquet入力フォーマットを読み取る際に、欠落しているカラムを許可します。                                                                                                                                             | `1`            |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Parquet入力フォーマットで読み取りを行う際に、無視して読み込むのではなく、シークを行うために必要な最小バイト数です。                                                                                                  | `8192`         |
| `input_format_parquet_enable_row_group_prefetch`                               | Parquet解析中に行グループのプリフェッチを有効にします。現在、単一スレッドの解析のみがプリフェッチできます。                                                                                                          | `1`            |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | スキーマ推論の際に、サポートされていない型を持つカラムをスキップします。                                                                                                                                              | `0`            |
| `input_format_parquet_max_block_size`                                          | Parquetリーダーの最大ブロックサイズです。                                                                                                                                                                               | `65409`        |
| `input_format_parquet_prefer_block_bytes`                                      | Parquetリーダーによって出力される平均ブロックバイト数です。                                                                                                                                                          | `16744704`     |
| `output_format_parquet_row_group_size`                                         | 行のターゲット行グループサイズです。                                                                                                                                                                                 | `1000000`      |
| `output_format_parquet_row_group_size_bytes`                                   | 圧縮前のバイト数でターゲットの行グループサイズです。                                                                                                                                                                 | `536870912`    |
| `output_format_parquet_string_as_string`                                       | StringカラムのためにBinaryではなくParquet String型を使用します。                                                                                                                                                        | `1`            |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | FixedStringカラムのためにBinaryではなくParquet FIXED_LENGTH_BYTE_ARRAY型を使用します。                                                                                                                                  | `1`            |
| `output_format_parquet_version`                                                | 出力フォーマットのParquetフォーマットバージョンです。サポートされるバージョン：1.0、2.4、2.6、および2.latest（デフォルト）                                                                                         | `2.latest`     |
| `output_format_parquet_compression_method`                                     | Parquet出力フォーマットの圧縮方法です。サポートされるコーデック：snappy、lz4、brotli、zstd、gzip、none（圧縮なし）                                                                                                | `zstd`         |
| `output_format_parquet_compliant_nested_types`                                 | Parquetファイルのスキーマ内で、リスト要素に対して 'item' の代わりに 'element' を使用します。これはArrowライブラリの実装の歴史的な遺物です。一般的に互換性を高めますが、古いバージョンのArrowには例外があります。                 | `1`            | 
| `output_format_parquet_use_custom_encoder`                                     | より高速なParquetエンコーダー実装を使用します。                                                                                                                                                                          | `1`            |
| `output_format_parquet_parallel_encoding`                                      | 複数のスレッドでParquetエンコーディングを行います。 `output_format_parquet_use_custom_encoder`が必要です。                                                                                                            | `1`            |
| `output_format_parquet_data_page_size`                                         | 圧縮前のページサイズのターゲットバイト数です。                                                                                                                                                               | `1048576`      |
| `output_format_parquet_batch_size`                                             | この行数ごとにページサイズをチェックします。平均値のサイズが数KBを超えるカラムを持つ場合は、減少させることを検討してください。                                                                                          | `1024`        |
| `output_format_parquet_write_page_index`                                       | Parquetファイルにページインデックスを書き込む可能性を追加します。                                                                                                                                                      | `1`            |
| `input_format_parquet_import_nested`                                           | 廃止された設定で、何もしません。                                                                                                                                                                                               | `0`            |

