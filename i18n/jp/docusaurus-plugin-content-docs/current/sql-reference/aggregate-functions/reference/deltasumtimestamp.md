---
'description': 'Adds the difference between consecutive rows. If the difference is
  negative, it is ignored.'
'sidebar_position': 130
'slug': '/sql-reference/aggregate-functions/reference/deltasumtimestamp'
'title': 'deltaSumTimestamp'
---



Adds the difference between consecutive rows. If the difference is negative, it is ignored.

This function is primarily for [materialized views](/sql-reference/statements/create/view#materialized-view) that store data ordered by some time bucket-aligned timestamp, for example, a `toStartOfMinute` bucket. Because the rows in such a materialized view will all have the same timestamp, it is impossible for them to be merged in the correct order, without storing the original, unrounded timestamp value. The `deltaSumTimestamp` function keeps track of the original `timestamp` of the values it's seen, so the values (states) of the function are correctly computed during merging of parts.

To calculate the delta sum across an ordered collection you can simply use the [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) function.

**構文**

```sql
deltaSumTimestamp(value, timestamp)
```

**引数**

- `value` — 入力値。必ず [Integer](../../data-types/int-uint.md) 型または [Float](../../data-types/float.md) 型、または [Date](../../data-types/date.md) または [DateTime](../../data-types/datetime.md) でなければなりません。
- `timestamp` — 値の順序付けに使用するパラメーター。必ず [Integer](../../data-types/int-uint.md) 型または [Float](../../data-types/float.md) 型、または [Date](../../data-types/date.md) または [DateTime](../../data-types/datetime.md) でなければなりません。

**戻り値**

- `timestamp` パラメーターによって順序付けられた連続した値の差の累積。

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
