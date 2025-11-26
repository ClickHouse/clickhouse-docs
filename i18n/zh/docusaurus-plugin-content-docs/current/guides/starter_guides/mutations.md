---
slug: /guides/developer/mutations
sidebar_label: '更新和删除数据'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', 'mutations']
title: '更新和删除 ClickHouse 数据'
description: '介绍如何在 ClickHouse 中执行更新和删除操作'
show_related_blogs: false
doc_type: 'guide'
---



# 使用变更操作更新和删除 ClickHouse 数据

尽管 ClickHouse 面向的是高吞吐量分析型工作负载，但在某些情况下仍然可以修改或删除已有数据。此类操作称为“变更（mutation）”，并通过 `ALTER TABLE` 命令执行。

:::tip
如果需要频繁执行更新操作，建议在 ClickHouse 中使用[去重](../developer/deduplication.md)，这样可以在不生成变更事件的情况下更新和/或删除行。或者，使用[轻量级更新](/docs/sql-reference/statements/update)或[轻量级删除](/guides/developer/lightweight-delete)。
:::



## 更新数据

使用 `ALTER TABLE...UPDATE` 命令更新表中的行：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` 是在满足 `<filter_expr>` 条件时该列的新值。`<expression>` 必须与该列具有相同的数据类型，或能够通过 `CAST` 运算符转换为相同的数据类型。`<filter_expr>` 应当为数据的每一行返回一个 `UInt8`（0 或非 0）值。多个 `UPDATE <column>` 语句可以在单个 `ALTER TABLE` 命令中通过逗号组合执行。

**示例**：

1. 如下所示的 mutation 语句允许通过字典查找将 `visitor_ids` 更新为新值：

   ```sql
   ALTER TABLE website.clicks
   UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
   WHERE visit_date < '2022-01-01'
   ```

2. 在一个命令中修改多个值，相比多次执行命令可能更加高效：

   ```sql
   ALTER TABLE website.clicks
   UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
   WHERE visit_date < '2022-01-01'
   ```

3. 对于分片表，可以使用 `ON CLUSTER` 执行 mutation：

   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster
   UPDATE click_count = click_count / 2
   WHERE visitor_id ILIKE '%robot%'
   ```

:::note
无法更新属于主键或排序键的列。
:::


## 删除数据

使用 `ALTER TABLE` 命令删除行：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` 应当为每一行数据返回一个 UInt8 值。

**示例**

1. 删除所有某列的值在给定数组中的记录：
   ```sql
   ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
   ```

2. 这个查询会删除哪些数据？
   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
   ```

:::note
要删除表中的全部数据，使用 `TRUNCATE TABLE [<database].]<table>` 命令会更加高效。该命令同样可以配合 `ON CLUSTER` 一起执行。
:::

请参阅 [`DELETE` 语句](/sql-reference/statements/delete.md) 文档页面了解更多详细信息。


## 轻量级删除

另一种删除行的方式是使用 `DELETE FROM` 命令，这被称为**轻量级删除**。被删除的行会立即被标记为已删除，并会在之后的所有查询中自动被过滤掉，因此无需等待数据分片合并，也不需要使用 `FINAL` 关键字。数据清理会在后台以异步方式进行。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例如，下面的查询会删除 `hits` 表中所有 `Title` 列的内容包含文本 `hello` 的行：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

关于轻量级删除的几点说明：

* 此特性仅适用于 `MergeTree` 表引擎家族。
* 轻量级删除默认是同步执行的，会等待所有副本处理完成该删除操作。此行为由 [`lightweight_deletes_sync` 设置](/operations/settings/settings#lightweight_deletes_sync) 控制。
