---
slug: /sql-reference/statements/select/all
sidebar_label: ALL
---

# ALL句

テーブルに複数の一致する行がある場合、`ALL`はそれらすべてを返します。`SELECT ALL`は、`DISTINCT`なしの`SELECT`と同じです。`ALL`と`DISTINCT`の両方が指定されている場合、例外がスローされます。

`ALL`は集約関数内でも指定でき、同じ効果（無操作）を持ちます。例えば：

```sql
SELECT sum(ALL number) FROM numbers(10);
```
は以下と等価です：

```sql
SELECT sum(number) FROM numbers(10);
```
