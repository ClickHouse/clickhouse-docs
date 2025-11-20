---
slug: /guides/developer/mutations
sidebar_label: '更新和删除数据'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', 'mutations']
title: '在 ClickHouse 中更新和删除数据'
description: '介绍如何在 ClickHouse 中执行更新和删除操作'
show_related_blogs: false
doc_type: 'guide'
---



# 使用变更操作更新和删除 ClickHouse 数据

尽管 ClickHouse 主要面向高吞吐量分析型工作负载，但在某些情况下也可以修改或删除已有数据。此类操作称为“变更（mutation）”，并通过 `ALTER TABLE` 命令执行。

:::tip
如果需要频繁执行更新操作，可以考虑在 ClickHouse 中使用[去重](../developer/deduplication.md)，它允许在不生成变更事件的情况下更新和/或删除行。或者使用[轻量级更新](/docs/sql-reference/statements/update)
或[轻量级删除](/guides/developer/lightweight-delete)。
:::



## 更新数据 {#updating-data}

使用 `ALTER TABLE...UPDATE` 命令更新表中的行：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` 是满足 `<filter_expr>` 条件的列的新值。`<expression>` 必须与列的数据类型相同,或者可以使用 `CAST` 运算符转换为相同的数据类型。`<filter_expr>` 应为数据的每一行返回一个 `UInt8` 值(零或非零)。多个 `UPDATE <column>` 语句可以在单个 `ALTER TABLE` 命令中组合使用,用逗号分隔。

**示例**:

1.  这样的变更操作允许通过字典查找将 `visitor_ids` 替换为新值:

    ```sql
    ALTER TABLE website.clicks
    UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
    WHERE visit_date < '2022-01-01'
    ```

2.  在单个命令中修改多个值比使用多个命令更高效:

    ```sql
    ALTER TABLE website.clicks
    UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
    WHERE visit_date < '2022-01-01'
    ```

3.  对于分片表,可以使用 `ON CLUSTER` 执行变更操作:

    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster
    UPDATE click_count = click_count / 2
    WHERE visitor_id ILIKE '%robot%'
    ```

:::note
无法更新主键或排序键中的列。
:::


## 删除数据 {#deleting-data}

使用 `ALTER TABLE` 命令删除行：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` 应为每行数据返回一个 UInt8 值。

**示例**

1. 删除列值在指定数组中的所有记录：

   ```sql
   ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
   ```

2. 这个查询会修改什么？
   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
   ```

:::note
要删除表中的所有数据，使用 `TRUNCATE TABLE [<database].]<table>` 命令更高效。此命令也可以通过 `ON CLUSTER` 执行。
:::

查看 [`DELETE` 语句](/sql-reference/statements/delete.md)文档页面了解更多详情。


## 轻量级删除 {#lightweight-deletes}

删除行的另一种方式是使用 `DELETE FROM` 命令,这被称为**轻量级删除**。被删除的行会立即标记为已删除,并在所有后续查询中自动过滤,因此您无需等待数据分区合并或使用 `FINAL` 关键字。数据清理会在后台异步执行。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例如,以下查询会从 `hits` 表中删除 `Title` 列包含文本 `hello` 的所有行:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

关于轻量级删除的几点说明:

- 此功能仅适用于 `MergeTree` 表引擎系列。
- 轻量级删除默认是同步的,会等待所有副本处理完删除操作。该行为由 [`lightweight_deletes_sync` 设置](/operations/settings/settings#lightweight_deletes_sync)控制。
