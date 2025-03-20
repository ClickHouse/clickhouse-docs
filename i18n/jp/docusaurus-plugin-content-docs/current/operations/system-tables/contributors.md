---
description: "貢献者に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/contributors
title: "system.contributors"
keywords: ["システムテーブル", "貢献者"]
---

貢献者に関する情報を含みます。クエリ実行時の順序はランダムです。

カラム：

- `name` (String) — git log からの貢献者（著者）名。

**例**

``` sql
SELECT * FROM system.contributors LIMIT 10
```

``` text
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

テーブル内の自身を見つけるには、次のクエリを使用します：

``` sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

``` text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
