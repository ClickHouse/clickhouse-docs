---
'sidebar_position': 3
'sidebar_label': '选择数据'
'title': '选择 ClickHouse 数据'
'slug': '/guides/writing-queries'
'description': '了解有关选择 ClickHouse 数据的内容'
---



ClickHouse 是一个 SQL 数据库，您可以通过编写您已经熟悉的相同类型的 `SELECT` 查询来查询数据。例如：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
查看 [SQL 参考](../sql-reference/statements/select/index.md) 以获取有关语法和可用子句及选项的更多详细信息。
:::

请注意，响应以良好的表格格式返回：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

添加 `FORMAT` 子句以指定 [ClickHouse 支持的多种输出格式](../interfaces/formats.md) 中的一种：
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

在上述查询中，输出以制表符分隔的形式返回：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse 支持超过 70 种输入和输出格式，因此在成千上万的函数和所有数据格式之间，您可以使用 ClickHouse 执行一些令人印象深刻且快速的 ETL 类数据转换。事实上，您甚至不需要运行中的 ClickHouse 服务器来转换数据 - 您可以使用 `clickhouse-local` 工具。查看 [`clickhouse-local` 的文档页](../operations/utilities/clickhouse-local.md) 以获取详细信息。
:::
