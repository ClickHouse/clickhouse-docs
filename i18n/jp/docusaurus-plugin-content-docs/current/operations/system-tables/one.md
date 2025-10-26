---
'description': 'システムテーブルは、値0を含む単一の`dummy` UInt8カラムを持つ単一の行を含んでいます。他のDBMSに見られる`DUAL`テーブルと似ています。'
'keywords':
- 'system table'
- 'one'
'slug': '/operations/system-tables/one'
'title': 'system.one'
'doc_type': 'reference'
---


# system.one

このテーブルには、値0を含む単一の `dummy` UInt8 カラムがある単一の行が含まれています。

このテーブルは、`SELECT` クエリが `FROM` 句を指定しない場合に使用されます。

これは、他のDBMSに見られる `DUAL` テーブルに似ています。

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
