---
description: 'Документация для типа данных Boolean в ClickHouse'
sidebar_label: 'Boolean'
sidebar_position: 33
slug: /sql-reference/data-types/boolean
title: 'Bool'
---


# Bool

Тип `bool` хранится внутренне как UInt8. Возможные значения: `true` (1), `false` (0).


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
