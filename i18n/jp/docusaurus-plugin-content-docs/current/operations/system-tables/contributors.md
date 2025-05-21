---
description: '貢献者に関する情報を含むシステムテーブル。'
keywords: ['system table', 'contributors']
slug: /operations/system-tables/contributors
title: 'system.contributors'
---

貢献者に関する情報を含みます。順序はクエリ実行時にランダムです。

カラム:

- `name` (String) — git log からの貢献者 (著者) 名。

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

テーブル内の自身を見つけるには、次のクエリを使用してください:

```sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
