---
description: 'ALTER TABLE ... DELETE 语句的文档'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'ALTER TABLE ... DELETE 语句'
doc_type: 'reference'
---



# ALTER TABLE ... DELETE 语句

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

删除与指定过滤表达式匹配的数据。该功能以[变更（mutation）](/sql-reference/statements/alter/index.md#mutations)的形式实现。

:::note
`ALTER TABLE` 前缀使该语法不同于大多数其他支持 SQL 的系统。其目的是表明，与 OLTP 数据库中的类似查询不同，这是一个开销较大的操作，不适合频繁使用。`ALTER TABLE` 被视为重量级操作，在删除数据之前需要先对底层数据进行合并。对于 MergeTree 表，建议考虑使用 [`DELETE FROM` 查询](/sql-reference/statements/delete.md)，它执行轻量级删除，速度可能会快得多。
:::

`filter_expr` 必须是 `UInt8` 类型。查询会删除表中使该表达式结果为非零值的行。

一个查询可以包含多个命令，用逗号分隔。

查询处理的同步性由 [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置控制。默认情况下为异步。

**另请参阅**

* [变更（Mutations）](/sql-reference/statements/alter/index.md#mutations)
* [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 设置


## 相关内容 {#related-content}

- 博客：[ClickHouse 中的更新和删除操作处理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
