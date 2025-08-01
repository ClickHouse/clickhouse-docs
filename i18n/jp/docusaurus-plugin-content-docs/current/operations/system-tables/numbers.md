---
description: 'System table containing a single UInt64 column named `number` that
  contains almost all the natural numbers starting from zero.'
keywords:
- 'system table'
- 'numbers'
slug: '/operations/system-tables/numbers'
title: 'システム.数字'
---




# system.numbers

このテーブルは、`number` と名付けられた単一の UInt64 カラムを含み、ゼロから始まるほぼ全ての自然数が格納されています。

このテーブルは、テスト用やブルートフォース検索が必要な場合に使用できます。

このテーブルからの読み取りは並列化されていません。

**例**

```sql
SELECT * FROM system.numbers LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 行がセットされました。経過時間: 0.001 秒。
```

出力は条件によって制限することもできます。

```sql
SELECT * FROM system.numbers < 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 行がセットされました。経過時間: 0.001 秒。
```
