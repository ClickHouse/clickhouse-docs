---
sidebar_label: CSV と TSV
slug: /integrations/data-formats/csv-tsv
---

# ClickHouse における CSV および TSV データの扱い

ClickHouse は CSV からのデータインポートおよびエクスポートをサポートしています。CSV ファイルは、ヘッダ行、カスタム区切り文字、エスケープ文字など、さまざまなフォーマットの特性を伴うことがあるため、ClickHouse は各ケースに効率的に対処するためのフォーマットおよび設定を提供しています。

## CSV ファイルからのデータのインポート {#importing-data-from-a-csv-file}

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

[CSVファイル](assets/data_small.csv)から `sometable` テーブルにデータをインポートするには、ファイルを直接 clickhouse-client にパイプできます：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

ここで、[FORMAT CSV](/interfaces/formats.md/#csv) を使用して、ClickHouse に CSV フォーマットされたデータを取り込んでいることを知らせます。あるいは、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 句を使用してローカルファイルからデータをロードすることもできます：

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、ClickHouse がファイルフォーマットを理解できるように `FORMAT CSV` 句を使用しています。また、[url()](/sql-reference/table-functions/url.md) 関数を使用して URL から、または [s3()](/sql-reference/table-functions/s3.md) 関数を使用して S3 ファイルから直接データをロードすることもできます。

:::tip
`file()` および `INFILE`/`OUTFILE` のためには、明示的なフォーマット設定をスキップできます。その場合、ClickHouse はファイル拡張子に基づいてフォーマットを自動的に検出します。
:::

### ヘッダ付きの CSV ファイル {#csv-files-with-headers}

仮に我々の [CSVファイルにヘッダ](assets/data_small_headers.csv) が含まれているとしましょう：

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするには、[CSVWithNames](/interfaces/formats.md/#csvwithnames) フォーマットを使用できます：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouse はファイルからデータをインポートする際に最初の行をスキップします。

:::tip
23.1 [バージョン](https://github.com/ClickHouse/ClickHouse/releases) 以降、`CSV` タイプが使用されると、ClickHouse は CSV ファイル内のヘッダを自動的に検出するので、`CSVWithNames` または `CSVWithNamesAndTypes` を使用する必要はありません。
:::


### カスタム区切り文字を持つ CSV ファイル {#csv-files-with-custom-delimiters}

CSV ファイルがコンマ以外の区切り文字を使用している場合、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) オプションを使用して関連する記号を設定できます：

```sql
SET format_csv_delimiter = ';'
```

これで、CSV ファイルからインポートするときに `;` 記号がコンマの代わりに区切り文字として使用されます。


### CSV ファイルで行をスキップする {#skipping-lines-in-a-csv-file}

場合によっては、CSV ファイルからデータをインポートする際に特定数の行をスキップしたいことがあります。これは、[input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) オプションを使用することで実現できます：

```sql
SET input_format_csv_skip_first_lines = 10
```

この場合、CSV ファイルの最初の 10 行をスキップします：

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

[ファイル](assets/data_small.csv) には 1k 行がありますが、ClickHouse は最初の 10 行をスキップするように要求したため、990 行のみをロードしました。

:::tip
`file()` 関数を使用している場合、ClickHouse Cloud ではファイルが存在するマシン上で `clickhouse client` コマンドを実行する必要があります。もう一つのオプションは、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルファイルを調査することです。
:::


### CSV ファイルにおける NULL 値の扱い {#treating-null-values-in-csv-files}

NULL 値は、ファイルを生成したアプリケーションに応じて異なる方法でエンコードされることがあります。デフォルトでは、ClickHouse は CSV での NULL 値として `\N` を使用しますが、[format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) オプションを使用してこれを変更することができます。

次のような CSV ファイルがあると仮定しましょう：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

このファイルからデータをロードすると、ClickHouse は `Nothing` を文字列として扱います（これは正しい動作です）：

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

ClickHouse に `Nothing` を `NULL` として扱わせたい場合は、次のオプションを使用して定義できます：

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待される場所に `NULL` が表示されます：

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


## TSV（Tab-separated）ファイル {#tsv-tab-separated-files}

タブ区切りデータ形式は、データ交換形式として広く使用されています。[TSVファイル](assets/data_small.tsv) から ClickHouse にデータをロードするには、[TabSeparated](/interfaces/formats.md/#tabseparated) フォーマットを使用します：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

ヘッダがある TSV ファイルを扱うための [TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames) フォーマットもあります。また、CSV と同様に、[input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) オプションを使用して最初の X 行をスキップすることができます。


### 生の TSV {#raw-tsv}

時には、TSV ファイルがタブや改行をエスケープせずに保存されることがあります。このようなファイルを処理するには、[TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw) を使用する必要があります。


## CSV へのエクスポート {#exporting-to-csv}

前述のいずれかのフォーマットを使用してデータをエクスポートすることもできます。テーブル（またはクエリ）から CSV フォーマットへデータをエクスポートするには、同じ `FORMAT` 句を使用します：

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

CSVファイルにヘッダを追加するには、[CSVWithNames](/interfaces/formats.md/#csvwithnames) フォーマットを使用します：

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

エクスポートしたデータをファイルに保存するには、[INTO…OUTFILE](/sql-reference/statements/select/into-outfile.md) 句を使用します：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouse は約 **1** 秒で 3600 万行を CSV ファイルに保存しました。

### カスタム区切り文字での CSV のエクスポート {#exporting-csv-with-custom-delimiters}

コンマ以外の区切り文字を使用したい場合は、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定オプションを使用できます：

```sql
SET format_csv_delimiter = '|'
```

これで、ClickHouse は CSV フォーマットの区切り文字として `|` を使用します：

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


### Windows 向けの CSV のエクスポート {#exporting-csv-for-windows}

Windows 環境で正常に動作する CSV ファイルを作成したい場合は、[output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) オプションを有効にすることを検討してください。これにより、行の区切りとして `\n` の代わりに `\r\n` が使用されます：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSV ファイルのスキーマ推論 {#schema-inference-for-csv-files}

多くの場合、未知の CSV ファイルに対処する必要があるため、どの型をカラムに使用するかを探る必要があります。ClickHouse はデフォルトで、与えられた CSV ファイルを分析に基づいてデータ形式を推測しようとします。これを「スキーマ推論」と呼びます。検出されたデータ型は、`DESCRIBE` ステートメントと [file()](/sql-reference/table-functions/file.md) 関数を組み合わせて調べることができます：

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

ここで、ClickHouse は CSV ファイルのカラム型を効率的に推測しました。ClickHouse に推測させたくない場合は、次のオプションを使用してこれを無効にできます：

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべてのカラム型は `String` として扱われます。

### 明示的なカラム型で CSV をエクスポートおよびインポートする {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse では、[CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes)（および他の *WithNames フォーマットファミリー）を使用してデータをエクスポートする際にカラム型を明示的に設定することもできます：

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

このフォーマットでは、カラム名の行とカラム型の行の2つのヘッダー行が含まれます。これにより、ClickHouse（および他のアプリケーション）は、[そのようなファイル](assets/data_csv_types.csv) からデータを読み込む際にカラム型を識別できます：

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

これで ClickHouse は2つ目のヘッダー行に基づいてカラム型を識別します。

## カスタム区切り文字、セパレーター、およびエスケープルール {#custom-delimiters-separators-and-escaping-rules}

複雑なケースでは、テキストデータが非常にカスタムされた形式でフォーマットされていることがありますが、依然として構造を有します。ClickHouse には、そのようなケースのための特別な [CustomSeparated](/interfaces/formats.md/#format-customseparated) フォーマットがあり、カスタムのエスケープルール、区切り文字、行セパレーター、開始/終了記号を設定できます。

次のようなデータがファイルに含まれているとしましょう：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

個々の行が `row()` で囲まれ、行が `,` で区切られ、個々の値が `;` で区切られていることがわかります。この場合、次の設定を使用してこのファイルからデータを読み取ることができます：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、カスタムフォーマットの [ファイル](assets/data_small_custom.txt) からデータを読み込むことができます：

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

[CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames) を使用して、ヘッダーを正しくエクスポートおよびインポートすることもできます。また、さらに複雑なケースに対処するために [regex およびテンプレート](templates-regex.md) フォーマットを探ることができます。


## 大規模な CSV ファイルの扱い {#working-with-large-csv-files}

CSV ファイルは大きくなる可能性があり、ClickHouse は任意のサイズのファイルに対して効率的に動作します。大きなファイルは通常圧縮されており、ClickHouse は処理の前に解凍する必要がなく、それをカバーしています。挿入中に `COMPRESSION` 句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION` 句が省略された場合、ClickHouse はファイルの拡張子に基づいてファイル圧縮を推測しようとします。同じアプローチを使用して、圧縮されたフォーマットに直接ファイルをエクスポートすることもできます：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより、圧縮された `data_csv.csv.gz` ファイルが作成されます。

## その他のフォーマット {#other-formats}

ClickHouse は、さまざまなシナリオやプラットフォームをカバーするために、多くのテキストおよびバイナリフォーマットをサポートしています。以下の記事でさらに多くのフォーマットとそれらの扱い方を探ってください：

- **CSV および TSV フォーマット**
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を確認してください - Clickhouse サーバーを必要とせずにローカル/リモートファイルで作業するためのポータブルなフル機能ツールです。
