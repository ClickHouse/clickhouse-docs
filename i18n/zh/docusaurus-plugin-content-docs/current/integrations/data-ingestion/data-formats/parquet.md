---
'sidebar_label': 'Parquet'
'sidebar_position': 3
'slug': '/integrations/data-formats/parquet'
'title': '在ClickHouse中使用Parquet'
'description': '描述如何在ClickHouse中使用Parquet'
---




# 在 ClickHouse 中使用 Parquet

Parquet 是一种高效的文件格式，用于以列式方式存储数据。
ClickHouse 提供对读取和写入 Parquet 文件的支持。

:::tip
在查询中引用文件路径时，ClickHouse 读取的位置将取决于您使用的 ClickHouse 变体。

如果您使用的是 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)，它将从您启动 ClickHouse Local 的位置相对位置读取。
如果您通过 `clickhouse client` 使用 ClickHouse Server 或 ClickHouse Cloud，它将从服务器上的 `/var/lib/clickhouse/user_files/` 目录的相对位置读取。
:::

## 从 Parquet 导入 {#importing-from-parquet}

在加载数据之前，我们可以使用 [file()](/sql-reference/functions/files.md/#file) 函数来探索一个 [示例 parquet 文件](assets/data.parquet) 的结构：

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

我们使用了 [Parquet](/interfaces/formats.md/#data-format-parquet) 作为第二个参数，这样 ClickHouse 就知道文件格式。这将打印出列和类型：

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

我们还可以在实际导入数据之前使用 SQL 的所有功能探索文件：

```sql
SELECT *
FROM file('data.parquet', Parquet)
LIMIT 3;
```
```response
┌─path──────────────────────┬─date───────┬─hits─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
└───────────────────────────┴────────────┴──────┘
```

:::tip
我们可以跳过 `file()` 和 `INFILE`/`OUTFILE` 的显式格式设置。
在这种情况下，ClickHouse 将根据文件扩展名自动检测格式。
:::

## 导入到现有表中 {#importing-to-an-existing-table}

让我们创建一个表，以便导入 Parquet 数据：

```sql
CREATE TABLE sometable
(
    `path` String,
    `date` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (date, path);
```

现在我们可以使用 `FROM INFILE` 子句导入数据：

```sql
INSERT INTO sometable
FROM INFILE 'data.parquet' FORMAT Parquet;

SELECT *
FROM sometable
LIMIT 5;
```
```response
┌─path──────────────────────────┬───────date─┬─hits─┐
│ 1988_in_philosophy            │ 2015-05-01 │   70 │
│ 2004_Green_Bay_Packers_season │ 2015-05-01 │  970 │
│ 24_hours_of_lemans            │ 2015-05-01 │   37 │
│ 25604_Karlin                  │ 2015-05-01 │   20 │
│ ASCII_ART                     │ 2015-05-01 │    9 │
└───────────────────────────────┴────────────┴──────┘
```

请注意，ClickHouse 自动将 Parquet 字符串（在 `date` 列中）转换为 `Date` 类型。这是因为 ClickHouse 会根据目标表中的类型自动进行类型转换。

## 将本地文件插入到远程服务器 {#inserting-a-local-file-to-remote-server}

如果您想将本地 Parquet 文件插入到远程 ClickHouse 服务器，您可以通过将文件内容通过管道输送到 `clickhouse-client` 来实现，如下所示：

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## 从 Parquet 文件创建新表 {#creating-new-tables-from-parquet-files}

由于 ClickHouse 读取 parquet 文件模式，我们可以即时创建表：

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

这将自动从给定的 parquet 文件创建并填充一个表：

```sql
DESCRIBE TABLE imported_from_parquet;
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

默认情况下，ClickHouse 对列名、类型和值非常严格。但有时，我们可以在导入期间跳过不存在的列或不支持的值。这可以通过 [Parquet 设置](/interfaces/formats/Parquet#format-settings) 来管理。

## 导出到 Parquet 格式 {#exporting-to-parquet-format}

:::tip
在 ClickHouse Cloud 中使用 `INTO OUTFILE` 时，您需要在将文件写入的计算机上运行 `clickhouse client` 中的命令。
:::

要将任何表或查询结果导出到 Parquet 文件，我们可以使用 `INTO OUTFILE` 子句：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

这将在工作目录中创建 `export.parquet` 文件。

## ClickHouse 和 Parquet 数据类型 {#clickhouse-and-parquet-data-types}
ClickHouse 和 Parquet 数据类型大致相同，但仍然 [有一些区别](/interfaces/formats/Parquet#data-types-matching-parquet)。例如，ClickHouse 会将 `DateTime` 类型导出为 Parquet 的 `int64`。如果我们将其再导入到 ClickHouse，我们将看到数字（[time.parquet 文件](assets/time.parquet)）：

```sql
SELECT * FROM file('time.parquet', Parquet);
```
```response
┌─n─┬───────time─┐
│ 0 │ 1673622611 │
│ 1 │ 1673622610 │
│ 2 │ 1673622609 │
│ 3 │ 1673622608 │
│ 4 │ 1673622607 │
└───┴────────────┘
```

在这种情况下可以使用 [类型转换](/sql-reference/functions/type-conversion-functions.md)：

```sql
SELECT
    n,
    toDateTime(time)                 <--- int to time
FROM file('time.parquet', Parquet);
```
```response
┌─n─┬────toDateTime(time)─┐
│ 0 │ 2023-01-13 15:10:11 │
│ 1 │ 2023-01-13 15:10:10 │
│ 2 │ 2023-01-13 15:10:09 │
│ 3 │ 2023-01-13 15:10:08 │
│ 4 │ 2023-01-13 15:10:07 │
└───┴─────────────────────┘
```


## 进一步阅读 {#further-reading}

ClickHouse 引入了对多种格式的支持，包括文本和二进制，以涵盖各种场景和平台。请在以下文章中探索更多格式及其使用方式：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Avro、Arrow 和 ORC](arrow-avro-orc.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一个便携式的全功能工具，可以在不需要 Clickhouse 服务器的情况下处理本地/远程文件。
