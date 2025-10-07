---
'description': 'システムテーブルは、0から始まるほぼすべての自然数を含む`number`という名前の単一UInt64カラムを含みます。'
'keywords':
- 'system table'
- 'numbers'
'slug': '/operations/system-tables/numbers'
'title': 'system.numbers'
'doc_type': 'reference'
---


# system.numbers

このテーブルには、0から始まるほぼすべての自然数を含む `number` という名前の単一の UInt64 カラムが含まれています。

このテーブルは、テストやブルートフォース検索が必要な場合に使用できます。

このテーブルからの読み込みは並列化されません。

**例**

```sql
SELECT * FROM system.numbers LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```

出力を述語によって制限することもできます。

```sql
SELECT * FROM system.numbers < 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```
