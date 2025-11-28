---
sidebar_label: 'SQL 转储'
slug: /integrations/data-formats/sql
title: '在 ClickHouse 中插入和转储 SQL 数据'
description: '介绍如何使用 SQL 转储在其他数据库与 ClickHouse 之间传输数据的页面。'
doc_type: 'guide'
keywords: ['SQL 格式', '数据导出', '数据导入', '备份', 'SQL 转储']
---



# 在 ClickHouse 中插入和导出 SQL 数据

ClickHouse 可以通过多种方式轻松集成到 OLTP 数据库基础架构中。其中一种方式是使用 SQL 转储文件在其他数据库与 ClickHouse 之间传输数据。



## 创建 SQL 转储

可以使用 [SQLInsert](/interfaces/formats/SQLInsert) 以 SQL 格式导出数据。ClickHouse 会以 `INSERT INTO <table name> VALUES(...` 的形式输出数据，并使用 [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 设置项作为表名：

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

可以通过禁用 [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) 选项来省略列名：

```sql
SET output_format_sql_insert_include_column_names = 0
```

现在我们可以将 [dump.sql](assets/dump.sql) 文件导入到另一个 OLTP 数据库中：

```bash
mysql some_db < dump.sql
```

我们假设在 MySQL 数据库 `some_db` 中已经存在表 `some_table`。

某些 DBMS 可能会对单个批次中可处理的值的数量施加限制。默认情况下，ClickHouse 会将值划分为每批 65k 个的批次，但可以通过 [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) 选项进行调整：

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 导出一组值

ClickHouse 提供了一种 [Values](/interfaces/formats/Values) 格式，类似于 SQL INSERT，但会省略 `INSERT INTO table VALUES` 部分，仅返回一组值：

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## 从 SQL 转储中插入数据

要读取 SQL 转储文件，使用 [MySQLDump](/interfaces/formats/MySQLDump)：

```sql
SELECT *
FROM file('dump.sql', MySQLDump)
LIMIT 5
```

```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

默认情况下，ClickHouse 会跳过未知列（由 [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 选项控制），并处理转储中首先找到的表的数据（当多个表被转储到同一个文件时）。DDL 语句会被忽略。要将 MySQL 转储中的数据加载到表中（[mysql.sql](assets/mysql.sql) 文件）：

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

我们也可以直接根据 MySQL dump 文件自动创建表：

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

在这里，我们基于 ClickHouse 自动推断出的结构创建了一个名为 `table_from_mysql` 的表。ClickHouse 要么根据数据推断类型，要么在有可用 DDL 时使用该 DDL：

```sql
DESCRIBE TABLE table_from_mysql;
```

```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date32) │              │                    │         │                  │                │
│ hits  │ Nullable(UInt32) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


## 其他格式 {#other-formats}

ClickHouse 支持多种格式，包括文本格式和二进制格式，以适配各种场景和平台。可以在以下文章中了解更多格式以及使用它们的方式：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [Native 与二进制格式](binary.md)
- **SQL 格式**

同时也可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 一个可移植的、功能完备的工具，可在无需 ClickHouse 服务器的情况下处理本地/远程文件。
