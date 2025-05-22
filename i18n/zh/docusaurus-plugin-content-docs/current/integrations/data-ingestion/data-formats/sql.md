
# 在 ClickHouse 中插入和转储 SQL 数据

ClickHouse 可以通过多种方式轻松集成到 OLTP 数据库基础设施中。其中一种方法是使用 SQL 转储在其他数据库与 ClickHouse 之间传输数据。

## 创建 SQL 转储 {#creating-sql-dumps}

可以使用 [SQLInsert](/interfaces/formats.md/#sqlinsert) 以 SQL 格式转储数据。ClickHouse 将以 `INSERT INTO <table name> VALUES(...` 形式写入数据，并使用 [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 设置选项作为表名：

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

现在我们可以将 [dump.sql](assets/dump.sql) 文件传输给另一个 OLTP 数据库：

```bash
mysql some_db < dump.sql
```

我们假设 `some_table` 表存在于 `some_db` MySQL 数据库中。

一些 DBMS 可能对单个批处理能处理的值的数量有限制。默认情况下，ClickHouse 将创建 65k 值的批处理，但可以通过 [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) 选项进行更改：

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 导出一组值 {#exporting-a-set-of-values}

ClickHouse 具有 [Values](/interfaces/formats.md/#data-format-values) 格式，它类似于 SQLInsert，但省略了 `INSERT INTO table VALUES` 部分，仅返回一组值：

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```
```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## 从 SQL 转储插入数据 {#inserting-data-from-sql-dumps}

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

默认情况下，ClickHouse 将跳过未知列（由 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 选项控制），并处理转储中找到的第一个表的数据（如果多个表转储到单个文件中）。DDL 语句将被跳过。要将数据从 MySQL 转储加载到表中（[mysql.sql](assets/mysql.sql) 文件）：

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

我们还可以根据 MySQL 转储文件自动创建一个表：

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

在这里，我们创建了一个名为 `table_from_mysql` 的表，基于 ClickHouse 自动推断的结构。ClickHouse 通过数据检测类型或在可用时使用 DDL：

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

ClickHouse 支持多种格式，包括文本和二进制，以覆盖各种场景和平台。在以下文章中探索更多格式和使用它们的方法：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- [原生和二进制格式](binary.md)
- **SQL 格式**

还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一种便携式全功能工具，可以在不需要 ClickHouse 服务器的情况下处理本地/远程文件。
