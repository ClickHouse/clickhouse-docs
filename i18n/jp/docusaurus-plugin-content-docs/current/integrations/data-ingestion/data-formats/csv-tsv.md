---
sidebar_label: 'CSV と TSV'
slug: /integrations/data-formats/csv-tsv
title: 'ClickHouse における CSV および TSV データの扱い'
description: 'ClickHouse で CSV および TSV データを扱う方法を説明するページ'
keywords: ['CSV 形式', 'TSV 形式', 'カンマ区切り値', 'タブ区切り値', 'データのインポート']
doc_type: 'guide'
---



# ClickHouse での CSV および TSV データの扱い方 {#working-with-csv-and-tsv-data-in-clickhouse}

ClickHouse は、CSV 形式でのデータのインポートおよびエクスポートをサポートしています。CSV ファイルは、ヘッダー行、カスタム区切り文字、エスケープ記号など、さまざまな形式上の違いを持つ場合があるため、ClickHouse ではそれぞれのケースに効率的に対処できるよう、フォーマットと設定が用意されています。



## CSV ファイルからのデータインポート {#importing-data-from-a-csv-file}

データをインポートする前に、適切な構造を持つテーブルを作成します。

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

[CSV ファイル](assets/data_small.csv)から `sometable` テーブルにデータをインポートするには、ファイルを直接 clickhouse-client にパイプで渡します。

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

ここでは、ClickHouse に対して CSV 形式のデータを取り込むことを知らせるために [FORMAT CSV](/interfaces/formats/CSV) を使用している点に注意してください。別の方法として、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 句を使用してローカルファイルからデータを読み込むこともできます。

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

ここでは、ClickHouse にファイルフォーマットを理解させるために `FORMAT CSV` 句を使用します。[url()](/sql-reference/table-functions/url.md) 関数を使って URL から直接データを読み込んだり、[s3()](/sql-reference/table-functions/s3.md) 関数を使って S3 ファイルからデータを読み込んだりすることもできます。

:::tip
`file()` と `INFILE`/`OUTFILE` については、明示的なフォーマット指定を省略できます。
その場合、ClickHouse はファイル拡張子に基づいて自動的にフォーマットを検出します。
:::

### ヘッダー付き CSV ファイル {#csv-files-with-headers}

次のような [ヘッダー付きの CSV ファイル](assets/data_small_headers.csv) があるとします。

```bash
head data-small-headers.csv
```

```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

このファイルからデータをインポートするには、[CSVWithNames](/interfaces/formats/CSVWithNames) 形式を使用できます。

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

この場合、ClickHouse はファイルからデータをインポートする際に最初の行をスキップします。

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases) 23.1 以降では、`CSV` フォーマットを使用する場合、ClickHouse は CSV ファイル内のヘッダー行を自動的に検出するため、`CSVWithNames` や `CSVWithNamesAndTypes` を使用する必要はありません。
:::

### カスタム区切り文字を使用する CSV ファイル {#csv-files-with-custom-delimiters}

CSV ファイルがカンマ以外の区切り文字を使用している場合は、[format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) オプションを使用して、適切な記号を設定できます。

```sql
SET format_csv_delimiter = ';'
```

この設定により、CSV ファイルからインポートする際には、カンマの代わりに区切り文字として `;` 記号が使用されるようになります。

### CSV ファイル内の行のスキップ {#skipping-lines-in-a-csv-file}

CSV ファイルからデータをインポートする際に、先頭から特定の行数をスキップしたい場合があります。これは [input&#95;format&#95;csv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) オプションを使用して行えます。

```sql
SET input_format_csv_skip_first_lines = 10
```

この場合は、CSV ファイルの先頭 10 行をスキップします。

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

この [file](assets/data_small.csv) には 1,000 行ありますが、最初の 10 行をスキップするよう指定したため、ClickHouse は 990 行だけを読み込みました。

:::tip
`file()` 関数を使用する場合、ClickHouse Cloud では、ファイルが配置されているマシン上で `clickhouse client` のコマンドを実行する必要があります。別の方法としては、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルでファイルを操作・検証することもできます。
:::

### CSV ファイル内の NULL 値の扱い {#treating-null-values-in-csv-files}

NULL 値は、そのファイルを生成したアプリケーションによって、異なる方法でエンコードされている場合があります。デフォルトでは、ClickHouse は CSV 内の NULL 値として `\N` を使用します。ただし、[format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) オプションを使うことで、これを変更できます。

次のような CSV ファイルがあるとします。

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```


このファイルからデータを読み込むと、ClickHouse は `Nothing` を String として扱います（これは正しい挙動です）：

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

ClickHouse に `Nothing` を `NULL` として扱わせたい場合は、次のオプションでそのように設定できます。

```sql
SET format_csv_null_representation = 'Nothing'
```

これで、期待した位置に `NULL` が入るようになりました。

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


## TSV (タブ区切り) ファイル {#tsv-tab-separated-files}

タブ区切りデータ形式は、データ交換形式として広く使用されています。[TSV ファイル](assets/data_small.tsv)から ClickHouse にデータを読み込むには、[TabSeparated](/interfaces/formats/TabSeparated) 形式を使用します。

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

ヘッダー行付き TSV ファイルを扱うための [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) フォーマットもあります。CSV と同様に、[input&#95;format&#95;tsv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) オプションを使用して先頭の X 行をスキップできます。

### 生の TSV {#raw-tsv}

TSV ファイルがタブや改行をエスケープせずに保存されている場合があります。そのようなファイルを処理するには [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw) を使用します。


## CSV へのエクスポート {#exporting-to-csv}

前の例で使用したいずれのフォーマットも、データのエクスポートに使用できます。テーブル（またはクエリ）から CSV 形式でデータをエクスポートするには、同じように `FORMAT` 句を使用します。

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

CSV ファイルにヘッダー行を追加するには、[CSVWithNames](/interfaces/formats/CSVWithNames) 形式を使用します。

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

エクスポートしたデータをファイルに保存するには、[INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md) 句を使用します。

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
36838935行のセット。経過時間: 1.304秒。処理済み: 3684万行、1.42 GB (2824万行/秒、1.09 GB/秒)
```

ClickHouse が 3,600 万行を CSV ファイルに保存するのに **約 1** 秒しかかかっていない点に注目してください。

### 区切り文字をカスタマイズした CSV のエクスポート {#exporting-csv-with-custom-delimiters}

カンマ以外の区切り文字を使用したい場合は、[format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定オプションを利用できます。

```sql
SET format_csv_delimiter = '|'
```

これで、ClickHouse は CSV 形式の区切り文字として `|` を使用するようになります：

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

### Windows 向けの CSV エクスポート {#exporting-csv-for-windows}

Windows 環境で CSV ファイルを問題なく利用したい場合は、[output&#95;format&#95;csv&#95;crlf&#95;end&#95;of&#95;line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) オプションを有効にすることを検討してください。これにより、改行コードとして `\n` の代わりに `\r\n` が使用されます。

```sql
SET output_format_csv_crlf_end_of_line = 1;
```


## CSV ファイルのスキーマ推論 {#schema-inference-for-csv-files}

多くの場合、スキーマが不明な CSV ファイルを扱うことになるため、各列にどの型を使用するかを確認する必要があります。ClickHouse はデフォルトで、与えられた CSV ファイルを解析し、その結果に基づいてデータ型を推測しようとします。これを「スキーマ推論」と呼びます。検出されたデータ型は、[file()](/sql-reference/table-functions/file.md) 関数と組み合わせて `DESCRIBE` ステートメントを使用することで確認できます。

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

ここでは、ClickHouse は CSV ファイルのカラム型を効率的に推測してくれます。ClickHouse に推測させたくない場合は、次のオプションでこの機能を無効化できます。

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

この場合、すべての列の型は `String` として扱われます。

### 明示的な列の型を指定した CSV のエクスポートとインポート {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse では、[CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)（および他の *WithNames 系フォーマット）を使用してデータをエクスポートする際に、列の型を明示的に設定することもできます。

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

この形式では、ヘッダーは 2 行で構成されます。1 行目はカラム名、もう 1 行はカラムの型です。これにより、ClickHouse（および他のアプリケーション）は、[このようなファイル](assets/data_csv_types.csv) からデータを読み込む際にカラム型を識別できるようになります。

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

これにより、ClickHouse は推測ではなく、（2行目の）ヘッダー行に基づいて列型を判定するようになりました。


## カスタム区切り文字、セパレーター、およびエスケープ規則 {#custom-delimiters-separators-and-escaping-rules}

より複雑なケースでは、テキストデータが高度にカスタマイズされた形式で整形されていても、なお構造を持っている場合があります。ClickHouse にはそのようなケース向けの特別な [CustomSeparated](/interfaces/formats/CustomSeparated) フォーマットがあり、カスタムのエスケープ規則、区切り文字、行区切り、開始／終了記号を設定できます。

ファイル内に次のようなデータがあるとします。

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

個々の行は `row()` で囲まれ、行同士は `,` で区切られ、個々の値は `;` で区切られていることがわかります。この場合、このファイルからデータを読み込むために次の設定を使用できます。

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

これで、カスタム形式の[ファイル](assets/data_small_custom.txt)からデータを読み込めます。

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

ヘッダーを正しくエクスポートおよびインポートするために、[CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames) を使用することもできます。さらに複雑なケースを扱うには、[regex and template](templates-regex.md) フォーマットを参照してください。


## 大きな CSV ファイルの扱い {#working-with-large-csv-files}

CSV ファイルは大きくなることがありますが、ClickHouse はサイズに関係なく効率的に処理できます。大きなファイルは通常、圧縮された状態で提供されますが、ClickHouse では処理前に解凍する必要はありません。`INSERT` 時に `COMPRESSION` 句を使用できます:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION` 句を省略しても、ClickHouse は拡張子に基づいてファイルの圧縮形式を推測しようとします。同様の方法で、ファイルを圧縮形式に直接エクスポートすることもできます。

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

これにより圧縮済みの `data_csv.csv.gz` ファイルが作成されます。


## その他のフォーマット {#other-formats}

ClickHouse は、多様なシナリオやプラットフォームをカバーするために、テキスト形式およびバイナリ形式の多くのフォーマットをサポートしています。以下の記事で、より多くのフォーマットとその扱い方を確認してください。

- **CSV と TSV フォーマット**
- [Parquet](parquet.md)
- [JSON フォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQL フォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も確認してください。ClickHouse サーバーを用意することなく、ローカル／リモートファイルを扱うことができる、ポータブルでフル機能のツールです。
