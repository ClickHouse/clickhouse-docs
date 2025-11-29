---
description: 'ClickHouse の Boolean データ型に関するドキュメント'
sidebar_label: 'Boolean'
sidebar_position: 33
slug: /sql-reference/data-types/boolean
title: 'Bool'
doc_type: 'reference'
---

# Bool {#bool}

型 `bool` は内部的に UInt8 型として保存されます。取りうる値は `true` (1) と `false` (0) です。

```sql
SELECT true AS col, toTypeName(col);
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
