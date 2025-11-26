---
description: 'ALTER TABLE ... UPDATE 语句文档'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'ALTER TABLE ... UPDATE 语句'
doc_type: 'reference'
---



# ALTER TABLE ... UPDATE 语句

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

对符合指定过滤表达式的数据进行修改。实现为一种 [mutation](/sql-reference/statements/alter/index.md#mutations)。

:::note\
`ALTER TABLE` 前缀使得此语法不同于大多数支持 SQL 的其他系统。其目的是强调，与 OLTP 数据库中的类似查询不同，这是一种开销较大的操作，并不适合频繁使用。
:::

`filter_expr` 必须是 `UInt8` 类型。该查询会将满足 `filter_expr` 取非零值的行中指定列的值更新为相应表达式的值。这些值会通过 `CAST` 运算符转换为列的类型。不支持更新用于计算主键或分区键的列。

一个查询中可以包含多个以逗号分隔的命令。

查询处理的同步性由 [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置决定。默认情况下是异步的。

**另请参阅**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置


## 相关内容 {#related-content}

- 博客文章：[在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
