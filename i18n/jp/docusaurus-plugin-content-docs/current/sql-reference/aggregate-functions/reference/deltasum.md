---
description: '隣接する行との算術差を合計します。'
sidebar_position: 129
slug: '/sql-reference/aggregate-functions/reference/deltasum'
title: 'deltaSum'
---




# deltaSum

連続する行の算術的な差を合計します。差が負の場合は無視されます。

:::note
この関数が正しく動作するためには、基になるデータがソートされている必要があります。この関数を[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)で使用したい場合は、ほぼ間違いなく[deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp)メソッドを使用したいでしょう。
:::

**構文**

```sql
deltaSum(value)
```

**引数**

- `value` — 入力値で、[整数](../../data-types/int-uint.md)または[浮動小数点](../../data-types/float.md)型である必要があります。

**戻り値**

- `Integer` または `Float` 型の得られた算術的な差。

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
