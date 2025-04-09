---
slug: /sql-reference/statements/alter/delete
sidebar_position: 39
sidebar_label: DELETE
---


# ALTER TABLE ... DELETE 语句

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

删除与指定过滤表达式匹配的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

:::note
`ALTER TABLE` 前缀使得该语法与大多数支持 SQL 的其他系统不同。它意在表明，与 OLTP 数据库中的类似查询不同，这是一项繁重的操作，不适合频繁使用。 `ALTER TABLE` 被视为一项重量级操作，在删除之前需要先合并底层数据。对于 MergeTree 表，考虑使用 [`DELETE FROM` 查询](/sql-reference/statements/delete.md)，它执行轻量级删除，并且可以显著更快。
:::

`filter_expr` 必须是 `UInt8` 类型。该查询删除在表中此表达式取非零值的行。

一个查询可以包含多个用逗号分隔的命令。

查询处理的同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。默认情况下，它是异步的。

**另请参见**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
