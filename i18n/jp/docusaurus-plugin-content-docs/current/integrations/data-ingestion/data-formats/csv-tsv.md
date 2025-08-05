---
sidebar_label: 'CSV and TSV'
slug: '/integrations/data-formats/csv-tsv'
title: 'Working with CSV and TSV data in ClickHouse'
description: 'Page describing how to work with CSV and TSV data in ClickHouse'
---




# ClickHouseにおけるCSVおよびTSVデータの操作

ClickHouseはCSVからのデータのインポートとCSVへのデータのエクスポートをサポートしています。CSVファイルはヘッダ行、カスタム区切り文字、エスケープ記号など、異なるフォーマットの仕様で提供されることがあるため、ClickHouseでは各ケースに効率的に対処するためのフォーマットと設定が用意されています。

## CSVファイルからのデータのインポート {#importing-data-from-a-csv-file}

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

[CSVファイル](assets/data_small.csv)から`sometable`テーブルにデータをインポートするには、ファイルを直接clickhouse-clientにパイプします：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

ここでは、ClickHouseにCSV形式のデータを取り込んでいることを通知するために[FORMAT CSV](/interfaces/formats.md/#csv)を使用しています。あるいは、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使ってローカルファイルからデータをロードすることもできます：

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、ClickHouseがファイル形式を理解できるように`FORMAT CSV`句を使用しています。また、[url()](/sql-reference/table-functions/url.md)関数を使用してURLから直接データをロードしたり、[s3()](/sql-reference/table-functions/s3.md)関数を使用してS3ファイルからデータをロードすることも可能です。

:::tip
`file()`および`INFILE`/`OUTFILE`に対しては明示的なフォーマット設定をスキップできます。
その場合、ClickHouseは自動的にファイル拡張子に基づいてフォーマットを検出します。
:::

### ヘッダ付きのCSVファイル {#csv-files-with-headers}

私たちの[CSVファイルにヘッダがあると仮定しましょう](assets/data_small_headers.csv)：

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするには、[CSVWithNames](/interfaces/formats.md/#csvwithnames)フォーマットを使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouseはファイルからデータをインポートする際に最初の行をスキップします。

:::tip
23.1 [バージョン](https://github.com/ClickHouse/ClickHouse/releases)以降、ClickHouseは`CSV`タイプが使用されているときにCSVファイルのヘッダを自動的に検出するため、`CSVWithNames`や`CSVWithNamesAndTypes`を使用する必要はありません。
:::

### カスタム区切り文字のあるCSVファイル {#csv-files-with-custom-delimiters}

CSVファイルがカンマ以外の区切り文字を使用している場合、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)オプションを使用して関連する記号を設定することができます：

```sql
SET format_csv_delimiter = ';'
```

これで、CSVファイルからインポートする際に、カンマの代わりに`;`記号が区切り文字として使用されるようになります。

### CSVファイル内の行のスキップ {#skipping-lines-in-a-csv-file}

時には、CSVファイルからデータをインポートする際に特定の行数をスキップしたい場合があります。これは、[input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)オプションを使用して行うことができます：

```sql
SET input_format_csv_skip_first_lines = 10
```

この場合、CSVファイルの最初の10行をスキップします：

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

[ファイル](assets/data_small.csv)には1k行がありますが、最初の10行をスキップするように指定したため、ClickHouseは990行のみを読み込みました。

:::tip
`file()`関数を使用する場合、ClickHouse Cloudでは、ファイルが存在するマシンで`clickhouse client`のコマンドを実行する必要があります。別のオプションは、ローカルファイルを探索するために[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用することです。
:::

### CSVファイル内のNULL値の扱い {#treating-null-values-in-csv-files}

NULL値は、ファイルを生成したアプリケーションによって異なる方法でエンコードされることがあります。デフォルトでは、ClickHouseはCSV内のNULL値として`\N`を使用します。しかし、[format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)オプションを使用してこれを変更できます。

以下のCSVファイルを考えてみましょう：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

このファイルからデータをロードすると、ClickHouseは`Nothing`を文字列として扱います（これは正しいです）：

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

ClickHouseに`Nothing`を`NULL`として扱わせたい場合、次のオプションを定義できます：

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待される場所に`NULL`があります：

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

タブ区切りデータフォーマットは、データ交換フォーマットとして広く使用されています。[TSVファイル](assets/data_small.tsv)からClickHouseにデータをロードするには、[TabSeparated](/interfaces/formats.md/#tabseparated)フォーマットが使用されます：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

ヘッダのあるTSVファイルを操作するための[TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames)フォーマットもあります。また、CSVと同様に、[input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)オプションを使用して最初のX行をスキップすることができます。

### 生TSV {#raw-tsv}

時には、TSVファイルがタブや行の改行をエスケープせずに保存されていることがあります。そのようなファイルを扱うには[TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw)を使用します。

## CSVへのエクスポート {#exporting-to-csv}

前の例に示した任意のフォーマットを使ってデータをエクスポートすることもできます。テーブル（またはクエリ）からCSV形式にデータをエクスポートするには、同じ`FORMAT`句を使用します：

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

CSVファイルにヘッダを追加するには、[CSVWithNames](/interfaces/formats.md/#csvwithnames)フォーマットを使用します：

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

### エクスポートしたデータをCSVファイルに保存する {#saving-exported-data-to-a-csv-file}

エクスポートしたデータをファイルに保存するには、[INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用します：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouseが36m行をCSVファイルに保存するのに**約1**秒かかったことに注意してください。

### カスタム区切り文字でのCSVエクスポート {#exporting-csv-with-custom-delimiters}

カンマ以外の区切り文字を使用したい場合は、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)設定オプションを使用します：

```sql
SET format_csv_delimiter = '|'
```

これでClickHouseはCSV形式の区切り文字として`|`を使用します：

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

### Windows向けのCSVエクスポート {#exporting-csv-for-windows}

Windows環境でCSVファイルを正しく動作させるには、[output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)オプションを有効にする必要があります。これにより、行の改行として`\n`の代わりに`\r\n`が使用されます：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSVファイルのスキーマ推測 {#schema-inference-for-csv-files}

不明なCSVファイルを扱う場合が多いため、カラムに使用するタイプを調べる必要があります。ClickHouseはデフォルトで、与えられたCSVファイルの分析に基づいてデータフォーマットを推測しようとします。これを「スキーマ推測」と呼びます。検出されたデータ型は、`DESCRIBE`ステートメントを`[file()](/sql-reference/table-functions/file.md)`関数と組み合わせて調べることができます：

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

ここで、ClickHouseはCSVファイルのカラムタイプを効率的に推測しました。ClickHouseに推測させたくない場合は、次のオプションでこれを無効にできます：

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべてのカラムタイプは`String`として扱われます。

### 明示的なカラムタイプを使用したCSVのエクスポートとインポート {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouseは、データをエクスポートする際にカラムタイプを明示的に設定することも許可しています。[CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes)（および他の*WithNames形式ファミリー）を使用します：

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

このフォーマットには2つのヘッダ行が含まれます。一つはカラム名で、もう一つはカラムタイプです。これにより、ClickHouse（および他のアプリケーション）は[そのようなファイル](assets/data_csv_types.csv)からデータを読み込む際にカラムタイプを識別できます：

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

これでClickHouseは、推測するのではなく第（2）ヘッダ行に基づいてカラムタイプを識別します。

## カスタム区切り文字、セパレーター、およびエスケープルール {#custom-delimiters-separators-and-escaping-rules}

複雑なケースでは、テキストデータが非常にカスタムな方法でフォーマットされている場合でも、構造を持つことがあります。ClickHouseには、そのような場合のために特別な[CustomSeparated](/interfaces/formats.md/#format-customseparated)フォーマットがあり、カスタムエスケープルール、区切り文字、行セパレーター、開始/終了シンボルを設定できます。

以下のデータがファイルにあるとします：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

各行が`row()`でラップされており、行は`,`で区切られ、個々の値は`;`で区切られていることがわかります。この場合、次の設定を使用してこのファイルからデータを読み取ることができます：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、カスタムフォーマットの[ファイル](assets/data_small_custom.txt)からデータをロードできます：

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

[CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames)を使用して、ヘッダを正しくエクスポートおよびインポートすることもできます。さらに複雑なケースには[regexおよびテンプレート](templates-regex.md)フォーマットを探索してください。

## 大きなCSVファイルの操作 {#working-with-large-csv-files}

CSVファイルは大きくなることがあり、ClickHouseは任意のサイズのファイルで効率的に動作します。大きなファイルは通常圧縮されて提供され、ClickHouseは処理前に圧縮を解く必要がありません。挿入時に`COMPRESSION`句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION`句を省略した場合、ClickHouseは拡張子に基づいてファイルの圧縮を推測しようとします。同様のアプローチを使用して、直接圧縮されたフォーマットでファイルをエクスポートすることができます：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより、圧縮された`data_csv.csv.gz`ファイルが作成されます。

## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために多くのフォーマット（テキストとバイナリの両方）をサポートしています。以下の記事でさらに多くのフォーマットやそれらとの作業方法を探ってみてください：

- **CSVおよびTSVフォーマット**
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regexおよびテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を確認してください。Clickhouseサーバーを必要とせずに、ローカル/リモートファイルで作業するためのポータブルでフル機能のツールです。
