---
'description': '系统表包含关于贡献者的信息。'
'keywords':
- 'system table'
- 'contributors'
'slug': '/operations/system-tables/contributors'
'title': 'system.contributors'
---

包含有关贡献者的信息。顺序在查询执行时是随机的。

列：

- `name` (字符串) — 来自 git log 的贡献者（作者）名称。

**示例**

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

要在表中查找您自己，请使用以下查询：

```sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
