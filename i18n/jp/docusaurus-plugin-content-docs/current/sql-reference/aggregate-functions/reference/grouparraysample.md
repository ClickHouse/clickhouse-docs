---
slug: /sql-reference/aggregate-functions/reference/grouparraysample
sidebar_position: 145
title: "groupArraySample"
description: "引数のサンプル値の配列を作成します。結果の配列のサイズは `max_size` 要素に制限されています。引数の値はランダムに選択され、配列に追加されます。"
---


# groupArraySample

引数のサンプル値の配列を作成します。結果の配列のサイズは `max_size` 要素に制限されています。引数の値はランダムに選択され、配列に追加されます。

**構文**

``` sql
groupArraySample(max_size[, seed])(x)
```

**引数**

- `max_size` — 結果の配列の最大サイズ。 [UInt64](../../data-types/int-uint.md)。
- `seed` — 乱数生成器のシード。オプション。 [UInt64](../../data-types/int-uint.md)。デフォルト値: `123456`。
- `x` — 引数（カラム名または式）。

**返される値**

- ランダムに選択された `x` 引数の配列。

タイプ: [Array](../../data-types/array.md)。

**例**

テーブル `colors` を考えます：

``` text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

カラム名を引数としたクエリ：

``` sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

結果：

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

カラム名と異なるシードを用いたクエリ：

``` sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

結果：

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

式を引数としたクエリ：

``` sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

結果：

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
