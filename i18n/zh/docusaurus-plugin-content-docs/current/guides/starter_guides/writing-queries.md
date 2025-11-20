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

ClickHouse 是一款 SQL 数据库，你可以使用自己已经熟悉的 `SELECT` 查询语句来查询数据。例如：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
有关语法以及可用子句和选项的更多信息，请参阅 [SQL 参考](/sql-reference/statements/select)。
:::

可以看到，返回结果是以整齐的表格形式展示的：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ 每批次插入大量数据行                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ 根据常用查询对数据进行排序 │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ 你好,ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ 颗粒是数据读取的最小单元      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

返回 4 行数据。用时:0.008 秒。
```

添加 `FORMAT` 子句来指定 [ClickHouse 支持的多种输出格式之一](/interfaces/formats#formats-overview)：

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

在上述查询中，输出结果以制表符分隔的格式返回：

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 每批次插入大量行      2022-03-21 00:00:00     1.41421
102 根据常用查询对数据进行排序  2022-03-22 00:00:00     2.718
101 你好,ClickHouse!  2022-03-22 14:04:09     -1
101 颗粒是数据读取的最小单元       2022-03-22 14:04:14     3.14159

结果包含 4 行。用时:0.005 秒。
```

:::note
ClickHouse 支持 70 多种输入和输出格式，因此借助数以千计的函数和所有这些数据格式，你可以使用 ClickHouse 执行高效且强大的类 ETL 数据转换。实际上，你甚至不需要有正在运行的 ClickHouse 服务器就能完成数据转换——你可以使用 `clickhouse-local` 工具。有关详细信息，请查看 [`clickhouse-local` 文档页面](/interfaces/cli)。
:::
