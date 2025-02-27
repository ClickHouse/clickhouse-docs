---
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
sidebar_position: 130
title: deltaSumTimestamp
---

連続する行間の差分を加算します。差分が負の場合は無視されます。

この関数は、特定の時間バケットに整列したタイムスタンプによってデータを保存する[マテリアライズドビュー](../../../sql-reference/statements/create/view.md#materialized)向けに主に使用されます。例えば、`toStartOfMinute`バケットのように。こういったマテリアライズドビュー内の行はすべて同じタイムスタンプを持つため、元の丸められていないタイムスタンプ値を保存せずに正しい順序でマージすることは不可能です。`deltaSumTimestamp`関数は、関数が見た値の元の`timestamp`を追跡するため、パーツのマージ中に関数の値（状態）が正しく計算されます。

順序付けられたコレクション全体のdelta sumを計算するには、単純に[deltaSum](../../../sql-reference/aggregate-functions/reference/deltasum.md#agg_functions-deltasum)関数を使用できます。

**構文**

``` sql
deltaSumTimestamp(value, timestamp)
```

**引数**

- `value` — 入力値。いずれかの[整数](../../data-types/int-uint.md)型または[浮動小数点](../../data-types/float.md)型、または[日付](../../data-types/date.md)や[日時](../../data-types/datetime.md)でなければなりません。
- `timestamp` — 値の順序指定のためのパラメータ。いずれかの[整数](../../data-types/int-uint.md)型または[浮動小数点](../../data-types/float.md)型、または[日付](../../data-types/date.md)や[日時](../../data-types/datetime.md)でなければなりません。

**返される値**

- `timestamp`パラメータで順序付けられた連続値間の蓄積された差分。

タイプ: [整数](../../data-types/int-uint.md)または[浮動小数点](../../data-types/float.md)または[日付](../../data-types/date.md)または[日時](../../data-types/datetime.md)。

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
