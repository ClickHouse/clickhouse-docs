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
ALTER TABLE [数据库.]表 [ON CLUSTER 集群] UPDATE 列1 = 表达式1 [, ...] [IN PARTITION 分区id] WHERE 筛选表达式
```

对符合指定过滤表达式的数据进行变更。该功能作为一次 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

:::note\
`ALTER TABLE` 前缀使得此语法区别于大多数其他支持 SQL 的系统。其目的是表明，与 OLTP 数据库中的类似查询不同，这是一个开销较大的操作，并非为频繁使用而设计。
:::

`filter_expr` 必须是 `UInt8` 类型。该查询会将满足 `filter_expr` 计算结果为非零值的行中指定列的值更新为相应表达式的值。更新时通过 `CAST` 运算符将值转换为列类型。不支持更新参与主键或分区键计算的列。

一个查询可以包含多个命令，用逗号分隔。

查询处理的同步性由 [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置决定。默认是异步的。

**另请参阅**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置


## 相关内容 {#related-content}

- 博客：[ClickHouse 中的更新和删除操作处理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
