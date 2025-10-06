---
'description': 'システムテーブルには、寄稿者に関する情報が含まれています。'
'keywords':
- 'system table'
- 'contributors'
'slug': '/operations/system-tables/contributors'
'title': 'system.contributors'
'doc_type': 'reference'
---

寄稿者に関する情報を含みます。順序はクエリ実行時にランダムです。

カラム:

- `name` (String) — git log からの寄稿者 (著者) 名。

**例**

```sql
SELECT * FROM system.contributors LIMIT 10
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
│ Max Vetrov       │
│ LiuYangkuan      │
│ svladykin        │
│ zamulla          │
│ Šimon Podlipský  │
│ BayoNet          │
│ Ilya Khomutov    │
│ Amy Krishnevsky  │
│ Loud_Scream      │
└──────────────────┘
```

テーブルで自分を見つけるには、クエリを使用してください:

```sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
