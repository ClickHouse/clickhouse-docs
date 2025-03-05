---
slug: /sql-reference/aggregate-functions/reference/maxintersections
sidebar_position: 163
title: maxIntersections
description: "グループの間隔が互いに交差する最大回数を計算する集約関数（すべての間隔が少なくとも一度交差する場合）。"
---


# maxIntersections

グループの間隔が互いに交差する最大回数を計算する集約関数（すべての間隔が少なくとも一度交差する場合）。

構文は次の通りです：

```sql
maxIntersections(start_column, end_column)
```

**引数**

- `start_column` – 各間隔の開始を表す数値カラム。`start_column` が `NULL` または 0 の場合、その間隔はスキップされます。

- `end_column` - 各間隔の終了を表す数値カラム。`end_column` が `NULL` または 0 の場合、その間隔はスキップされます。

**返される値**

交差した間隔の最大数を返します。

**例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();
```

次のように挿入します：

```sql
INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

間隔は次のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらの間隔の中で3つが共通の値を持っています（その値は `4` ですが、共通の値は重要ではなく、交差のカウントを測定しています）。間隔 `(1,3)` と `(3,7)` は端点を共有していますが、`maxIntersections` 関数では交差しているとは見なされません。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

返答：
```response
3
```

最大の間隔が複数回発生している場合は、[`maxIntersectionsPosition` 関数](./maxintersectionsposition.md)を使用して、それらの発生の数と位置を特定できます。
