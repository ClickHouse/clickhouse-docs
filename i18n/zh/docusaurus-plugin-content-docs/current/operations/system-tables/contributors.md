---
'description': 'System table containing information about contributors.'
'keywords':
- 'system table'
- 'contributors'
'slug': '/operations/system-tables/contributors'
'title': 'system.contributors'
---



包含有关贡献者的信息。执行查询时顺序是随机的。

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

要在表中找到你自己，请使用以下查询：

```sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

```text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
