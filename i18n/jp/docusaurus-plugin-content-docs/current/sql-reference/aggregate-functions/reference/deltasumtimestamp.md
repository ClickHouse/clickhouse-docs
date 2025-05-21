---
description: '連続した行間の差を追加します。差が負の場合は、無視されます。'
sidebar_position: 130
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
title: 'deltaSumTimestamp'
---

連続した行間の差を追加します。差が負の場合は、無視されます。

この関数は、いくつかの時間バケットに沿ったタイムスタンプでデータを保存する[物化ビュー](/sql-reference/statements/create/view#materialized-view)に主に使用されます。例えば、`toStartOfMinute` バケットです。このような物化ビューの行はすべて同じタイムスタンプを持つため、元の丸めされていないタイムスタンプ値を保存せずに正しい順序でマージすることは不可能です。`deltaSumTimestamp` 関数は、見た値の元の `timestamp` を追跡するため、部分のマージ中に関数の値（状態）が正しく計算されます。

順序付きコレクション間でデルタ合計を計算するには、単に [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 関数を使用できます。

**構文**

```sql
deltaSumTimestamp(value, timestamp)
```

**引数**

- `value` — 入力値。`[Integer](../../data-types/int-uint.md)` 型または `[Float](../../data-types/float.md)` 型、または `[Date](../../data-types/date.md)` か `[DateTime](../../data-types/datetime.md)` である必要があります。
- `timestamp` — 値を順序付けるためのパラメータ。`[Integer](../../data-types/int-uint.md)` 型または `[Float](../../data-types/float.md)` 型、または `[Date](../../data-types/date.md)` か `[DateTime](../../data-types/datetime.md)` である必要があります。

**返される値**

- `timestamp` パラメータに従って順序付けられた連続する値間の蓄積された差異。

型: `[Integer](../../data-types/int-uint.md)` または `[Float](../../data-types/float.md)` または `[Date](../../data-types/date.md)` または `[DateTime](../../data-types/datetime.md)`。

**例**

クエリ:

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

結果:

```text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
