---
slug: /sql-reference/aggregate-functions/reference/distinctdynamictypes
sidebar_position: 215
title: "distinctDynamicTypes"
description: "Dynamic カラムに格納されている異なるデータ型のリストを計算します。"
---


# distinctDynamicTypes

[Dynamic](../../data-types/dynamic.md) カラムに格納されている異なるデータ型のリストを計算します。

**構文**

```sql
distinctDynamicTypes(dynamic)
```

**引数**

- `dynamic` — [Dynamic](../../data-types/dynamic.md) カラム。

**返される値**

- データ型名のソート済みリスト [Array(String)](../../data-types/array.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test_dynamic;
CREATE TABLE test_dynamic(d Dynamic) ENGINE = Memory;
INSERT INTO test_dynamic VALUES (42), (NULL), ('Hello'), ([1, 2, 3]), ('2020-01-01'), (map(1, 2)), (43), ([4, 5]), (NULL), ('World'), (map(3, 4))
```

```sql
SELECT distinctDynamicTypes(d) FROM test_dynamic;
```

結果:

```reference
┌─distinctDynamicTypes(d)──────────────────────────────────────┐
│ ['Array(Int64)','Date','Int64','Map(UInt8, UInt8)','String'] │
└──────────────────────────────────────────────────────────────┘
```
