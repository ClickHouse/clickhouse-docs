---
description: '連続する行同士の差分を加算します。差分が負の場合は無視されます。'
sidebar_position: 130
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
title: 'deltaSumTimestamp'
doc_type: 'reference'
---

連続する行同士の差分を加算します。差分が負の場合は無視されます。

この関数は主に、`toStartOfMinute` バケットのような時間バケットの境界に揃えたタイムスタンプで並べ替えられたデータを保存する[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)向けです。このようなマテリアライズドビューでは、行がすべて同じタイムスタンプを持つため、元の丸め前のタイムスタンプ値を保持しない限り、正しい順序でマージすることはできません。`deltaSumTimestamp` 関数は、これまでに処理した値の元の `timestamp` を追跡することで、パーツのマージ時に関数の値（状態）が正しく計算されるようにします。

並び順の付いた集合全体でデルタ和を計算するには、単純に [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 関数を使用できます。

**構文**

```sql
deltaSumTimestamp(value, timestamp)
```

**引数**

* `value` — 入力値。いずれかの [Integer](../../data-types/int-uint.md) 型、[Float](../../data-types/float.md) 型、[Date](../../data-types/date.md)、または [DateTime](../../data-types/datetime.md) でなければなりません。
* `timestamp` — 値を並べる順序を指定するためのパラメータ。いずれかの [Integer](../../data-types/int-uint.md) 型、[Float](../../data-types/float.md) 型、[Date](../../data-types/date.md)、または [DateTime](../../data-types/datetime.md) でなければなりません。

**返される値**

* `timestamp` パラメータでソートしたときの、連続する値同士の差分の累積値。

型: [Integer](../../data-types/int-uint.md)、[Float](../../data-types/float.md)、[Date](../../data-types/date.md)、または [DateTime](../../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

結果：

```text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
