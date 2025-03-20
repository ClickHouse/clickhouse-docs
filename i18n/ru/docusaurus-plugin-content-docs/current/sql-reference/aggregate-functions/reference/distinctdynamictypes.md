---
slug: /sql-reference/aggregate-functions/reference/distinctdynamictypes
sidebar_position: 215
title: "distinctDynamicTypes"
description: "Calculates the list of distinct data types stored in Dynamic column."
---


# distinctDynamicTypes

Вычисляет список различных типов данных, хранящихся в колонке [Dynamic](../../data-types/dynamic.md).

**Синтаксис**

```sql
distinctDynamicTypes(dynamic)
```

**Аргументы**

- `dynamic` — колонка [Dynamic](../../data-types/dynamic.md).

**Возвращаемое Значение**

- Отсортированный список имен типов данных [Array(String)](../../data-types/array.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_dynamic;
CREATE TABLE test_dynamic(d Dynamic) ENGINE = Memory;
INSERT INTO test_dynamic VALUES (42), (NULL), ('Hello'), ([1, 2, 3]), ('2020-01-01'), (map(1, 2)), (43), ([4, 5]), (NULL), ('World'), (map(3, 4))
```

```sql
SELECT distinctDynamicTypes(d) FROM test_dynamic;
```

Результат:

```reference
┌─distinctDynamicTypes(d)──────────────────────────────────────┐
│ ['Array(Int64)','Date','Int64','Map(UInt8, UInt8)','String'] │
└──────────────────────────────────────────────────────────────┘
```
