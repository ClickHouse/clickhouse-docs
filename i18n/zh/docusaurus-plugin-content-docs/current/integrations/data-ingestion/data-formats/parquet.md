---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: '在 ClickHouse 中使用 Parquet'
description: '介绍如何在 ClickHouse 中使用 Parquet 的页面'
doc_type: 'guide'
keywords: ['parquet', '列式格式', '数据格式', '压缩', 'apache parquet']
---



# 在 ClickHouse 中使用 Parquet

Parquet 是一种高效的列式存储文件格式。
ClickHouse 支持读取和写入 Parquet 文件。

:::tip
在查询中引用文件路径时，ClickHouse 实际尝试读取的位置取决于您使用的 ClickHouse 版本/方式。

如果您使用的是 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)，它会从您启动 ClickHouse Local 的当前位置的相对路径读取文件。
如果您是通过 `clickhouse client` 使用 ClickHouse Server 或 ClickHouse Cloud，它会从服务器上 `/var/lib/clickhouse/user_files/` 目录的相对路径读取文件。
:::



## 从 Parquet 导入 {#importing-from-parquet}

在加载数据之前,我们可以使用 [file()](/sql-reference/functions/files.md/#file) 函数来查看[示例 parquet 文件](assets/data.parquet)的结构:

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

我们将 [Parquet](/interfaces/formats/Parquet) 作为第二个参数,这样 ClickHouse 就能识别文件格式。该命令将输出列及其类型:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

我们还可以在实际导入数据之前,利用 SQL 的全部功能来探索文件内容:

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
对于 `file()` 和 `INFILE`/`OUTFILE`,我们可以省略显式的格式设置。
在这种情况下,ClickHouse 将根据文件扩展名自动检测格式。
:::


## 导入到现有表 {#importing-to-an-existing-table}

首先创建一个表来导入 Parquet 数据:

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

现在可以使用 `FROM INFILE` 子句导入数据:

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

注意 ClickHouse 会自动将 Parquet 字符串(在 `date` 列中)转换为 `Date` 类型。这是因为 ClickHouse 会根据目标表中的类型自动执行类型转换。


## 将本地文件插入到远程服务器 {#inserting-a-local-file-to-remote-server}

如果您想将本地 Parquet 文件插入到远程 ClickHouse 服务器,可以通过管道将文件内容传递给 `clickhouse-client`,如下所示:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```


## 从 Parquet 文件创建新表 {#creating-new-tables-from-parquet-files}

由于 ClickHouse 能够读取 Parquet 文件的模式(schema),我们可以即时创建表:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

这将自动从指定的 Parquet 文件创建表并填充数据:

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

默认情况下,ClickHouse 对列名、类型和值的要求较为严格。但在某些情况下,我们可以在导入时跳过不存在的列或不支持的值。这可以通过 [Parquet 设置](/interfaces/formats/Parquet#format-settings)进行配置。


## 导出为 Parquet 格式 {#exporting-to-parquet-format}

:::tip
在 ClickHouse Cloud 中使用 `INTO OUTFILE` 时,需要在文件写入目标机器上运行 `clickhouse client` 命令。
:::

要将任何表或查询结果导出为 Parquet 文件,可以使用 `INTO OUTFILE` 子句:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

这将在工作目录中创建 `export.parquet` 文件。


## ClickHouse 与 Parquet 数据类型 {#clickhouse-and-parquet-data-types}

ClickHouse 与 Parquet 的数据类型大部分相同,但仍然[存在一些差异](/interfaces/formats/Parquet#data-types-matching-parquet)。例如,ClickHouse 会将 `DateTime` 类型导出为 Parquet 的 `int64` 类型。如果将其重新导入到 ClickHouse,将会看到数字([time.parquet 文件](assets/time.parquet)):

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

在这种情况下可以使用[类型转换](/sql-reference/functions/type-conversion-functions.md):

```sql
SELECT
    n,
    toDateTime(time)                 <--- int 转换为 time
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


## 延伸阅读 {#further-reading}

ClickHouse 支持多种文本和二进制格式,以满足各种应用场景和平台需求。您可以在以下文章中了解更多格式及其使用方法:

- [CSV 和 TSV 格式](csv-tsv.md)
- [Avro、Arrow 和 ORC](arrow-avro-orc.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- [SQL 格式](sql.md)

另外,您还可以了解 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 一个功能完备的便携式工具,无需 ClickHouse 服务器即可处理本地/远程文件。
