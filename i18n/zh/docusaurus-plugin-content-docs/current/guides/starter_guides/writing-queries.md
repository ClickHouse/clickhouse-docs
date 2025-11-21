---
sidebar_position: 3
sidebar_label: '查询数据'
title: '查询 ClickHouse 数据'
slug: /guides/writing-queries
description: '了解如何查询 ClickHouse 数据'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse 是一款 SQL 数据库，可以通过编写与已熟悉的相同类型的 `SELECT` 查询来查询数据。例如：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
有关语法以及可用子句和选项的更多详细信息，请参阅 [SQL 参考](/sql-reference/statements/select)。
:::

可以看到，响应以一个格式良好的表格形式返回：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ 每批次插入大量数据行                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ 根据常用查询对数据进行排序 │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ 你好,ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ 颗粒是数据读取的最小单元      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

返回 4 行数据。用时:0.008 秒。
```

添加 `FORMAT` 子句来指定 [ClickHouse 支持的众多输出格式之一](/interfaces/formats#formats-overview)：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

在上述查询中，查询结果将以制表符分隔的格式返回：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 每批插入大量行      2022-03-21 00:00:00     1.41421
102 根据常用查询对数据进行排序  2022-03-22 00:00:00     2.718
101 你好,ClickHouse!  2022-03-22 14:04:09     -1
101 颗粒是读取数据的最小块       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse 支持超过 70 种输入和输出格式，配合成千上万的函数和所有这些数据格式，您可以使用 ClickHouse 执行令人印象深刻且高速的类 ETL 数据转换。实际上，即使没有正在运行的 ClickHouse 服务器，也可以使用 `clickhouse-local` 工具进行数据转换。详情参见 [`clickhouse-local` 文档页面](/interfaces/cli)。
:::
