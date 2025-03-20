---
description: "システムテーブルで、値0を含む単一の `dummy` UInt8 カラムを持つ単一の行が含まれます。他のDBMSで見られる `DUAL` テーブルに類似しています。"
slug: /operations/system-tables/one
title: "system.one"
keywords: ["システムテーブル", "one"]
---

このテーブルは、値0を含む単一の `dummy` UInt8 カラムを持つ単一の行で構成されています。

このテーブルは、`SELECT` クエリが `FROM` 句を指定しない場合に使用されます。

これは、他のDBMSで見られる `DUAL` テーブルに類似しています。

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
