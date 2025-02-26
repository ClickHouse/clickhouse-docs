---
description: "情報提供者に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/contributors
title: "contributors"
keywords: ["システムテーブル", "情報提供者"]
---

情報提供者に関する情報を含んでいます。順序はクエリ実行時にランダムです。

カラム:

- `name` (String) — git log からの情報提供者（著者）名。

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

自分自身をテーブルで見つけるには、次のクエリを使用します：

``` sql
SELECT * FROM system.contributors WHERE name = 'Olga Khvostikova'
```

``` text
┌─name─────────────┐
│ Olga Khvostikova │
└──────────────────┘
```
