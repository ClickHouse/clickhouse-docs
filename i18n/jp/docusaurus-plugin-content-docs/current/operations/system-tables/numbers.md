---
description: 'ゼロから始まるほぼすべての自然数を含む `number` という名前の単一の UInt64 カラムを持つシステムテーブルです。'
keywords: ['システムテーブル', '数字']
slug: /operations/system-tables/numbers
title: 'system.numbers'
---


# system.numbers

このテーブルは、ゼロから始まるほぼすべての自然数を含む `number` という名前の単一の UInt64 カラムを持っています。

このテーブルはテストに使用したり、ブルートフォース検索を行う際に利用できます。

このテーブルからの読み取りは並列化されません。

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

出力を制限するために条件を使うこともできます。

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
