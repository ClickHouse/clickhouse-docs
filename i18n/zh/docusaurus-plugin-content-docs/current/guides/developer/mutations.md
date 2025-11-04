---
'slug': '/guides/developer/mutations'
'sidebar_label': '更新和删除数据'
'sidebar_position': 1
'keywords':
- 'UPDATE'
- 'DELETE'
- 'mutations'
'title': '更新和删除 ClickHouse 数据'
'description': '描述如何在 ClickHouse 中执行更新和删除操作'
'show_related_blogs': false
'doc_type': 'guide'
---


# 更新和删除 ClickHouse 数据的变更

尽管 ClickHouse 主要针对高容量分析工作负载，但在某些情况下，可以修改或删除现有数据。这些操作被称为“变更”，并使用 `ALTER TABLE` 命令执行。

:::tip
如果您需要频繁更新，请考虑在 ClickHouse 中使用 [去重](../developer/deduplication.md)，这允许您更新和/或删除行而不会生成变更事件。或者，使用 [轻量级更新](/docs/sql-reference/statements/update) 或 [轻量级删除](/guides/developer/lightweight-delete)。
:::

## 更新数据 {#updating-data}

使用 `ALTER TABLE...UPDATE` 命令更新表中的行：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` 是满足 `<filter_expr>` 的列的新值。`<expression>` 必须与列的数据类型相同，或可以使用 `CAST` 运算符转换为相同的数据类型。`<filter_expr>` 应该对每一行数据返回一个 `UInt8`（零或非零）值。多个 `UPDATE <column>` 语句可以用逗号分隔组合在一个 `ALTER TABLE` 命令中。

**示例**：

1. 这样的变更允许使用字典查找将 `visitor_ids` 替换为新值：

```sql
ALTER TABLE website.clicks
UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
WHERE visit_date < '2022-01-01'
```

2.  在一个命令中修改多个值可能比多个命令更高效：

```sql
ALTER TABLE website.clicks
UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
WHERE visit_date < '2022-01-01'
```

3.  对于分片表，可以执行 `ON CLUSTER` 变更：

```sql
ALTER TABLE clicks ON CLUSTER main_cluster
UPDATE click_count = click_count / 2
WHERE visitor_id ILIKE '%robot%'
```

:::note
无法更新主键或排序键的一部分的列。
:::

## 删除数据 {#deleting-data}

使用 `ALTER TABLE` 命令删除行：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` 应该对每一行数据返回一个 UInt8 值。

**示例**

1. 删除列中值在某个数组中的任何记录：
```sql
ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
```

2. 这个查询修改了什么？
```sql
ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
```

:::note
要删除表中的所有数据，使用命令 `TRUNCATE TABLE [<database].]<table>` 更为高效。该命令也可以在 `ON CLUSTER` 上执行。
:::

查看 [`DELETE` 语句](/sql-reference/statements/delete.md) 文档页面以获取更多详情。

## 轻量级删除 {#lightweight-deletes}

删除行的另一种选择是使用 `DELETE FROM` 命令，这被称为 **轻量级删除**。被删除的行会立即被标记为已删除，并将自动从所有后续查询中过滤掉，因此您无需等待分区片段的合并或使用 `FINAL` 关键字。数据的清理在后台异步进行。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例如，以下查询从 `hits` 表中删除所有 `Title` 列包含文本 `hello` 的行：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

关于轻量级删除的几点说明：
- 此功能仅适用于 `MergeTree` 表引擎系列。
- 轻量级删除默认是异步的。将 `mutations_sync` 设置为 1 以等待一个副本处理该语句，将 `mutations_sync` 设置为 2 以等待所有副本。
