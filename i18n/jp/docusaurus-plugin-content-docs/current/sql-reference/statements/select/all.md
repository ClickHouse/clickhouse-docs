---
description: 'ALL 句に関するドキュメント'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'ALL 句'
doc_type: 'reference'
---

# ALL 句 \\{#all-clause\\}

テーブル内に複数の行が条件に一致する場合、`ALL` はそれらをすべて返します。`SELECT ALL` は `DISTINCT` を付けない `SELECT` と同じです。`ALL` と `DISTINCT` の両方が指定された場合は、例外がスローされます。

`ALL` は集約関数内で指定できますが、クエリの結果に実質的な影響はありません。

例：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

次のものと同等です：

```sql
SELECT sum(number) FROM numbers(10);
```
