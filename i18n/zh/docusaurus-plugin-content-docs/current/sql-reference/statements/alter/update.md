---
'description': 'ALTER TABLE ... UPDATE 语句的文档'
'sidebar_label': 'UPDATE'
'sidebar_position': 40
'slug': '/sql-reference/statements/alter/update'
'title': 'ALTER TABLE ... UPDATE 语句'
---


# ALTER TABLE ... UPDATE 语句

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

操作与指定过滤表达式匹配的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

:::note    
`ALTER TABLE` 前缀使得此语法与大多数其他支持 SQL 的系统不同。它旨在表明，与 OLTP 数据库中的类似查询不同，这是一项不设计为频繁使用的重操作。
:::

`filter_expr` 必须是 `UInt8` 类型。此查询将指定列的值更新为 `filter_expr` 取非零值的行中对应表达式的值。值使用 `CAST` 运算符转换为列类型。不支持更新在主键或分区键计算中使用的列。

一个查询可以包含多个用逗号分隔的命令。

查询处理的同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。默认情况下，它是异步的。

**另见**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [ALTER 查询的同步性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置


## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
