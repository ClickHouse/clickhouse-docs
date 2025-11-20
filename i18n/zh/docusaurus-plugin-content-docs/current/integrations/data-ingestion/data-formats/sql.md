---
sidebar_label: 'SQL 转储'
slug: /integrations/data-formats/sql
title: '在 ClickHouse 中插入和导出 SQL 数据'
description: '介绍如何使用 SQL 转储在其他数据库与 ClickHouse 之间传输数据的页面。'
doc_type: 'guide'
keywords: ['sql format', 'data export', 'data import', 'backup', 'sql dumps']
---



# 在 ClickHouse 中插入和导出 SQL 数据

ClickHouse 可以通过多种方式轻松集成到 OLTP 数据库基础设施中。其中一种方式是使用 SQL 转储文件在其他数据库与 ClickHouse 之间传输数据。



## 创建 SQL 转储 {#creating-sql-dumps}

可以使用 [SQLInsert](/interfaces/formats/SQLInsert) 格式将数据转储为 SQL 格式。ClickHouse 会以 `INSERT INTO <table name> VALUES(...` 的形式写入数据,并使用 [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 设置选项指定表名:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

可以通过禁用 [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) 选项来省略列名:

```sql
SET output_format_sql_insert_include_column_names = 0
```

现在可以将 [dump.sql](assets/dump.sql) 文件导入到其他 OLTP 数据库:

```bash
mysql some_db < dump.sql
```

这里假设 `some_table` 表已存在于 `some_db` MySQL 数据库中。

某些数据库管理系统可能对单个批次中可处理的值数量有限制。默认情况下,ClickHouse 会创建包含 65k 个值的批次,但可以通过 [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) 选项进行调整:

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 导出值集合 {#exporting-a-set-of-values}

ClickHouse 提供了 [Values](/interfaces/formats/Values) 格式,它类似于 SQLInsert,但省略了 `INSERT INTO table VALUES` 部分,仅返回值集合:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## 从 SQL 转储插入数据 {#inserting-data-from-sql-dumps}

要读取 SQL 转储,可以使用 [MySQLDump](/interfaces/formats/MySQLDump) 格式:

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

默认情况下,ClickHouse 会跳过未知列(由 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 选项控制),并处理转储中第一个找到的表的数据(当多个表被转储到单个文件时)。DDL 语句将被跳过。要从 MySQL 转储加载数据到表中([mysql.sql](assets/mysql.sql) 文件):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

我们也可以从 MySQL 转储文件自动创建表:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

这里我们创建了一个名为 `table_from_mysql` 的表,其结构由 ClickHouse 自动推断。ClickHouse 会根据数据检测类型,或在可用时使用 DDL:

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

ClickHouse 支持多种文本和二进制格式,以满足各种应用场景和平台需求。您可以在以下文章中了解更多格式及其使用方法:

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- **SQL 格式**

另外,您还可以了解 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 这是一个功能完整的便携式工具,无需 ClickHouse 服务器即可处理本地或远程文件。
