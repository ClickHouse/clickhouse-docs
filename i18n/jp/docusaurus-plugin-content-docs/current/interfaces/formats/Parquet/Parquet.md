---
alias: []
description: 'Parquet 形式のドキュメント'
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



## 説明 {#description}

[Apache Parquet](https://parquet.apache.org/)は、Hadoopエコシステムで広く普及しているカラム型ストレージフォーマットです。ClickHouseは、このフォーマットの読み取りおよび書き込み操作をサポートしています。


## データ型のマッピング {#data-types-matching-parquet}

以下の表は、Parquetデータ型とClickHouseの[データ型](/sql-reference/data-types/index.md)の対応関係を示しています。

| Parquet型(論理型、変換型、または物理型) | ClickHouseデータ型                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `BOOLEAN`                                      | [Bool](/sql-reference/data-types/boolean.md)                                               |
| `UINT_8`                                       | [UInt8](/sql-reference/data-types/int-uint.md)                                             |
| `INT_8`                                        | [Int8](/sql-reference/data-types/int-uint.md)                                              |
| `UINT_16`                                      | [UInt16](/sql-reference/data-types/int-uint.md)                                            |
| `INT_16`                                       | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) |
| `UINT_32`                                      | [UInt32](/sql-reference/data-types/int-uint.md)                                            |
| `INT_32`                                       | [Int32](/sql-reference/data-types/int-uint.md)                                             |
| `UINT_64`                                      | [UInt64](/sql-reference/data-types/int-uint.md)                                            |
| `INT_64`                                       | [Int64](/sql-reference/data-types/int-uint.md)                                             |
| `DATE`                                         | [Date32](/sql-reference/data-types/date.md)                                                |
| `TIMESTAMP`, `TIME`                            | [DateTime64](/sql-reference/data-types/datetime64.md)                                      |
| `FLOAT`                                        | [Float32](/sql-reference/data-types/float.md)                                              |
| `DOUBLE`                                       | [Float64](/sql-reference/data-types/float.md)                                              |
| `INT96`                                        | [DateTime64(9, 'UTC')](/sql-reference/data-types/datetime64.md)                            |
| `BYTE_ARRAY`, `UTF8`, `ENUM`, `BSON`           | [String](/sql-reference/data-types/string.md)                                              |
| `JSON`                                         | [JSON](/sql-reference/data-types/newjson.md)                                               |
| `FIXED_LEN_BYTE_ARRAY`                         | [FixedString](/sql-reference/data-types/fixedstring.md)                                    |
| `DECIMAL`                                      | [Decimal](/sql-reference/data-types/decimal.md)                                            |
| `LIST`                                         | [Array](/sql-reference/data-types/array.md)                                                |
| `MAP`                                          | [Map](/sql-reference/data-types/map.md)                                                    |
| struct                                         | [Tuple](/sql-reference/data-types/tuple.md)                                                |
| `FLOAT16`                                      | [Float32](/sql-reference/data-types/float.md)                                              |
| `UUID`                                         | [FixedString(16)](/sql-reference/data-types/fixedstring.md)                                |
| `INTERVAL`                                     | [FixedString(12)](/sql-reference/data-types/fixedstring.md)                                |

Parquetファイルを書き込む際、対応するParquet型が存在しないデータ型は、最も近い利用可能な型に変換されます:

| ClickHouseデータ型                                                   | Parquet型                                        |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| [IPv4](/sql-reference/data-types/ipv4.md)                              | `UINT_32`                                           |
| [IPv6](/sql-reference/data-types/ipv6.md)                              | `FIXED_LEN_BYTE_ARRAY`(16バイト)                   |
| [Date](/sql-reference/data-types/date.md)(16ビット)                    | `DATE`(32ビット)                                    |
| [DateTime](/sql-reference/data-types/datetime.md)(32ビット、秒単位)   | `TIMESTAMP`(64ビット、ミリ秒単位)                 |
| [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md) | `FIXED_LEN_BYTE_ARRAY`(16/32バイト、リトルエンディアン) |

配列はネスト可能であり、引数として`Nullable`型の値を持つことができます。`Tuple`型と`Map`型もネスト可能です。

ClickHouseテーブルのカラムのデータ型は、挿入されるParquetデータの対応するフィールドと異なる場合があります。データ挿入時、ClickHouseは上記の表に従ってデータ型を解釈し、その後ClickHouseテーブルのカラムに設定されているデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。例えば、`UINT_32`のParquetカラムは[IPv4](/sql-reference/data-types/ipv4.md)のClickHouseカラムに読み込むことができます。


一部の Parquet 型には、完全に対応する ClickHouse 型が存在しません。これらは次のように読み取られます。
* `TIME`（一日の時刻）はタイムスタンプとして読み取られます。例: `10:23:13.000` は `1970-01-01 10:23:13.000` になります。
* `TIMESTAMP` / `TIME` で `isAdjustedToUTC=false` のものはローカルの壁時計時刻（あるローカルタイムゾーンにおける年・月・日・時・分・秒・サブ秒フィールドであり、どのタイムゾーンをローカルと見なすかには依存しない）であり、SQL の `TIMESTAMP WITHOUT TIME ZONE` と同じです。ClickHouse はこれを、UTC タイムスタンプであるかのように読み取ります。例: ローカルの壁時計の読みを表す `2025-09-29 18:42:13.000` は、時点を表す `2025-09-29 18:42:13.000`（`DateTime64(3, 'UTC')`）になります。String に変換すると、年・月・日・時・分・秒・サブ秒は正しく表示され、それを UTC ではなく何らかのローカルタイムゾーンでの時刻として解釈できます。直感に反して、型を `DateTime64(3, 'UTC')` から `DateTime64(3)` に変更しても状況は改善しません。どちらの型も時計の読みではなく「時点」を表すためですが、`DateTime64(3)` はローカルタイムゾーンを用いて誤ったフォーマットになってしまいます。
* `INTERVAL` は現在、Parquet ファイルでエンコードされているとおりの時間間隔の生のバイナリ表現を持つ `FixedString(12)` として読み取られます。



## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下のデータを含む`football.parquet`という名前のParquetファイルを使用します:

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

`Parquet`形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquetはバイナリ形式であるため、ターミナル上で人間が読める形式では表示されません。Parquetファイルを出力するには`INTO OUTFILE`を使用してください。
:::

Hadoopとデータを交換する場合は、[`HDFSテーブルエンジン`](/engines/table-engines/integrations/hdfs.md)を使用できます。


## フォーマット設定 {#format-settings}


| 設定                                                                             | 概要                                                                                                                                                                      | デフォルト                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_format_parquet_case_insensitive_column_matching`                        | Parquet の列と CH の列を照合する際、大文字小文字を区別しません。                                                                                                                                  | `0`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_preserve_order`                                          | Parquet ファイルから読み込む際に行の並び替えは行わないでください。通常、処理が大幅に遅くなります。                                                                                                                   | `0`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_filter_push_down`                                        | Parquet ファイルを読み込む際には、WHERE/PREWHERE 式と Parquet メタデータ内の最小値／最大値の統計情報に基づいて、行グループ全体をスキップします。                                                                                | `1`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_bloom_filter_push_down`                                  | Parquet ファイルを読み込む際には、WHERE 句の条件式および Parquet メタデータ内のブルームフィルタに基づいて、行グループ全体をスキップします。                                                                                       | `0`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_use_native_reader`                                       | Parquet ファイルの読み込み時に、Arrow リーダーではなくネイティブリーダーを使用する。                                                                                                                       | `0`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_allow_missing_columns`                                   | Parquet 入力フォーマットの読み取り時に欠落列を許容する                                                                                                                                         | `1`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | Parquet 入力フォーマットで、`read with ignore` による読み取りではなくシークを行うかどうかを判断するための、ローカル読み取り（ファイル）に必要な最小バイト数                                                                             | `8192`                                                                                                                                                                                                                                                                                                                  |
| `input_format_parquet_enable_row_group_prefetch`                               | Parquet のパース中に row group のプリフェッチを有効にします。現在のところ、プリフェッチに対応しているのは単一スレッドでのパースのみです。                                                                                          | `1`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | Parquet 形式のスキーマ推論時に、サポートされていない型の列をスキップする                                                                                                                                | `0`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_max_block_size`                                          | Parquet リーダーが読み込むブロックの最大サイズ。                                                                                                                                            | `65409`                                                                                                                                                                                                                                                                                                                 |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet リーダーによって出力されるブロックの平均バイト数                                                                                                                                        | `16744704`                                                                                                                                                                                                                                                                                                              |
| `input_format_parquet_enable_json_parsing`                                     | Parquet ファイルを読み込む際、JSON 列を ClickHouse の JSON カラムとして解析します。                                                                                                               | `1`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_row_group_size`                                         | ターゲットとなる行グループのサイズ（行数）。                                                                                                                                                  | `1000000`                                                                                                                                                                                                                                                                                                               |
| `output_format_parquet_row_group_size_bytes`                                   | 圧縮前のターゲット行グループのサイズ（バイト単位）。                                                                                                                                              | `536870912`                                                                                                                                                                                                                                                                                                             |
| `output_format_parquet_string_as_string`                                       | String 列には Binary ではなく、Parquet の String 型を使用します。                                                                                                                        | `1`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | FixedString 列には、Binary の代わりに Parquet の FIXED&#95;LEN&#95;BYTE&#95;ARRAY 型を使用してください。                                                                                     | `1`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_version`                                                | 出力フォーマットに使用する Parquet フォーマットのバージョン。サポートされているバージョン: 1.0、2.4、2.6、2.latest（デフォルト）                                                                                          | `2.latest`                                                                                                                                                                                                                                                                                                              |
| `output_format_parquet_compression_method`                                     | Parquet 出力フォーマットで使用する圧縮方式。サポートされているコーデック: snappy、lz4、brotli、zstd、gzip、none（非圧縮）                                                                                         | `zstd`                                                                                                                                                                                                                                                                                                                  |
| `output_format_parquet_compliant_nested_types`                                 | Parquet ファイルスキーマでは、リスト要素の名前として &#39;item&#39; ではなく &#39;element&#39; を使用します。これは Arrow ライブラリ実装に由来する歴史的な経緯によるものです。一般的には互換性が向上しますが、一部の古いバージョンの Arrow では互換性の問題が生じる可能性があります。 | `1`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_use_custom_encoder`                                     | 高速な Parquet エンコーダー実装を使用します。                                                                                                                                             | `1`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_parallel_encoding`                                      | 複数スレッドで Parquet エンコードを実行します。`output_format_parquet_use_custom_encoder` を有効にする必要があります。                                                                                   | `1`                                                                                                                                                                                                                                                                                                                     |
| `output_format_parquet_data_page_size`                                         | 圧縮前の、バイト単位で指定する目標ページサイズ。                                                                                                                                                | `1048576`                                                                                                                                                                                                                                                                                                               |
| `output_format_parquet_batch_size`                                             | ページサイズを、この行数ごとに確認します。値の平均サイズが数 KB を超えるカラムがある場合は、この値を小さくすることを検討してください。                                                                                                   | `1024`                                                                                                                                                                                                                                                                                                                  |
| `output_format_parquet_write_page_index`                                       | Parquet ファイルにページインデックスを書き込む機能を追加。                                                                                                                                       | `1`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_import_nested`                                           | 廃止された設定であり、何の効果もありません。                                                                                                                                                  | `0`                                                                                                                                                                                                                                                                                                                     |
| `input_format_parquet_local_time_as_utc`                                       | true                                                                                                                                                                    | isAdjustedToUTC=false の Parquet タイムスタンプに対するスキーマ推論で使用されるデータ型を決定します。true の場合は DateTime64(..., &#39;UTC&#39;)、false の場合は DateTime64(...) になります。ClickHouse にはローカルのウォールクロック時刻用のデータ型がないため、どちらの挙動も完全には正しくありません。直感に反して、&#39;true&#39; の方がおそらく誤りが少ない選択肢です。これは、&#39;UTC&#39; のタイムスタンプを String としてフォーマットすると、正しいローカル時刻の表現が得られるためです。 |
