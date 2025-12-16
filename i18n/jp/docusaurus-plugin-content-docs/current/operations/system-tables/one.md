---
description: 'UInt8 型の `dummy` 列が 1 列だけあり、その列に値 0 が格納された行が 1 行だけ存在するシステムテーブル。他の DBMS にある `DUAL` テーブルに相当します。'
keywords: ['システムテーブル', 'one']
slug: /operations/system-tables/one
title: 'system.one'
doc_type: 'reference'
---

# system.one {#systemone}

このテーブルは 1 行 1 列のテーブルで、UInt8 型の `dummy` 列に値 0 が格納されています。

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
