---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: '在 ClickHouse 中使用 Parquet'
description: '本文介绍如何在 ClickHouse 中使用 Parquet'
doc_type: 'guide'
keywords: ['parquet', '列式格式', '数据格式', '压缩', 'Apache Parquet']
---

# 在 ClickHouse 中使用 Parquet \{#working-with-parquet-in-clickhouse\}

Parquet 是一种高效的文件格式，用于以列式方式存储数据。
ClickHouse 支持读取和写入 Parquet 文件。

:::tip
在查询中引用文件路径时，ClickHouse 实际尝试读取的位置取决于你所使用的 ClickHouse 运行方式。

如果你使用的是 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)，它会从相对于你启动 ClickHouse Local 时所在位置的路径进行读取。
如果你是通过 `clickhouse client` 使用 ClickHouse Server 或 ClickHouse Cloud，它会从相对于服务器上 `/var/lib/clickhouse/user_files/` 目录的路径进行读取。
:::

## 从 Parquet 导入 \{#importing-from-parquet\}

在加载数据之前，我们可以使用 [file()](/sql-reference/functions/files.md/#file) 函数来查看[示例 Parquet 文件](assets/data.parquet)的结构：

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

我们将 [Parquet](/interfaces/formats/Parquet) 作为第二个参数，以便 ClickHouse 能识别文件格式。这将输出包含数据类型的各列：

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

我们还可以在实际导入数据之前，充分利用 SQL 的强大功能来探索文件：

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
对于 `file()` 和 `INFILE`/`OUTFILE`，我们可以不显式指定格式。
在这种情况下，ClickHouse 会根据文件扩展名自动检测格式。
:::

## 导入到现有表 \{#importing-to-an-existing-table\}

我们先创建一个用于导入 Parquet 数据的表：

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

请注意 ClickHouse 如何自动将 Parquet 字符串（`date` 列中的值）转换为 `Date` 类型。这是因为 ClickHouse 会根据目标表中的列类型自动进行类型转换。

## 将本地文件插入到远程服务器 \{#inserting-a-local-file-to-remote-server\}

如果您想将本地 Parquet 文件插入到远程 ClickHouse 服务器，可以像下面这样通过管道将文件内容传递给 `clickhouse-client`：

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## 基于 Parquet 文件创建新表 \{#creating-new-tables-from-parquet-files\}

由于 ClickHouse 能读取 Parquet 文件的 schema，我们可以动态创建表：

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

这将基于指定的 Parquet 文件自动创建并填充一张数据表：

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

默认情况下，ClickHouse 对列名、类型和值要求非常严格。但在某些情况下，我们可以在导入时跳过不存在的列或不支持的值。可以通过 [Parquet 设置](/interfaces/formats/Parquet#format-settings) 来控制这一行为。

## 导出为 Parquet 格式 \{#exporting-to-parquet-format\}

:::tip
在 ClickHouse Cloud 中使用 `INTO OUTFILE` 时，需要在将要写入该文件的那台机器上，通过 `clickhouse client` 来运行这些命令。
:::

要将任意表或查询结果导出为 Parquet 文件，可以使用 `INTO OUTFILE` 子句：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

这将在当前工作目录中创建 `export.parquet` 文件。

## ClickHouse 与 Parquet 数据类型 \{#clickhouse-and-parquet-data-types\}

ClickHouse 与 Parquet 的数据类型在大多数情况下是相同的，但仍然[存在一些差异](/interfaces/formats/Parquet#data-types-matching-parquet)。例如，ClickHouse 会将 `DateTime` 类型导出为 Parquet 的 `int64`。如果我们随后再将该数据导入回 ClickHouse，看到的将是一串数字（[time.parquet 文件](assets/time.parquet)）：

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

在这种情况下，可以使用[type conversion](/sql-reference/functions/type-conversion-functions.md)：

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

## 延伸阅读 \{#further-reading\}

ClickHouse 支持多种格式，包括文本和二进制格式，以适配各种场景和平台。请在以下文章中了解更多格式以及使用它们的方法：

* [CSV 和 TSV 格式](csv-tsv.md)
* [Avro、Arrow 和 ORC](arrow-avro-orc.md)
* [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
* [正则表达式和模板](templates-regex.md)
* [原生和二进制格式](binary.md)
* [SQL 格式](sql.md)

还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)——一个可移植且功能完备的工具，可在无需 ClickHouse 服务器的情况下处理本地/远程文件。
