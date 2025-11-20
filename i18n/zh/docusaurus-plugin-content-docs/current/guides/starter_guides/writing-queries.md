---
sidebar_position: 3
sidebar_label: '选择数据'
title: '选择 ClickHouse 数据'
slug: /guides/writing-queries
description: '了解如何在 ClickHouse 中查询数据'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse 是一款 SQL 数据库，您可以像使用其他数据库一样，通过编写熟悉的 `SELECT` 查询来访问数据。例如：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
有关语法以及可用子句和选项的更多详细信息，请参阅 [SQL Reference](/sql-reference/statements/select)。
:::

可以看到，返回结果是一个格式良好的表格：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ 每批次插入大量行                                    │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ 根据常用查询对数据进行排序                          │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ 你好,ClickHouse!                                   │ 2022-03-22 14:04:09 │      -1 │
│     101 │ 颗粒是读取数据的最小块                              │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

返回 4 行。耗时:0.008 秒。
```

添加 `FORMAT` 子句，以指定 [ClickHouse 支持的多种输出格式](/interfaces/formats#formats-overview) 之一：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

在上述查询中，输出结果以制表符分隔的形式返回：

```response
查询 ID: 3604df1c-acfd-4117-9c56-f86c69721121

102 每批插入大量行      2022-03-21 00:00:00     1.41421
102 根据常用查询对数据进行排序  2022-03-22 00:00:00     2.718
101 你好,ClickHouse!  2022-03-22 14:04:09     -1
101 颗粒是读取的最小数据块       2022-03-22 14:04:14     3.14159

4 行结果集。用时:0.005 秒。
```

:::note
ClickHouse 支持超过 70 种输入和输出格式，因此配合数千个函数和所有这些数据格式，你可以使用 ClickHouse 执行高效而强大的类 ETL 数据转换。实际上，你甚至不需要运行中的 ClickHouse 服务器就能转换数据——可以直接使用 `clickhouse-local` 工具。详情请参见 [`clickhouse-local` 文档页面](/interfaces/cli)。
:::
