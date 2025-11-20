---
sidebar_label: 'CSV と TSV'
slug: /integrations/data-formats/csv-tsv
title: 'ClickHouse における CSV および TSV データの扱い方'
description: 'ClickHouse で CSV および TSV データを扱う方法を説明するページ'
keywords: ['CSV format', 'TSV format', 'comma separated values', 'tab separated values', 'data import']
doc_type: 'guide'
---



# ClickHouse での CSV および TSV データの扱い方

ClickHouse は、CSV 形式でのデータのインポートおよびエクスポートをサポートしています。CSV ファイルは、ヘッダー行、カスタム区切り文字、エスケープ記号など、さまざまな形式上の違いを持つ場合があるため、ClickHouse ではそれぞれのケースに効率的に対応できるよう、複数のフォーマットと設定を用意しています。



## CSVファイルからのデータインポート {#importing-data-from-a-csv-file}

データをインポートする前に、適切な構造のテーブルを作成します:

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

[CSVファイル](assets/data_small.csv)から`sometable`テーブルにデータをインポートするには、ファイルを直接clickhouse-clientにパイプします:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

CSV形式のデータを取り込むことをClickHouseに伝えるために[FORMAT CSV](/interfaces/formats/CSV)を使用していることに注意してください。また、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使用してローカルファイルからデータを読み込むこともできます:

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、ClickHouseがファイル形式を理解できるように`FORMAT CSV`句を使用しています。また、[url()](/sql-reference/table-functions/url.md)関数を使用してURLから直接データを読み込んだり、[s3()](/sql-reference/table-functions/s3.md)関数を使用してS3ファイルから読み込むこともできます。

:::tip
`file()`および`INFILE`/`OUTFILE`では明示的な形式設定を省略できます。
その場合、ClickHouseはファイル拡張子に基づいて形式を自動的に検出します。
:::

### ヘッダー付きCSVファイル {#csv-files-with-headers}

[CSVファイルにヘッダーが含まれている](assets/data_small_headers.csv)場合を考えます:

```bash
head data-small-headers.csv
```

```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするには、[CSVWithNames](/interfaces/formats/CSVWithNames)形式を使用できます:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouseはファイルからデータをインポートする際に最初の行をスキップします。

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases)23.1以降、ClickHouseは`CSV`形式を使用する際にCSVファイル内のヘッダーを自動的に検出するため、`CSVWithNames`や`CSVWithNamesAndTypes`を使用する必要はありません。
:::

### カスタム区切り文字を使用したCSVファイル {#csv-files-with-custom-delimiters}

CSVファイルがカンマ以外の区切り文字を使用している場合、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)オプションを使用して適切な記号を設定できます:

```sql
SET format_csv_delimiter = ';'
```

これで、CSVファイルからインポートする際に、カンマの代わりに`;`記号が区切り文字として使用されます。

### CSVファイルの行をスキップする {#skipping-lines-in-a-csv-file}

CSVファイルからデータをインポートする際に、特定の行数をスキップしたい場合があります。これは[input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)オプションを使用して実行できます:

```sql
SET input_format_csv_skip_first_lines = 10
```

この場合、CSVファイルの最初の10行をスキップします:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

[ファイル](assets/data_small.csv)には1000行ありますが、最初の10行をスキップするように指定したため、ClickHouseは990行のみを読み込みました。

:::tip
`file()`関数を使用する場合、ClickHouse Cloudではファイルが存在するマシン上で`clickhouse client`でコマンドを実行する必要があります。別の方法として、[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用してローカルでファイルを探索することもできます。
:::

### CSVファイル内のNULL値の扱い {#treating-null-values-in-csv-files}

NULL値は、ファイルを生成したアプリケーションによって異なる方法でエンコードされる場合があります。デフォルトでは、ClickHouseはCSVでのNULL値として`\N`を使用します。ただし、[format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)オプションを使用してこれを変更できます。

次のようなCSVファイルがあるとします:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```


このファイルからデータを読み込むと、ClickHouse は `Nothing` を文字列として扱います（これは正しい挙動です）:

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

ClickHouse に `Nothing` を `NULL` として扱わせたい場合は、次のオプションでそのように定義できます。

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待どおりの場所に `NULL` が入るようになりました。

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

タブ区切りデータ形式は、データ交換形式として広く使用されています。[TSVファイル](assets/data_small.tsv)からClickHouseにデータをロードするには、[TabSeparated](/interfaces/formats/TabSeparated)形式を使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

ヘッダーを持つTSVファイルを扱うための[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)形式も用意されています。また、CSVと同様に、[input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)オプションを使用して最初のX行をスキップできます。

### Raw TSV {#raw-tsv}

TSVファイルがタブや改行をエスケープせずに保存されている場合があります。このようなファイルを処理するには、[TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)を使用してください。


## CSVへのエクスポート {#exporting-to-csv}

前述の例で使用したフォーマットは、データのエクスポートにも使用できます。テーブル（またはクエリ）からCSVフォーマットにデータをエクスポートするには、同じ`FORMAT`句を使用します:

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

CSVファイルにヘッダーを追加するには、[CSVWithNames](/interfaces/formats/CSVWithNames)フォーマットを使用します:

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

### エクスポートしたデータをCSVファイルに保存 {#saving-exported-data-to-a-csv-file}

エクスポートしたデータをファイルに保存するには、[INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用します:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouseが3600万行をCSVファイルに保存するのに**約1**秒しかかからなかったことに注目してください。

### カスタム区切り文字を使用したCSVのエクスポート {#exporting-csv-with-custom-delimiters}

カンマ以外の区切り文字を使用したい場合は、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)設定オプションを使用できます:

```sql
SET format_csv_delimiter = '|'
```

これでClickHouseはCSVフォーマットの区切り文字として`|`を使用するようになります:

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

### Windows向けCSVのエクスポート {#exporting-csv-for-windows}

Windows環境でCSVファイルを正常に動作させたい場合は、[output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)オプションの有効化を検討してください。これにより、改行文字として`\n`の代わりに`\r\n`が使用されます:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```


## CSVファイルのスキーマ推論 {#schema-inference-for-csv-files}

多くの場合、未知のCSVファイルを扱う必要があるため、カラムに使用する型を調査する必要があります。ClickHouseはデフォルトで、指定されたCSVファイルの分析に基づいてデータ形式を推測しようとします。これは「スキーマ推論」として知られています。検出されたデータ型は、[file()](/sql-reference/table-functions/file.md)関数と組み合わせて`DESCRIBE`文を使用することで確認できます:

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

ここでは、ClickHouseがCSVファイルのカラム型を効率的に推測できました。ClickHouseに推測させたくない場合は、次のオプションで無効にできます:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべてのカラム型は`String`として扱われます。

### 明示的なカラム型を使用したCSVのエクスポートとインポート {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouseでは、[CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)（および他の\*WithNames形式ファミリー）を使用してデータをエクスポートする際に、カラム型を明示的に設定することもできます:

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

この形式には2つのヘッダー行が含まれます。1つはカラム名、もう1つはカラム型です。これにより、ClickHouse（および他のアプリケーション）は[このようなファイル](assets/data_csv_types.csv)からデータを読み込む際にカラム型を識別できます:

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

これで、ClickHouseは推測ではなく（2番目の）ヘッダー行に基づいてカラム型を識別します。


## カスタム区切り文字、セパレータ、およびエスケープルール {#custom-delimiters-separators-and-escaping-rules}

複雑なケースでは、テキストデータが高度にカスタマイズされた形式でフォーマットされていても、一定の構造を持つことがあります。ClickHouseには、このようなケースに対応する特別な[CustomSeparated](/interfaces/formats/CustomSeparated)フォーマットがあり、カスタムエスケープルール、区切り文字、行セパレータ、および開始/終了記号を設定できます。

ファイルに次のようなデータがあるとします:

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

個々の行が`row()`で囲まれ、行は`,`で区切られ、個々の値は`;`で区切られていることがわかります。この場合、このファイルからデータを読み取るために次の設定を使用できます:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、カスタムフォーマットされた[ファイル](assets/data_small_custom.txt)からデータを読み込むことができます:

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

また、[CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)を使用して、ヘッダーを正しくエクスポートおよびインポートすることもできます。さらに複雑なケースに対応するには、[正規表現とテンプレート](templates-regex.md)フォーマットを参照してください。


## 大規模なCSVファイルの操作 {#working-with-large-csv-files}

CSVファイルは大規模になることがあり、ClickHouseはあらゆるサイズのファイルを効率的に処理します。大規模なファイルは通常圧縮されていますが、ClickHouseは処理前に解凍することなく対応できます。挿入時に`COMPRESSION`句を使用できます:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION`句を省略した場合でも、ClickHouseはファイルの拡張子に基づいて圧縮形式を推測しようとします。同じ方法で、ファイルを圧縮形式に直接エクスポートすることもできます:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより、圧縮された`data_csv.csv.gz`ファイルが作成されます。


## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するため、テキスト形式とバイナリ形式の両方で多数のフォーマットをサポートしています。以下の記事で、その他のフォーマットとその使用方法を詳しくご確認ください：

- **CSVおよびTSVフォーマット**
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もご確認ください。これは、ClickHouseサーバーを必要とせずにローカル/リモートファイルを操作できる、ポータブルでフル機能を備えたツールです。
