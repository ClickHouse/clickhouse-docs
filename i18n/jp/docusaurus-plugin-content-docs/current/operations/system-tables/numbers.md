---
description: "システムテーブルで、`number`という名前の単一のUInt64カラムを含み、ゼロから始まるほぼすべての自然数が含まれています。"
slug: /operations/system-tables/numbers
title: "system.numbers"
keywords: ["システムテーブル", "numbers"]
---

このテーブルは、`number`という名前の単一のUInt64カラムを含み、ゼロから始まるほぼすべての自然数が含まれています。

このテーブルは、テストやブルートフォース検索を行う必要がある場合に使用できます。

このテーブルからの読み込みは並列化されません。

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

10 行がセットに含まれています。経過時間: 0.001 秒。
```

出力を制限するために条件を使用することもできます。

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

10 行がセットに含まれています。経過時間: 0.001 秒。
```
