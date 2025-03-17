---
description: "サーバーがサポートするデータベースエンジンのリストを含むシステムテーブルです。"
slug: /operations/system-tables/database_engines
title: "system.database_engines"
keywords: ["システムテーブル", "database_engines"]
---

サーバーがサポートするデータベースエンジンのリストを含みます。

このテーブルには次のカラムが含まれています（カラムタイプは括弧内に示されています）：

- `name` (String) — データベースエンジンの名前。

例：

``` sql
SELECT *
FROM system.database_engines
WHERE name in ('Atomic', 'Lazy', 'Ordinary')
```

``` text
┌─name─────┐
│ Ordinary │
│ Atomic   │
│ Lazy     │
└──────────┘
```
