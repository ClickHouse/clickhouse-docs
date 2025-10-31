---
'description': 'ALTER TABLE ... UPDATE 语句的文档'
'sidebar_label': 'UPDATE'
'sidebar_position': 40
'slug': '/sql-reference/statements/alter/update'
'title': 'ALTER TABLE ... UPDATE 语句'
'doc_type': 'reference'
---


# ALTER TABLE ... UPDATE 语句

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

操纵与指定筛选表达式匹配的数据。作为一个 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

:::note    
`ALTER TABLE` 前缀使得该语法与大多数支持 SQL 的其他系统不同。它旨在表示，与 OLTP 数据库中的类似查询不同，这是一项重操作，并不设计为频繁使用。
:::

`filter_expr` 必须为 `UInt8` 类型。此查询将指定列的值更新为 `filter_expr` 非零值行中对应表达式的值。值通过 `CAST` 操作符转换为列类型。不支持更新用于计算主键或分区键的列。

一个查询可以包含多个用逗号分隔的命令。

查询处理的同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。默认情况下，它是异步的。

**另见**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
