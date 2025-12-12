---
sidebar_label: 'CSV 与 TSV'
slug: /integrations/data-formats/csv-tsv
title: '在 ClickHouse 中使用 CSV 和 TSV 数据'
description: '介绍如何在 ClickHouse 中使用 CSV 和 TSV 数据的页面'
keywords: ['CSV 格式', 'TSV 格式', '逗号分隔值', '制表符分隔值', '数据导入']
doc_type: 'guide'
---

# 在 ClickHouse 中处理 CSV 和 TSV 数据 {#working-with-csv-and-tsv-data-in-clickhouse}

ClickHouse 支持从 CSV 导入数据并导出为 CSV。由于 CSV 文件在具体格式上可能有所不同，包括表头行、自定义分隔符以及转义符号，ClickHouse 提供了相应的格式和设置，以高效处理每种情况。

## 从 CSV 文件导入数据 {#importing-data-from-a-csv-file}

在导入数据之前，先创建一个具有合适表结构的表：

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

要将 [CSV 文件](assets/data_small.csv) 中的数据导入到 `sometable` 表中，我们可以通过管道将该文件直接传递给 clickhouse-client 客户端程序：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

请注意，我们使用 [FORMAT CSV](/interfaces/formats/CSV) 来让 ClickHouse 确认我们正在摄取 CSV 格式的数据。或者，我们也可以使用 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据：

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

在这里，我们使用 `FORMAT CSV` 子句，让 ClickHouse 能够识别文件格式。我们也可以使用 [url()](/sql-reference/table-functions/url.md) 函数直接从 URL 加载数据，或者使用 [s3()](/sql-reference/table-functions/s3.md) 函数从 S3 文件加载数据。

:::tip
对于 `file()` 和 `INFILE`/`OUTFILE`，我们可以省略显式指定格式。
在这种情况下，ClickHouse 会根据文件扩展名自动检测格式。
:::

### 带表头的 CSV 文件 {#csv-files-with-headers}

假设我们的 [CSV 文件包含表头](assets/data_small_headers.csv)：

```bash
head data-small-headers.csv
```

```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

要从该文件导入数据，我们可以使用 [CSVWithNames](/interfaces/formats/CSVWithNames) 格式：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

在这种情况下，ClickHouse 在从文件导入数据时会跳过第一行。

:::tip
从 [23.1 版本](https://github.com/ClickHouse/ClickHouse/releases) 开始，在使用 `CSV` 格式时，ClickHouse 会自动检测 CSV 文件中的表头，因此不再需要使用 `CSVWithNames` 或 `CSVWithNamesAndTypes`。
:::

### 使用自定义分隔符的 CSV 文件 {#csv-files-with-custom-delimiters}

如果 CSV 文件使用的分隔符不是逗号，则可以使用 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 选项来设置相应的分隔符字符：

```sql
SET format_csv_delimiter = ';'
```

现在，当我们从 CSV 文件导入数据时，会使用 `;` 号作为分隔符，而不是逗号。

### 在 CSV 文件中跳过行 {#skipping-lines-in-a-csv-file}

有时，在从 CSV 文件导入数据时，我们可能需要跳过开头的若干行。这可以通过 [input&#95;format&#95;csv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) 选项来实现：

```sql
SET input_format_csv_skip_first_lines = 10
```

在本例中，我们将跳过 CSV 文件的前 10 行：

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

该 [文件](assets/data_small.csv) 有 1000 行，但 ClickHouse 只加载了 990 行，因为我们要求跳过前 10 行。

:::tip
在配合 ClickHouse Cloud 使用 `file()` 函数时，您需要在文件所在的机器上通过 `clickhouse client` 来运行这些命令。另一种方式是使用 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 在本地查看文件。
:::

### 处理 CSV 文件中的 NULL 值 {#treating-null-values-in-csv-files}

NULL 值的编码方式会因生成文件的应用不同而有所差异。默认情况下，ClickHouse 在 CSV 中使用 `\N` 表示 NULL 值。但我们可以通过 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 这个选项来修改该行为。

假设我们有如下所示的 CSV 文件：

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

如果我们从这个文件加载数据，ClickHouse 会将 `Nothing` 当作字符串（这是正确的）：

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

如果希望 ClickHouse 将 `Nothing` 视为 `NULL`，可以通过以下选项进行定义：

```sql
SET format_csv_null_representation = 'Nothing'
```

现在我们如预期那样得到了 `NULL`：

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

## TSV（制表符分隔）文件 {#tsv-tab-separated-files}

制表符分隔的数据格式是一种常用的数据交换格式。要将 [TSV 文件](assets/data_small.tsv) 中的数据加载到 ClickHouse，需要使用 [TabSeparated](/interfaces/formats/TabSeparated) 格式：

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

还提供一种 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) 格式，可用于处理带有表头的 TSV 文件。而且，与 CSV 一样，我们可以使用 [input&#95;format&#95;tsv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) 选项跳过前 X 行。

### 原始 TSV {#raw-tsv}

有时，TSV 文件在保存时没有对制表符和换行符进行转义。这种情况下，应使用 [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw) 来处理此类文件。

## 导出为 CSV {#exporting-to-csv}

我们在前面示例中使用的任何格式也可用于导出数据。要将表（或查询）中的数据导出为 CSV 格式，我们使用相同的 `FORMAT` 子句：

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

要为 CSV 文件添加表头，我们使用 [CSVWithNames](/interfaces/formats/CSVWithNames) 格式：

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

### 将导出的数据保存到 CSV 文件 {#saving-exported-data-to-a-csv-file}

要将导出的数据保存到文件中，可以使用 [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

请注意，ClickHouse 将 3600 万行保存到一个 CSV 文件中只花了大约 **1** 秒。

### 使用自定义分隔符导出 CSV {#exporting-csv-with-custom-delimiters}

如果我们希望使用非逗号分隔符，可以使用 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置选项来实现：

```sql
SET format_csv_delimiter = '|'
```

现在 ClickHouse 会使用 `|` 作为 CSV 格式的分隔符：

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

如果希望 CSV 文件在 Windows 环境中正常使用，可以启用 [output&#95;format&#95;csv&#95;crlf&#95;end&#95;of&#95;line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) 选项。这样会使用 `\r\n` 作为换行符，而不是 `\n`：

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## 针对 CSV 文件的模式推断 {#schema-inference-for-csv-files}

在很多情况下，我们可能会处理结构未知的 CSV 文件，因此需要确定各列应使用哪些数据类型。ClickHouse 默认会根据对给定 CSV 文件的分析来推断数据格式，这被称为“模式推断（Schema Inference）”。可以结合使用 `DESCRIBE` 语句和 [file()](/sql-reference/table-functions/file.md) 函数来查看推断出的数据类型：

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

此处，ClickHouse 能高效地推断我们 CSV 文件中的列类型。如果我们不希望 ClickHouse 进行推断，可以通过以下选项禁用该功能：

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

在这种情况下，所有列的类型都会被视为 `String`。

### 使用显式列类型导出和导入 CSV {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse 还允许在使用 [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)（以及其他 *WithNames 系列格式）导出数据时，显式设置列类型：

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

这种格式将包含两行表头：第一行为列名，第二行为列类型。这样 ClickHouse（以及其他应用）在从[此类文件](assets/data_csv_types.csv)加载数据时就可以识别列类型：

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

现在，ClickHouse 会根据（第二行）表头行来确定列类型，而不再依赖猜测。

## 自定义分隔符、分隔标记和转义规则 {#custom-delimiters-separators-and-escaping-rules}

在更复杂的场景中，文本数据可以采用高度自定义的格式，但仍然保持一定的结构。ClickHouse 为此类场景提供了专用的 [CustomSeparated](/interfaces/formats/CustomSeparated) 格式，它允许设置自定义的转义规则、分隔符、行分隔符以及起始/结束符号。

假设我们在文件中有如下数据：

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

我们可以看到，每一行都被包裹在 `row()` 中，各行之间用 `,` 分隔，单个值则用 `;` 分隔。在这种情况下，我们可以使用以下设置从该文件中读取数据：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

现在我们可以从自定义格式的 [文件](assets/data_small_custom.txt) 中加载数据：

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

我们也可以使用 [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames) 来正确导出和导入表头。要处理更复杂的情况，请查看 [regex and template](templates-regex.md) 格式。

## 处理大型 CSV 文件 {#working-with-large-csv-files}

CSV 文件可能会很大，而 ClickHouse 能高效处理任意大小的文件。大型文件通常是压缩的，ClickHouse 可以直接处理，无需事先解压缩。我们可以在执行插入操作时使用 `COMPRESSION` 子句：

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

如果省略 `COMPRESSION` 子句，ClickHouse 仍会尝试根据文件扩展名自动识别压缩格式。可以使用同样的方法将文件直接导出为压缩格式：

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

这将生成压缩的 `data_csv.csv.gz` 文件。

## 其他格式 {#other-formats}

ClickHouse 支持多种格式，包括文本和二进制格式，以满足各种场景和平台的需求。请在以下文章中探索更多格式及其使用方式：

- **CSV 和 TSV 格式**
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

另外也可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)——一个无需 ClickHouse 服务器即可处理本地/远程文件的功能完备的便携式工具。
