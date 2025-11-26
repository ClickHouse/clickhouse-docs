---
sidebar_position: 3
sidebar_label: '查询数据'
title: '查询 ClickHouse 数据'
slug: /guides/writing-queries
description: '了解如何查询 ClickHouse 数据'
keywords: ['SELECT', '数据格式']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse 是一款 SQL 数据库，你可以像以往一样，通过编写你已经熟悉的 `SELECT` 查询语句来查询数据。例如：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
查看 [SQL 参考文档](/sql-reference/statements/select)，以获取有关语法以及可用子句和选项的更多详细信息。
:::

注意，返回结果是整齐的表格格式：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ 每批次插入大量行                                    │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ 根据常用查询对数据进行排序                          │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ 你好,ClickHouse!                                   │ 2022-03-22 14:04:09 │      -1 │
│     101 │ 颗粒是读取的最小数据块                              │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

返回 4 行。耗时:0.008 秒。
```

添加 `FORMAT` 子句，以指定 [ClickHouse 支持的众多输出格式中的一种](/interfaces/formats#formats-overview)：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

在上述查询中，结果以制表符分隔的形式输出：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 每批插入大量行      2022-03-21 00:00:00     1.41421
102 根据常用查询对数据进行排序  2022-03-22 00:00:00     2.718
101 你好,ClickHouse!  2022-03-22 14:04:09     -1
101 Granule 是读取数据的最小块       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse 支持 70 多种输入和输出格式，因此配合上千个函数和各种数据格式，你可以使用 ClickHouse 执行高效而强大的类 ETL 式数据转换。实际上，你甚至不需要有正在运行的 ClickHouse 服务器就能转换数据——你可以使用 `clickhouse-local` 工具。详情请参阅 [`clickhouse-local` 的文档页面](/interfaces/cli)。
:::
