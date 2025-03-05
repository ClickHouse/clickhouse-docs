---
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
sidebar_position: 130
title: "deltaSumTimestamp"
description: "連続する行の差分を追加します。差分が負の場合は無視されます。"
---

連続する行の差分を追加します。差分が負の場合は無視されます。

この関数は、特定の時間バケットに整列されたタイムスタンプでデータを保存する[物化ビュー](../../../sql-reference/statements/create/view.md#materialized)用に主に使用されます。例えば、`toStartOfMinute` バケットのようなものです。このような物化ビューでは、すべての行が同じタイムスタンプを持つため、元の切り上げされていないタイムスタンプ値を保存せずに、正しい順序でマージされることは不可能です。`deltaSumTimestamp` 関数は、見た値の元の `timestamp` を追跡するため、部品のマージ中に関数の値（状態）が正しく計算されます。

順序付けられたコレクション全体にわたるデルタ合計を計算するには、単に [deltaSum](../../../sql-reference/aggregate-functions/reference/deltasum.md#agg_functions-deltasum) 関数を使用すればよいです。

**構文**

``` sql
deltaSumTimestamp(value, timestamp)
```

**引数**

- `value` — 入力値。いずれかの[整数](../../data-types/int-uint.md)型または[浮動小数点](../../data-types/float.md)型、または[日付](../../data-types/date.md)または[日付時刻](../../data-types/datetime.md)である必要があります。
- `timestamp` — 値を並べ替えるためのパラメータ。いずれかの[整数](../../data-types/int-uint.md)型または[浮動小数点](../../data-types/float.md)型、または[日付](../../data-types/date.md)または[日付時刻](../../data-types/datetime.md)である必要があります。

**返される値**

- `timestamp` パラメータで並べられた連続する値の累積差。

タイプ: [整数](../../data-types/int-uint.md)または[浮動小数点](../../data-types/float.md)または[日付](../../data-types/date.md)または[日付時刻](../../data-types/datetime.md)。

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
