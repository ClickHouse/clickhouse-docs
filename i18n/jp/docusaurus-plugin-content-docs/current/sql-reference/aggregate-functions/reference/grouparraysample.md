---
description: '引数値のサンプル配列を作成します。生成される配列のサイズは `max_size` 要素に制限されます。引数値はランダムに選択され、配列に追加されます。'
sidebar_position: 145
slug: /sql-reference/aggregate-functions/reference/grouparraysample
title: 'groupArraySample'
doc_type: 'reference'
---

# groupArraySample

引数値のサンプルを要素とする配列を作成します。生成される配列のサイズは最大 `max_size` 要素に制限されます。引数値はランダムに選択され、配列に追加されます。

**構文**

```sql
groupArraySample(max_size[, seed])(x)
```

**引数**

* `max_size` — 結果の配列の最大サイズ。[UInt64](../../data-types/int-uint.md)。
* `seed` — 乱数生成器のシード。省略可能。[UInt64](../../data-types/int-uint.md)。デフォルト値: `123456`。
* `x` — 引数（列名または式）。

**返される値**

* `x` の値をランダムに選択した配列。

型: [Array](../../data-types/array.md)。

**例**

次の `colors` テーブルを考えます:

```text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

列名を引数として指定するクエリ：

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

結果：

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

列名と別のシード値を指定したクエリ：

```sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

結果:

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

式を引数に取るクエリ:

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

結果:

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
