---
alias: []
description: 'Parquet 形式に関するドキュメント'
input_format: true
keywords: ['Parquet']
output_format: true
slug: /interfaces/formats/Parquet
title: 'Parquet'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \\{#description\\}

[Apache Parquet](https://parquet.apache.org/) は、Hadoop エコシステムで広く利用されている列指向ストレージ形式です。ClickHouse は、この形式の読み書きをサポートしています。

## データ型の対応 \\{#data-types-matching-parquet\\}

以下の表は、Parquet のデータ型が ClickHouse の[データ型](/sql-reference/data-types/index.md)にどのように対応するかを示します。

| Parquet type (logical, converted, or physical) | ClickHouse data type |
|------------------------------------------------|----------------------|
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean.md) |
| `UINT_8` | [UInt8](/sql-reference/data-types/int-uint.md) |
| `INT_8` | [Int8](/sql-reference/data-types/int-uint.md) |
| `UINT_16` | [UInt16](/sql-reference/data-types/int-uint.md) |
| `INT_16` | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) |
| `UINT_32` | [UInt32](/sql-reference/data-types/int-uint.md) |
| `INT_32` | [Int32](/sql-reference/data-types/int-uint.md) |
| `UINT_64` | [UInt64](/sql-reference/data-types/int-uint.md) |
| `INT_64` | [Int64](/sql-reference/data-types/int-uint.md) |
| `DATE` | [Date32](/sql-reference/data-types/date.md) |
| `TIMESTAMP`, `TIME` | [DateTime64](/sql-reference/data-types/datetime64.md) |
| `FLOAT` | [Float32](/sql-reference/data-types/float.md) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float.md) |
| `INT96` | [DateTime64(9, 'UTC')](/sql-reference/data-types/datetime64.md) |
| `BYTE_ARRAY`, `UTF8`, `ENUM`, `BSON` | [String](/sql-reference/data-types/string.md) |
| `JSON` | [JSON](/sql-reference/data-types/newjson.md) |
| `FIXED_LEN_BYTE_ARRAY` | [FixedString](/sql-reference/data-types/fixedstring.md) |
| `DECIMAL` | [Decimal](/sql-reference/data-types/decimal.md) |
| `LIST` | [Array](/sql-reference/data-types/array.md) |
| `MAP` | [Map](/sql-reference/data-types/map.md) |
| struct | [Tuple](/sql-reference/data-types/tuple.md) |
| `FLOAT16` | [Float32](/sql-reference/data-types/float.md) |
| `UUID` | [FixedString(16)](/sql-reference/data-types/fixedstring.md) |
| `INTERVAL` | [FixedString(12)](/sql-reference/data-types/fixedstring.md) |

Parquet ファイルを書き出す際、対応する Parquet 型が存在しないデータ型は、利用可能な最も近い型に変換されます。

| ClickHouse data type | Parquet type |
|----------------------|--------------|
| [IPv4](/sql-reference/data-types/ipv4.md) | `UINT_32` |
| [IPv6](/sql-reference/data-types/ipv6.md) | `FIXED_LEN_BYTE_ARRAY` (16 bytes) |
| [Date](/sql-reference/data-types/date.md) (16 bits) | `DATE` (32 bits) |
| [DateTime](/sql-reference/data-types/datetime.md) (32 bits, seconds) | `TIMESTAMP` (64 bits, milliseconds) |
| [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md) | `FIXED_LEN_BYTE_ARRAY` (16/32 bytes, little-endian) |

`Array` は入れ子にでき、引数として `Nullable` 型の値を持つことができます。`Tuple` 型および `Map` 型も入れ子にできます。

ClickHouse テーブルのカラムのデータ型は、挿入される Parquet データ内の対応するフィールドの型と異なる場合があります。データ挿入時、ClickHouse は上記の表に従ってデータ型を解釈し、その後 ClickHouse テーブルのカラムに設定されているデータ型へ[キャスト](/sql-reference/functions/type-conversion-functions#CAST)します。たとえば、`UINT_32` の Parquet カラムは [IPv4](/sql-reference/data-types/ipv4.md) 型の ClickHouse カラムとして読み取ることができます。

一部の Parquet 型には、近い ClickHouse 型が存在しません。これらは次のように読み取ります。

* `TIME`（時刻）は `timestamp` として読み取られます。例: `10:23:13.000` は `1970-01-01 10:23:13.000` になります。
* `isAdjustedToUTC=false` の `TIMESTAMP`/`TIME` はローカルのウォールクロック時刻（どのタイムゾーンをローカルとみなすかにかかわらず、ローカルタイムゾーンにおける年・月・日・時・分・秒およびサブ秒フィールド）であり、SQL の `TIMESTAMP WITHOUT TIME ZONE` と同じです。ClickHouse はこれを、あたかも UTC の `timestamp` であるかのように読み取ります。例: `2025-09-29 18:42:13.000`（ローカルの時計の読み値を表す）は `2025-09-29 18:42:13.000`（ある時点を表す `DateTime64(3, 'UTC')`）になります。String に変換すると、年・月・日・時・分・秒およびサブ秒は正しい値として表示され、それを UTC ではなく何らかのローカルタイムゾーンの時刻として解釈できます。直感に反して、型を `DateTime64(3, 'UTC')` から `DateTime64(3)` に変更しても状況は改善しません。どちらの型も時計の読み値ではなくある時点を表すためですが、`DateTime64(3)` はローカルタイムゾーンを用いて誤ってフォーマットされてしまいます。
* `INTERVAL` は現在、Parquet ファイル内でエンコードされているとおりの時間間隔の生のバイナリ表現を持つ `FixedString(12)` として読み取られます。

## 使用例 \\{#example-usage\\}

### データの挿入 \{#inserting-data\}

次のデータを含む `football.parquet` という名前の Parquet ファイルを使用します：

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

データを挿入します：

```sql
INSERT INTO football FROM INFILE 'football.parquet' FORMAT Parquet;
```


### データの読み込み \{#reading-data\}

`Parquet` 形式でデータを読み込みます。

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet はバイナリ形式であり、ターミナル上では人間が読める形で表示されません。Parquet ファイルを出力するには `INTO OUTFILE` を使用します。
:::

Hadoop とデータを交換するには、[`HDFS table engine`](/engines/table-engines/integrations/hdfs.md) を使用できます。


## フォーマット設定 \\{#format-settings\\}

| 設定                                                                             | 概要                                                                                                                                                                     | デフォルト                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_format_parquet_case_insensitive_column_matching`                        | Parquet の列と CH の列を照合する際に大文字と小文字を区別しません。                                                                                                                                | `0`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_preserve_order`                                          | Parquet ファイルを読み込む際に行の順序を変更しないようにします。通常、処理が大幅に遅くなります。                                                                                                                   | `0`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_filter_push_down`                                        | Parquet ファイルを読み込む際、WHERE/PREWHERE 句と Parquet メタデータ内の最小値/最大値の統計量に基づいて、行グループ全体をスキップします。                                                                                  | `1`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_bloom_filter_push_down`                                  | Parquet ファイルを読み込む際、WHERE 句と Parquet メタデータ内のブルームフィルターに基づいて行グループ全体をスキップします。                                                                                              | `0`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_allow_missing_columns`                                   | Parquet 入力フォーマットを読み込む際に、存在しないカラムを許可する                                                                                                                                  | `1`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Parquet 入力フォーマットで、データを無視しつつ順次読み込むのではなくシークを行うために必要なローカルファイル読み取りの最小バイト数                                                                                                  | `8192`                                                                                                                                                                                                                                                                                                                        |
| `input_format_parquet_enable_row_group_prefetch`                               | Parquet の解析時に行グループのプリフェッチを有効にします。現在は単一スレッドでの解析時にのみプリフェッチが行えます。                                                                                                         | `1`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | Parquet 形式のスキーマ推論時に、サポートされていない型を持つ列をスキップします。                                                                                                                           | `0`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_max_block_size`                                          | Parquet リーダーの最大ブロックサイズ                                                                                                                                                 | `65409`                                                                                                                                                                                                                                                                                                                       |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet リーダーから出力されるブロックの平均サイズ（バイト単位）                                                                                                                                   | `16744704`                                                                                                                                                                                                                                                                                                                    |
| `input_format_parquet_enable_json_parsing`                                     | Parquet ファイルを読み込む際は、JSON 列を ClickHouse の JSON カラムとしてパースします。                                                                                                            | `1`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_row_group_size`                                         | 行グループの目標サイズ（行数単位）。                                                                                                                                                     | `1000000`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_row_group_size_bytes`                                   | 圧縮前のターゲット行グループのサイズ（バイト単位）。                                                                                                                                             | `536870912`                                                                                                                                                                                                                                                                                                                   |
| `output_format_parquet_string_as_string`                                       | String 列には Binary 型ではなく、Parquet の String 型を使用してください。                                                                                                                   | `1`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | FixedString 列には Binary ではなく Parquet の FIXED&#95;LEN&#95;BYTE&#95;ARRAY 型を使用してください。                                                                                     | `1`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_version`                                                | 出力フォーマットで使用する Parquet フォーマットのバージョンです。サポートされているバージョンは 1.0、2.4、2.6、および 2.latest（デフォルト）です。                                                                                | `2.latest`                                                                                                                                                                                                                                                                                                                    |
| `output_format_parquet_compression_method`                                     | Parquet 出力フォーマットの圧縮方式。サポートされるコーデック：snappy、lz4、brotli、zstd、gzip、none（非圧縮）                                                                                               | `zstd`                                                                                                                                                                                                                                                                                                                        |
| `output_format_parquet_compliant_nested_types`                                 | Parquet ファイルのスキーマでは、リスト要素には &#39;item&#39; ではなく &#39;element&#39; という名前を使用します。これは Arrow ライブラリの実装に起因する歴史的な経緯によるものです。一般的には互換性が向上しますが、一部の古いバージョンの Arrow とは互換性がない可能性があります。 | `1`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_use_custom_encoder`                                     | より高速な Parquet エンコーダー実装を使用します。                                                                                                                                          | `1`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_parallel_encoding`                                      | 複数スレッドで Parquet エンコードを行う。output&#95;format&#95;parquet&#95;use&#95;custom&#95;encoder を有効にする必要がある。                                                                     | `1`                                                                                                                                                                                                                                                                                                                           |
| `output_format_parquet_data_page_size`                                         | 圧縮前のページの目標サイズ（バイト単位）。                                                                                                                                                  | `1048576`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_batch_size`                                             | 指定した行数ごとにページサイズをチェックします。カラム内の値の平均サイズが数 KB を超える場合は、この値を小さくすることを検討してください。                                                                                                | `1024`                                                                                                                                                                                                                                                                                                                        |
| `output_format_parquet_write_page_index`                                       | Parquet ファイルにページインデックスを書き込めるようにします。                                                                                                                                    | `1`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_import_nested`                                           | この設定は廃止されており、指定しても何の効果もありません。                                                                                                                                          | `0`                                                                                                                                                                                                                                                                                                                           |
| `input_format_parquet_local_time_as_utc`                                       | true                                                                                                                                                                   | isAdjustedToUTC=false の Parquet タイムスタンプに対して、スキーマ推論時に使用されるデータ型を決定します。true の場合は DateTime64(..., &#39;UTC&#39;)、false の場合は DateTime64(...) になります。ClickHouse にはローカルの壁時計時刻を表すデータ型がないため、どちらの動作も完全には正しくありません。直感に反して、&#39;true&#39; の方がまだ誤りが少ない選択肢と考えられます。これは、&#39;UTC&#39; タイムスタンプを String 型としてフォーマットすると、正しいローカル時刻を表す文字列表現が得られるためです。 |