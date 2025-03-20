---
slug: /sql-reference/statements/alter/update
sidebar_position: 40
sidebar_label: 更新
---


# ALTER TABLE ... 更新语句

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] 更新 column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

操作符合指定过滤表达式的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

:::note    
`ALTER TABLE` 前缀使得该语法与大多数支持 SQL 的其他系统不同。它意在表明，与 OLTP 数据库中的类似查询不同，这是一项重操作，不适合频繁使用。
:::

`filter_expr` 必须为 `UInt8` 类型。该查询将指定列的值更新为对应表达式在 `filter_expr` 取非零值的行中的值。值通过 `CAST` 运算符转换为列类型。不支持对用于计算主键或分区键的列进行更新。

一个查询可以包含多个用逗号分隔的命令。

查询处理的同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。默认情况下，它是异步的。

**另见**

- [变更](/sql-reference/statements/alter/index.md#mutations)
- [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置


## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
