---
description: '連続する行間の差分を加算します。差分が負の場合は無視されます。'
sidebar_position: 130
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
title: 'deltaSumTimestamp'
doc_type: 'reference'
---

連続する行間の差分を加算します。差分が負の場合は無視されます。

この関数は主に、`toStartOfMinute` バケットのような時間バケットに揃えたタイムスタンプでソートされたデータを保持する[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)向けです。このようなマテリアライズドビューでは、行はすべて同じタイムスタンプを持つため、元の丸められていないタイムスタンプ値を保持していないと、正しい順序でマージすることはできません。`deltaSumTimestamp` 関数は、これまでに見た値の元の `timestamp` を追跡することで、パーツのマージ時に関数の値（状態）が正しく計算されるようにします。

順序付けされたコレクション全体でデルタの合計を計算するには、単に [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 関数を使用できます。

**構文**

```sql
deltaSumTimestamp(value, timestamp)
```

**引数**

* `value` — 入力値。いずれかの [Integer](../../data-types/int-uint.md) 型、[Float](../../data-types/float.md) 型、または [Date](../../data-types/date.md)、[DateTime](../../data-types/datetime.md) である必要があります。
* `timestamp` — 値の順序付けに使用するパラメーター。いずれかの [Integer](../../data-types/int-uint.md) 型、[Float](../../data-types/float.md) 型、または [Date](../../data-types/date.md)、[DateTime](../../data-types/datetime.md) である必要があります。

**返される値**

* `timestamp` パラメーターで指定された順序で並ぶ連続する値同士の差分を累積したもの。

型: [Integer](../../data-types/int-uint.md)、[Float](../../data-types/float.md)、[Date](../../data-types/date.md)、または [DateTime](../../data-types/datetime.md) のいずれか。

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
