
# mergeTreeProjection 表函数

表示 MergeTree 表中某个投影的内容。它可以用于内省。

## 语法 {#syntax}

```sql
mergeTreeProjection(database, table, projection)
```

## 参数 {#arguments}

| 参数         | 描述                                     |
|--------------|------------------------------------------|
| `database`   | 要从中读取投影的数据库名称。             |
| `table`      | 要从中读取投影的表名称。                 |
| `projection` | 要读取的投影。                           |

## 返回值 {#returned_value}

一个包含指定投影提供的列的表对象。

## 示例 {#usage-example}

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
