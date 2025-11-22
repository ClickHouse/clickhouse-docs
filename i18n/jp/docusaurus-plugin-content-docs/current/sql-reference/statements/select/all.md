---
description: 'ALL 句のリファレンス'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'ALL 句'
doc_type: 'reference'
---

# ALL 句

テーブル内で条件に一致する行が複数ある場合、`ALL` はそれらをすべて返します。`SELECT ALL` は `DISTINCT` を指定しない `SELECT` と同一です。`ALL` と `DISTINCT` の両方が指定された場合は、例外がスローされます。

`ALL` は集約関数の内部で指定できますが、クエリ結果に対して実質的な効果はありません。

例:

```sql
SELECT sum(ALL number) FROM numbers(10);
```

以下と同等です：

```sql
SELECT sum(number) FROM numbers(10);
```
