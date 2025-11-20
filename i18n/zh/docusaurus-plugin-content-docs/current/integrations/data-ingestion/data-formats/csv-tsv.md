---
sidebar_label: 'CSV 和 TSV'
slug: /integrations/data-formats/csv-tsv
title: '在 ClickHouse 中处理 CSV 和 TSV 数据'
description: '介绍如何在 ClickHouse 中处理 CSV 和 TSV 数据的页面'
keywords: ['CSV format', 'TSV format', 'comma separated values', 'tab separated values', 'data import']
doc_type: 'guide'
---



# 在 ClickHouse 中处理 CSV 和 TSV 数据

ClickHouse 支持从 CSV 导入数据并导出为 CSV。由于 CSV 文件在格式细节上可能有所不同，包括表头行、自定义分隔符以及转义符，ClickHouse 提供了相应的格式和设置，以高效处理各种情况。



## 从 CSV 文件导入数据 {#importing-data-from-a-csv-file}

在导入数据之前,我们先创建一个具有相应结构的表:

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

要将 [CSV 文件](assets/data_small.csv) 中的数据导入到 `sometable` 表,我们可以直接通过管道将文件传输到 clickhouse-client:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

注意,我们使用 [FORMAT CSV](/interfaces/formats/CSV) 来告知 ClickHouse 我们正在导入 CSV 格式的数据。或者,我们也可以使用 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据:

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

在这里,我们使用 `FORMAT CSV` 子句让 ClickHouse 识别文件格式。我们还可以使用 [url()](/sql-reference/table-functions/url.md) 函数直接从 URL 加载数据,或使用 [s3()](/sql-reference/table-functions/s3.md) 函数从 S3 文件加载数据。

:::tip
对于 `file()` 和 `INFILE`/`OUTFILE`,我们可以省略显式的格式设置。
在这种情况下,ClickHouse 将根据文件扩展名自动检测格式。
:::

### 带标题的 CSV 文件 {#csv-files-with-headers}

假设我们的 [CSV 文件包含标题行](assets/data_small_headers.csv):

```bash
head data-small-headers.csv
```

```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

要从此文件导入数据,我们可以使用 [CSVWithNames](/interfaces/formats/CSVWithNames) 格式:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

在这种情况下,ClickHouse 在导入数据时会跳过第一行。

:::tip
从 [版本](https://github.com/ClickHouse/ClickHouse/releases) 23.1 开始,ClickHouse 在使用 `CSV` 格式时会自动检测 CSV 文件中的标题行,因此无需使用 `CSVWithNames` 或 `CSVWithNamesAndTypes`。
:::

### 使用自定义分隔符的 CSV 文件 {#csv-files-with-custom-delimiters}

如果 CSV 文件使用逗号以外的分隔符,我们可以使用 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 选项来设置相应的符号:

```sql
SET format_csv_delimiter = ';'
```

现在,当我们从 CSV 文件导入数据时,`;` 符号将被用作分隔符,而不是逗号。

### 跳过 CSV 文件中的行 {#skipping-lines-in-a-csv-file}

有时,我们可能需要在从 CSV 文件导入数据时跳过一定数量的行。这可以使用 [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) 选项来实现:

```sql
SET input_format_csv_skip_first_lines = 10
```

在这种情况下,我们将跳过 CSV 文件的前十行:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

该 [文件](assets/data_small.csv) 有 1000 行,但 ClickHouse 只加载了 990 行,因为我们要求跳过前 10 行。

:::tip
在 ClickHouse Cloud 中使用 `file()` 函数时,您需要在文件所在的机器上通过 `clickhouse client` 运行命令。另一个选项是使用 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 在本地探索文件。
:::

### 处理 CSV 文件中的 NULL 值 {#treating-null-values-in-csv-files}

根据生成文件的应用程序不同,NULL 值可以有不同的编码方式。默认情况下,ClickHouse 在 CSV 中使用 `\N` 表示 NULL 值。但我们可以使用 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 选项来更改它。

假设我们有以下 CSV 文件:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```


如果我们从这个文件加载数据，ClickHouse 会将 `Nothing` 视为 String 类型（这是正确的）：

```sql
SELECT * FROM file('nulls.csv')
```

```response
┌─c1──────┬─c2──────┐
│ Donald  │ 90      │
│ Joe     │ 无 │
│ 无 │ 70      │
└─────────┴─────────┘
```

如果希望 ClickHouse 将 `Nothing` 当作 `NULL` 处理，可以使用以下选项进行设置：

```sql
SET format_csv_null_representation = 'Nothing'
```

现在我们在预期的位置看到了 `NULL`：

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


## TSV(制表符分隔)文件 {#tsv-tab-separated-files}

制表符分隔数据格式被广泛用作数据交换格式。要将 [TSV 文件](assets/data_small.tsv) 中的数据加载到 ClickHouse,可使用 [TabSeparated](/interfaces/formats/TabSeparated) 格式:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

此外还有 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) 格式,用于处理带有表头的 TSV 文件。与 CSV 类似,可以使用 [input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) 选项跳过前 X 行。

### 原始 TSV {#raw-tsv}

有时 TSV 文件在保存时不会对制表符和换行符进行转义。对于此类文件,应使用 [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw) 格式来处理。


## 导出为 CSV {#exporting-to-csv}

前面示例中的任何格式都可以用于导出数据。要将表(或查询)中的数据导出为 CSV 格式,我们使用相同的 `FORMAT` 子句:

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

要为 CSV 文件添加标题行,我们使用 [CSVWithNames](/interfaces/formats/CSVWithNames) 格式:

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

要将导出的数据保存到文件,可以使用 [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

注意 ClickHouse 仅用了 **约 1** 秒就将 3600 万行数据保存到 CSV 文件中。

### 使用自定义分隔符导出 CSV {#exporting-csv-with-custom-delimiters}

如果想使用逗号以外的分隔符,可以使用 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 设置选项:

```sql
SET format_csv_delimiter = '|'
```

现在 ClickHouse 将使用 `|` 作为 CSV 格式的分隔符:

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

如果希望 CSV 文件在 Windows 环境中正常工作,应该考虑启用 [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) 选项。这将使用 `\r\n` 作为换行符,而不是 `\n`:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```


## CSV 文件的模式推断 {#schema-inference-for-csv-files}

在许多情况下,我们可能需要处理未知的 CSV 文件,因此必须确定列应使用哪些类型。默认情况下,ClickHouse 会尝试根据对给定 CSV 文件的分析来推断数据格式。这称为"模式推断"。可以使用 `DESCRIBE` 语句配合 [file()](/sql-reference/table-functions/file.md) 函数来查看检测到的数据类型:

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

在这里,ClickHouse 能够有效地推断出我们 CSV 文件的列类型。如果不希望 ClickHouse 进行推断,可以使用以下选项禁用此功能:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

在这种情况下,所有列类型都将被视为 `String`。

### 使用显式列类型导出和导入 CSV {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse 还允许在使用 [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)(以及其他 \*WithNames 格式系列)导出数据时显式设置列类型:

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

此格式将包含两个标题行——一个包含列名,另一个包含列类型。这将允许 ClickHouse(和其他应用程序)在从[此类文件](assets/data_csv_types.csv)加载数据时识别列类型:

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

现在 ClickHouse 基于(第二个)标题行识别列类型,而不是进行推断。


## 自定义分隔符、分隔符和转义规则 {#custom-delimiters-separators-and-escaping-rules}

在复杂场景中,文本数据可能采用高度自定义的格式,但仍保持一定的结构。ClickHouse 为此类场景提供了专门的 [CustomSeparated](/interfaces/formats/CustomSeparated) 格式,允许设置自定义的转义规则、分隔符、行分隔符以及起始/结束符号。

假设文件中包含以下数据:

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

可以看到,每一行数据都被包裹在 `row()` 中,行与行之间用 `,` 分隔,各个字段值用 `;` 分隔。在这种情况下,我们可以使用以下设置从该文件读取数据:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

现在我们可以从自定义格式的[文件](assets/data_small_custom.txt)中加载数据:

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

我们还可以使用 [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames) 来正确导出和导入表头。如需处理更复杂的情况,可以探索[正则表达式和模板](templates-regex.md)格式。


## 处理大型 CSV 文件 {#working-with-large-csv-files}

CSV 文件可能很大,ClickHouse 能够高效处理任意大小的文件。大型文件通常以压缩格式提供,ClickHouse 可以直接处理而无需事先解压。我们可以在插入数据时使用 `COMPRESSION` 子句:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

如果省略 `COMPRESSION` 子句,ClickHouse 仍会尝试根据文件扩展名推断压缩格式。同样的方法也可用于直接导出压缩格式的文件:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

这将创建一个压缩的 `data_csv.csv.gz` 文件。


## 其他格式 {#other-formats}

ClickHouse 支持多种文本和二进制格式,以满足各种应用场景和平台需求。您可以在以下文章中了解更多格式及其使用方法:

- **CSV 和 TSV 格式**
- [Parquet](parquet.md)
- [JSON formats](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex and templates](templates-regex.md)
- [Native and binary formats](binary.md)
- [SQL formats](sql.md)

另外,您还可以了解 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 这是一个功能完整的便携式工具,无需 ClickHouse 服务器即可处理本地或远程文件。
