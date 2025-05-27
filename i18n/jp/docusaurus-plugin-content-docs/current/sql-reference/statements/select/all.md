---
'description': 'Documentation for ALL Clause'
'sidebar_label': 'ALL'
'slug': '/sql-reference/statements/select/all'
'title': 'ALL Clause'
---




# ALL句

テーブルに複数の一致する行がある場合、`ALL`はそれらすべてを返します。 `SELECT ALL`は、`DISTINCT`なしの`SELECT`と同じです。 `ALL`と`DISTINCT`の両方が指定された場合、例外がスローされます。

`ALL`は集約関数内で指定できますが、クエリの結果に実際的な影響はありません。

例えば：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

は次のように同等です：

```sql
SELECT sum(number) FROM numbers(10);
```
