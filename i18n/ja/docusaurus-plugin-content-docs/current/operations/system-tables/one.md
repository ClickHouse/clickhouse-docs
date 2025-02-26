---
description: "システムテーブルで、単一の行と単一の `dummy` UInt8 カラムに値 0 を含んでいます。他の DBMS に見られる `DUAL` テーブルに似ています。"
slug: /operations/system-tables/one
title: "one"
keywords: ["システムテーブル", "one"]
---

このテーブルは、単一の行に単一の `dummy` UInt8 カラムを持ち、その値は 0 です。

`SELECT` クエリで `FROM` 句が指定されていない場合に、このテーブルが使用されます。

これは他の DBMS に見られる `DUAL` テーブルに似ています。

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
