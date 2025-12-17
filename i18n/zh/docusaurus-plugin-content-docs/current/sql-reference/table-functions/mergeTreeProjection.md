---
description: '表示 MergeTree 表中某个 projection 的内容。
  可用于内部查看（introspection）。'
sidebar_label: 'mergeTreeProjection'
sidebar_position: 77
slug: /sql-reference/table-functions/mergeTreeProjection
title: 'mergeTreeProjection'
doc_type: 'reference'
---

# mergeTreeProjection 表函数 {#mergetreeprojection-table-function}

表示 MergeTree 表中某个投影的内容。可用于内部检查和分析。

## 语法 {#syntax}

```sql
mergeTreeProjection(database, table, projection)
```

## 参数 {#arguments}

| 参数         | 描述                           |
|--------------|--------------------------------|
| `database`   | 要读取其投影的数据库名称。     |
| `table`      | 要读取其投影的表名称。         |
| `projection` | 要读取的投影名称。             |

## 返回值 {#returned_value}

一个表对象，其列由给定投影提供。

## 使用示例 {#usage-example}

```sql
CREATE TABLE test
(
    `user_id` UInt64,
    `item_id` UInt64,
    PROJECTION order_by_item_id
    (
        SELECT _part_offset
        ORDER BY item_id
    )
)
ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO test SELECT number, 100 - number FROM numbers(5);
```

```sql
SELECT *, _part_offset FROM mergeTreeProjection(currentDatabase(), test, order_by_item_id);
```

```text
   ┌─item_id─┬─_parent_part_offset─┬─_part_offset─┐
1. │      96 │                   4 │            0 │
2. │      97 │                   3 │            1 │
3. │      98 │                   2 │            2 │
4. │      99 │                   1 │            3 │
5. │     100 │                   0 │            4 │
   └─────────┴─────────────────────┴──────────────┘
```

```sql
DESCRIBE mergeTreeProjection(currentDatabase(), test, order_by_item_id) SETTINGS describe_compact_output = 1;
```

```text
   ┌─name────────────────┬─type───┐
1. │ item_id             │ UInt64 │
2. │ _parent_part_offset │ UInt64 │
   └─────────────────────┴────────┘
```
