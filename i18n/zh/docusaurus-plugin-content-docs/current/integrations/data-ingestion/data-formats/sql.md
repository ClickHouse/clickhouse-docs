---
'sidebar_label': 'SQL 转储'
'slug': '/integrations/data-formats/sql'
'title': '在 ClickHouse 中插入和转储 SQL 数据'
'description': '页面描述如何使用 SQL 转储在其他 DATABASE 和 ClickHouse 之间传输数据。'
---


# 在 ClickHouse 中插入和导出 SQL 数据

ClickHouse 可以通过多种方式轻松集成到 OLTP 数据库基础设施中。一种方法是使用 SQL 转储在其他数据库和 ClickHouse 之间传输数据。

## 创建 SQL 转储 {#creating-sql-dumps}

数据可以使用 [SQLInsert](/interfaces/formats.md/#sqlinsert) 以 SQL 格式转储。ClickHouse 将以 `INSERT INTO <table name> VALUES(...` 形式写入数据，并使用 [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 设置选项作为表名：

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

通过禁用 [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) 选项可以省略列名：

```sql
SET output_format_sql_insert_include_column_names = 0
```

现在我们可以将 [dump.sql](assets/dump.sql) 文件提供给另一个 OLTP 数据库：

```bash
mysql some_db < dump.sql
```

我们假设 `some_table` 表存在于 `some_db` MySQL 数据库中。

某些 DBMS 可能限制在单个批次中可以处理多少值。默认情况下，ClickHouse 将创建 65k 值的批次，但可以通过 [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) 选项进行更改：

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 导出一组值 {#exporting-a-set-of-values}

ClickHouse 有 [Values](/interfaces/formats.md/#data-format-values) 格式，它类似于 SQLInsert，但省略了 `INSERT INTO table VALUES` 部分，并仅返回一组值：

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```
```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```

## 从 SQL 转储中插入数据 {#inserting-data-from-sql-dumps}

要读取 SQL 转储，使用 [MySQLDump](/interfaces/formats.md/#mysqldump)：

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

默认情况下，ClickHouse 将跳过未知列（由 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 选项控制）并处理转储中第一个找到的表的数据（如果多个表被转储到一个文件中）。DDL 语句将被跳过。要将数据从 MySQL 转储加载到表中（[mysql.sql](assets/mysql.sql) 文件）：

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

我们还可以从 MySQL 转储文件自动创建一个表：

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

在这里，我们根据 ClickHouse 自动推测的结构创建了一个名为 `table_from_mysql` 的表。ClickHouse 会根据数据检测类型或在可用时使用 DDL：

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

ClickHouse 支持多种文本和二进制格式，以涵盖各种场景和平台。请在以下文章中探索更多格式及其使用方法：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [本地和二进制格式](binary.md)
- **SQL 格式**

同时查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一款便携式的全功能工具，可在无需 ClickHouse 服务器的情况下处理本地/远程文件。
