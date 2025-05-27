---
'description': 'System table containing a single row with a single `dummy` UInt8 column
  containing the value 0. Similar to the `DUAL` table found in other DBMSs.'
'keywords':
- 'system table'
- 'one'
'slug': '/operations/system-tables/one'
'title': 'system.one'
---




# system.one

このテーブルは、値 0 を含む単一の `dummy` UInt8 カラムを持つ単一の行を含んでいます。

このテーブルは、`SELECT` クエリが `FROM` 句を指定しない場合に使用されます。

これは、他の DBMS に見られる `DUAL` テーブルに類似しています。

**例**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 行がセットに含まれています。経過時間: 0.001 秒。
```
