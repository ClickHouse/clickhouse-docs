---
'description': '連続する行の算術的な差を合計します。'
'sidebar_position': 129
'slug': '/sql-reference/aggregate-functions/reference/deltasum'
'title': 'deltaSum'
'doc_type': 'reference'
---


# deltaSum

連続する行の算術的な差を合計します。差が負の場合は無視されます。

:::note
この関数が正しく機能するためには、基になるデータがソートされている必要があります。この関数を[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)で使用したい場合は、おそらく代わりに[deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp)メソッドを使用することをお勧めします。
:::

**構文**

```sql
deltaSum(value)
```

**引数**

- `value` — 入力値で、[Integer](../../data-types/int-uint.md)または[Float](../../data-types/float.md)型である必要があります。

**返される値**

- `Integer`または`Float`型の算術的な差が得られます。

**例**

クエリ:

```sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

結果:

```text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

クエリ:

```sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

結果:

```text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

結果:

```text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```

## 関連項目 {#see-also}

- [runningDifference](/sql-reference/functions/other-functions#runningDifference)
