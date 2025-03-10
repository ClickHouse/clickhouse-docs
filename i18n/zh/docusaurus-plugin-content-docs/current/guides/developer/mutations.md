---
slug: /guides/developer/mutations
sidebar_label: 更新和删除数据
sidebar_position: 1
keywords: ['update', 'delete', 'mutation']
---


# 更新和删除 ClickHouse 数据

虽然 ClickHouse 专为高量分析工作负载而设计，但在某些情况下，修改或删除现有数据是可能的。这些操作被标记为“变更”，并通过 `ALTER TABLE` 命令执行。您还可以使用 ClickHouse 的轻量级删除功能 `DELETE` 一行。

:::tip
如果需要频繁进行更新，请考虑在 ClickHouse 中使用 [去重](../developer/deduplication.md)，这允许您在不生成变更事件的情况下更新和/或删除行。
:::

## 更新数据 {#updating-data}

使用 `ALTER TABLE...UPDATE` 命令更新表中的行：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` 是满足 `<filter_expr>` 的列的新值。`<expression>` 必须与列的数据类型相同，或者能够通过 `CAST` 操作符转换为相同的数据类型。`<filter_expr>` 应该为每一行数据返回一个 `UInt8`（零或非零）值。多个 `UPDATE <column>` 语句可以在单个 `ALTER TABLE` 命令中用逗号分隔组合。

**示例**：

1.  像这样的变更允许通过字典查找用新值替换 `visitor_ids`：

     ```sql
     ALTER TABLE website.clicks
     UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
     WHERE visit_date < '2022-01-01'
     ```

2.   在一个命令中修改多个值可能比多个命令更高效：

     ```sql
     ALTER TABLE website.clicks
     UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
     WHERE visit_date < '2022-01-01'
     ```

3.  对于分片表，变更可以在 `ON CLUSTER` 执行：

     ```sql
     ALTER TABLE clicks ON CLUSTER main_cluster
     UPDATE click_count = click_count / 2
     WHERE visitor_id ILIKE '%robot%'
     ```

:::note
无法更新作为主键或排序键的一部分的列。
:::

## 删除数据 {#deleting-data}

使用 `ALTER TABLE` 命令删除行：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` 应该为每一行数据返回一个 UInt8 值。

**示例**

1. 删除任何在值数组中的列记录：
    ```sql
    ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
    ```

2.  这个查询修改了什么？
    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
    ```

:::note
要删除表中的所有数据，使用 `TRUNCATE TABLE [<database].]<table>` 命令更有效。此命令也可以在 `ON CLUSTER` 上执行。
:::

查看 [`DELETE` 语句](/sql-reference/statements/delete.md) 文档页面以获取更多详细信息。

## 轻量级删除 {#lightweight-deletes}

另一种删除行的选项是使用 `DELETE FROM` 命令，称为 **轻量级删除**。被删除的行会立即被标记为删除，并会自动从后续查询中过滤，因此您不必等待分区合并或使用 `FINAL` 关键字。数据清理在后台异步进行。

``` sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例如，以下查询删除 `hits` 表中 `Title` 列包含文本 `hello` 的所有行：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

关于轻量级删除的几点说明：
- 此功能仅适用于 `MergeTree` 表引擎系列。
- 轻量级删除默认是异步的。将 `mutations_sync` 设置为 1 以等待一个副本处理语句，将 `mutations_sync` 设置为 2 以等待所有副本。
