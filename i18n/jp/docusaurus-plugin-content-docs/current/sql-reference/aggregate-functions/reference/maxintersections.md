---
description: 'グループのインターバルが互いに交差する最大回数を計算する集約関数（すべてのインターバルが少なくとも1回交差する場合）。'
sidebar_position: 163
slug: /sql-reference/aggregate-functions/reference/maxintersections
title: 'maxIntersections'
---


# maxIntersections

グループのインターバルが互いに交差する最大回数を計算する集約関数（すべてのインターバルが少なくとも1回交差する場合）。

構文は次の通りです：

```sql
maxIntersections(start_column, end_column)
```

**引数**

- `start_column` – 各インターバルの開始を示す数値カラム。`start_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

- `end_column` - 各インターバルの終了を示す数値カラム。`end_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

**戻り値**

交差したインターバルの最大数を返します。

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

インターバルは次のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらのインターバルのうち3つは共通の値を持っています（共通の値は `4` ですが、重要なのはその値ではなく、交差の数を測定しています）。インターバル `(1,3)` と `(3,7)` はエンドポイントを共有していますが、`maxIntersections` 関数によって交差しているとは見なされません。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

レスポンス：
```response
3
```

最大インターバルの複数の出現がある場合、[`maxIntersectionsPosition` 関数](./maxintersectionsposition.md)を使用して、それらの出現の数と位置を特定できます。
