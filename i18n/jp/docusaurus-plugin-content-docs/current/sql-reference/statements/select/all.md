---
'description': 'ALL 句に関するドキュメンテーション'
'sidebar_label': 'ALL'
'slug': '/sql-reference/statements/select/all'
'title': 'ALL 句'
'doc_type': 'reference'
---


# ALL句

テーブルに複数の一致する行がある場合、`ALL`はそれらすべてを返します。`SELECT ALL`は、`DISTINCT`なしの`SELECT`と同じです。`ALL`と`DISTINCT`の両方が指定されている場合、例外がスローされます。

`ALL`は集約関数内で指定することができますが、クエリの結果に実質的な影響はありません。

例えば：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

は次のように等価です：

```sql
SELECT sum(number) FROM numbers(10);
```
