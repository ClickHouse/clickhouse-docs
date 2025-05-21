---
'description': 'Calculates the list of distinct data types stored in Dynamic column.'
'sidebar_position': 215
'slug': '/sql-reference/aggregate-functions/reference/distinctdynamictypes'
'title': 'distinctDynamicTypes'
---




# distinctDynamicTypes

计算存储在 [Dynamic](../../data-types/dynamic.md) 列中的不同数据类型的列表。

**语法**

```sql
distinctDynamicTypes(dynamic)
```

**参数**

- `dynamic` — [Dynamic](../../data-types/dynamic.md) 列。

**返回值**

- 排序后的数据类型名称列表 [Array(String)](../../data-types/array.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_dynamic;
CREATE TABLE test_dynamic(d Dynamic) ENGINE = Memory;
INSERT INTO test_dynamic VALUES (42), (NULL), ('Hello'), ([1, 2, 3]), ('2020-01-01'), (map(1, 2)), (43), ([4, 5]), (NULL), ('World'), (map(3, 4))
```

```sql
SELECT distinctDynamicTypes(d) FROM test_dynamic;
```

结果：

```reference
┌─distinctDynamicTypes(d)──────────────────────────────────────┐
│ ['Array(Int64)','Date','Int64','Map(UInt8, UInt8)','String'] │
└──────────────────────────────────────────────────────────────┘
```
