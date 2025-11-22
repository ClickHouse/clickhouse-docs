---
description: '値 0 を持つ `dummy` という UInt8 型の単一列からなる 1 行のみの system テーブル。他の DBMS に存在する `DUAL` テーブルに相当します。'
keywords: ['system table', 'one']
slug: /operations/system-tables/one
title: 'system.one'
doc_type: 'reference'
---

# system.one

このテーブルには、値 0 を持つ UInt8 型の `dummy` 列が 1 つだけある行が 1 行だけ格納されています。

このテーブルは、`SELECT` クエリで `FROM` 句が指定されていない場合に使用されます。

これは、他の DBMS に存在する `DUAL` テーブルに相当します。

**例**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 rows in set. Elapsed: 0.001 sec.
```
