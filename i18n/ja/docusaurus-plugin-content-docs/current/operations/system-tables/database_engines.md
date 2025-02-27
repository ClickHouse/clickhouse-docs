---
description: "サーバーによってサポートされているデータベースエンジンのリストを含むシステムテーブル。"
slug: /operations/system-tables/database_engines
title: "database_engines"
keywords: ["システムテーブル", "database_engines"]
---

サーバーによってサポートされているデータベースエンジンのリストを含んでいます。

このテーブルは以下のカラムを含んでいます（カラムの型は括弧内に示されています）：

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
