---
slug: /sql-reference/statements/select/all
sidebar_label: ALL
---


# ALL句

テーブルに複数の一致する行がある場合、`ALL`はそれらすべてを返します。 `SELECT ALL`は、`DISTINCT`なしの`SELECT`と同じです。 両方の指定がある場合、例外が発生します。

`ALL`は、同じ効果（noop）を持つ集約関数内でも指定できます。例えば：

```sql
SELECT sum(ALL number) FROM numbers(10);
```
は次のように等しいです：

```sql
SELECT sum(number) FROM numbers(10);
```
