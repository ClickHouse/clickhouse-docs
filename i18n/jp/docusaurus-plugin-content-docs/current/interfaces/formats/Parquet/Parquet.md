---
alias: []
description: 'Parquetフォーマットのドキュメント'
input_format: true
keywords:
- 'Parquet'
output_format: true
slug: '/interfaces/formats/Parquet'
title: 'Parquet'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Parquet](https://parquet.apache.org/) は、Hadoop エコシステムで広く使用されている列指向ストレージ形式です。ClickHouse は、この形式の読み取りおよび書き込み操作をサポートしています。

## データ型の一致 {#data-types-matching-parquet}

以下の表は、サポートされているデータ型と、それらが ClickHouse の [データ型](/sql-reference/data-types/index.md) にどのように一致するかを示しています。

| Parquet データ型 (`INSERT`)                    | ClickHouse データ型                                                                                     | Parquet データ型 (`SELECT`)  |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------|
| `BOOL`                                        | [Bool](/sql-reference/data-types/boolean.md)                                                          | `BOOL`                        |
| `UINT8`, `BOOL`                               | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                       |
| `INT8`                                        | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)             | `INT8`                        |
| `UINT16`                                      | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                      |
| `INT16`                                       | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)           | `INT16`                       |
| `UINT32`                                      | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                      |
| `INT32`                                       | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                       |
| `UINT64`                                      | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                      |
| `INT64`                                       | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                       |
| `FLOAT`                                       | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT`                       |
| `DOUBLE`                                      | [Float64](/sql-reference/data-types/float.md)                                                      | `DOUBLE`                      |
| `DATE`                                        | [Date32](/sql-reference/data-types/date.md)                                                         | `DATE`                        |
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

配列は入れ子にでき、引数として `Nullable` 型の値を持つことができます。`Tuple` および `Map` 型も入れ子にできます。

サポートされていない Parquet データ型は次のとおりです：
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`。

ClickHouse テーブルカラムのデータ型は、挿入される Parquet データの対応するフィールドとは異なる場合があります。データを挿入する際、ClickHouse は上の表に従ってデータ型を解釈し、その後 [キャスト](/sql-reference/functions/type-conversion-functions#cast) を行って、ClickHouse テーブルカラムに設定されたデータ型にデータを変換します。

## 使用例 {#example-usage}

### データの挿入と選択 {#inserting-and-selecting-data-parquet}

次のコマンドを使用して、ファイルから ClickHouse テーブルに Parquet データを挿入できます：

```bash
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT Parquet"
```

次のコマンドを使用して、ClickHouse テーブルからデータを選択し、Parquet 形式のファイルに保存できます：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Parquet" > {some_file.pq}
```

Hadoop とデータを交換するには、[`HDFS テーブルエンジン`](/engines/table-engines/integrations/hdfs.md) を使用できます。

## フォーマット設定 {#format-settings}

| 設定                                                                          | 説明                                                                                                                                                                                                  | デフォルト     |
|----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                      | Parquet カラムと CH カラムを照合する際に、大文字小文字を無視します。                                                                                                                                   | `0`         |
| `input_format_parquet_preserve_order`                                        | Parquet ファイルから読み取る際に、行の順序を変更しないようにします。通常、これにより遅くなります。                                                                                                       | `0`         |
| `input_format_parquet_filter_push_down`                                      | Parquet ファイルを読み取る際に、WHERE/PREWHERE 式および Parquet メタデータの最小/最大統計情報に基づいて全行グループをスキップします。                                                                       | `1`         |
| `input_format_parquet_bloom_filter_push_down`                                | Parquet ファイルを読み取る際に、WHERE 式および Parquet メタデータのブルームフィルタに基づいて全行グループをスキップします。                                                                          | `0`         |
| `input_format_parquet_use_native_reader`                                     | Parquet ファイルを読み取る際に、Arrow リーダーの代わりにネイティブリーダーを使用します。                                                                                                           | `0`         |
| `input_format_parquet_allow_missing_columns`                                 | Parquet 入力形式読み取り時に、欠落しているカラムを許可します。                                                                                                                                   | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                         | Local read (file) においてファイルをシークするために必要な最小バイト数です。これにより、Parquet 入力形式で読み取りと無視を行うことができます。                                                        | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                             | Parquet パース時に行グループのプリフェッチを有効にします。現在、単一スレッドのパースのみがプリフェッチを行うことができます。                                                                           | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | スキーマ推論時に、サポートされていない型のカラムをスキップします。                                                                                                                                 | `0`         |
| `input_format_parquet_max_block_size`                                        | Parquet リーダーの最大ブロックサイズです。                                                                                                                                                              | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                    | Parquet リーダーによって出力される平均ブロックバイト数です。                                                                                                                                               | `16744704`  |
| `output_format_parquet_row_group_size`                                       | 行のターゲット Row Group サイズです。                                                                                                                                                                   | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                 | 圧縮前のバイトでのターゲット Row Group サイズです。                                                                                                                                                       | `536870912` |
| `output_format_parquet_string_as_string`                                     | 文字列カラムのために Parquet String 型を使用します。                                                                                                                                                         | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                     | 固定文字列カラムのために Parquet FIXED_LENGTH_BYTE_ARRAY 型を使用します。                                                                                                                                 | `1`         |
| `output_format_parquet_version`                                              | 出力フォーマット用の Parquet フォーマットバージョンです。サポートされているバージョン：1.0、2.4、2.6、および2.latest (デフォルト)。                                                                                     | `2.latest`  |
| `output_format_parquet_compression_method`                                   | Parquet 出力フォーマットの圧縮方法です。サポートされているコーデック：snappy、lz4、brotli、zstd、gzip、none (非圧縮)。                                                                                     | `zstd`      |
| `output_format_parquet_compliant_nested_types`                               | Parquet ファイルスキーマで、リスト要素の名称に 'element' を使用します。これは Arrow ライブラリの実装の履歴的な遺物です。一般的には互換性が向上しますが、古いバージョンの Arrow の一部では例外があります。                                   | `1`         |
| `output_format_parquet_use_custom_encoder`                                   | より高速な Parquet エンコーダー実装を使用します。                                                                                                                                                          | `1`         |
| `output_format_parquet_parallel_encoding`                                    | 複数スレッドで Parquet エンコーディングを行います。`output_format_parquet_use_custom_encoder` が必要です。                                                                                                         | `1`         |
| `output_format_parquet_data_page_size`                                       | 圧縮前のバイト単位のターゲットページサイズです。                                                                                                                                                              | `1048576`   |
| `output_format_parquet_batch_size`                                           | この行数ごとにページサイズを確認します。平均値のサイズが数KBを超えるカラムがある場合は減少を検討してください。                                                                                                    | `1024`      |
| `output_format_parquet_write_page_index`                                     | Parquet ファイルにページインデックスを書く機能を追加します。                                                                                                                                               | `1`         |
| `input_format_parquet_import_nested`                                         | 廃止された設定で、何もしません。                                                                                                                                                                            | `0`         |
