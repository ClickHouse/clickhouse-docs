---
description: 'ALTER TABLE ... UPDATE 语句的文档'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'ALTER TABLE ... UPDATE 语句'
doc_type: 'reference'
---



# ALTER TABLE ... UPDATE 语句 {#alter-table-update-statements}

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

根据指定的过滤表达式对匹配的数据进行操作。实现形式为[变更（mutation）](/sql-reference/statements/alter/index.md#mutations)。

:::note
`ALTER TABLE` 前缀使得此语法与大多数支持 SQL 的其他系统不同。其目的是表明，与 OLTP 数据库中的类似查询不同，这是一个开销较大的操作，并非为高频使用而设计。
:::

`filter_expr` 必须为 `UInt8` 类型。该查询会将满足 `filter_expr` 结果为非零值的行中指定列的值更新为对应表达式的值。值通过 `CAST` 运算符转换为列类型。不支持更新用于计算主键或分区键的列。

一个查询可以包含多个命令，用逗号分隔。

查询处理的同步方式由 [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置控制。默认情况下为异步。

**另请参阅**

* [变更（Mutations）](/sql-reference/statements/alter/index.md#mutations)
* [ALTER 查询的同步方式](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置


## 相关内容 {#related-content}

- 博客文章：[在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
