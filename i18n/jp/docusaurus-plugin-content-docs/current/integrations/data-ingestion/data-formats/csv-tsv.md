---
'sidebar_label': 'CSV と TSV'
'slug': '/integrations/data-formats/csv-tsv'
'title': 'ClickHouse における CSV および TSV データの取り扱い'
'description': 'ClickHouse における CSV と TSV データの取り扱いについて説明するページ'
'doc_type': 'guide'
---



# ClickHouseでのCSVおよびTSVデータの操作

ClickHouseは、CSVからのデータのインポートとCSVへのデータのエクスポートをサポートしています。CSVファイルは、ヘッダー行、カスタム区切り文字、エスケープ記号など、さまざまな形式の特性を持つことがあるため、ClickHouseは各ケースに効率的に対応するための形式と設定を提供します。

## CSVファイルからのデータのインポート {#importing-data-from-a-csv-file}

データをインポートする前に、関連する構造を持つテーブルを作成しましょう：

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

CSVファイルから`sometable`テーブルにデータをインポートするには、ファイルを直接clickhouse-clientにパイプできます：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

[FORMAT CSV](/interfaces/formats.md/#csv)を使用していることに注意してください。これによりClickHouseは私たちがCSV形式のデータを取り込んでいることを認識します。あるいは、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使用してローカルファイルからデータを読み込むこともできます。

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、`FORMAT CSV`句を使用してClickHouseにファイル形式を理解させています。また、[url()](/sql-reference/table-functions/url.md)関数を使用してURLから直接データを読み込んだり、[s3()](/sql-reference/table-functions/s3.md)関数を使ってS3ファイルからデータを読み込んだりすることもできます。

:::tip
`file()`および`INFILE`/`OUTFILE`のための明示的なフォーマット設定はスキップできます。この場合、ClickHouseはファイル拡張子に基づいて自動的にフォーマットを検出します。
:::

### ヘッダー付きCSVファイル {#csv-files-with-headers}

私たちの[CSVファイルにはヘッダー](assets/data_small_headers.csv)が含まれているとしましょう：

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするために、[CSVWithNames](/interfaces/formats.md/#csvwithnames)形式を使用することができます：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouseはファイルからデータをインポートする際に最初の行をスキップします。

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases) 23.1以降、ClickHouseは`CSV`形式を使用してCSVファイルのヘッダーを自動的に検出するため、`CSVWithNames`または`CSVWithNamesAndTypes`を使用する必要はありません。
:::

### カスタム区切り文字付きCSVファイル {#csv-files-with-custom-delimiters}

CSVファイルがカンマ以外の区切り文字を使用している場合、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)オプションを使用して関連する記号を設定できます：

```sql
SET format_csv_delimiter = ';'
```

これで、CSVファイルからインポートする際には、`カンマ`の代わりに`;`記号が区切り文字として使用されます。

### CSVファイルの行をスキップする {#skipping-lines-in-a-csv-file}

ときどき、CSVファイルからデータをインポートする際に特定の行数をスキップしたい場合があります。これは、[input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)オプションを使用して行うことができます：

```sql
SET input_format_csv_skip_first_lines = 10
```

この場合、CSVファイルから最初の10行をスキップします：

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

[ファイル](assets/data_small.csv)には1k行がありますが、最初の10行をスキップするように要求したため、ClickHouseは990行しか読み込みませんでした。

:::tip
`file()`関数を使用する場合、ClickHouse Cloudではファイルが存在するマシン上で`clickhouse client`のコマンドを実行する必要があります。別のオプションは、[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用して、ローカルでファイルを探索することです。
:::

### CSVファイル内のNULL値の扱い {#treating-null-values-in-csv-files}

NULL値のエンコードは、ファイルを生成したアプリケーションによって異なる場合があります。デフォルトでは、ClickHouseはCSV内のNULL値として`\N`を使用します。ただし、[format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)オプションを使用してこれを変更できます。

次のCSVファイルがあるとしましょう：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

このファイルからデータを読み込むと、ClickHouseは`Nothing`をStringとして扱います（これは正しい動作です）：

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

ClickHouseに`Nothing`を`NULL`として扱わせたい場合、次のオプションを使用して定義できます：

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待した場所に`NULL`があります：

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

タブ区切りデータ形式は、データのやりとりフォーマットとして広く使用されています。[TSVファイル](assets/data_small.tsv)からClickHouseにデータをロードするには、[TabSeparated](/interfaces/formats.md/#tabseparated)形式を使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

ヘッダーのあるTSVファイルを扱うための[TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames)形式もあります。また、CSVと同様に、[input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)オプションを使用して最初のX行をスキップすることもできます。

### 生のTSV {#raw-tsv}

時々、TSVファイルはタブや改行をエスケープせずに保存されます。このようなファイルを処理するには[TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw)を使用します。

## CSVへのエクスポート {#exporting-to-csv}

前の例に出てきた任意の形式を使用してデータをエクスポートすることもできます。テーブル（またはクエリ）からCSV形式にデータをエクスポートするには、同じ`FORMAT`句を使用します：

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

エクスポートされたデータをファイルに保存するには、[INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用できます：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

36m行をCSVファイルに保存するのにClickHouseは**約1**秒かかったことに注意してください。

### カスタム区切り文字付きCSVのエクスポート {#exporting-csv-with-custom-delimiters}

カンマ以外の区切り文字を使用したい場合、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)設定オプションを利用できます：

```sql
SET format_csv_delimiter = '|'
```

これで、ClickHouseはCSV形式の区切り文字として`|`を使用します：

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

### Windows向けのCSVのエクスポート {#exporting-csv-for-windows}

CSVファイルがWindows環境で正しく動作するようにするには、[output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)オプションを有効にすることを検討してください。これにより、行の区切りを`\n`の代わりに`\r\n`として使用します：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSVファイルのスキーマ推論 {#schema-inference-for-csv-files}

未知のCSVファイルを扱うことが多いため、カラム用の型を調査する必要があります。ClickHouseは、デフォルトで、与えられたCSVファイルの分析に基づいてデータ形式を推測しようとします。これは「スキーマ推論」として知られています。検出されたデータ型は、`DESCRIBE`ステートメントと[ファイル()](/sql-reference/table-functions/file.md)関数を組み合わせて調査できます：

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

ここで、ClickHouseは私たちのCSVファイルに対するカラム型を効率的に推測しました。ClickHouseに推測させたくない場合、次のオプションを使用して無効にできます：

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべてのカラム型は`String`として扱われます。

### 明示的なカラム型でのCSVのエクスポートとインポート {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouseは、データをエクスポートする際に[CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes)（およびその他の*WithNames形式ファミリー）で明示的にカラム型を設定することも許可しています：

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

この形式には、カラム名とカラム型の2行のヘッダーが含まれます。これにより、ClickHouse（および他のアプリ）が[このようなファイル](assets/data_csv_types.csv)からデータをロードする際にカラム型を識別できるようになります：

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

これで、ClickHouseは推測するのではなく、（2行目の）ヘッダー行に基づいてカラム型を識別します。

## カスタム区切り文字、セパレーター、およびエスケープルール {#custom-delimiters-separators-and-escaping-rules}

複雑なケースでは、テキストデータが非常にカスタムな形式でフォーマットされることがありますが、依然として構造を持っています。ClickHouseには、そのような場合のために特別な[CustomSeparated](/interfaces/formats.md/#format-customseparated)形式があり、カスタムのエスケープルール、区切り文字、行セパレーター、および開始/終了記号を設定できます。

ファイル内に以下のデータがあると仮定しましょう：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

各行は`row()`でラップされ、行は`,`で区切られ、個々の値は`;`で区切られています。この場合、次の設定を使用してこのファイルからデータを読み込むことができます：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、私たちのカスタムフォーマットの[ファイル](assets/data_small_custom.txt)からデータをロードできます：

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

[CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames)を使用してヘッダーを正しくエクスポートおよびインポートすることもできます。より複雑なケースに対処するために[regexとテンプレート](templates-regex.md)形式を探索してください。

## 大きなCSVファイルの扱い {#working-with-large-csv-files}

CSVファイルは大きくなる可能性があり、ClickHouseは任意のサイズのファイルで効率的に動作します。大きなファイルは通常圧縮されており、ClickHouseは処理の前に展開することなくこれをカバーしています。挿入時に`COMPRESSION`句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION`句が省略された場合でも、ClickHouseはファイルの拡張子に基づいてファイル圧縮を推測しようとします。すべてのファイルを直接圧縮形式にエクスポートするための同じアプローチを使用できます：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより、圧縮された`data_csv.csv.gz`ファイルが作成されます。

## その他の形式 {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、多くの形式（テキスト形式およびバイナリ形式）をサポートしています。次の記事で、より多くの形式やそれらとの作業方法を探索してください：

- **CSVおよびTSV形式**
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regexおよびテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を確認してください - Clickhouseサーバーなしでローカル/リモートファイルで作業するためのポータブルでフル機能のツールです。
