---
description: '単一の行と、値0を含む単一の `dummy` UInt8 カラムを持つシステムテーブル。
  他のDBMSに見られる `DUAL` テーブルに類似しています。'
keywords: ['system table', 'one']
slug: /operations/system-tables/one
title: 'system.one'
---


# system.one

このテーブルは、値0を含む単一の `dummy` UInt8 カラムを持つ単一の行を含んでいます。

このテーブルは、`SELECT` クエリが `FROM` 句を指定しない場合に使用されます。

これは、他のDBMSに見られる `DUAL` テーブルに類似しています。

**例**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 行がセットに含まれています。経過時間: 0.001秒。
```
