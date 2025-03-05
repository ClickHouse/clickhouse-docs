---
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
sidebar_position: 130
title: "deltaSumTimestamp"
description: "連続する行の差を追加します。差が負の場合は無視されます。"
---

連続する行の差を追加します。差が負の場合は無視されます。

この関数は、例えば `toStartOfMinute` バケットによって時系列でデータを保存するための [物化ビュー](/sql-reference/statements/create/view#materialized-view) に主に使用されます。このような物化ビューの行はすべて同じタイムスタンプを持つため、元の丸められていないタイムスタンプ値を保存せずに正しい順序でマージすることは不可能です。`deltaSumTimestamp` 関数は見た値の元の `timestamp` を追跡し、パーツのマージ中に関数の値（状態）が正しく計算されるようにします。

順序付けられたコレクション全体でデルタ合計を計算するには、単純に [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 関数を使用できます。

**構文**

``` sql
deltaSumTimestamp(value, timestamp)
```

**引数**

- `value` — 入力値。いずれかの [整数](../../data-types/int-uint.md) 型または [浮動小数点](../../data-types/float.md) 型、または [日付](../../data-types/date.md) または [日時](../../data-types/datetime.md) である必要があります。
- `timestamp` — 値を順序付けるためのパラメータ。いずれかの [整数](../../data-types/int-uint.md) 型または [浮動小数点](../../data-types/float.md) 型、または [日付](../../data-types/date.md) または [日時](../../data-types/datetime.md) である必要があります。

**返される値**

- `timestamp` パラメータによって順序付けられた連続する値の累積的な差。

型: [整数](../../data-types/int-uint.md) または [浮動小数点](../../data-types/float.md) または [日付](../../data-types/date.md) または [日時](../../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

結果:

``` text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
