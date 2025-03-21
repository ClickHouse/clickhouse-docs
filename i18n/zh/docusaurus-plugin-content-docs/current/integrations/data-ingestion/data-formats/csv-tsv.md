---
sidebar_label: CSV 和 TSV
slug: /integrations/data-formats/csv-tsv
---


# 在 ClickHouse 中处理 CSV 和 TSV 数据

ClickHouse 支持从 CSV 导入数据和导出到 CSV。由于 CSV 文件可能具有不同的格式细节，包括标题行、自定义分隔符和转义符，ClickHouse 提供格式和设置以有效处理每种情况。


## 从 CSV 文件导入数据 {#importing-data-from-a-csv-file}

在导入数据之前，让我们创建一个具有相关结构的表：

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


要从 [CSV 文件](assets/data_small.csv) 导入数据到 `sometable` 表中，我们可以将文件直接通过管道传递给 clickhouse-client：


```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

请注意，我们使用 [FORMAT CSV](/interfaces/formats.md/#csv) 来告诉 ClickHouse 我们正在导入 CSV 格式的数据。或者，我们可以使用 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据：


```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

在这里，我们使用 `FORMAT CSV` 子句使 ClickHouse 理解文件格式。我们还可以使用 [url()](/sql-reference/table-functions/url.md) 函数直接从 URL 加载数据，或从 S3 文件使用 [s3()](/sql-reference/table-functions/s3.md) 函数加载数据。

:::tip
我们可以跳过 `file()` 和 `INFILE`/`OUTFILE` 的显式格式设置。在这种情况下，ClickHouse 将根据文件扩展名自动检测格式。
:::

### 带有标题的 CSV 文件 {#csv-files-with-headers}

假设我们的 [CSV 文件有标题](assets/data_small_headers.csv)：

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

要从此文件导入数据，我们可以使用 [CSVWithNames](/interfaces/formats.md/#csvwithnames) 格式：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

在这种情况下，ClickHouse 在导入数据时会跳过第一行。

:::tip
从 23.1 [版本](https://github.com/ClickHouse/ClickHouse/releases) 开始，ClickHouse 将在使用 `CSV` 类型时自动检测 CSV 文件中的标题，因此不需要使用 `CSVWithNames` 或 `CSVWithNamesAndTypes`。
:::


### 带有自定义分隔符的 CSV 文件 {#csv-files-with-custom-delimiters}

如果 CSV 文件使用除逗号以外的其他分隔符，我们可以使用 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 选项来设置相关符号：


```sql
SET format_csv_delimiter = ';'
```

现在，当我们从 CSV 文件导入时，`；` 符号将作为分隔符，而不是逗号。


### 跳过 CSV 文件中的行 {#skipping-lines-in-a-csv-file}

有时，我们可能会在从 CSV 文件导入数据时跳过某些行。可以使用 [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) 选项来完成此操作：


```sql
SET input_format_csv_skip_first_lines = 10
```

在这种情况下，我们将跳过 CSV 文件中的前十行：

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

该 [file](assets/data_small.csv) 有 1k 行，但 ClickHouse 只加载了 990，因为我们要求跳过前 10 行。

:::tip
使用 `file()` 函数时，使用 ClickHouse Cloud，您需要在文件所在的机器上运行 `clickhouse client` 中的命令。另一种选择是使用 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 在本地查看文件。
:::


### 处理 CSV 文件中的 NULL 值 {#treating-null-values-in-csv-files}

空值可能根据生成文件的应用程序而以不同方式编码。默认情况下，ClickHouse 将 `\N` 用作 CSV 中的空值。但是，我们可以使用 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 选项进行更改。

假设我们有以下 CSV 文件：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

如果我们从此文件加载数据，ClickHouse 将把 `Nothing` 视为字符串（这是正确的）：

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

如果我们希望 ClickHouse 将 `Nothing` 视为 `NULL`，可以使用以下选项定义：

```sql
SET format_csv_null_representation = 'Nothing'
```

现在我们有 `NULL` 在我们预期的位置：

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


## TSV (制表符分隔) 文件 {#tsv-tab-separated-files}

制表符分隔数据格式被广泛用作数据交换格式。要将数据从 [TSV 文件](assets/data_small.tsv) 加载到 ClickHouse，则使用 [TabSeparated](/interfaces/formats.md/#tabseparated) 格式：


```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```


还有一个 [TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames) 格式以允许处理带有标题的 TSV 文件。同样，对于 CSV，我们可以使用 [input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) 选项跳过前 X 行。


### 原始 TSV {#raw-tsv}

有时，TSV 文件在保存时没有转义制表符和换行符。我们应该使用 [TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw) 来处理此类文件。


## 导出到 CSV {#exporting-to-csv}

在我们之前的示例中，任何格式也可以用于导出数据。要将数据从表（或查询）导出到 CSV 格式，我们使用相同的 `FORMAT` 子句：


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

要为 CSV 文件添加标题，我们使用 [CSVWithNames](/interfaces/formats.md/#csvwithnames) 格式：

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


### 将导出数据保存到 CSV 文件 {#saving-exported-data-to-a-csv-file}

要将导出数据保存到文件中，我们可以使用 [INTO…OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

注意 ClickHouse 只需 **~1** 秒就能将 36m 行保存到 CSV 文件中。


### 导出带有自定义分隔符的 CSV {#exporting-csv-with-custom-delimiters}

如果我们想要使用除逗号以外的其他分隔符，可以使用 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置选项：

```sql
SET format_csv_delimiter = '|'
```

现在 ClickHouse 将使用 `|` 作为 CSV 格式的分隔符：

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


### 为 Windows 导出 CSV {#exporting-csv-for-windows}

如果我们希望 CSV 文件在 Windows 环境中正常工作，我们应该考虑启用 [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) 选项。这将使用 `\r\n` 作为换行符，而不是 `\n`：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSV 文件的模式推断 {#schema-inference-for-csv-files}

我们可能会在许多情况下处理未知的 CSV 文件，因此我们必须探索哪些类型用于列。ClickHouse 默认将尝试根据对给定 CSV 文件的分析来猜测数据格式。这被称为“模式推断”。通过 `DESCRIBE` 语句和 [file()](/sql-reference/table-functions/file.md) 函数可以探索检测到的数据类型：


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


在这里，ClickHouse 能有效地猜测我们 CSV 文件的列类型。如果我们不希望 ClickHouse 猜测，可以使用以下选项禁用此功能：


```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

在这种情况下，所有列类型将被视为 `String`。

### 使用显式列类型导出和导入 CSV {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse 还允许在导出数据时显式设置列类型，使用 [CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes)（及其他 *WithNames 格式系列）：

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


该格式将包括两行标题 - 一行为列名称，另一行为列类型。这将允许 ClickHouse（和其他应用程序）在从 [此类文件](assets/data_csv_types.csv) 加载数据时识别列类型：


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

现在 ClickHouse 根据第二行标题识别列类型，而不是进行猜测。

## 自定义分隔符、分隔符和转义规则 {#custom-delimiters-separators-and-escaping-rules}

在复杂情况下，文本数据可能以高度自定义的方式格式化，但仍然具有结构。ClickHouse 有一个特殊的 [CustomSeparated](/interfaces/formats.md/#format-customseparated) 格式，可用于这种情况，它允许设置自定义转义规则、分隔符、行分隔符及开始/结束符号。

假设我们在文件中有以下数据：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

我们可以看到，单个行用 `row()` 包裹，行通过 `,` 分隔，个别值用 `;` 分隔。在这种情况下，我们可以使用以下设置从该文件读取数据：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

现在我们可以从我们自定义格式的 [file](assets/data_small_custom.txt) 中加载数据：

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

我们还可以使用 [CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames) 正确导出和导入标题。探索 [正则表达式和模板](templates-regex.md) 格式以处理更复杂的情况。


## 处理大型 CSV 文件 {#working-with-large-csv-files}

CSV 文件可能很大，ClickHouse 可以高效处理任何大小的文件。大型文件通常是压缩的，ClickHouse 可以直接处理压缩的文件，无需先进行解压。在插入时可以使用 `COMPRESSION` 子句：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

如果忽略 `COMPRESSION` 子句，ClickHouse 仍将根据文件扩展名尝试猜测文件的压缩。导出文件直接到压缩格式也可以使用相同的方法：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

这将创建一个压缩的 `data_csv.csv.gz` 文件。

## 其他格式 {#other-formats}

ClickHouse 引入对多种格式的支持，包括文本格式和二进制格式，以涵盖各种场景和平台。在以下文章中探索更多格式以及如何使用它们：

- **CSV 和 TSV 格式**
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一个便携式全功能工具，用于在不需要 ClickHouse 服务器的情况下处理本地/远程文件。
