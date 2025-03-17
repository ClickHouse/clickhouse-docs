---
sidebar_label: CSVおよびTSV
slug: /integrations/data-formats/csv-tsv
---


# ClickHouseにおけるCSVおよびTSVデータの操作

ClickHouseはCSVからのデータのインポートおよびCSVへのデータのエクスポートをサポートしています。CSVファイルはヘッダー行、カスタム区切り文字、エスケープ記号など、さまざまなフォーマットの特性を持つ可能性があるため、ClickHouseはそれぞれのケースに効率的に対応するためのフォーマットと設定を提供します。


## CSVファイルからのデータのインポート {#importing-data-from-a-csv-file}

データをインポートする前に、適切な構造を持つテーブルを作成しましょう：

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


CSVファイルから`sometable`テーブルへのデータをインポートするには、ファイルを直接clickhouse-clientにパイプします：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

ここで、[FORMAT CSV](/interfaces/formats.md/#csv)を使用してClickHouseにCSV形式のデータを取り込んでいることを通知します。あるいは、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使ってローカルファイルからデータをロードすることもできます：

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、`FORMAT CSV`句を使ってClickHouseにファイルの形式を理解させています。また、[url()](/sql-reference/table-functions/url.md)関数を利用してURLから、または[s3()](/sql-reference/table-functions/s3.md)関数を使用してS3ファイルから直接データをロードすることも可能です。

:::tip
`file()`および`INFILE`/`OUTFILE`の明示的なフォーマット設定をスキップできます。この場合、ClickHouseはファイル拡張子に基づいて自動的にフォーマットを検出します。
:::

### ヘッダー付きCSVファイル {#csv-files-with-headers}

例えば、私たちの[CSVファイルにはヘッダー](assets/data_small_headers.csv)があります：

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするには、[CSVWithNames](/interfaces/formats.md/#csvwithnames)形式を使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouseはファイルからデータをインポートする際に最初の行をスキップします。

:::tip
23.1 [バージョン](https://github.com/ClickHouse/ClickHouse/releases)以降、ClickHouseは`CSV`タイプが使用されている場合にCSVファイルのヘッダーを自動的に検出するため、`CSVWithNames`や`CSVWithNamesAndTypes`を使用する必要はありません。
:::


### カスタム区切り文字を持つCSVファイル {#csv-files-with-custom-delimiters}

CSVファイルがカンマ以外の区切り文字を使用している場合、関連する記号を設定するために[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)オプションを使用できます：

```sql
SET format_csv_delimiter = ';'
```

これで、CSVファイルからインポートする際に`；`記号がカンマの代わりに区切り文字として使用されます。


### CSVファイル内の行をスキップする {#skipping-lines-in-a-csv-file}

時には、CSVファイルからデータをインポートする際に特定の行数をスキップする必要があります。これは[input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)オプションを使用して行えます：

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

[file](assets/data_small.csv)には1k行がありますが、最初の10行をスキップするように指示したため、ClickHouseは990行しか読み込みません。

:::tip
`file()`関数を使用する場合、ClickHouse Cloudでは、ファイルが存在するマシンの`clickhouse client`でコマンドを実行する必要があります。別のオプションとして、[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用してローカルでファイルを探索できます。
:::


### CSVファイル内のNULL値の扱い {#treating-null-values-in-csv-files}

NULL値は、ファイルを生成したアプリケーションによって異なる方法でエンコードされることがあります。デフォルトでは、ClickHouseはCSVにおいてNULL値として`\N`を使用します。しかし、[format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)オプションを使用してこれを変更できます。

以下のCSVファイルがあるとしましょう：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

このファイルからデータをロードすると、ClickHouseは`Nothing`を文字列として扱います（これは正しい扱いです）：

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

ClickHouseに`Nothing`を`NULL`として扱わせたい場合、次のオプションを定義します：

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待していたところに`NULL`が表示されます：

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

タブ区切りデータ形式は、データインターチェンジフォーマットとして広く使用されています。[TSVファイル](assets/data_small.tsv)からClickHouseにデータをロードするには、[TabSeparated](/interfaces/formats.md/#tabseparated)形式を使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```


ヘッダー付きのTSVファイルを扱うための[TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames)形式もあります。そして、CSVと同様に、[input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)オプションを使用して最初のX行をスキップすることができます。


### 生のTSV {#raw-tsv}

時には、TSVファイルがタブや改行をエスケープせずに保存されています。そのようなファイルを扱うためには、[TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw)を使用する必要があります。


## CSVへのエクスポート {#exporting-to-csv}

前述の例のいずれかの形式もデータをエクスポートするために使用できます。テーブル（またはクエリ）からCSV形式にデータをエクスポートするには、同じ`FORMAT`句を使用します：

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

CSVファイルにヘッダーを追加するには、[CSVWithNames](/interfaces/formats.md/#csvwithnames)形式を使用します：

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


### エクスポートされたデータをCSVファイルに保存する {#saving-exported-data-to-a-csv-file}

エクスポートされたデータをファイルに保存するには、[INTO…OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用します：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouseが36m行をCSVファイルに保存するのに**約1**秒かかったことに注目してください。


### カスタム区切り文字でのCSVのエクスポート {#exporting-csv-with-custom-delimiters}

カンマ以外の区切り文字を使用したい場合は、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)設定オプションを使用することができます：

```sql
SET format_csv_delimiter = '|'
```

これで、ClickHouseはCSV形式で`|`を区切り文字として使用します：

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


### Windows用のCSVのエクスポート {#exporting-csv-for-windows}

Windows環境でうまく動作するCSVファイルを作成する場合、[output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)オプションを有効にすることを考慮する必要があります。これにより、行の区切りは`\n`の代わりに`\r\n`が使用されます：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSVファイルのスキーマ推論 {#schema-inference-for-csv-files}

多くの場合、未知のCSVファイルを扱う必要があるため、カラムに使用する型を調べる必要があります。ClickHouseはデフォルトで、与えられたCSVファイルの分析に基づいてデータフォーマットを推測しようとします。これを「スキーマ推論」と呼びます。検出されたデータ型は、`DESCRIBE`文を[file()](/sql-reference/table-functions/file.md)関数とペアで使用して調べることができます：

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


ここで、ClickHouseはCSVファイルのカラム型を効率的に推測することができました。ClickHouseに推測を行わせたくない場合、次のオプションを使用してこれを無効にできます：

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべてのカラム型は`String`として扱われます。

### 明示的なカラム型を用いたCSVのエクスポートおよびインポート {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouseは、[CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes)（およびその他の*WithNames形式ファミリー）を使用してデータをエクスポートする際にカラム型を明示的に設定することも可能です：

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


この形式では二つのヘッダー行が含まれます - 一つはカラム名で、もう一つはカラム型です。これにより、ClickHouse（および他のアプリケーション）が[そのようなファイル](assets/data_csv_types.csv)からデータをロードする際にカラム型を識別できるようになります：

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

これで、ClickHouseは推測の代わりに（第二の）ヘッダー行に基づいてカラム型を識別します。

## カスタム区切り文字、セパレータ、およびエスケープルール {#custom-delimiters-separators-and-escaping-rules}

高度にカスタマイズされた方法でフォーマットされたテキストデータでも、構造を持っている場合があります。ClickHouseには、そのようなケースに対応するための特別な[CustomSeparated](/interfaces/formats.md/#format-customseparated)形式があり、カスタムのエスケープルール、区切り文字、行のセパレータ、および開始/終了記号を設定することができます。

以下のようなデータがファイルにあるとします：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

各行が`row()`でラップされ、行は`,`で区切られ、個々の値は`;`で区切られています。この場合、次の設定を使用してこのファイルからデータを読み込むことができます：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、カスタムフォーマットの[data_small_custom.txt](assets/data_small_custom.txt)ファイルからデータをロードできます：

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

[CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames)を使用して、ヘッダーをエクスポートおよびインポートする際に正しく処理することもできます。さらに複雑なケースには、[regexとテンプレート](templates-regex.md)形式を探求してください。


## 大きなCSVファイルとの作業 {#working-with-large-csv-files}

CSVファイルは大きくなりがちであり、ClickHouseは任意のサイズのファイルと効率的に作業します。大きなファイルは通常、圧縮されており、ClickHouseは処理前に解凍する必要がありません。インサート時に`COMPRESSION`句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION`句が省略された場合でも、ClickHouseはファイルの拡張子に基づいて圧縮を推測しようとします。圧縮された形式への直接エクスポートにも同じアプローチが使用できます：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより、圧縮された`data_csv.csv.gz`ファイルが作成されます。

## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、テキストおよびバイナリ形式の多くのサポートを導入しています。以下のドキュメントで、さまざまなフォーマットやその操作方法を調査してください：

- **CSVおよびTSV形式**
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

さらに、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)も確認してください。これは、ClickHouseサーバーなしでローカル/リモートファイルで作業するためのポータブルなフル機能ツールです。
