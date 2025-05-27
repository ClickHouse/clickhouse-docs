---
'description': 'ClickHouse 中 Boolean 数据类型的文档'
'sidebar_label': 'Boolean'
'sidebar_position': 33
'slug': '/sql-reference/data-types/boolean'
'title': 'Bool'
---


# Bool

类型 `bool` 在内部存储为 UInt8。可能的值为 `true` (1)，`false` (0)。

```sql
select true as col, toTypeName(col);
┌─col──┬─toTypeName(true)─┐
│ true │ Bool             │
└──────┴──────────────────┘

select true == 1 as col, toTypeName(col);
┌─col─┬─toTypeName(equals(true, 1))─┐
│   1 │ UInt8                       │
└─────┴─────────────────────────────┘
```

```sql
CREATE TABLE test_bool
(
    `A` Int64,
    `B` Bool
)
ENGINE = Memory;

INSERT INTO test_bool VALUES (1, true),(2,0);

SELECT * FROM test_bool;
┌─A─┬─B─────┐
│ 1 │ true  │
│ 2 │ false │
└───┴───────┘
```
