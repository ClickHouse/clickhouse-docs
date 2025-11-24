---
'description': '동적 컬럼에 저장된 고유 데이터 유형 목록을 계산합니다.'
'sidebar_position': 215
'slug': '/sql-reference/aggregate-functions/reference/distinctdynamictypes'
'title': 'distinctDynamicTypes'
'doc_type': 'reference'
---


# distinctDynamicTypes

Calculates the list of distinct data types stored in [Dynamic](../../data-types/dynamic.md) column.

**Syntax**

```sql
distinctDynamicTypes(dynamic)
```

**Arguments**

- `dynamic` — [Dynamic](../../data-types/dynamic.md) 컬럼.

**Returned Value**

- The sorted list of data type names [Array(String)](../../data-types/array.md).

**Example**

쿼리:

```sql
DROP TABLE IF EXISTS test_dynamic;
CREATE TABLE test_dynamic(d Dynamic) ENGINE = Memory;
INSERT INTO test_dynamic VALUES (42), (NULL), ('Hello'), ([1, 2, 3]), ('2020-01-01'), (map(1, 2)), (43), ([4, 5]), (NULL), ('World'), (map(3, 4))
```

```sql
SELECT distinctDynamicTypes(d) FROM test_dynamic;
```

결과:

```reference
┌─distinctDynamicTypes(d)──────────────────────────────────────┐
│ ['Array(Int64)','Date','Int64','Map(UInt8, UInt8)','String'] │
└──────────────────────────────────────────────────────────────┘
```
