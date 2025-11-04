---
'description': '連続する行の違いを加算します。違いが負の場合は無視されます。'
'sidebar_position': 130
'slug': '/sql-reference/aggregate-functions/reference/deltasumtimestamp'
'title': 'deltaSumTimestamp'
'doc_type': 'reference'
---

連続行間の差を追加します。差が負である場合は無視されます。

この関数は、例えば `toStartOfMinute` バケットのような、時間バケットに整列されたタイムスタンプでデータを保存する [materialized views](/sql-reference/statements/create/view#materialized-view) のために主に使用されます。そのようなマテリアライズドビュー内の行はすべて同じタイムスタンプを持つため、元の丸められていないタイムスタンプ値を保存せずに正しい順序でマージすることは不可能です。`deltaSumTimestamp` 関数は、これまでに見た値の元の `timestamp` を追跡し、パーツのマージ時に関数の値（状態）が正しく計算されるようにします。

順序付けられたコレクションに対してデルタ合計を計算するには、単に [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 関数を使用できます。

**構文**

```sql
deltaSumTimestamp(value, timestamp)
```

**引数**

- `value` — 入力値。いずれかの [Integer](../../data-types/int-uint.md) 型、[Float](../../data-types/float.md) 型、[Date](../../data-types/date.md) または [DateTime](../../data-types/datetime.md) 型でなければなりません。
- `timestamp` — 値を順序付けるためのパラメータ。いずれかの [Integer](../../data-types/int-uint.md) 型、[Float](../../data-types/float.md) 型、[Date](../../data-types/date.md) または [DateTime](../../data-types/datetime.md) 型でなければなりません。

**返される値**

- `timestamp` パラメータで順序付けされた連続する値の累積差。

タイプ: [Integer](../../data-types/int-uint.md) または [Float](../../data-types/float.md) または [Date](../../data-types/date.md) または [DateTime](../../data-types/datetime.md)。

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
