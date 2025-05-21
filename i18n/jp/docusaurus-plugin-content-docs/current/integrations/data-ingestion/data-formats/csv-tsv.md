---
sidebar_label: 'CSV と TSV'
slug: /integrations/data-formats/csv-tsv
title: 'ClickHouse における CSV と TSV データの操作'
description: 'ClickHouse における CSV と TSV データの操作方法を説明するページ'
---


# ClickHouse における CSV と TSV データの操作

ClickHouse は、CSV からのデータのインポートと CSV へのデータのエクスポートをサポートしています。CSV ファイルは、ヘッダー行、カスタム区切り文字、エスケープ記号など、異なる形式の仕様で提供される可能性があるため、ClickHouse は各ケースに効率的に対処するための形式と設定を提供します。

## CSV ファイルからのデータのインポート {#importing-data-from-a-csv-file}

データをインポートする前に、関連する構造のテーブルを作成しましょう：

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```

[CSV ファイル](assets/data_small.csv) から `sometable` テーブルにデータをインポートするには、ファイルを直接 clickhouse-client にパイプします：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

ここで、[FORMAT CSV](/interfaces/formats.md/#csv) を使用して、ClickHouse に CSV 形式のデータを取り込むことを知らせています。あるいは、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 句を使用してローカルファイルからデータをロードすることもできます：

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、ClickHouse がファイル形式を理解するために `FORMAT CSV` 句を使用しています。また、[url()](/sql-reference/table-functions/url.md) 関数を使用して URL から、または [s3()](/sql-reference/table-functions/s3.md) 関数を使用して S3 ファイルからデータを直接ロードすることもできます。

:::tip
`file()` および `INFILE`/`OUTFILE` に対して明示的な形式設定をスキップできます。その場合、ClickHouse はファイル拡張子に基づいて自動的に形式を検出します。
:::

### ヘッダー付き CSV ファイル {#csv-files-with-headers}

私たちの [CSV ファイルにはヘッダー](assets/data_small_headers.csv) が含まれているとしましょう：

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするには、[CSVWithNames](/interfaces/formats.md/#csvwithnames) 形式を使用できます：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouse はファイルからデータをインポートする際に最初の行をスキップします。

:::tip
23.1 [バージョン](https://github.com/ClickHouse/ClickHouse/releases) 以降、ClickHouse は CSV 型が使用されているときに CSV ファイル内のヘッダーを自動的に検出するため、`CSVWithNames` や `CSVWithNamesAndTypes` を使用する必要はありません。
:::

### カスタム区切り文字を使用する CSV ファイル {#csv-files-with-custom-delimiters}

CSV ファイルがカンマ以外の区切り文字を使用している場合、関連する記号を設定するために [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) オプションを使用できます：

```sql
SET format_csv_delimiter = ';'
```

これで、CSV ファイルからインポートする際に、カンマの代わりに `;` 記号が区切り文字として使用されます。

### CSV ファイル内の行をスキップ {#skipping-lines-in-a-csv-file}

場合によっては、CSV ファイルからデータをインポートする際に特定の行数をスキップすることがあります。これは、[input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) オプションを使用して行うことができます：

```sql
SET input_format_csv_skip_first_lines = 10
```

この場合、最初の 10 行を CSV ファイルからスキップします：

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

[ファイル](assets/data_small.csv) には 1k 行がありますが、最初の 10 行をスキップするようにリクエストしたため、ClickHouse は 990 行しか読み込みません。

:::tip
`file()` 関数を使用する場合、ClickHouse Cloud では、ファイルが存在するマシンで `clickhouse client` のコマンドを実行する必要があります。別のオプションとして、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルファイルを探索できます。
:::


### CSV ファイル内の NULL 値の取り扱い {#treating-null-values-in-csv-files}

NULL 値は、ファイルを生成したアプリケーションによって異なる方法でエンコードされる場合があります。デフォルトでは、ClickHouse は CSV の NULL 値として `\N` を使用します。しかし、[format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) オプションを使用して変更することができます。

次の CSV ファイルがあるとします：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

このファイルからデータをロードすると、ClickHouse は `Nothing` を文字列として扱います（これは正しいです）：

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1──────┬─c2──────┐
│ Donald  │ 90      │
│ Joe     │ Nothing │
│ Nothing │ 70      │
└─────────┴─────────┘
```

ClickHouse に `Nothing` を `NULL` として扱わせたい場合、次のオプションを定義できます：

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待通りの位置に `NULL` が得られます：

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1─────┬─c2───┐
│ Donald │ 90   │
│ Joe    │ ᴺᵁᴸᴸ │
│ ᴺᵁᴸᴸ   │ 70   │
└────────┴──────┘
```


## TSV（タブ区切り）ファイル {#tsv-tab-separated-files}

タブ区切りデータ形式は、データのやり取り形式として広く使用されています。 [TSV ファイル](assets/data_small.tsv) から ClickHouse にデータをロードするには、[TabSeparated](/interfaces/formats.md/#tabseparated) 形式を使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

ヘッダー付きの TSV ファイルを扱うには、[TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames) 形式もあります。また、CSV と同様に、[input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) オプションを使用して最初の X 行をスキップすることができます。


### 生の TSV {#raw-tsv}

時には、TSV ファイルがタブや改行をエスケープせずに保存されることがあります。そのようなファイルを処理するには、[TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw) を使用します。


## CSV へのエクスポート {#exporting-to-csv}

前述のすべての形式は、データをエクスポートするためにも使用できます。テーブル（またはクエリ）から CSV 形式にデータをエクスポートするには、同じ `FORMAT` 句を使用します：

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

CSV ファイルにヘッダーを追加するには、[CSVWithNames](/interfaces/formats.md/#csvwithnames) 形式を使用します：

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNames
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```


### エクスポートしたデータを CSV ファイルに保存する {#saving-exported-data-to-a-csv-file}

エクスポートしたデータをファイルに保存するには、[INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md) 句を使用します：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouse が 3600 万行を CSV ファイルに保存するのに **約 1** 秒かかったことに注意してください。


### カスタム区切り文字で CSV をエクスポートする {#exporting-csv-with-custom-delimiters}

カンマ以外の区切り文字を使用する場合、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定オプションを使用できます：

```sql
SET format_csv_delimiter = '|'
```

これで、ClickHouse は CSV 形式の区切り文字として `|` を使用します：

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy"|"2017-08-01"|241
"Aegithina_tiphia"|"2018-02-01"|34
"1971-72_Utah_Stars_season"|"2016-10-01"|1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8"|"2015-12-01"|73
"2016_Greater_Western_Sydney_Giants_season"|"2017-05-01"|86
```


### Windows 用の CSV をエクスポートする {#exporting-csv-for-windows}

CSV ファイルが Windows 環境で正常に動作するようにするには、[output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) オプションを有効にすることを検討してください。これにより、改行が `\n` の代わりに `\r\n` として使用されます：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSV ファイルのスキーマ推論 {#schema-inference-for-csv-files}

多くの場合、未知の CSV ファイルで作業するため、カラムに使用する型を調べる必要があります。ClickHouse はデフォルトで、与えられた CSV ファイルの分析に基づいてデータ形式を推測しようとします。これを「スキーマ推論」と呼びます。検出されたデータ型は、`DESCRIBE` ステートメントと [file()](/sql-reference/table-functions/file.md) 関数を組み合わせて調べることができます：

```sql
DESCRIBE file('data-small.csv', CSV)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(Date)   │              │                    │         │                  │                │
│ c3   │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ここで、ClickHouse は私たちの CSV ファイルに対してカラム型を効率的に推測しました。ClickHouse に推測をさせたくない場合は、以下のオプションを使用して無効にできます：

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべてのカラム型は `String` として扱われます。

### 明示的なカラム型を使用した CSV のエクスポートとインポート {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse では、[CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes)（および他の *WithNames 形式ファミリー）を使用してデータをエクスポートする際にカラム型を明示的に設定することも可能です：

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNamesAndTypes
```
```response
"path","month","hits"
"String","Date","UInt32"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

この形式では、カラム名のある1行とカラム型のあるもう1行の2つのヘッダー行が含まれます。これにより、ClickHouse（および他のアプリ） は [そのようなファイル](assets/data_csv_types.csv) からデータをロードする際にカラム型を特定することができます：

```sql
DESCRIBE file('data_csv_types.csv', CSVWithNamesAndTypes)
```
```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

これで ClickHouse は推測するのではなく、（2 行目の）ヘッダー行に基づいてカラム型を特定します。

## カスタム区切り文字、セパレーター、およびエスケープルール {#custom-delimiters-separators-and-escaping-rules}

複雑なケースでは、テキストデータが高度にカスタマイズされた形式でフォーマットされていることがありますが、まだ構造を持っています。ClickHouse には、そのような場合のために特別な [CustomSeparated](/interfaces/formats.md/#format-customseparated) 形式があり、カスタムエスケープルール、区切り文字、行の区切り文字、開始/終了シンボルを設定することができます。

次のデータがファイルにあるとします：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

ここで、それぞれの行は `row()` で囲まれ、行は `,` で区切られ、個々の値は `;` で区切られています。この場合、次の設定を使用してこのファイルからデータを読み込むことができます：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、カスタム形式の [ファイル](assets/data_small_custom.txt) からデータをロードできます：

```sql
SELECT *
FROM file('data_small_custom.txt', CustomSeparated)
LIMIT 3
```
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

ヘッダーを正しくエクスポートおよびインポートするためには、[CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames) を使用することもできます。さらに複雑なケースには、[regex とテンプレート](templates-regex.md) 形式を調べてみてください。


## 大きな CSV ファイルを扱う {#working-with-large-csv-files}

CSV ファイルは大きくなりがちで、ClickHouse はあらゆるサイズのファイルで効率的に動作します。大きなファイルは通常圧縮されており、ClickHouse は処理の前に解凍する必要はありません。挿入中に `COMPRESSION` 句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION` 句が省略された場合、ClickHouse はファイルの拡張子に基づいて圧縮を推測しようとします。同様のアプローチを使用して、圧縮形式に直接エクスポートすることもできます：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより、圧縮された `data_csv.csv.gz` ファイルが作成されます。

## その他の形式 {#other-formats}

ClickHouse はさまざまなシナリオやプラットフォームをカバーするために、多くの形式、テキスト形式やバイナリ形式をサポートします。以下の記事で、さらに多くの形式やその扱い方を探ります：

- **CSV と TSV 形式**
- [Parquet](parquet.md)
- [JSON 形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL 形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も確認してください。これにより、ClickHouse サーバーなしでローカルまたはリモートファイルを扱うための完全機能を備えたツールを利用できます。
