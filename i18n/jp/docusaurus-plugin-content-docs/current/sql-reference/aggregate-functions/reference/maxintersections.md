---
description: 'Aggregate function that calculates the maximum number of times that
  a group of intervals intersects each other (if all the intervals intersect at least
  once).'
sidebar_position: 163
slug: '/sql-reference/aggregate-functions/reference/maxintersections'
title: 'maxIntersections'
---




# maxIntersections

グループの時間間隔が互いに交差する最大回数を計算する集約関数（すべての時間間隔が少なくとも1回交差する場合）。

構文は次のとおりです：

```sql
maxIntersections(start_column, end_column)
```

**引数**

- `start_column` – 各時間間隔の開始を表す数値カラム。`start_column` が `NULL` または 0 の場合、その間隔はスキップされます。

- `end_column` - 各時間間隔の終了を表す数値カラム。`end_column` が `NULL` または 0 の場合、その間隔はスキップされます。

**返される値**

交差した時間間隔の最大数を返します。

**例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

時間間隔は次のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらの時間間隔のうち3つが共通の値を持っています（値は `4` ですが、共通の値は重要ではなく、交差の数を測定しています）。時間間隔 `(1,3)` と `(3,7)` は端点を共有していますが、`maxIntersections` 関数では交差しているとはみなされません。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

レスポンス：
```response
3
```

最大の時間間隔が複数回発生する場合、その発生の数と位置を見つけるために [`maxIntersectionsPosition` 関数](./maxintersectionsposition.md) を使用できます。
